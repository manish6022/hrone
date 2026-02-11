"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = () => {
      const storedToken = Cookies.get('token');
      const storedUser = Cookies.get('user');

      if (storedToken && storedUser) {
        if (isMounted) {
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse user cookie", e);
            Cookies.remove('user');
            Cookies.remove('token');
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

  const login = (newToken: string, newUser: User) => {
    Cookies.set('token', newToken, { expires: 7 }); // Expires in 7 days
    Cookies.set('user', JSON.stringify(newUser), { expires: 7 });
    setToken(newToken);
    setUser(newUser);
    router.push('/');
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
        router.push('/');
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

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return user.privileges.some(p => {
      const privStr = typeof p === 'string' ? p : (p as any).name;
      return privStr?.toLowerCase() === permission.toLowerCase();
    });
  }, [user, isSuperAdmin]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isLoading,
      hasPermission,
      isSuperAdmin
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
