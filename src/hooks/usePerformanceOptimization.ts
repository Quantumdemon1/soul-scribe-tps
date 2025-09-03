import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { errorLogger } from '@/services/errorLoggingService';

// Enhanced performance monitoring and optimization hook
export function usePerformanceOptimization() {
  const performanceMetrics = useRef<Map<string, number>>(new Map());
  const componentRenderStart = useRef<number>(0);

  // Component performance tracking
  const trackComponentRender = useCallback((componentName: string) => {
    componentRenderStart.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - componentRenderStart.current;
      performanceMetrics.current.set(componentName, renderTime);
      
      if (renderTime > 100) { // Slow component render
        errorLogger.logError({
          error_type: 'javascript',
          error_message: `Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`,
          severity: 'medium',
          context: { 
            component: componentName,
            renderTime,
            metric: 'component_render'
          }
        });
      }
    };
  }, []);

  // API call performance tracking
  const trackApiCall = useCallback((apiName: string, startTime: number) => {
    const duration = performance.now() - startTime;
    
    if (duration > 5000) { // Slow API call
      errorLogger.logError({
        error_type: 'network',
        error_message: `Slow API call: ${apiName} took ${duration.toFixed(2)}ms`,
        severity: 'medium',
        context: { 
          api: apiName,
          duration,
          metric: 'api_call'
        }
      });
    }
    
    return duration;
  }, []);
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

  // Enhanced performance utilities
  const performanceUtils = useMemo(() => ({
    ...memoizedUtils,
    
    // Track long-running operations
    trackOperation: <T>(name: string, operation: () => T): T => {
      const start = performance.now();
      const result = operation();
      const duration = performance.now() - start;
      
      if (duration > 1000) {
        errorLogger.logError({
          error_type: 'javascript',
          error_message: `Long operation: ${name} took ${duration.toFixed(2)}ms`,
          severity: 'medium',
          context: { operation: name, duration }
        });
      }
      
      return result;
    },
    
    // Batch API calls to reduce network overhead
    batchApiCalls: async <T>(calls: Array<() => Promise<T>>, batchSize = 3): Promise<T[]> => {
      const results: T[] = [];
      
      for (let i = 0; i < calls.length; i += batchSize) {
        const batch = calls.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch.map(call => call()));
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results[i + index] = result.value;
          } else {
            errorLogger.logError({
              error_type: 'network',
              error_message: `Batch API call failed: ${result.reason}`,
              severity: 'medium',
              context: { batchIndex: i + index, reason: result.reason }
            });
          }
        });
      }
      
      return results;
    },
    
    // Optimize image loading
    preloadImage: (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    }
  }), [memoizedUtils]);

  return { 
    performanceUtils,
    trackComponentRender,
    trackApiCall,
    getMetrics: () => Object.fromEntries(performanceMetrics.current)
  };
}