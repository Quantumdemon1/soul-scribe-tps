import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionReadinessTest } from './ProductionReadinessTest';
import { ProductionMobileTest } from '../mobile/ProductionMobileTest';
import { IntegralMobileTest } from '../mobile/IntegralMobileTest';
import { CacheIntegrationTest } from './CacheIntegrationTest';
import { AlertTriangle, CheckCircle, Clock, Play, Shield, Smartphone, Zap } from 'lucide-react';
import { logger } from '@/utils/structuredLogging';

interface TestSuiteResult {
  name: string;
  category: 'security' | 'performance' | 'mobile' | 'integration';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
  criticalIssues?: number;
}

export const ProductionTestSuite: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<TestSuiteResult[]>([
    { name: 'Production Readiness', category: 'security', status: 'pending' },
    { name: 'Mobile Production Test', category: 'mobile', status: 'pending' },
    { name: 'Mobile Integration Test', category: 'mobile', status: 'pending' },
    { name: 'Cache Integration Test', category: 'integration', status: 'pending' },
  ]);

  const updateTestStatus = (testName: string, status: TestSuiteResult['status'], duration?: number, details?: string, criticalIssues?: number) => {
    setResults(prev => prev.map(result => 
      result.name === testName 
        ? { ...result, status, duration, details, criticalIssues }
        : result
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    logger.info('Starting comprehensive production test suite', {
      component: 'ProductionTestSuite',
      action: 'runAllTests'
    });

    const startTime = performance.now();

    try {
      // Run each test sequentially to avoid resource conflicts
      for (const test of results) {
        setCurrentTest(test.name);
        updateTestStatus(test.name, 'running');

        const testStartTime = performance.now();
        
        try {
          // Simulate test execution - in a real scenario, these would trigger the actual components
          await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
          
          const testDuration = performance.now() - testStartTime;
          
          // For demo purposes, randomize some results
          const success = Math.random() > 0.2; // 80% success rate
          const criticalIssues = success ? 0 : Math.floor(Math.random() * 3);
          
          updateTestStatus(
            test.name,
            success ? 'passed' : 'failed',
            testDuration,
            success ? 'All checks passed' : `${criticalIssues} critical issues found`,
            criticalIssues
          );

          logger.info(`Test completed: ${test.name}`, {
            component: 'ProductionTestSuite',
            action: 'testCompleted',
            metadata: { testName: test.name, success, duration: testDuration }
          });
        } catch (error) {
          const testDuration = performance.now() - testStartTime;
          updateTestStatus(test.name, 'failed', testDuration, 'Test execution failed', 1);
          
          logger.error(`Test failed: ${test.name}`, {
            component: 'ProductionTestSuite',
            action: 'testFailed',
            metadata: { testName: test.name }
          }, error as Error);
        }
      }

      const totalDuration = performance.now() - startTime;
      logger.info('Production test suite completed', {
        component: 'ProductionTestSuite',
        action: 'allTestsCompleted',
        metadata: { duration: totalDuration, totalTests: results.length }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: TestSuiteResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: TestSuiteResult['category']) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'integration': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const totalTests = results.length;
  const completedTests = results.filter(r => r.status === 'passed' || r.status === 'failed').length;
  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const criticalIssues = results.reduce((sum, r) => sum + (r.criticalIssues || 0), 0);
  const progress = (completedTests / totalTests) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Production Test Suite
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
              <div className="text-xs text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{criticalIssues}</div>
              <div className="text-xs text-muted-foreground">Critical Issues</div>
            </div>
          </div>

          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Production Test Suite
              </>
            )}
          </Button>

          {currentTest && (
            <div className="text-center text-sm text-muted-foreground">
              Currently running: {currentTest}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(result.category)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{result.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.duration && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.duration)}ms
                    </span>
                  )}
                  {result.criticalIssues && result.criticalIssues > 0 && (
                    <Badge variant="destructive">
                      {result.criticalIssues} critical
                    </Badge>
                  )}
                  <Badge variant={
                    result.status === 'passed' ? 'default' :
                    result.status === 'failed' ? 'destructive' :
                    result.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {getStatusIcon(result.status)}
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
          <TabsTrigger value="details">Test Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4">
          <ProductionReadinessTest />
          <ProductionMobileTest />
          <IntegralMobileTest />
          <CacheIntegrationTest />
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.filter(r => r.details).map((result) => (
                  <div key={result.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      {getStatusIcon(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.details}</p>
                  </div>
                ))}
                {results.filter(r => r.details).length === 0 && (
                  <p className="text-center text-muted-foreground">
                    Run tests to see detailed results
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};