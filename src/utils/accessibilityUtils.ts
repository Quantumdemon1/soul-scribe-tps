import { logger } from './structuredLogging';

export interface AccessibilityOptions {
  enableKeyboardNavigation: boolean;
  enableScreenReaderSupport: boolean;
  enableHighContrast: boolean;
  enableFocusIndicators: boolean;
  enableAriaLabels: boolean;
}

class AccessibilityManager {
  private options: AccessibilityOptions;
  private focusableElements: string = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  constructor(options: Partial<AccessibilityOptions> = {}) {
    this.options = {
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableHighContrast: false,
      enableFocusIndicators: true,
      enableAriaLabels: true,
      ...options
    };

    this.initialize();
  }

  private initialize(): void {
    if (this.options.enableKeyboardNavigation) {
      this.enableKeyboardNavigation();
    }

    if (this.options.enableScreenReaderSupport) {
      this.enableScreenReaderSupport();
    }

    if (this.options.enableHighContrast) {
      this.enableHighContrast();
    }

    if (this.options.enableFocusIndicators) {
      this.enableFocusIndicators();
    }

    logger.info('Accessibility features initialized', {
      component: 'AccessibilityManager',
      action: 'initialize',
      metadata: this.options
    });
  }

  private enableKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Tab':
          this.handleTabNavigation(event);
          break;
        case 'Escape':
          this.handleEscapeKey(event);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(event);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          this.handleArrowNavigation(event);
          break;
      }
    });
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    const focusableElements = Array.from(
      document.querySelectorAll(this.focusableElements)
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(activeElement);
    
    if (event.shiftKey) {
      // Shift + Tab (backwards)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
      focusableElements[prevIndex]?.focus();
    } else {
      // Tab (forwards)
      const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
      focusableElements[nextIndex]?.focus();
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
    if (openModals.length > 0) {
      const lastModal = openModals[openModals.length - 1] as HTMLElement;
      const closeButton = lastModal.querySelector('[aria-label*="close"], [data-dismiss]') as HTMLElement;
      closeButton?.click();
      event.preventDefault();
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle activation for custom interactive elements
    if (target.hasAttribute('role') && 
        ['button', 'tab', 'menuitem'].includes(target.getAttribute('role')!)) {
      target.click();
      event.preventDefault();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const parent = target.closest('[role="tablist"], [role="menu"], [role="listbox"]');
    
    if (parent) {
      const items = Array.from(parent.querySelectorAll('[role="tab"], [role="menuitem"], [role="option"]')) as HTMLElement[];
      const currentIndex = items.indexOf(target);
      
      if (currentIndex !== -1) {
        const isVertical = parent.getAttribute('aria-orientation') === 'vertical';
        const nextIndex = event.key === (isVertical ? 'ArrowDown' : 'ArrowRight') 
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;
        
        items[nextIndex]?.focus();
        event.preventDefault();
      }
    }
  }

  private enableScreenReaderSupport(): void {
    // Add live regions for dynamic content
    this.createLiveRegion('polite', 'sr-live-polite');
    this.createLiveRegion('assertive', 'sr-live-assertive');

    // Enhance existing elements
    this.enhanceFormElements();
    this.enhanceButtons();
    this.enhanceNavigationElements();
  }

  private createLiveRegion(politeness: 'polite' | 'assertive', id: string): void {
    if (!document.getElementById(id)) {
      const liveRegion = document.createElement('div');
      liveRegion.id = id;
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  }

  private enhanceFormElements(): void {
    // Add proper labels and descriptions
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label && !element.hasAttribute('aria-labelledby')) {
          element.setAttribute('aria-labelledby', label.id || `label-${element.id}`);
        }
      }

      // Add validation aria attributes
      if (element.hasAttribute('required')) {
        element.setAttribute('aria-required', 'true');
      }
    });
  }

  private enhanceButtons(): void {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((buttonElement) => {
      const button = buttonElement as HTMLButtonElement;
      if (!button.textContent?.trim()) {
        const icon = button.querySelector('svg, i, .icon');
        if (icon) {
          button.setAttribute('aria-label', this.generateButtonLabel(button));
        }
      }
    });
  }

  private enhanceNavigationElements(): void {
    // Add navigation landmarks
    const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
    navs.forEach((navElement, index) => {
      const nav = navElement as HTMLElement;
      nav.setAttribute('aria-label', `Navigation ${index + 1}`);
    });

    // Enhance breadcrumbs
    const breadcrumbs = document.querySelectorAll('[aria-label*="breadcrumb"], .breadcrumb');
    breadcrumbs.forEach((breadcrumbElement) => {
      const breadcrumb = breadcrumbElement as HTMLElement;
      if (!breadcrumb.hasAttribute('role')) {
        breadcrumb.setAttribute('role', 'navigation');
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
      }
    });
  }

  private generateButtonLabel(button: HTMLElement): string {
    const commonPatterns: Record<string, string> = {
      'close': 'Close',
      'menu': 'Menu',
      'search': 'Search',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'back': 'Go back',
      'next': 'Next',
      'previous': 'Previous',
      'submit': 'Submit',
      'cancel': 'Cancel'
    };

    const className = button.className.toLowerCase();
    const dataAction = button.getAttribute('data-action')?.toLowerCase();
    
    for (const [pattern, label] of Object.entries(commonPatterns)) {
      if (className.includes(pattern) || dataAction?.includes(pattern)) {
        return label;
      }
    }

    return 'Button';
  }

  private enableHighContrast(): void {
    document.body.classList.add('high-contrast');
    
    // Add CSS custom properties for high contrast
    const style = document.createElement('style');
    style.textContent = `
      .high-contrast {
        --background: #000000;
        --foreground: #ffffff;
        --muted: #333333;
        --accent: #ffff00;
        --border: #ffffff;
      }
    `;
    document.head.appendChild(style);
  }

  private enableFocusIndicators(): void {
    const style = document.createElement('style');
    style.textContent = `
      .accessibility-focus {
        outline: 3px solid var(--accent, #0066cc) !important;
        outline-offset: 2px !important;
      }
      
      *:focus-visible {
        outline: 3px solid var(--accent, #0066cc) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Public methods for dynamic content
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.getElementById(`sr-live-${priority}`);
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }

    logger.info('Screen reader announcement', {
      component: 'AccessibilityManager',
      action: 'announce',
      metadata: { message, priority }
    });
  }

  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(this.focusableElements) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  updateOptions(newOptions: Partial<AccessibilityOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.initialize();
  }
}

// Singleton instance
export const accessibilityManager = new AccessibilityManager();

// Utility functions
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  accessibilityManager.announceToScreenReader(message, priority);
};

export const trapFocus = (container: HTMLElement) => {
  return accessibilityManager.trapFocus(container);
};

// React hook for accessibility
import { useEffect } from 'react';

export const useAccessibility = (options?: Partial<AccessibilityOptions>) => {
  useEffect(() => {
    if (options) {
      accessibilityManager.updateOptions(options);
    }
  }, [options]);

  return {
    announceToScreenReader,
    trapFocus
  };
};