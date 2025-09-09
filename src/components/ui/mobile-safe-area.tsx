import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  insetType?: 'safe-area' | 'constant';
}

export const MobileSafeArea: React.FC<MobileSafeAreaProps> = ({
  children,
  className,
  top = false,
  bottom = false,
  insetType = 'safe-area'
}) => {
  const safeAreaStyles: React.CSSProperties = {};
  
  if (top) {
    safeAreaStyles.paddingTop = `env(${insetType}-inset-top)`;
  }
  
  if (bottom) {
    safeAreaStyles.paddingBottom = `env(${insetType}-inset-bottom)`;
  }

  return (
    <div 
      className={cn(className)} 
      style={safeAreaStyles}
    >
      {children}
    </div>
  );
};