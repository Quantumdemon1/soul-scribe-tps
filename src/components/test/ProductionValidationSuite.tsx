import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { ProductionPerformanceValidator } from '@/utils/productionPerformanceValidator';
import { ImportOptimizer, MobileValidatorProduction } from '@/utils/productionValidators';
import { RobustJSONParser } from '@/utils/robustJSONParser';
import { CheckCircle, XCircle, AlertTriangle, Play, Zap, Smartphone, Package } from 'lucide-react';

interface ValidationResult {
  category: string;
  tests: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }>;
}

export const ProductionValidationSuite: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const runProductionValidation = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Performance Tests
      const performanceResults = await ProductionPerformanceValidator.validateProductionPerformance();
      const performanceTests = performanceResults.map(result => ({
        name: result.testName,
        status: result.status === 'passed' ? 'passed' as const : 'failed' as const,
        details: result.details
      }));

      setResults(prev => [...prev, {
        category: 'Performance',
        tests: performanceTests
      }]);

      // Bundle Analysis
      const bundleResult = await ImportOptimizer.validateBundleSize();
      setResults(prev => [...prev, {
        category: 'Bundle',
        tests: [{
          name: 'Bundle Size Optimization',
          status: bundleResult.isValid ? 'passed' : 'failed',
          details: bundleResult.details
        }]
      }]);

      // Mobile Validation
      const mobileResult = await MobileValidatorProduction.validateMobileOptimization();
      setResults(prev => [...prev, {
        category: 'Mobile Optimization',
        tests: [{
          name: 'Mobile Optimization',
          status: mobileResult.isValid ? 'passed' : 'failed',
          details: mobileResult.details
        }]
      }]);

      // JSON Parsing Tests
      const jsonTests = [
        { input: '{"valid": "json"}', name: 'Basic JSON Parsing' },
        { input: '{invalid json}', name: 'Malformed JSON Recovery' },
        { input: '{"nested": {"deep": {"object": true}}}', name: 'Complex JSON Structures' }
      ];

      const jsonTestResults = jsonTests.map(test => {
        const result = RobustJSONParser.parseWithFallback(test.input, { fallback: true });
        return {
          name: test.name,
          status: result.success ? 'passed' as const : 'warning' as const,
          details: result.success ? 'Parsing successful' : `Fallback used: ${result.error || 'Unknown error'}`
        };
      });

      setResults(prev => [...prev, {
        category: 'JSON Processing',
        tests: jsonTestResults
      }]);

      // Calculate overall score
      const allTests = results.flatMap(r => r.tests);
      const passedTests = allTests.filter(t => t.status === 'passed').length;
      const warningTests = allTests.filter(t => t.status === 'warning').length;
      const totalTests = allTests.length;
      
      if (totalTests > 0) {
        const score = ((passedTests + warningTests * 0.5) / totalTests) * 100;
        setOverallScore(score);
      }

    } catch (error) {
      setResults(prev => [...prev, {
        category: 'Error',
        tests: [{
          name: 'Validation Execution',
          status: 'failed',
          details: `Error: ${(error as Error).message}`
        }]
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'performance': return <Zap className="w-5 h-5" />;
      case 'mobile optimization': return <Smartphone className="w-5 h-5" />;
      case 'bundle': return <Package className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const passedTests = results.flatMap(r => r.tests).filter(t => t.status === 'passed').length;
  const failedTests = results.flatMap(r => r.tests).filter(t => t.status === 'failed').length;
  const totalTests = results.flatMap(r => r.tests).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Production Validation Suite
            </span>
            <Button onClick={runProductionValidation} disabled={isRunning}>
              {isRunning ? 'Running Validation...' : 'Run Production Validation'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overallScore > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overallScore.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
            </div>
          )}

          {overallScore > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Production Readiness</span>
                <span>{overallScore.toFixed(1)}%</span>
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>
          )}

          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(result.category)}
                <h4 className="font-semibold">{result.category}</h4>
                <Badge variant="outline">
                  {result.tests.length} {result.tests.length === 1 ? 'test' : 'tests'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {result.tests.map((test, testIndex) => (
                  <div key={testIndex} className="flex items-start gap-3 p-2 rounded bg-secondary/50">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{test.name}</div>
                      <div className="text-xs text-muted-foreground">{test.details}</div>
                    </div>
                    <Badge 
                      variant={test.status === 'passed' ? 'default' : test.status === 'warning' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {results.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Production Validation" to start comprehensive testing
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p className="text-sm">
                <strong>Bundle:</strong> {ImportOptimizer.generateOptimizationReport()}
              </p>
              <p className="text-sm">
                <strong>Mobile:</strong> Mobile optimization validation completed
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};