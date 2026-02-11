import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for permission-based useEffect
 * Prevents useEffect dependency issues with permission functions
 */
export function usePermissionEffect(
  permission: string,
  effect: () => void | (() => void) | Promise<void>,
  deps: any[] = []
) {
  const { user, hasPermission } = useAuth();
  const effectRef = useRef(effect);
  
  // Update effect ref without causing re-renders
  effectRef.current = effect;
  
  useEffect(() => {
    if (user && hasPermission(permission)) {
      const result = effectRef.current();
      
      // Handle both sync and async effects
      if (result instanceof Promise) {
        // For async effects, we don't return the promise
        // as useEffect doesn't support async cleanup functions
        return undefined;
      }
      
      return result;
    }
  }, [user, permission, ...deps]);
}

/**
 * Hook for permission-based loading state
 */
export function usePermissionBasedLoad<T>(
  permission: string,
  loader: (signal: AbortSignal) => Promise<T>,
  deps: any[] = []
) {
  const { user, hasPermission } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    if (!user || !hasPermission(permission)) {
      return;
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    const loadData = async () => {
      try {
        await loader(signal);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error(`Failed to load data for permission: ${permission}`, error);
        }
      }
    };
    
    loadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, permission, ...deps]);
}