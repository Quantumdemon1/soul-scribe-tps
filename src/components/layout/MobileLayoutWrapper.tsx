import React from 'react';
import { MobileLayoutOptimizer } from '@/components/ui/mobile-layout-optimizer';
import { MobileResponsiveWrapper } from '@/components/ui/mobile-responsive-wrapper';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutWrapperProps {
  children: React.ReactNode;
  enableSafeArea?: boolean;
  optimizeForOrientation?: boolean;
  preventOverscroll?: boolean;
}

export const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({
  children,
  enableSafeArea = true,
  optimizeForOrientation = true,
  preventOverscroll = true
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <MobileLayoutOptimizer
      enableSafeArea={enableSafeArea}
      preventOverscroll={preventOverscroll}
      className="min-h-screen"
    >
      <MobileResponsiveWrapper
        optimizeForOrientation={optimizeForOrientation}
        enableTouchOptimization={true}
        className="w-full"
      >
        {children}
      </MobileResponsiveWrapper>
    </MobileLayoutOptimizer>
  );
};