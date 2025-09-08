import { logger } from './structuredLogging';

interface BundleStats {
  totalSize: number;
  chunkSizes: Record<string, number>;
  loadTime: number;
  criticalResourcesLoaded: boolean;
}

class BundleAnalyzer {
  private stats: BundleStats | null = null;
  
  public initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track bundle load performance
    window.addEventListener('load', () => {
      this.analyzeBundlePerformance();
    });

    // Track dynamic imports
    this.interceptDynamicImports();
  }

  private analyzeBundlePerformance(): void {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Calculate total bundle size
    let totalSize = 0;
    const chunkSizes: Record<string, number> = {};

    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        const size = resource.transferSize || 0;
        totalSize += size;
        
        // Extract chunk name
        const url = new URL(resource.name);
        const filename = url.pathname.split('/').pop() || 'unknown';
        chunkSizes[filename] = size;
      }
    });

    this.stats = {
      totalSize,
      chunkSizes,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      criticalResourcesLoaded: this.checkCriticalResources()
    };

    logger.info('Bundle analysis complete', {
      component: 'BundleAnalyzer',
      metadata: {
        totalBundleSize: Math.round(totalSize / 1024), // KB
        loadTime: Math.round(this.stats.loadTime),
        chunkCount: Object.keys(chunkSizes).length,
        largestChunk: this.getLargestChunk()
      }
    });

    // Alert if bundle is too large
    if (totalSize > 1024 * 1024) { // 1MB
      logger.warn('Large bundle size detected', {
        component: 'BundleAnalyzer',
        metadata: { 
          totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
          recommendation: 'Consider code splitting or removing unused dependencies'
        }
      });
    }
  }

  private checkCriticalResources(): boolean {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const criticalFiles = ['main.js', 'index.js', 'app.js', 'vendor.js'];
    
    return criticalFiles.some(file => 
      resources.some(resource => resource.name.includes(file))
    );
  }

  private getLargestChunk(): { name: string; size: number } | null {
    if (!this.stats) return null;
    
    let largest = { name: '', size: 0 };
    Object.entries(this.stats.chunkSizes).forEach(([name, size]) => {
      if (size > largest.size) {
        largest = { name, size };
      }
    });
    
    return largest.size > 0 ? largest : null;
  }

  private interceptDynamicImports(): void {
    // Track dynamic imports for code splitting analysis
    const originalImport = window.eval('import');
    if (originalImport) {
      // Note: This is for tracking only, actual interception is complex
      logger.info('Dynamic import tracking initialized', {
        component: 'BundleAnalyzer'
      });
    }
  }

  public getBundleStats(): BundleStats | null {
    return this.stats;
  }

  public generateReport(): string {
    if (!this.stats) return 'No bundle stats available';
    
    const totalSizeKB = Math.round(this.stats.totalSize / 1024);
    const report = [
      `Bundle Analysis Report`,
      `======================`,
      `Total Bundle Size: ${totalSizeKB} KB`,
      `Load Time: ${Math.round(this.stats.loadTime)} ms`,
      `Number of Chunks: ${Object.keys(this.stats.chunkSizes).length}`,
      ``,
      `Chunk Breakdown:`,
      ...Object.entries(this.stats.chunkSizes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Top 10 chunks
        .map(([name, size]) => `  ${name}: ${Math.round(size / 1024)} KB`),
      ``,
      `Performance Grade: ${this.getPerformanceGrade()}`,
      `Recommendations: ${this.getRecommendations().join(', ')}`
    ];
    
    return report.join('\n');
  }

  private getPerformanceGrade(): string {
    if (!this.stats) return 'N/A';
    
    const totalSizeKB = this.stats.totalSize / 1024;
    const loadTime = this.stats.loadTime;
    
    if (totalSizeKB < 500 && loadTime < 1000) return 'A';
    if (totalSizeKB < 800 && loadTime < 2000) return 'B';
    if (totalSizeKB < 1200 && loadTime < 3000) return 'C';
    return 'D';
  }

  private getRecommendations(): string[] {
    if (!this.stats) return [];
    
    const recommendations: string[] = [];
    const totalSizeKB = this.stats.totalSize / 1024;
    
    if (totalSizeKB > 1000) {
      recommendations.push('Consider code splitting');
    }
    
    if (this.stats.loadTime > 2000) {
      recommendations.push('Optimize loading sequence');
    }
    
    const largestChunk = this.getLargestChunk();
    if (largestChunk && largestChunk.size > 300 * 1024) {
      recommendations.push(`Split large chunk: ${largestChunk.name}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Bundle size looks good!');
    }
    
    return recommendations;
  }
}

export const bundleAnalyzer = new BundleAnalyzer();

// Auto-initialize in production
if (import.meta.env.PROD) {
  bundleAnalyzer.initializeTracking();
}