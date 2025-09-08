import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  TouchpadIcon, 
  Gauge, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  RefreshCw
} from 'lucide-react';
import { mobileTestSuite } from '@/utils/mobileTestSuite';
import { logger } from '@/utils/structuredLogging';

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  performance?: number;
}

export const MobileTestIntegration: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ passed: number; total: number; score: number } | null>(null);

  const runMobileTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      logger.info('Starting mobile test suite', {
        component: 'MobileTestIntegration',
        action: 'run_tests'
      });

      const testResults = await mobileTestSuite.runAllTests();
      setResults(testResults);
      
      const testSummary = mobileTestSuite.getTestSummary();
      setSummary(testSummary);

      logger.info('Mobile tests completed', {
        component: 'MobileTestIntegration',
        metadata: {
          totalTests: testSummary.total,
          passedTests: testSummary.passed,
          score: testSummary.score
        }
      });

    } catch (error) {
      logger.error('Error running mobile tests', {
        component: 'MobileTestIntegration',
        metadata: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getResultIcon = (passed: boolean) => {
    if (passed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Optimization Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Run comprehensive mobile optimization tests to ensure optimal user experience
          </p>
          <Button 
            onClick={runMobileTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.passed}/{summary.total}</div>
              <div className="text-xs text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(summary.score)}`}>
                {Math.round(summary.score)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <Badge variant={summary.score >= 80 ? 'default' : summary.score >= 60 ? 'secondary' : 'destructive'}>
                {summary.score >= 80 ? 'Excellent' : summary.score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
          </div>
        )}

        {summary && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Mobile Readiness Score</span>
              <span className={getScoreColor(summary.score)}>{Math.round(summary.score)}%</span>
            </div>
            <Progress value={summary.score} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Test Results</h4>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getResultIcon(result.passed)}
                    <div>
                      <div className="font-medium text-sm">{result.test}</div>
                      {result.details && (
                        <div className="text-xs text-muted-foreground">{result.details}</div>
                      )}
                    </div>
                  </div>
                   {result.performance && (
                     <div className="text-right">
                       <div className="text-xs text-muted-foreground">
                         {result.performance}ms
                       </div>
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRunning && results.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tests run yet. Click "Run Tests" to begin mobile optimization analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};