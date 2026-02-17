"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { isJWTExpired } from "@/lib/security";

interface User {
  id: number;
  username: string;
  email: string;
  roles: (string | { id: number; name: string; privileges?: any[] })[];
  privileges: string[];
  isSuperAdmin?: boolean; // God Mode flag
  employeeResponseDto?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    department: string;
    designation: string;
    joiningDate: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
  isHR: () => boolean;
  isManager: () => boolean;
  isRegularUser: () => boolean;
  getUserRole: () => 'superadmin' | 'hr' | 'manager' | 'user';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for direct use
export default AuthContext;

// Define consistent role checking constants
const ADMIN_ROLES = ['superadmin', 'admin'];
const MANAGER_ROLES = ['manager', 'teamlead', 'supervisor'];
const HR_ROLES = ['hr', 'humanresources', 'hrmanager'];
const REGULAR_USER_ROLES = ['roleuser', 'user', 'employee', 'staff'];

// Helper function to normalize role string
const normalizeRole = (role: string | { id: number; name: string; privileges?: any[] }): string => {
  const roleStr = (typeof role === 'string' ? role : role.name)?.toLowerCase().replace(/[\s_]/g, '');
  return roleStr || '';
};

// Helper function to check if user has any of the specified roles
const hasAnyRole = (userRoles: (string | { id: number; name: string; privileges?: any[] })[], targetRoles: string[]): boolean => {
  return userRoles?.some(role => {
    const normalizedRole = normalizeRole(role);
    return targetRoles.includes(normalizedRole);
  }) || false;
};

// Unified helper function to check if a user is a regular user (not admin, HR, or manager)
const checkIsRegularUser = (user: User): boolean => {
  if (!user || user.isSuperAdmin) return false;

  // Check if user has admin or manager roles
  if (hasAnyRole(user.roles || [], [...ADMIN_ROLES, ...MANAGER_ROLES])) {
    return false;
  }

  // Check if user has regular user roles
  return hasAnyRole(user.roles || [], REGULAR_USER_ROLES);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Environment-based configuration
  const COOKIE_EXPIRES_DAYS = parseInt(process.env.NEXT_PUBLIC_COOKIE_EXPIRES_DAYS || '7', 10);
  const TOKEN_CHECK_INTERVAL_MINUTES = parseInt(process.env.NEXT_PUBLIC_TOKEN_CHECK_INTERVAL_MINUTES || '5', 10);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = () => {
      const storedToken = Cookies.get('token');
      const storedUser = Cookies.get('user');

      if (storedToken && storedUser) {
        // Check if token is expired
        if (isJWTExpired(storedToken)) {
          console.log('Stored token is expired, removing cookies and logging out');
          Cookies.remove('token');
          Cookies.remove('user');
          if (isMounted) {
            setToken(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse user cookie", e);
            Cookies.remove('user');
            Cookies.remove('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic token expiration check
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (token && isJWTExpired(token)) {
        console.log('Token expired during session, logging out');
        Cookies.remove('token');
        Cookies.remove('user');
        setToken(null);
        setUser(null);
        router.push('/login');
      }
    };

    // Check every N minutes (configured via environment)
    const intervalId = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL_MINUTES * 60 * 1000);

    // Also check immediately
    checkTokenExpiration();

    return () => clearInterval(intervalId);
  }, [token, router]);

  const login = (newToken: string, newUser: User) => {
    console.log('Login function called with user:', newUser.username, 'roles:', newUser.roles);

    Cookies.set('token', newToken, { expires: COOKIE_EXPIRES_DAYS });
    Cookies.set('user', JSON.stringify(newUser), { expires: COOKIE_EXPIRES_DAYS });
    setToken(newToken);
    setUser(newUser);

    console.log('Login - User data:', { roles: newUser.roles, isSuperAdmin: newUser.isSuperAdmin });

    // Use centralized role checking logic
    const isRegularUser = checkIsRegularUser(newUser);

    console.log('Login - isRegularUser:', isRegularUser, 'redirecting to:', isRegularUser ? '/employee-dashboard' : '/');

    router.push(isRegularUser ? '/employee-dashboard' : '/');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // Protect routes logic
  useEffect(() => {
    let isMounted = true;
    
    if (!isLoading && isMounted) {
      const isLoginPage = pathname === '/login';
      const isAuthenticated = !!token;

      if (!isAuthenticated && !isLoginPage) {
        router.push('/login');
      } else if (isAuthenticated && isLoginPage) {
        console.log('Route protection - User data:', { roles: user?.roles, isSuperAdmin: user?.isSuperAdmin });

        // Use centralized role checking logic
        const isRegularUser = user ? checkIsRegularUser(user) : false;

        console.log('Route protection - isRegularUser:', isRegularUser, 'redirecting to:', isRegularUser ? '/employee-dashboard' : '/');

        router.push(isRegularUser ? '/employee-dashboard' : '/');
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [isLoading, token, pathname, router]);

  const isSuperAdmin = useCallback(() => {
    if (!user) return false;
    const identifier = (user.username || (user as any).name || '').toLowerCase();

    return user.isSuperAdmin ||
      identifier === 'superadmin' ||
      user.roles?.some(r => {
        const roleStr = (typeof r === 'string' ? r : (r as any).name)?.toLowerCase().replace(/[\s_]/g, '');
        return roleStr === 'superadmin' || roleStr === 'admin';
      }) || false;
  }, [user]);

  const isHR = useCallback(() => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return user.roles?.some(r => {
      const roleStr = (typeof r === 'string' ? r : (r as any).name)?.toLowerCase().replace(/[\s_]/g, '');
      return roleStr === 'hr' || roleStr === 'humanresources' || roleStr === 'hrmanager';
    }) || false;
  }, [user, isSuperAdmin]);

  const isManager = useCallback(() => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return user.roles?.some(r => {
      const roleStr = (typeof r === 'string' ? r : (r as any).name)?.toLowerCase().replace(/[\s_]/g, '');
      return roleStr === 'manager' || roleStr === 'teamlead' || roleStr === 'supervisor';
    }) || false;
  }, [user, isSuperAdmin]);

  const isRegularUser = useCallback(() => {
    if (!user) return false;
    return checkIsRegularUser(user);
  }, [user]);

  const getUserRole = useCallback((): 'superadmin' | 'hr' | 'manager' | 'user' => {
    if (isSuperAdmin()) return 'superadmin';
    if (isHR()) return 'hr';
    if (isManager()) return 'manager';
    return 'user';
  }, [isSuperAdmin, isHR, isManager]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    
    // Grant basic permissions to regular users
    if (isRegularUser()) {
      const basicPermissions = ['view_timesheet', 'ATTENDANCE_APPROVE'];
      if (basicPermissions.includes(permission.toLowerCase())) return true;
    }
    
    return user.privileges.some(p => {
      const privStr = typeof p === 'string' ? p : (p as any).name;
      return privStr?.toLowerCase() === permission.toLowerCase();
    });
  }, [user, isSuperAdmin, isRegularUser]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading,
      hasPermission,
      isSuperAdmin,
      isHR,
      isManager,
      isRegularUser,
      getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
