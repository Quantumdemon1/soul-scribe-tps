// Production optimization utilities
import { logger } from './structuredLogging';

export class ProductionOptimizer {
  private static instance: ProductionOptimizer;
  private isProduction = import.meta.env.PROD;
  
  static getInstance(): ProductionOptimizer {
    if (!ProductionOptimizer.instance) {
      ProductionOptimizer.instance = new ProductionOptimizer();
    }
    return ProductionOptimizer.instance;
  }

  // Remove debug statements in production
  removeDebugCode(): void {
    if (this.isProduction) {
      // Console suppression handled by debugCleanup utility
      logger.info('Debug code removal activated for production');
    }
  }

  // Optimize for mobile performance
  optimizeForMobile(): void {
    if (typeof window !== 'undefined') {
      // Reduce motion for low-end devices
      const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                      (navigator as any).deviceMemory <= 2;
      
      if (isLowEnd) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
        
        logger.info('Low-end device optimization applied');
      }

      // Optimize touch events
      document.addEventListener('touchstart', () => {}, { passive: true });
      document.addEventListener('touchmove', () => {}, { passive: true });
    }
  }

  // Bundle size optimization tracking
  trackBundleSize(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (entries.length > 0) {
          const timing = entries[0];
          
          logger.info('Bundle load performance', {
            component: 'ProductionOptimizer',
            metadata: {
              loadTime: timing.loadEventEnd - timing.loadEventStart,
              domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
              transferSize: timing.transferSize
            }
          });
        }
      });
    }
  }

  // Initialize all optimizations
  initialize(): void {
    this.removeDebugCode();
    this.optimizeForMobile();
    this.trackBundleSize();
    
    logger.info('Production optimizations initialized', {
      component: 'ProductionOptimizer',
      metadata: { 
        isProduction: this.isProduction,
        userAgent: navigator.userAgent.substring(0, 100)
      }
    });
  }
}

// Auto-initialize on import
ProductionOptimizer.getInstance().initialize();