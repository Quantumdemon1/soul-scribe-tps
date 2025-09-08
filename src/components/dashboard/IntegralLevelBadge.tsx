import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IntegralLevel } from '@/mappings/integral.enhanced';
import { cn } from '@/lib/utils';

interface IntegralLevelBadgeProps {
  level: IntegralLevel;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const getLevelColorClasses = (color: string) => {
  const colorMap = {
    'Red': 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400',
    'Amber': 'bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-400',
    'Orange': 'bg-orange-500/20 text-orange-700 border-orange-500/30 dark:text-orange-400',
    'Green': 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400',
    'Teal': 'bg-teal-500/20 text-teal-700 border-teal-500/30 dark:text-teal-400',
    'Turquoise': 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30 dark:text-cyan-400',
  };
  return colorMap[color as keyof typeof colorMap] || 'bg-muted text-muted-foreground';
};

export const IntegralLevelBadge: React.FC<IntegralLevelBadgeProps> = ({
  level,
  size = 'md',
  showName = true,
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-2',
        getLevelColorClasses(level.color),
        sizeClasses[size],
        className
      )}
    >
      <span className="font-bold">{level.number}</span>
      {showName && (
        <>
          <span className="mx-1">•</span>
          <span>{level.color}</span>
        </>
      )}
    </Badge>
  );
};