import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastGenerated?: string | null;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showTimestamp?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  lastGenerated,
  className,
  variant = 'outline',
  size = 'sm',
  showTimestamp = true
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={cn(
          "transition-all",
          isLoading && "animate-pulse",
          className
        )}
      >
        <RotateCcw 
          className={cn(
            "w-4 h-4",
            size === 'icon' ? 'w-4 h-4' : 'w-4 h-4 mr-2',
            isLoading && "animate-spin"
          )} 
        />
        {size !== 'icon' && (isLoading ? 'Refreshing...' : 'Refresh')}
      </Button>
      
      {showTimestamp && lastGenerated && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Updated: {lastGenerated}</span>
        </div>
      )}
    </div>
  );
};