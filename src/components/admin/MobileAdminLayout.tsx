import React from 'react';
import { MobileLayoutOptimizer } from '@/components/ui/mobile-layout-optimizer';
import { MobileResponsiveWrapper } from '@/components/ui/mobile-responsive-wrapper';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileAdminLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerActions?: React.ReactNode;
}

export const MobileAdminLayout: React.FC<MobileAdminLayoutProps> = ({
  children,
  className,
  title,
  headerActions
}) => {
  return (
    <MobileLayoutOptimizer
      enableSafeArea
      preventOverscroll
      className="min-h-screen bg-background"
    >
      <MobileResponsiveWrapper
        className={cn("p-4 space-y-4", className)}
        mobileClassName="p-3 space-y-3"
        enableTouchOptimization
      >
        {title && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 border-b">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {headerActions && (
              <div className="flex gap-2">
                {headerActions}
              </div>
            )}
          </div>
        )}
        
        <Card className="bg-card border border-border shadow-sm">
          <div className="p-4">
            {children}
          </div>
        </Card>
      </MobileResponsiveWrapper>
    </MobileLayoutOptimizer>
  );
};