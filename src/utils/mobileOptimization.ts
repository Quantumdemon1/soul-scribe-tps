import { useEffect, useState } from 'react';

interface MobileOptimizationOptions {
  disableZoom?: boolean;
  optimizeImages?: boolean;
  enableTouchOptimization?: boolean;
  preloadCriticalContent?: boolean;
}

export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Disable zoom if requested
    if (options.disableZoom) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    // Touch optimization
    if (options.enableTouchOptimization) {
      document.body.style.touchAction = 'manipulation';
      (document.body.style as any).webkitTouchCallout = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
    }

    // Preload critical content
    if (options.preloadCriticalContent) {
      // Add resource hints for critical resources
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = '/css/critical.css';
      document.head.appendChild(preloadLink);
    }
  }, [isMobile, options]);

  return {
    isMobile,
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait'
  };
};

interface MobileOptimizationProviderProps {
  children: React.ReactNode;
  options?: MobileOptimizationOptions;
}

export const MobileOptimizationProvider = ({ children, options = {} }: MobileOptimizationProviderProps) => {
  useMobileOptimization(options);
  return children;
};

// Performance utilities for mobile
export const mobilePerformanceUtils = {
  // Lazy load images when they come into view
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  },

  // Optimize touch events for better responsiveness
  optimizeTouchEvents: (element: HTMLElement) => {
    element.addEventListener('touchstart', () => {}, { passive: true });
    element.addEventListener('touchmove', () => {}, { passive: true });
  },

  // Reduce animations on low-end devices
  reduceMotionForLowEnd: () => {
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                    (navigator as any).deviceMemory <= 2;
    
    if (isLowEnd) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }
  },

  // Preload critical routes
  preloadCriticalRoutes: (routes: string[]) => {
    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
};

// CSS-in-JS mobile-first utilities
export const mobileStyles = {
  // Responsive grid that works well on mobile
  responsiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '0.75rem'
    }
  },

  // Touch-friendly button sizing
  touchButton: {
    minHeight: '44px',
    minWidth: '44px',
    padding: '12px 16px',
    '@media (max-width: 768px)': {
      minHeight: '48px',
      minWidth: '48px',
      padding: '14px 18px'
    }
  },

  // Mobile-optimized text sizing
  responsiveText: {
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    lineHeight: '1.5',
    '@media (max-width: 768px)': {
      fontSize: 'clamp(0.75rem, 4vw, 0.875rem)'
    }
  }
};