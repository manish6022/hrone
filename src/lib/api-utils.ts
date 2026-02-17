import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from './security'
import { validateCSRFToken, generateCSRFToken } from './security'

// API Response helpers
export class APIResponse {
  static success(data: any, message?: string, status: number = 200) {
    return NextResponse.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static error(message: string, status: number = 400, details?: any) {
    // Don't leak sensitive information in production
    const isDevelopment = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: false,
      message,
      ...(isDevelopment && details && { details }),
      timestamp: new Date().toISOString()
    }, { status })
  }

  static unauthorized(message: string = 'Authentication required') {
    return this.error(message, 401)
  }

  static forbidden(message: string = 'Access denied') {
    return this.error(message, 403)
  }

  static notFound(message: string = 'Resource not found') {
    return this.error(message, 404)
  }

  static serverError(message: string = 'Internal server error') {
    // Never expose internal error details
    return this.error(message, 500)
  }
}

// Authentication middleware for API routes
export function withAuth(handler: Function, options: {
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredPermissions?: string[]
} = {}) {
  return async (request: NextRequest, context?: any) => {
    try {
      const { requireAuth = true, requireAdmin = false, requiredPermissions = [] } = options

      // Check authentication
      if (requireAuth) {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return APIResponse.unauthorized()
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        try {
          const decoded = verifyJWT(token) as any
          const currentTime = Date.now() / 1000

          // Check token expiration
          if (decoded.exp && decoded.exp < currentTime) {
            return APIResponse.error('Token expired', 401)
          }

          // Attach user to request
          ;(request as any).user = decoded

          // Check admin requirement
          if (requireAdmin && !decoded.isSuperAdmin) {
            return APIResponse.forbidden('Admin access required')
          }

          // Check permissions
          if (requiredPermissions.length > 0) {
            const hasRequiredPermissions = requiredPermissions.every(permission =>
              decoded.privileges?.some((p: any) =>
                (typeof p === 'string' ? p : p.name)?.toLowerCase() === permission.toLowerCase()
              )
            )

            if (!hasRequiredPermissions) {
              return APIResponse.forbidden('Insufficient permissions')
            }
          }

        } catch (error) {
          console.error('Token validation error:', error)
          return APIResponse.unauthorized('Invalid token')
        }
      }

      // Execute the handler
      return await handler(request, context)

    } catch (error) {
      console.error('API route error:', error)
      return APIResponse.serverError()
    }
  }
}

// CSRF protection middleware for POST/PUT/DELETE requests
export function withCSRF(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    // Skip CSRF check for GET requests
    if (request.method === 'GET') {
      return NextResponse.next()
    }

    try {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionToken = request.cookies.get('csrf-token')?.value

      if (!csrfToken || !sessionToken) {
        return APIResponse.error('CSRF token missing', 403)
      }

      if (!validateCSRFToken(csrfToken, sessionToken)) {
        return APIResponse.error('Invalid CSRF token', 403)
      }

      return handler(request, context)
    } catch (error) {
      console.error('CSRF validation error:', error)
      return APIResponse.serverError()
    }
  }
}

// Rate limiting for API routes
const apiRateLimit = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(handler: Function, options: {
  maxRequests?: number
  windowMs?: number
  skipSuccessfulRequests?: boolean
} = {}) {
  const { maxRequests = 100, windowMs = 15 * 60 * 1000, skipSuccessfulRequests = false } = options

  return async (request: NextRequest, context?: any) => {
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    const key = `${clientIP}:${request.nextUrl.pathname}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean old entries
    for (const [k, v] of apiRateLimit.entries()) {
      if (v.resetTime < windowStart) {
        apiRateLimit.delete(k)
      }
    }

    const record = apiRateLimit.get(key) || { count: 0, resetTime: now + windowMs }

    if (record.count >= maxRequests) {
      return APIResponse.error('Too many requests', 429, {
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      })
    }

    record.count++
    apiRateLimit.set(key, record)

    try {
      const response = await handler(request, context)

      // Reset counter on successful requests if configured
      if (skipSuccessfulRequests && response.status < 400) {
        record.count = Math.max(0, record.count - 1)
      }

      return response
    } catch (error) {
      // Don't count errors against rate limit
      record.count = Math.max(0, record.count - 1)
      throw error
    }
  }
}

// Input validation middleware
export function withValidation(handler: Function, schema?: any) {
  return async (request: NextRequest, context?: any) => {
    try {
      if (schema) {
        // Basic validation - extend with your preferred validation library
        const body = await request.json().catch(() => ({}))

        // Simple required fields check
        if (schema.required) {
          const missing = schema.required.filter((field: string) => !body[field])
          if (missing.length > 0) {
            return APIResponse.error(`Missing required fields: ${missing.join(', ')}`, 400)
          }
        }
      }

      return handler(request, context)
    } catch (error) {
      console.error('Validation error:', error)
      return APIResponse.error('Invalid request data', 400)
    }
  }
}

// Combined middleware for common API routes
export function withApiProtection(handler: Function, options: {
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredPermissions?: string[]
  enableCSRF?: boolean
  rateLimit?: { maxRequests?: number; windowMs?: number }
  validationSchema?: any
} = {}) {
  let protectedHandler = handler

  // Apply rate limiting
  if (options.rateLimit) {
    protectedHandler = withRateLimit(protectedHandler, options.rateLimit)
  }

  // Apply validation
  if (options.validationSchema) {
    protectedHandler = withValidation(protectedHandler, options.validationSchema)
  }

  // Apply authentication
  if (options.requireAuth !== false) {
    protectedHandler = withAuth(protectedHandler, {
      requireAuth: options.requireAuth,
      requireAdmin: options.requireAdmin,
      requiredPermissions: options.requiredPermissions
    })
  }

  // Apply CSRF protection for state-changing operations
  if (options.enableCSRF) {
    protectedHandler = withCSRF(protectedHandler)
  }

  return protectedHandler
}
