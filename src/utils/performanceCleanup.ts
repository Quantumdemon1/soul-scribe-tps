// Performance cleanup and console suppression for production

interface PerformanceCleanupConfig {
  suppressConsole: boolean;
  cleanupIntervals: boolean;
  removeDebugCode: boolean;
  optimizeMemory: boolean;
}

export class PerformanceCleanup {
  private static isProduction = process.env.NODE_ENV === 'production';
  private static cleanupRuns = 0;
  private static readonly MAX_CLEANUP_RUNS = 100;

  static async performProductionCleanup(config: PerformanceCleanupConfig = {
    suppressConsole: true,
    cleanupIntervals: true, 
    removeDebugCode: true,
    optimizeMemory: true
  }): Promise<void> {
    if (!this.isProduction) {
      return; // Don't cleanup in development
    }

    if (this.cleanupRuns >= this.MAX_CLEANUP_RUNS) {
      return; // Prevent excessive cleanup
    }

    try {
      if (config.suppressConsole) {
        this.suppressConsoleOutput();
      }

      if (config.cleanupIntervals) {
        this.cleanupIntervals();
      }

      if (config.removeDebugCode) {
        this.removeDebugElements();
      }

      if (config.optimizeMemory) {
        await this.optimizeMemoryUsage();
      }

      this.cleanupRuns++;
    } catch (error) {
      // Silent fail in production to avoid breaking the app
      if (!this.isProduction) {
        console.error('Cleanup failed:', error);
      }
    }
  }

  private static suppressConsoleOutput(): void {
    if (this.isProduction) {
      const noop = () => {};
      
      // Suppress only in production
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      console.debug = noop;
      
      // Keep error logging for debugging critical issues
      const originalError = console.error;
      console.error = (...args) => {
        // Only log actual errors, not warnings
        if (args.some(arg => arg instanceof Error || (typeof arg === 'string' && arg.toLowerCase().includes('error')))) {
          originalError.apply(console, args);
        }
      };
    }
  }

  private static cleanupIntervals(): void {
    // Clean up any orphaned intervals or timeouts
    // In a real implementation, this would track and clear intervals
    try {
      // Clear high interval IDs that might be orphaned
      for (let i = 1; i < 1000; i++) {
        try {
          clearInterval(i);
          clearTimeout(i);
        } catch {
          // Ignore errors when clearing non-existent intervals
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  private static removeDebugElements(): void {
    try {
      // Remove debug elements that might exist
      const debugSelectors = [
        '[data-debug]',
        '[data-test]',
        '.debug',
        '.test-only',
        '[id*=\\\"debug\\\"]',
        '[class*=\\\"debug\\\"]'
      ];

      debugSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            element.remove();
          } catch {
            // Element might already be removed
          }
        });
      });
    } catch (error) {
      // Silent fail
    }
  }

  private static async optimizeMemoryUsage(): Promise<void> {
    try {
      // Force garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }

      // Clear any cached data that's no longer needed
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        // Only clear old caches, keep recent ones
        const oldCaches = cacheNames.filter(name => 
          name.includes('old') || name.includes('temp')
        );
        
        await Promise.all(
          oldCaches.map(cacheName => caches.delete(cacheName))
        );
      }

      // Optimize images by removing data URLs from memory
      const images = document.querySelectorAll('img[src^=\\\"data:\\\"]');
      images.forEach(img => {
        if (!img.getBoundingClientRect().width) {
          // Image is not visible, clear its data URL
          (img as HTMLImageElement).src = '';
        }
      });
    } catch (error) {
      // Silent fail
    }
  }

  static checkMemoryUsage(): { usage: number; isHigh: boolean; recommendations: string[] } {
    try {
      const performance = (window as any).performance;
      
      if (performance && performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        const isHigh = usage > 80;

        const recommendations: string[] = [];
        if (isHigh) {
          recommendations.push('High memory usage detected');
          recommendations.push('Consider implementing component unmounting');
          recommendations.push('Review for memory leaks in event listeners');
          recommendations.push('Optimize large data structures');
        }

        return {
          usage: Math.round(usage),
          isHigh,
          recommendations
        };
      }

      // Fallback when memory API is not available
      return {
        usage: 0,
        isHigh: false,
        recommendations: ['Memory monitoring not available in this browser']
      };
    } catch (error) {
      return {
        usage: 0,
        isHigh: false,
        recommendations: ['Memory monitoring failed']
      };
    }
  }

  static getOptimizationReport(): string {
    const memoryInfo = this.checkMemoryUsage();
    
    return `
# Performance Optimization Report

## Memory Usage: ${memoryInfo.usage}%
${memoryInfo.isHigh ? '⚠️ High memory usage detected' : '✓ Memory usage is normal'}

## Optimizations Applied:
- Console output: ${this.isProduction ? 'Suppressed' : 'Active (development)'}
- Cleanup runs: ${this.cleanupRuns}/${this.MAX_CLEANUP_RUNS}
- Memory optimization: ${this.cleanupRuns > 0 ? 'Applied' : 'Pending'}

## Recommendations:
${memoryInfo.recommendations.map(rec => `- ${rec}`).join('\n')}

${this.cleanupRuns >= this.MAX_CLEANUP_RUNS ? 
  '⚠️ Maximum cleanup runs reached. Further optimization may be needed.' : 
  '✓ System optimization is active.'
}`.trim();
  }
}
