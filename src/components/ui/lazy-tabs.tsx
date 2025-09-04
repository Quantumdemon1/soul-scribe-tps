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
  const [hasBeenActive, setHasBeenActive] = useState(eager);
  
  return (
    <TabsContent
      ref={ref}
      value={value}
      className={className}
      onFocus={() => setHasBeenActive(true)}
      {...props}
    >
      {hasBeenActive ? children : null}
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
  const [activeTab, setActiveTab] = useState(value || defaultValue || '');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  const handleValueChange = useCallback((newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
    
    // Mark tab as loaded
    if (!loadedTabs.has(newValue)) {
      setLoadedTabs(prev => new Set([...prev, newValue]));
      onTabLoad?.(newValue);
    }
  }, [onValueChange, onTabLoad, loadedTabs]);

  // Preload next tab
  useEffect(() => {
    if (!preloadNext || !activeTab) return;

    const timer = setTimeout(() => {
      // Find the next tab to preload (simplified logic)
      const tabOrder = ['overview', 'insights', 'ai-insights', 'types', 'development', 'career'];
      const currentIndex = tabOrder.indexOf(activeTab);
      const nextTab = tabOrder[currentIndex + 1];
      
      if (nextTab && !loadedTabs.has(nextTab)) {
        onTabLoad?.(nextTab);
      }
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(timer);
  }, [activeTab, preloadNext, onTabLoad, loadedTabs]);

  return (
    <Tabs 
      value={value || activeTab} 
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