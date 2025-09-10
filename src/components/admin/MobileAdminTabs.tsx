import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileAdminTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export const MobileAdminTabs: React.FC<MobileAdminTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn("w-full border-b bg-background", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <Button
                key={tab.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  "flex-shrink-0 min-w-max h-9 px-3 text-xs",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="w-3 h-3 mr-1.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};