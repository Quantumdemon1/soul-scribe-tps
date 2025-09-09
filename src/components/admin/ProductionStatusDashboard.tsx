import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProductionReadiness } from '@/hooks/useProductionReadiness';
import { 
  Shield, 
  Smartphone, 
  Zap, 
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download
} from 'lucide-react';

export const ProductionStatusDashboard: React.FC = () => {
  const { status, isLoading, error, checkReadiness, generateReport } = useProductionReadiness();

  const getStatusIcon = (isReady: boolean) => {
    if (isReady) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-destructive" />;
  };

  const getStatusColor = (score: number) => {
    if (score >= 95) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getTestStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const downloadReport = () => {
    const report = generateReport();
    if (report) {
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `production-readiness-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Production Readiness Status</h2>
          <p className="text-muted-foreground">
            Comprehensive assessment of application production readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={checkReadiness}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          {status && (
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {status && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.isReady)}
                Overall Production Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      <span className={getStatusColor(status.score)}>
                        {status.score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {status.level}
                    </div>
                  </div>
                  <Badge variant={status.isReady ? 'default' : 'destructive'}>
                    {status.isReady ? 'Production Ready' : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={status.score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {status.testResults.performance.toFixed(1)}%
                  </span>
                  {getTestStatusIcon(status.testResults.performance)}
                </div>
                <Progress value={status.testResults.performance} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {status.testResults.mobile.toFixed(1)}%
                  </span>
                  {getTestStatusIcon(status.testResults.mobile)}
                </div>
                <Progress value={status.testResults.mobile} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4" />
                  Bundle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {status.testResults.bundle.toFixed(1)}%
                  </span>
                  {getTestStatusIcon(status.testResults.bundle)}
                </div>
                <Progress value={status.testResults.bundle} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Type Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {status.testResults.typeScript.toFixed(1)}%
                  </span>
                  {getTestStatusIcon(status.testResults.typeScript)}
                </div>
                <Progress value={status.testResults.typeScript} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Error Handling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {status.testResults.errorHandling.toFixed(1)}%
                  </span>
                  {getTestStatusIcon(status.testResults.errorHandling)}
                </div>
                <Progress value={status.testResults.errorHandling} className="h-1 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Critical Issues */}
          {status.criticalIssues.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {status.criticalIssues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {status.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {status.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};