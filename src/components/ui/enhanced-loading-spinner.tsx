import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, Sparkles, Target } from 'lucide-react';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'brain' | 'sparkles' | 'target';
  className?: string;
  message?: string;
  progress?: number;
}

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  message,
  progress
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const getIcon = () => {
    switch (variant) {
      case 'brain':
        return <Brain className={cn(sizeClasses[size], 'animate-pulse text-primary')} />;
      case 'sparkles':
        return <Sparkles className={cn(sizeClasses[size], 'animate-spin text-primary')} />;
      case 'target':
        return <Target className={cn(sizeClasses[size], 'animate-spin text-primary')} />;
      default:
        return (
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-muted border-t-primary',
              sizeClasses[size]
            )}
          />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {getIcon()}
      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      )}
      {typeof progress === 'number' && (
        <div className="w-full max-w-xs">
          <div className="bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};