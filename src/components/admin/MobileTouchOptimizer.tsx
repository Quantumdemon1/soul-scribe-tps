import React from 'react';
import { cn } from '@/lib/utils';

interface MobileTouchOptimizerProps {
  children: React.ReactNode;
  className?: string;
  enableTouchFeedback?: boolean;
  minTouchTarget?: number;
}

export const MobileTouchOptimizer: React.FC<MobileTouchOptimizerProps> = ({
  children,
  className,
  enableTouchFeedback = true,
  minTouchTarget = 44
}) => {
  return (
    <div
      className={cn(
        "touch-manipulation",
        enableTouchFeedback && "active:scale-[0.98] transition-transform duration-75",
        className
      )}
      style={{
        minHeight: `${minTouchTarget}px`,
        minWidth: `${minTouchTarget}px`,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  );
};

interface MobileFormOptimizerProps {
  children: React.ReactNode;
  className?: string;
  preventZoom?: boolean;
}

export const MobileFormOptimizer: React.FC<MobileFormOptimizerProps> = ({
  children,
  className,
  preventZoom = true
}) => {
  React.useEffect(() => {
    if (preventZoom) {
      // Prevent zoom on form inputs for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const currentContent = viewport.getAttribute('content') || '';
        if (!currentContent.includes('user-scalable=no')) {
          viewport.setAttribute('content', `${currentContent}, user-scalable=no`);
        }
      }
    }
  }, [preventZoom]);

  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'input') {
          return React.cloneElement(child, {
            ...child.props,
            style: {
              ...child.props.style,
              fontSize: '16px', // Prevent zoom on iOS
            }
          });
        }
        return child;
      })}
    </div>
  );
};