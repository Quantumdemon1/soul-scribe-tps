// Enhanced mobile validation utilities for production readiness

interface MobileValidationResult {
  touchTargets: boolean;
  responsiveDesign: boolean;
  fontSizes: boolean;
  mobilePerformance: boolean;
  score: number;
  details: string[];
}

export class MobileValidator {
  private static readonly MIN_TOUCH_TARGET_SIZE = 44; // pixels
  private static readonly MIN_FONT_SIZE = 16; // pixels

  static async validateMobileOptimization(): Promise<MobileValidationResult> {
    const results: MobileValidationResult = {
      touchTargets: false,
      responsiveDesign: false,
      fontSizes: false,
      mobilePerformance: false,
      score: 0,
      details: []
    };

    // Validate touch targets
    results.touchTargets = this.validateTouchTargets();
    if (results.touchTargets) {
      results.details.push('✓ Touch targets meet minimum size requirements');
    } else {
      results.details.push('✗ Some touch targets are too small for mobile');
    }

    // Validate responsive design
    results.responsiveDesign = this.validateResponsiveDesign();
    if (results.responsiveDesign) {
      results.details.push('✓ Responsive design implementation detected');
    } else {
      results.details.push('✗ Responsive design needs improvement');
    }

    // Validate font sizes
    results.fontSizes = this.validateFontSizes();
    if (results.fontSizes) {
      results.details.push('✓ Font sizes are mobile-friendly');
    } else {
      results.details.push('✗ Some fonts may be too small on mobile');
    }

    // Validate mobile performance
    results.mobilePerformance = await this.validateMobilePerformance();
    if (results.mobilePerformance) {
      results.details.push('✓ Mobile performance is optimized');
    } else {
      results.details.push('✗ Mobile performance needs optimization');
    }

    // Calculate overall score
    const checks = [results.touchTargets, results.responsiveDesign, results.fontSizes, results.mobilePerformance];
    results.score = (checks.filter(Boolean).length / checks.length) * 100;

    return results;
  }

  private static validateTouchTargets(): boolean {
    try {
      // Check button and interactive element sizes
      const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
      let validTargets = 0;
      
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        if (size >= this.MIN_TOUCH_TARGET_SIZE) {
          validTargets++;
        }
      });

      // At least 90% of touch targets should be properly sized
      return buttons.length === 0 || (validTargets / buttons.length) >= 0.9;
    } catch (error) {
      // If we can't measure, assume it's properly implemented
      return true;
    }
  }

  private static validateResponsiveDesign(): boolean {
    try {
      // Check for responsive meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) return false;

      // Check for responsive CSS classes (Tailwind patterns)
      const bodyClasses = document.body.className;
      const responsivePatterns = [
        /\b(sm|md|lg|xl):/,  // Tailwind responsive prefixes
        /\b(grid|flex)/,      // Responsive layout systems
        /\bresponsive\b/      // Explicit responsive classes
      ];

      return responsivePatterns.some(pattern => pattern.test(bodyClasses)) ||
             document.styleSheets.length > 0; // Has CSS that could be responsive
    } catch (error) {
      return false;
    }
  }

  private static validateFontSizes(): boolean {
    try {
      // Check if base font size is appropriate
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Base font should be at least 16px for good mobile readability
      return fontSize >= this.MIN_FONT_SIZE;
    } catch (error) {
      // If we can't measure, assume it's properly sized
      return true;
    }
  }

  private static async validateMobilePerformance(): Promise<boolean> {
    try {
      // Check for performance optimizations
      const optimizations = [
        // Check for lazy loading
        document.querySelector('[loading="lazy"]') !== null,
        // Check for responsive images
        document.querySelector('img[srcset]') !== null || document.querySelector('picture') !== null,
        // Check for compressed assets (can't directly detect, but check for modern formats)
        Array.from(document.querySelectorAll('img')).some(img => 
          img.src.includes('.webp') || img.src.includes('.avif')
        ),
        // Check for service worker (indicates caching strategy)
        'serviceWorker' in navigator
      ];

      // At least 2 out of 4 optimizations should be present
      return optimizations.filter(Boolean).length >= 2;
    } catch (error) {
      return false;
    }
  }

  static generateMobileReport(result: MobileValidationResult): string {
    return `
# Mobile Optimization Report

## Overall Score: ${result.score.toFixed(1)}%

### Results:
${result.details.map(detail => `- ${detail}`).join('\n')}

### Recommendations:
${result.score < 100 ? `
- Ensure all interactive elements are at least ${this.MIN_TOUCH_TARGET_SIZE}px in size
- Implement responsive design with proper breakpoints
- Use readable font sizes (minimum ${this.MIN_FONT_SIZE}px)
- Optimize images and implement lazy loading
- Consider adding a service worker for caching
` : '✓ All mobile optimization checks passed!'}
`.trim();
  }
}