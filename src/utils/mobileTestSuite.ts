// Mobile testing utilities for production readiness
import { logger } from './structuredLogging';

interface MobileTestResult {
  test: string;
  passed: boolean;
  details?: string;
  performance?: number;
}

export class MobileTestSuite {
  private results: MobileTestResult[] = [];

  // Test touch responsiveness
  async testTouchResponsiveness(): Promise<MobileTestResult> {
    return new Promise((resolve) => {
      const testElement = document.createElement('button');
      testElement.style.cssText = `
        position: fixed; 
        top: -100px; 
        width: 44px; 
        height: 44px; 
        opacity: 0;
      `;
      document.body.appendChild(testElement);

      const startTime = performance.now();
      testElement.addEventListener('touchstart', () => {
        const responseTime = performance.now() - startTime;
        document.body.removeChild(testElement);
        
        resolve({
          test: 'Touch Responsiveness',
          passed: responseTime < 100,
          performance: responseTime,
          details: `Response time: ${responseTime.toFixed(2)}ms`
        });
      }, { passive: true });

      // Simulate touch
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
          identifier: 0,
          target: testElement,
          clientX: 22,
          clientY: 22,
          radiusX: 10,
          radiusY: 10,
          rotationAngle: 0,
          force: 1
        })]
      });

      setTimeout(() => testElement.dispatchEvent(touchEvent), 10);
    });
  }

  // Test viewport responsiveness
  testViewportResponsiveness(): MobileTestResult {
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = !!viewport;
    const hasProperContent = viewport?.getAttribute('content')?.includes('width=device-width');

    return {
      test: 'Viewport Configuration',
      passed: hasViewport && !!hasProperContent,
      details: hasViewport ? viewport.getAttribute('content') || 'No content' : 'No viewport meta tag'
    };
  }

  // Test font size accessibility
  testFontSizeAccessibility(): MobileTestResult {
    const elements = document.querySelectorAll('p, span, div, button, input');
    let smallTextCount = 0;
    
    elements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const fontSize = parseInt(computedStyle.fontSize);
      if (fontSize < 14) smallTextCount++;
    });

    const passed = smallTextCount / elements.length < 0.1; // Less than 10% should have small text

    return {
      test: 'Font Size Accessibility',
      passed,
      details: `${smallTextCount}/${elements.length} elements with font-size < 14px`
    };
  }

  // Test button touch targets
  testButtonTouchTargets(): MobileTestResult {
    const buttons = document.querySelectorAll('button, [role="button"], input[type="button"]');
    let undersizedButtons = 0;

    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        undersizedButtons++;
      }
    });

    const passed = undersizedButtons === 0;

    return {
      test: 'Button Touch Targets',
      passed,
      details: `${undersizedButtons}/${buttons.length} buttons below 44px minimum`
    };
  }

  // Test scroll performance
  async testScrollPerformance(): Promise<MobileTestResult> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      let scrolling = true;

      const measureFrame = () => {
        if (scrolling) {
          frameCount++;
          requestAnimationFrame(measureFrame);
        }
      };

      const handleScroll = () => {
        if (scrolling) {
          measureFrame();
          
          setTimeout(() => {
            scrolling = false;
            const duration = performance.now() - startTime;
            const fps = (frameCount * 1000) / duration;
            
            window.removeEventListener('scroll', handleScroll);
            
            resolve({
              test: 'Scroll Performance',
              passed: fps >= 50, // 50+ FPS is acceptable for mobile
              performance: fps,
              details: `${fps.toFixed(1)} FPS during scroll`
            });
          }, 1000);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Trigger scroll
      window.scrollBy(0, 100);
    });
  }

  // Run all mobile tests
  async runAllTests(): Promise<MobileTestResult[]> {
    this.results = [];

    try {
      // Synchronous tests
      this.results.push(this.testViewportResponsiveness());
      this.results.push(this.testFontSizeAccessibility());
      this.results.push(this.testButtonTouchTargets());

      // Asynchronous tests
      this.results.push(await this.testTouchResponsiveness());
      this.results.push(await this.testScrollPerformance());

      // Log results
      const passedTests = this.results.filter(r => r.passed).length;
      const totalTests = this.results.length;

      logger.info('Mobile test suite completed', {
        component: 'MobileTestSuite',
        metadata: {
          passedTests,
          totalTests,
          results: this.results
        }
      });

      return this.results;
    } catch (error) {
      logger.error('Mobile test suite failed', {
        component: 'MobileTestSuite',
        metadata: { error: (error as Error).message }
      });
      
      return this.results;
    }
  }

  // Get test summary
  getTestSummary(): { passed: number; total: number; score: number } {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const score = total > 0 ? (passed / total) * 100 : 0;

    return { passed, total, score };
  }
}

// Export singleton instance
export const mobileTestSuite = new MobileTestSuite();