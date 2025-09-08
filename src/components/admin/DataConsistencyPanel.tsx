import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAssessmentDataConsistency } from '@/hooks/useAssessmentDataConsistency';
import { EnhancedLoadingSpinner } from '@/components/ui/enhanced-loading-spinner';

export const DataConsistencyPanel: React.FC = () => {
  const {
    isChecking,
    isBackfilling,
    result,
    checkDataConsistency,
    backfillIntegralData
  } = useAssessmentDataConsistency();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Assessment Data Consistency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isChecking ? (
          <EnhancedLoadingSpinner
            variant="default"
            size="sm"
            message="Checking data consistency..."
          />
        ) : result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {result.hasIntegralGaps ? (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  <span className="text-sm font-medium">Integral Data</span>
                </div>
                <div className="text-xl font-bold">
                  {result.hasIntegralGaps ? result.missingIntegralCount : 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.hasIntegralGaps ? 'Missing' : 'Complete'}
                </div>
              </div>

              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant={result.hasIntegralGaps ? 'destructive' : 'default'}>
                  {result.hasIntegralGaps ? 'Needs Attention' : 'Healthy'}
                </Badge>
              </div>
            </div>

            {result.hasIntegralGaps && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {result.missingIntegralCount} assessments need integral data backfill
                  </p>
                  <Button
                    onClick={backfillIntegralData}
                    disabled={isBackfilling}
                    size="sm"
                    variant="outline"
                  >
                    {isBackfilling ? 'Processing...' : 'Backfill Data'}
                  </Button>
                </div>

                {isBackfilling && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Backfill Progress</span>
                      <span className="text-sm">{Math.round(result.backfillProgress)}%</span>
                    </div>
                    <Progress value={result.backfillProgress} className="w-full" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                onClick={checkDataConsistency}
                variant="ghost"
                size="sm"
                disabled={isChecking || isBackfilling}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Check
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Last checked: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Button onClick={checkDataConsistency} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Run Consistency Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};