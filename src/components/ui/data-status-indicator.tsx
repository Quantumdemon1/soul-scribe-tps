import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface DataStatusIndicatorProps {
  isLoading: boolean;
  hasData: boolean;
  error?: string | null;
  lastGenerated?: string | null;
  confidence?: number;
  staleThreshold?: number; // in minutes
}

export const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  isLoading,
  hasData,
  error,
  lastGenerated,
  confidence,
  staleThreshold = 30
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span>Generating insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="w-4 h-4" />
        <span>Failed to load</span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>No data available</span>
      </div>
    );
  }

  const isStale = lastGenerated ? 
    (Date.now() - new Date(lastGenerated).getTime()) > (staleThreshold * 60 * 1000) : 
    false;

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-muted-foreground">Ready</span>
      </div>
      
      {confidence && (
        <Badge variant={confidence > 0.8 ? 'default' : confidence > 0.6 ? 'secondary' : 'outline'}>
          {Math.round(confidence * 100)}% confidence
        </Badge>
      )}
      
      {isStale && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-xs">Data may be outdated</span>
        </div>
      )}
    </div>
  );
};