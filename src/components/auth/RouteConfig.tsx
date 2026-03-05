// Route Guard Configuration - Similar to Angular's route guards
export interface RouteConfig {
  path: string;
  guard?: RouteGuardConfig;
  children?: RouteConfig[];
}

import { RouteGuardConfig } from './AuthGuard';

// Define route configurations with their guards
export const routeConfigs: RouteConfig[] = [
  // Public routes
  { path: '/login', guard: { requireAuth: false } },
  { path: '/', guard: { requireAuth: true } }, // All authenticated users access default page

  // Dashboard routes - admin access
  { path: '/dashboard', guard: { roles: ['superadmin', 'hr', 'manager'] } },

  // Admin-only routes
  { path: '/users', guard: { roles: ['superadmin', 'hr'] } },
  { path: '/users/create', guard: { roles: ['superadmin', 'hr'] } },
  { path: '/roles', guard: { roles: ['superadmin', 'hr'] } },
  { path: '/privileges', guard: { roles: ['superadmin', 'hr'] } },

  // HR and Manager routes
  { path: '/leave', guard: { roles: ['superadmin', 'hr', 'manager'] } },
  { path: '/leave-types', guard: { roles: ['superadmin', 'hr'] } },
  { path: '/attendance', guard: { roles: ['superadmin', 'hr', 'manager'] } },
  { path: '/payroll', guard: { roles: ['superadmin', 'hr'] } },
  { path: '/performance', guard: { roles: ['superadmin', 'hr', 'manager'] } },

  // Manager and above routes
  { path: '/production', guard: { roles: ['superadmin', 'hr', 'manager'] } },
  { path: '/items', guard: { roles: ['superadmin', 'hr', 'manager'] } },

  // User routes (all authenticated users)
  { path: '/timesheet', guard: { requireAuth: true } },
  { path: '/reports', guard: { requireAuth: true } },

  // API routes
  { path: '/api/auth/login', guard: { requireAuth: false } },
  { path: '/api/', guard: { requireAuth: true } },
];

// Helper function to find route config
export function findRouteConfig(pathname: string): RouteConfig | null {
  // Exact match first
  const exactMatch = routeConfigs.find(config => config.path === pathname);
  if (exactMatch) return exactMatch;

  // Prefix match for nested routes
  const prefixMatch = routeConfigs.find(config =>
    pathname.startsWith(config.path) && config.path !== '/'
  );
  if (prefixMatch) return prefixMatch;

  // Default to root config
  return routeConfigs.find(config => config.path === '/') || null;
}

// Helper function to check if route requires auth
export function requiresAuth(pathname: string): boolean {
  const config = findRouteConfig(pathname);
  return config?.guard?.requireAuth !== false;
}

// Helper function to get required roles for route
export function getRequiredRoles(pathname: string): string[] {
  const config = findRouteConfig(pathname);
  return config?.guard?.roles || [];
}

// Helper function to get required permissions for route
export function getRequiredPermissions(pathname: string): string[] {
  const config = findRouteConfig(pathname);
  return config?.guard?.permissions || [];
}

// Helper function to get redirect path for route
export function getRedirectPath(pathname: string): string {
  const config = findRouteConfig(pathname);
  return config?.guard?.redirectTo || '/login';
}
