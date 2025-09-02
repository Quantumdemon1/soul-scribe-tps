import React, { useEffect, useMemo } from 'react';
import { errorLogger } from '@/services/errorLoggingService';

// Performance monitoring hook
export function usePerformanceOptimization() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observePerformance = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        if (lastEntry && 'renderTime' in lastEntry) {
          const lcp = (lastEntry as any).renderTime || (lastEntry as any).loadTime;
          if (lcp > 2500) { // Poor LCP
            errorLogger.logError({
              error_type: 'javascript',
              error_message: `Poor LCP performance: ${lcp}ms`,
              severity: 'medium',
              context: { metric: 'LCP', value: lcp }
            });
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if ('processingStart' in entry && 'startTime' in entry) {
            const fid = (entry as any).processingStart - (entry as any).startTime;
            if (fid > 100) { // Poor FID
              errorLogger.logError({
                error_type: 'javascript',
                error_message: `Poor FID performance: ${fid}ms`,
                severity: 'medium',
                context: { metric: 'FID', value: fid }
              });
            }
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        if (clsValue > 0.1) { // Poor CLS
          errorLogger.logError({
            error_type: 'javascript',
            error_message: `Poor CLS performance: ${clsValue}`,
            severity: 'low',
            context: { metric: 'CLS', value: clsValue }
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Only observe if PerformanceObserver is supported
    if ('PerformanceObserver' in window) {
      observePerformance();
    }

    // Monitor memory usage (if available)
    const checkMemoryUsage = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMemoryMB = memory.totalJSHeapSize / 1024 / 1024;
        
        if (usedMemoryMB > 100) { // High memory usage
          errorLogger.logError({
            error_type: 'javascript',
            error_message: `High memory usage: ${usedMemoryMB.toFixed(2)}MB`,
            severity: 'medium',
            context: { 
              metric: 'memory',
              usedMB: usedMemoryMB,
              totalMB: totalMemoryMB
            }
          });
        }
      }
    };

    const memoryInterval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  // Memoized values for expensive computations
  const memoizedUtils = useMemo(() => ({
    debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },
    
    throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  }), []);

  return { memoizedUtils };
}