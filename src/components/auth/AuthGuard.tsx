"use client";

import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export interface RouteGuardConfig {
  requireAuth?: boolean;
  roles?: ('superadmin' | 'hr' | 'manager' | 'user')[];
  permissions?: string[];
  redirectTo?: string;
  fallback?: React.ComponentType<{ message?: string }>;
}

// Default fallback component
function AccessDeniedFallback({ message = "You don't have permission to access this resource." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-6 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-2">Access Restricted</h2>
      <p className="text-muted-foreground max-w-md">
        {message}
      </p>
    </div>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Auth Guard Hook - Similar to Angular's CanActivate
export function useAuthGuard(config: RouteGuardConfig = {}) {
  const {
    requireAuth = true,
    roles = [],
    permissions = [],
    redirectTo = '/login',
  } = config;

  const { user, isAuthenticated, isLoading, hasPermission, getUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check roles
    if (roles.length > 0 && isAuthenticated) {
      const userRole = getUserRole();
      if (!roles.includes(userRole)) {
        router.push('/employee-dashboard'); // Redirect regular users to their dashboard
        return;
      }
    }

    // Check permissions
    if (permissions.length > 0 && isAuthenticated) {
      const hasRequiredPermission = permissions.some(permission => hasPermission(permission));
      if (!hasRequiredPermission) {
        router.push('/employee-dashboard'); // Redirect users without permission
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, requireAuth, roles, permissions, hasPermission, getUserRole, redirectTo]);

  return {
    isAllowed: !isLoading && (!requireAuth || (
      isAuthenticated &&
      (roles.length === 0 || roles.includes(getUserRole())) &&
      (permissions.length === 0 || permissions.some(permission => hasPermission(permission)))
    )),
    isLoading,
    user,
    userRole: getUserRole(),
  };
}

// Higher-Order Component for Auth Guards - Similar to Angular's route guards
export function withAuthGuard<P extends object>(
  Component: ComponentType<P>,
  config: RouteGuardConfig = {}
) {
  const {
    fallback: Fallback = AccessDeniedFallback,
  } = config;

  return function AuthGuardedComponent(props: P) {
    const { isAllowed, isLoading } = useAuthGuard(config);

    if (isLoading) {
      return <LoadingFallback />;
    }

    if (!isAllowed) {
      return <Fallback />;
    }

    return <Component {...props} />;
  };
}

// Page-level Auth Guard Component - For wrapping page content
export function AuthGuard({
  children,
  requireAuth = true,
  roles = [],
  permissions = [],
  redirectTo = '/login',
  fallback: Fallback = AccessDeniedFallback,
}: RouteGuardConfig & AuthGuardProps) {
  const { isAllowed, isLoading } = useAuthGuard({
    requireAuth,
    roles,
    permissions,
    redirectTo,
  });

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAllowed) {
    return <Fallback />;
  }

  return <>{children}</>;
}

// Permission-based Auth Guard
export function PermissionGuard({
  children,
  permission,
  fallback: Fallback = AccessDeniedFallback,
}: {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ComponentType<{ message?: string }>;
}) {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated || !hasPermission(permission)) {
    return <Fallback />;
  }

  return <>{children}</>;
}

// Role-based Auth Guard
export function RoleGuard({
  children,
  roles,
  fallback: Fallback = AccessDeniedFallback,
}: {
  children: React.ReactNode;
  roles: ('superadmin' | 'hr' | 'manager' | 'user')[];
  fallback?: React.ComponentType<{ message?: string }>;
}) {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated || !roles.includes(getUserRole())) {
    return <Fallback />;
  }

  return <>{children}</>;
}

// Admin Guard - Only super admins and HR managers
export function AdminGuard({
  children,
  fallback: Fallback = AccessDeniedFallback,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ message?: string }>;
}) {
  return (
    <RoleGuard roles={['superadmin', 'hr']} fallback={Fallback}>
      {children}
    </RoleGuard>
  );
}

// Manager Guard - Managers and above
export function ManagerGuard({
  children,
  fallback: Fallback = AccessDeniedFallback,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ message?: string }>;
}) {
  return (
    <RoleGuard roles={['superadmin', 'hr', 'manager']} fallback={Fallback}>
      {children}
    </RoleGuard>
  );
}
