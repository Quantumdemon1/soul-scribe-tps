import React from 'react';
import { ProductionWrapper } from './ProductionWrapper';
import { MobileSafeArea } from '@/components/ui/mobile-safe-area';
import { MobileResponsiveWrapper } from '@/components/ui/mobile-responsive-wrapper';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileProductionWrapperProps {
  children: React.ReactNode;
}

export const MobileProductionWrapper: React.FC<MobileProductionWrapperProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <ProductionWrapper>
      <MobileSafeArea 
        top={isMobile} 
        bottom={isMobile}
        className="min-h-screen"
      >
        <MobileResponsiveWrapper
          enableTouchOptimization={isMobile}
          optimizeForOrientation={isMobile}
          mobileClassName="px-4 py-2"
          desktopClassName="px-6 py-4"
        >
          {children}
        </MobileResponsiveWrapper>
      </MobileSafeArea>
    </ProductionWrapper>
  );
};