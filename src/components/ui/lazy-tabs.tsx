import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LazyTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  preloadNext?: boolean;
  onTabLoad?: (tabId: string) => void;
}

interface LazyTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  eager?: boolean;
}

const LazyTabsContent = React.forwardRef<
  HTMLDivElement,
  LazyTabsContentProps
>(({ value, children, className, eager = false, ...props }, ref) => {
  return (
    <TabsContent
      ref={ref}
      value={value}
      className={className}
      {...props}
    >
      {children}
    </TabsContent>
  );
});

LazyTabsContent.displayName = 'LazyTabsContent';

export const LazyTabs: React.FC<LazyTabsProps> & {
  Content: typeof LazyTabsContent;
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
} = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  className, 
  children, 
  preloadNext = true,
  onTabLoad 
}) => {
  const handleValueChange = useCallback((newValue: string) => {
    onValueChange?.(newValue);
    onTabLoad?.(newValue);
  }, [onValueChange, onTabLoad]);

  return (
    <Tabs 
      defaultValue={defaultValue}
      value={value} 
      onValueChange={handleValueChange}
      className={className}
    >
      {children}
    </Tabs>
  );
};

LazyTabs.Content = LazyTabsContent;
LazyTabs.List = TabsList;
LazyTabs.Trigger = TabsTrigger;