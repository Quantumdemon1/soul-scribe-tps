import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  className,
  side = 'top'
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle 
          className={cn("w-4 h-4 text-muted-foreground hover:text-foreground cursor-help", className)} 
        />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};