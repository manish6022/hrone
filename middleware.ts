import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './src/lib/security'
import {
  findRouteConfig,
  requiresAuth,
  getRequiredRoles,
  getRequiredPermissions,
  getRedirectPath
} from './src/components/auth/RouteConfig'

// Define role hierarchy for checking permissions
const ROLE_HIERARCHY = {
  superadmin: 4,
  hr: 3,
  manager: 2,
  user: 1,
};

// Helper function to check if user has required role level
function hasRequiredRoleLevel(userRole: string, requiredRoles: string[]): boolean {
  if (!userRole || requiredRoles.length === 0) return true;

  const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  return requiredRoles.some(requiredRole => {
    const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userRoleLevel >= requiredLevel;
  });
}

// Enhanced permission checking
function hasPermission(user: any, requiredPermissions: string[]): boolean {
  if (!user) return false;

  // Super admin has all permissions
  if (user.isSuperAdmin) return true;

  // Check if user has any of the required permissions
  return requiredPermissions.every(permission => {
    // Check user privileges
    if (user.privileges && user.privileges.some((p: any) =>
      (typeof p === 'string' ? p : p.name)?.toLowerCase() === permission.toLowerCase()
    )) {
      return true;
    }

    // Check role-based permissions
    if (user.roles && user.roles.some((role: any) => {
      const roleName = (typeof role === 'string' ? role : role.name)?.toLowerCase();
      // Map common role names to permissions
      const rolePermissions: Record<string, string[]> = {
        'superadmin': ['*'],
        'admin': ['*'],
        'hr': ['user_management', 'leave_management', 'attendance_management', 'payroll_view'],
        'manager': ['team_management', 'leave_approval', 'attendance_approval', 'reports_view'],
        'user': ['timesheet_submit', 'leave_request', 'profile_view']
      };

      return rolePermissions[roleName]?.includes(permission) ||
             rolePermissions[roleName]?.includes('*');
    })) {
      return true;
    }

    return false;
  });
}

// Get user role from user object
function getUserRole(user: any): string {
  if (!user) return '';

  if (user.isSuperAdmin) return 'superadmin';

  // Check roles in hierarchy order
  const roleOrder = ['superadmin', 'hr', 'manager', 'user'];
  for (const role of roleOrder) {
    if (user.roles?.some((r: any) =>
      (typeof r === 'string' ? r : r.name)?.toLowerCase().includes(role)
    )) {
      return role;
    }
  }

  return 'user'; // Default fallback
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  // Parse user data
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (error) {
      console.error('Failed to parse user cookie in middleware');
    }
  }

  // Get route configuration
  const routeConfig = findRouteConfig(pathname);

  // Check if route requires authentication
  if (requiresAuth(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL(getRedirectPath(pathname), request.url));
    }

    // Verify token
    const decodedToken = verifyJWT(token);
    if (!decodedToken) {
      // Clear invalid cookies
      const response = NextResponse.redirect(new URL(getRedirectPath(pathname), request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }

    // Check role-based access
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles.length > 0) {
      const userRole = getUserRole(user);
      if (!hasRequiredRoleLevel(userRole, requiredRoles)) {
        // Redirect to default page for unauthorized access
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Check permission-based access
    const requiredPermissions = getRequiredPermissions(pathname);
    if (requiredPermissions.length > 0) {
      if (!hasPermission(user, requiredPermissions)) {
        // Redirect to default page for unauthorized access
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // API routes protection
  if (pathname.startsWith('/api/')) {
    // Skip auth endpoints
    if (pathname === '/api/auth/login' || pathname.startsWith('/api/auth/refresh')) {
      return NextResponse.next();
    }

    // Check authentication for API routes
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token for API routes
    const decodedToken = verifyJWT(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // Security headers (additional layer beyond next.config.ts)
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Add request ID for tracking
  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
}
