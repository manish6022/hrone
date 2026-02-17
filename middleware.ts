import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './src/lib/security'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/employee-dashboard',
  '/users',
  '/roles',
  '/privileges',
  '/attendance',
  '/leave',
  '/timesheet',
  '/production',
  '/items',
  '/leave-types',
  '/ui-showcase'
]

// Define admin-only routes
const adminRoutes = [
  '/users',
  '/roles',
  '/privileges',
  '/production',
  '/items',
  '/leave-types'
]

// Define public routes (no auth required)
const publicRoutes = [
  '/login',
  '/',
  '/api/auth/login'
]

// Check if user has required permissions
function hasPermission(user: any, requiredPermission: string): boolean {
  if (!user) return false

  // Super admin has all permissions
  if (user.isSuperAdmin) return true

  // Check user privileges
  if (user.privileges && user.privileges.some((p: any) =>
    (typeof p === 'string' ? p : p.name)?.toLowerCase() === requiredPermission.toLowerCase()
  )) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const userCookie = request.cookies.get('user')?.value

  // Parse user data
  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (error) {
      console.error('Failed to parse user cookie in middleware')
    }
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token
    const decodedToken = verifyJWT(token)
    if (!decodedToken) {
      // Clear invalid cookies
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }

    // Check admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!user?.isSuperAdmin && !hasPermission(user, 'admin_access')) {
        return NextResponse.redirect(new URL('/employee-dashboard', request.url))
      }
    }
  }

  // API routes protection
  if (pathname.startsWith('/api/')) {
    // Skip auth endpoints
    if (pathname === '/api/auth/login') {
      return NextResponse.next()
    }

    // Check authentication for API routes
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token for API routes
    const decodedToken = verifyJWT(token)
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  // Security headers (additional layer beyond next.config.ts)
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Add request ID for tracking
  response.headers.set('X-Request-ID', crypto.randomUUID())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
