import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAdminTabs } from './MobileAdminTabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MobileAdminSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  tabs?: Array<{
    value: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const MobileAdminSection: React.FC<MobileAdminSectionProps> = ({
  title,
  children,
  className,
  tabs,
  activeTab,
  onTabChange
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 pb-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
      )}
      
      {tabs && activeTab && onTabChange && (
        <MobileAdminTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          className="sticky top-12 z-10"
        />
      )}
      
      <Card className="bg-card border border-border">
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="p-4">
            {children}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};