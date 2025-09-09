import { logger } from './structuredLogging';

export class BundleOptimizer {
  private static readonly MAX_BUNDLE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly CHUNK_SIZE_LIMIT = 256 * 1024; // 256KB per chunk

  static analyzeBundle(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navigation = entries[0];
      
      if (navigation) {
        const bundleSize = navigation.transferSize || 0;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        logger.performance('bundle_analysis', loadTime, {
          bundleSize,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize,
          compressionRatio: navigation.encodedBodySize / navigation.decodedBodySize
        });

        // Check if bundle size is within limits
        if (bundleSize > this.MAX_BUNDLE_SIZE) {
          logger.warn('Bundle size exceeds recommended limit', {
            component: 'BundleOptimizer',
            metadata: {
              currentSize: bundleSize,
              maxSize: this.MAX_BUNDLE_SIZE,
              excess: bundleSize - this.MAX_BUNDLE_SIZE
            }
          });
        }

        // Analyze resource loading
        this.analyzeResourceLoading();
      }
    });
  }

  private static analyzeResourceLoading(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const analysis = {
      totalResources: resources.length,
      largeResources: resources.filter(r => r.transferSize > this.CHUNK_SIZE_LIMIT).length,
      slowResources: resources.filter(r => r.duration > 1000).length,
      cachedResources: resources.filter(r => r.transferSize === 0).length,
      totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };

    logger.info('Resource loading analysis', {
      component: 'BundleOptimizer',
      action: 'analyzeResourceLoading',
      metadata: analysis
    });

    // Identify optimization opportunities
    if (analysis.largeResources > 0) {
      logger.warn(`${analysis.largeResources} resources exceed ${this.CHUNK_SIZE_LIMIT / 1024}KB`, {
        component: 'BundleOptimizer',
        metadata: { largeResources: analysis.largeResources }
      });
    }
  }

  static optimizeChunkLoading(): void {
    // Preload critical routes
    const criticalRoutes = ['/', '/assessments', '/profile'];
    
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    logger.info('Critical routes preloaded', {
      component: 'BundleOptimizer',
      action: 'optimizeChunkLoading',
      metadata: { routes: criticalRoutes }
    });
  }

  static enableCompression(): void {
    // This is typically handled by the server/CDN, but we can hint at it
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        logger.info('Service worker registered for compression', {
          component: 'BundleOptimizer',
          action: 'enableCompression'
        });
      }).catch(() => {
        // Service worker not available, that's ok
      });
    }
  }

  static initialize(): void {
    this.analyzeBundle();
    this.optimizeChunkLoading();
    this.enableCompression();
    
    logger.info('Bundle optimizer initialized', {
      component: 'BundleOptimizer',
      action: 'initialize'
    });
  }
}

// Auto-initialize
BundleOptimizer.initialize();