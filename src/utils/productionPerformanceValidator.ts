// Production performance validation and mobile optimization tests

interface PerformanceTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  value: number;
  threshold: number;
  details: string;
}

export class ProductionPerformanceValidator {
  private static results: PerformanceTestResult[] = [];

  static async validateProductionPerformance(): Promise<PerformanceTestResult[]> {
    this.results = [];
    
    // Test 1: Memory Usage
    await this.testMemoryUsage();
    
    // Test 2: Bundle Size
    await this.testBundleSize();
    
    // Test 3: Mobile Performance
    await this.testMobilePerformance();
    
    // Test 4: PerformanceMonitor Health
    await this.testPerformanceMonitorHealth();
    
    // Test 5: Component Render Performance
    await this.testComponentRenderPerformance();
    
    return this.results;
  }

  private static async testMemoryUsage(): Promise<void> {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      const threshold = 100; // 100MB threshold
      
      this.results.push({
        testName: 'Memory Usage',
        status: usedMB < threshold ? 'passed' : 'warning',
        value: usedMB,
        threshold,
        details: `Current usage: ${usedMB.toFixed(2)}MB. ${usedMB < threshold ? 'Within acceptable limits.' : 'Consider optimization.'}`
      });
    } else {
      this.results.push({
        testName: 'Memory Usage',
        status: 'warning',
        value: 0,
        threshold: 100,
        details: 'Memory API not available in this environment'
      });
    }
  }

  private static async testBundleSize(): Promise<void> {
    if (typeof performance !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const transferSize = navigation?.transferSize || 0;
      const sizeMB = transferSize / (1024 * 1024);
      const threshold = 2; // 2MB threshold
      
      this.results.push({
        testName: 'Bundle Size',
        status: sizeMB < threshold ? 'passed' : 'warning',
        value: sizeMB,
        threshold,
        details: `Bundle size: ${sizeMB.toFixed(2)}MB. ${sizeMB < threshold ? 'Optimized for production.' : 'Consider further optimization.'}`
      });
    }
  }

  private static async testMobilePerformance(): Promise<void> {
    const isMobile = window.innerWidth <= 768;
    const touchElements = document.querySelectorAll('button, [role="button"], input[type="button"]');
    let undersizedCount = 0;
    
    touchElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        undersizedCount++;
      }
    });
    
    const compliance = (touchElements.length - undersizedCount) / touchElements.length * 100;
    
    this.results.push({
      testName: 'Mobile Touch Targets',
      status: compliance >= 90 ? 'passed' : 'failed',
      value: compliance,
      threshold: 90,
      details: `${compliance.toFixed(1)}% of touch targets meet 44px minimum. ${undersizedCount} elements need adjustment.`
    });
  }

  private static async testPerformanceMonitorHealth(): Promise<void> {
    // Check if PerformanceMonitor is working without infinite loops
    const startTime = performance.now();
    let isHealthy = true;
    
    try {
      // Monitor for any console errors related to maximum update depth
      const originalError = console.error;
      let hasMaxUpdateError = false;
      
      console.error = (...args: unknown[]) => {
        const message = args.join(' ');
        if (message.includes('Maximum update depth') || message.includes('infinite loop')) {
          hasMaxUpdateError = true;
        }
        originalError.apply(console, args);
      };
      
      // Wait a short time to check for issues
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.error = originalError;
      
      const duration = performance.now() - startTime;
      isHealthy = !hasMaxUpdateError && duration < 1500; // Should complete quickly
      
      this.results.push({
        testName: 'PerformanceMonitor Health',
        status: isHealthy ? 'passed' : 'failed',
        value: duration,
        threshold: 1500,
        details: hasMaxUpdateError 
          ? 'Infinite loop detected in PerformanceMonitor'
          : `Monitor health check completed in ${duration.toFixed(2)}ms`
      });
    } catch (error) {
      this.results.push({
        testName: 'PerformanceMonitor Health',
        status: 'failed',
        value: 0,
        threshold: 1500,
        details: `Health check failed: ${(error as Error).message}`
      });
    }
  }

  private static async testComponentRenderPerformance(): Promise<void> {
    const startTime = performance.now();
    
    // Test component mounting/unmounting performance
    const testDiv = document.createElement('div');
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);
    
    // Simulate component operations
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      element.innerHTML = `<span>Test ${i}</span>`;
      testDiv.appendChild(element);
    }
    
    document.body.removeChild(testDiv);
    
    const duration = performance.now() - startTime;
    const threshold = 16; // 16ms for 60fps
    
    this.results.push({
      testName: 'Component Render Performance',
      status: duration < threshold ? 'passed' : 'warning',
      value: duration,
      threshold,
      details: `DOM operations completed in ${duration.toFixed(2)}ms. ${duration < threshold ? 'Excellent performance.' : 'Consider optimization.'}`
    });
  }

  static generatePerformanceReport(): string {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    let report = `Performance Validation Report\n`;
    report += `=============================\n\n`;
    report += `Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n\n`;
    
    this.results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      report += `${icon} ${result.testName}: ${result.details}\n`;
    });
    
    return report;
  }

  static getOverallScore(): number {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const warningTests = this.results.filter(r => r.status === 'warning').length;
    
    // Passed = 100%, Warning = 75%, Failed = 0%
    return ((passedTests * 100) + (warningTests * 75)) / (totalTests * 100) * 100;
  }
}