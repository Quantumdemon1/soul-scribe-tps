import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/utils/mobileOptimization';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  enableTouchOptimization?: boolean;
  optimizeForOrientation?: boolean;
}

export const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName,
  enableTouchOptimization = false,
  optimizeForOrientation = false
}) => {
  const { isMobile, orientation } = useMobileOptimization({
    enableTouchOptimization
  });

  const orientationClass = optimizeForOrientation ? 
    (orientation === 'landscape' ? 'landscape-optimized' : 'portrait-optimized') : '';

  return (
    <div
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName,
        orientationClass
      )}
    >
      {children}
    </div>
  );
};