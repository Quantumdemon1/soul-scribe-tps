import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/structuredLogging';

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
  jsHeapSize: number;
  domNodes: number;
  errorCount: number;
}

export const PerformanceTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        bundleSize: navigation.transferSize || 0,
        memoryUsage: memory?.usedJSHeapSize || 0,
        renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        jsHeapSize: memory?.totalJSHeapSize || 0,
        domNodes: document.querySelectorAll('*').length,
        errorCount: 0 // This would be tracked via error boundary
      };

      setMetrics(metrics);

      // Log performance metrics
      logger.performance('page_load', metrics.loadTime, {
        bundleSize: metrics.bundleSize,
        memoryUsage: metrics.memoryUsage,
        renderTime: metrics.renderTime,
        domNodes: metrics.domNodes
      });
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => window.removeEventListener('load', collectMetrics);
  }, []);

  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // Penalize slow load times
    if (metrics.loadTime > 3000) score -= 30;
    else if (metrics.loadTime > 1500) score -= 15;
    
    // Penalize large bundle sizes
    if (metrics.bundleSize > 2000000) score -= 20; // 2MB
    else if (metrics.bundleSize > 1000000) score -= 10; // 1MB
    
    // Penalize excessive DOM nodes
    if (metrics.domNodes > 3000) score -= 20;
    else if (metrics.domNodes > 1500) score -= 10;
    
    // Penalize high memory usage
    if (metrics.memoryUsage > 50000000) score -= 15; // 50MB
    else if (metrics.memoryUsage > 25000000) score -= 8; // 25MB
    
    return Math.max(0, score);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!metrics) return null;

  const score = getPerformanceScore(metrics);
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Activity className="h-5 w-5" />
        </button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </span>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Score</span>
              <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                <span className={scoreColor}>{score}/100</span>
              </Badge>
            </div>
            
            <Progress value={score} className="h-2" />
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Load Time</span>
                </div>
                <div className="font-mono">{formatTime(metrics.loadTime)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Bundle Size</span>
                </div>
                <div className="font-mono">{formatBytes(metrics.bundleSize)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Memory</span>
                </div>
                <div className="font-mono">{formatBytes(metrics.memoryUsage)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>DOM Nodes</span>
                </div>
                <div className="font-mono">{metrics.domNodes.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};