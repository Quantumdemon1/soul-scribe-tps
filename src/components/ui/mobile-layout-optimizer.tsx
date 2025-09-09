import React from 'react';
import { cn } from '@/lib/utils';
import { MobileSafeArea } from './mobile-safe-area';
import { useMobileOptimization } from '@/utils/mobileOptimization';

interface MobileLayoutOptimizerProps {
  children: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  preventOverscroll?: boolean;
}

export const MobileLayoutOptimizer: React.FC<MobileLayoutOptimizerProps> = ({
  children,
  className,
  enableSafeArea = true,
  stickyHeader = false,
  stickyFooter = false,
  preventOverscroll = true
}) => {
  const { isMobile, orientation } = useMobileOptimization({
    enableTouchOptimization: true
  });

  const layoutStyles: React.CSSProperties = {
    ...(preventOverscroll && isMobile && {
      overscrollBehavior: 'none',
      WebkitOverflowScrolling: 'touch'
    }),
    ...(isMobile && {
      minHeight: '100dvh' // Dynamic viewport height for mobile
    })
  };

  const containerClasses = cn(
    'flex flex-col',
    {
      'sticky top-0': stickyHeader && isMobile,
      'sticky bottom-0': stickyFooter && isMobile,
      'h-screen': isMobile,
      'landscape:h-screen': orientation === 'landscape'
    },
    className
  );

  if (enableSafeArea && isMobile) {
    return (
      <div style={layoutStyles}>
        <MobileSafeArea
          top={stickyHeader}
          bottom={stickyFooter}
          className={containerClasses}
        >
          {children}
        </MobileSafeArea>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={layoutStyles}>
      {children}
    </div>
  );
};

interface MobileScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  showScrollIndicator?: boolean;
}

export const MobileScrollContainer: React.FC<MobileScrollContainerProps> = ({
  children,
  className,
  enablePullToRefresh = false,
  onRefresh,
  showScrollIndicator = true
}) => {
  const { isMobile } = useMobileOptimization();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const scrollStyles: React.CSSProperties = {
    ...(isMobile && {
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth'
    })
  };

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto',
        {
          'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent': showScrollIndicator && !isMobile,
          'hide-scrollbar': isMobile && !showScrollIndicator
        },
        className
      )}
      style={scrollStyles}
      onTouchStart={enablePullToRefresh ? handleRefresh : undefined}
    >
      {isRefreshing && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {children}
    </div>
  );
};