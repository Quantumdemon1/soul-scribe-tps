import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LazyTabs } from '@/components/ui/lazy-tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  User, 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Briefcase, 
  GitCompare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDashboardTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  onTabLoad: (tabId: string) => void;
  children: React.ReactNode;
}

const tabConfig = [
  { value: 'overview', icon: User, label: 'Overview' },
  { value: 'insights', icon: Brain, label: 'Insights' },
  { value: 'ai-insights', icon: Sparkles, label: 'AI' },
  { value: 'types', icon: Target, label: 'Types' },
  { value: 'development', icon: TrendingUp, label: 'Growth' },
  { value: 'career', icon: Briefcase, label: 'Career' },
  { value: 'comparison', icon: GitCompare, label: 'Compare' },
  { value: 'enhanced', icon: Brain, label: 'Enhanced' },
];

export const MobileDashboardTabs: React.FC<MobileDashboardTabsProps> = ({
  value,
  onValueChange,
  onTabLoad,
  children
}) => {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active tab on mobile
  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      const activeTabIndex = tabConfig.findIndex(tab => tab.value === value);
      if (activeTabIndex !== -1) {
        const scrollContainer = scrollContainerRef.current;
        const tabWidth = 100; // Approximate tab width
        const scrollPosition = activeTabIndex * tabWidth - (scrollContainer.offsetWidth / 2) + (tabWidth / 2);
        scrollContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [value, isMobile]);

  if (!isMobile) {
    // Desktop view - use original grid layout
    return (
      <LazyTabs 
        value={value} 
        onValueChange={onValueChange} 
        onTabLoad={onTabLoad}
        className="w-full"
        preloadNext={true}
      >
        <LazyTabs.List className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
          {tabConfig.map(({ value: tabValue, icon: Icon, label }) => (
            <LazyTabs.Trigger 
              key={tabValue} 
              value={tabValue} 
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </LazyTabs.Trigger>
          ))}
        </LazyTabs.List>
        {children}
      </LazyTabs>
    );
  }

  // Mobile view - horizontal scroll with icons
  return (
    <LazyTabs 
      value={value} 
      onValueChange={onValueChange} 
      onTabLoad={onTabLoad}
      className="w-full"
      preloadNext={true}
    >
      {/* Sticky mobile tab bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b mb-6">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide py-3 px-4 gap-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabConfig.map(({ value: tabValue, icon: Icon, label }) => {
            const isActive = value === tabValue;
            return (
              <Button
                key={tabValue}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onValueChange(tabValue)}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[80px] h-16 whitespace-nowrap",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="px-4">
        {children}
      </div>
    </LazyTabs>
  );
};