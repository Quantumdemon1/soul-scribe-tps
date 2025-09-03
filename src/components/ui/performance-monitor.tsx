import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiCalls: number;
  errorCount: number;
}

export function PerformanceMonitor() {
  const { getMetrics } = usePerformanceOptimization();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    apiCalls: 0,
    errorCount: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      const componentMetrics = getMetrics();
      const memory = (performance as any).memory;
      
      setMetrics({
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
        renderTime: Math.max(...Object.values(componentMetrics)) || 0,
        apiCalls: Object.keys(componentMetrics).filter(key => key.includes('api')).length,
        errorCount: Object.keys(componentMetrics).filter(key => key.includes('error')).length
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  const getHealthStatus = () => {
    if (metrics.memoryUsage > 100 || metrics.renderTime > 100 || metrics.errorCount > 0) {
      return { status: 'poor', color: 'destructive' };
    }
    if (metrics.memoryUsage > 50 || metrics.renderTime > 50) {
      return { status: 'fair', color: 'warning' };
    }
    return { status: 'good', color: 'success' };
  };

  const health = getHealthStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Monitor
          <Badge variant={health.color as any} className="ml-auto">
            {health.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <Progress value={Math.min(metrics.memoryUsage, 100)} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {metrics.memoryUsage.toFixed(1)} MB
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Render Time</span>
            </div>
            <Progress value={Math.min(metrics.renderTime / 10, 100)} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {metrics.renderTime.toFixed(1)} ms
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">API Calls</span>
            </div>
            <p className="text-2xl font-bold">{metrics.apiCalls}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{metrics.errorCount}</p>
          </div>
        </div>

        {health.status !== 'good' && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Performance Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {metrics.memoryUsage > 100 && (
                <li>• High memory usage detected - consider refreshing the page</li>
              )}
              {metrics.renderTime > 100 && (
                <li>• Slow component renders detected - check for heavy computations</li>
              )}
              {metrics.errorCount > 0 && (
                <li>• Errors detected - check the console for details</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}