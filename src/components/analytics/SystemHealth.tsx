import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Server, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  TrendingUp,
  Cpu,
  HardDrive
} from 'lucide-react';
import { logger } from '@/utils/structuredLogging';

interface SystemMetrics {
  databaseHealth: 'healthy' | 'warning' | 'critical';
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  activeConnections: number;
  storageUsed: number;
  memoryUsage: number;
  cpuUsage: number;
  recentErrors: Array<{
    timestamp: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  performanceMetrics: {
    avgAssessmentTime: number;
    avgInsightGeneration: number;
    successRate: number;
  };
}

export const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemMetrics = async () => {
    setLoading(true);
    try {
      // Simulate system metrics - in a real app, these would come from monitoring services
      const mockMetrics: SystemMetrics = {
        databaseHealth: 'healthy',
        apiResponseTime: Math.random() * 200 + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        uptime: 99.8,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        storageUsed: Math.random() * 30 + 20, // 20-50%
        memoryUsage: Math.random() * 40 + 30, // 30-70%
        cpuUsage: Math.random() * 30 + 10, // 10-40%
        recentErrors: [
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            message: 'Rate limit exceeded for OpenAI API',
            severity: 'medium'
          },
          {
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            message: 'Temporary connection timeout',
            severity: 'low'
          }
        ],
        performanceMetrics: {
          avgAssessmentTime: Math.random() * 5 + 8, // 8-13 minutes
          avgInsightGeneration: Math.random() * 10 + 15, // 15-25 seconds
          successRate: Math.random() * 5 + 95 // 95-100%
        }
      };

      // Add some real data where possible
      const [assessments, insights] = await Promise.all([
        supabase.from('assessments').select('created_at').limit(100),
        supabase.from('ai_insights').select('created_at').limit(100)
      ]);

      // Calculate real success rate
      if (assessments.data && insights.data) {
        const recentAssessments = assessments.data.filter(a => 
          new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        const recentInsights = insights.data.filter(i => 
          new Date(i.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        
        if (recentAssessments > 0) {
          mockMetrics.performanceMetrics.successRate = (recentInsights / recentAssessments) * 100;
        }
      }

      setMetrics(mockMetrics);
    } catch (error) {
      logger.error('Failed to load system health metrics', {
        component: 'SystemHealth',
        metadata: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'hsl(var(--success))';
      case 'warning': return 'hsl(var(--warning))';
      case 'critical': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading system metrics..." />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load system metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getHealthIcon(metrics.databaseHealth)}
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-muted-foreground capitalize">{metrics.databaseHealth}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">API Response</p>
                <p className="text-sm text-muted-foreground">{metrics.apiResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Uptime</p>
                <p className="text-sm text-muted-foreground">{metrics.uptime.toFixed(2)}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="font-medium">Connections</p>
                <p className="text-sm text-muted-foreground">{metrics.activeConnections}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress
              value={metrics.cpuUsage}
              max={100}
              size={100}
              color={metrics.cpuUsage > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
              label={`${metrics.cpuUsage.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress
              value={metrics.memoryUsage}
              max={100}
              size={100}
              color={metrics.memoryUsage > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--secondary))'}
              label={`${metrics.memoryUsage.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress
              value={metrics.storageUsed}
              max={100}
              size={100}
              color={metrics.storageUsed > 80 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
              label={`${metrics.storageUsed.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress
              value={metrics.errorRate}
              max={5}
              size={100}
              color={metrics.errorRate > 2 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'}
              label={`${metrics.errorRate.toFixed(2)}%`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.performanceMetrics.avgAssessmentTime.toFixed(1)}m
              </div>
              <p className="text-sm text-muted-foreground">Avg Assessment Time</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {metrics.performanceMetrics.avgInsightGeneration.toFixed(1)}s
              </div>
              <p className="text-sm text-muted-foreground">Avg AI Insight Generation</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.performanceMetrics.successRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      {metrics.recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentErrors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{error.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(error.severity) as any}>
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};