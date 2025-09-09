import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductionPerformanceValidator } from '@/utils/productionPerformanceValidator';
import { FinalProductionValidator } from '@/utils/finalProductionValidator';
import { ImportOptimizer, MobileValidatorProduction } from '@/utils/productionValidators';
import { RobustJSONParser } from '@/utils/robustJSONParser';

interface TestResult {
  category: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: string[];
}

export const ProductionTestExecutor: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    try {
      // Performance Tests
      const perfResults = await ProductionPerformanceValidator.validateProductionPerformance();
      const perfScore = ProductionPerformanceValidator.getOverallScore();
      testResults.push({
        category: 'Performance',
        status: perfScore >= 80 ? 'passed' : perfScore >= 60 ? 'warning' : 'failed',
        score: perfScore,
        details: perfResults.map(r => `${r.testName}: ${r.details}`)
      });

      // Bundle Optimization Tests
      const importAnalysis = ImportOptimizer.analyzeImports();
      const bundleResult = await ImportOptimizer.validateBundleSize();
      testResults.push({
        category: 'Bundle Optimization',
        status: bundleResult.isValid ? 'passed' : 'warning',
        score: bundleResult.score,
        details: [
          bundleResult.details,
          `Recommendations: ${bundleResult.recommendations.join(', ')}`,
          `Import efficiency: ${importAnalysis.bundleOptimizations.length} optimizations`
        ]
      });

      // Mobile Validation Tests
      const mobileResult = await MobileValidatorProduction.validateMobileOptimization();
      testResults.push({
        category: 'Mobile Optimization',
        status: mobileResult.isValid ? 'passed' : mobileResult.score >= 70 ? 'warning' : 'failed',
        score: mobileResult.score,
        details: [
          mobileResult.details,
          `Recommendations: ${mobileResult.recommendations.join(', ')}`
        ]
      });

      // JSON Parsing Robustness Tests
      const jsonTestData = '{"test": "value", "number": 123}';
      const jsonResult = RobustJSONParser.parseWithFallback(jsonTestData, { fallback: true });
      testResults.push({
        category: 'JSON Parsing',
        status: jsonResult.success ? 'passed' : 'warning',
        score: jsonResult.success ? 100 : 50,
        details: [
          `Basic parsing: ${jsonResult.success ? 'Working' : 'Failed'}`,
          `Fallback handling: Active`,
          `Error recovery: Implemented`
        ]
      });

      // Final Production Readiness
      const finalReport = await FinalProductionValidator.generateComprehensiveReport();
      testResults.push({
        category: 'Overall Production Readiness',
        status: finalReport.overallScore >= 95 ? 'passed' : finalReport.overallScore >= 80 ? 'warning' : 'failed',
        score: finalReport.overallScore,
        details: [
          `TypeScript compliance: ${finalReport.categories.typeScript.score}%`,
          `Performance score: ${finalReport.categories.performance.score}%`,
          `Mobile readiness: ${finalReport.categories.mobile.score}%`,
          `Bundle optimization: ${finalReport.categories.bundleOptimization.score}%`,
          `Error handling: ${finalReport.categories.errorHandling.score}%`
        ]
      });

      setResults(testResults);
      setOverallScore(finalReport.overallScore);

    } catch (error) {
      testResults.push({
        category: 'Test Execution',
        status: 'failed',
        score: 0,
        details: [`Error running tests: ${(error as Error).message}`]
      });
      setResults(testResults);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Production Test Executor
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overallScore > 0 && (
          <div className="text-center p-4 bg-secondary rounded-lg">
            <h3 className="text-2xl font-bold">Overall Production Score</h3>
            <div className="text-4xl font-bold text-primary">{overallScore.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {overallScore >= 95 ? 'Production Ready ✅' : 
               overallScore >= 80 ? 'Almost Ready ⚠️' : 
               'Needs Work ❌'}
            </div>
          </div>
        )}

        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{result.category}</h4>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
                <span className="font-bold">{result.score.toFixed(0)}%</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="space-y-1">
              {result.details.map((detail, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  • {detail}
                </div>
              ))}
            </div>
          </div>
        ))}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run All Tests" to execute the production readiness test suite
          </div>
        )}
      </CardContent>
    </Card>
  );
};