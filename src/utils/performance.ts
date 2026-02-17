/**
 * Performance Monitoring Utilities
 * Helps track and optimize application performance
 */

import { useEffect } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any; // Cast to any to access processingStart
            console.log('FID:', fidEntry.processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (e) {
        console.warn('Performance monitoring not fully supported');
      }
    }
  }, []);
};

// Back/Forward Cache optimization
export const useBFCacheOptimization = () => {
  useEffect(() => {
    // Clean up on pagehide to enable bfcache
    const handlePageHide = () => {
      // Clear any timers/intervals
      // Note: Components should handle their own cleanup
    };

    // Restore state on pageshow
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        console.log('Page restored from bfcache');
        // Re-initialize any necessary state
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // This will be replaced by webpack during build
    console.log('Bundle size monitoring active');
  }
};

// Performance marks for critical operations
export const performanceMarks = {
  mark: (name: string) => {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark: string) => {
    if ('performance' in window && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration}ms`);
        return measure.duration;
      } catch (e) {
        console.warn('Performance measure failed:', e);
      }
    }
  },

  clearMarks: (name?: string) => {
    if ('performance' in window && performance.clearMarks) {
      if (name) {
        performance.clearMarks(name);
      } else {
        performance.clearMarks();
      }
    }
  },

  clearMeasures: (name?: string) => {
    if ('performance' in window && performance.clearMeasures) {
      if (name) {
        performance.clearMeasures(name);
      } else {
        performance.clearMeasures();
      }
    }
  },
};

// Web Vitals reporting
export const reportWebVitals = (metric: any) => {
  // Send to analytics service
  console.log('Web Vital:', metric.name, metric.value);

  // You can send this to your analytics service
  // Example: sendToAnalytics(metric);
};

// Long task monitoring
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long task detected:', entry.duration, 'ms');
          // Report long tasks for optimization
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      return () => longTaskObserver.disconnect();
    } catch (e) {
      console.warn('Long task monitoring not supported');
    }
  }
};

import React from 'react';
