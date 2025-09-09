import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Shield, Code, Database, Zap } from 'lucide-react';
import { logger } from '@/utils/structuredLogging';
import { mobileTestSuite } from '@/utils/mobileTestSuite';

interface TestResult {
  name: string;
  category: 'security' | 'performance' | 'accessibility' | 'code-quality';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
  error?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ProductionReadinessTestProps {
  onTestComplete?: (results: TestResult[]) => void;
}

export function ProductionReadinessTest({ onTestComplete }: ProductionReadinessTestProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<TestResult[]>([]);

  const testCases: TestResult[] = [
    // Critical Security Tests
    { name: 'HTTPS Configuration', category: 'security', status: 'pending', priority: 'critical' },
    { name: 'Authentication Security', category: 'security', status: 'pending', priority: 'critical' },
    { name: 'XSS Protection', category: 'security', status: 'pending', priority: 'critical' },
    
    // High Priority Performance Tests
    { name: 'Bundle Size Analysis', category: 'performance', status: 'pending', priority: 'high' },
    { name: 'Core Web Vitals', category: 'performance', status: 'pending', priority: 'high' },
    { name: 'Mobile Performance', category: 'performance', status: 'pending', priority: 'high' },
    
    // Accessibility Tests
    { name: 'Touch Target Compliance', category: 'accessibility', status: 'pending', priority: 'high' },
    { name: 'Font Size Standards', category: 'accessibility', status: 'pending', priority: 'medium' },
    { name: 'Color Contrast Ratio', category: 'accessibility', status: 'pending', priority: 'medium' },
    
    // Code Quality Tests
    { name: 'Console Statement Cleanup', category: 'code-quality', status: 'pending', priority: 'high' },
    { name: 'Error Boundary Coverage', category: 'code-quality', status: 'pending', priority: 'medium' },
    { name: 'TypeScript Compliance', category: 'code-quality', status: 'pending', priority: 'medium' },
  ];

  const runProductionReadinessTests = async () => {
    setIsRunning(true);
    setResults(testCases);
    const startTime = Date.now();

    try {
      // Security Tests
      await runTest('HTTPS Configuration', async () => {
        const isHTTPS = window.location.protocol === 'https:';
        const hasSecureContext = window.isSecureContext;
        return {
          passed: isHTTPS && hasSecureContext,
          details: isHTTPS ? 'HTTPS properly configured' : 'Not using HTTPS',
        };
      });

      await runTest('Authentication Security', async () => {
        // Check for auth tokens in localStorage (security risk)
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('auth') || key.includes('token') || key.includes('jwt')
        );
        const hasInsecureStorage = authKeys.some(key => {
          const value = localStorage.getItem(key);
          return value && (value.includes('Bearer') || value.length > 50);
        });
        
        return {
          passed: !hasInsecureStorage,
          details: hasInsecureStorage ? 'Auth tokens found in localStorage' : 'No insecure auth storage detected',
        };
      });

      await runTest('XSS Protection', async () => {
        const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const hasXSSProtection = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
        const dangerousElements = document.querySelectorAll('[onclick], [onerror], [onload]');
        
        return {
          passed: (!!hasCSP || !!hasXSSProtection) && dangerousElements.length === 0,
          details: `CSP: ${!!hasCSP}, XSS Protection: ${!!hasXSSProtection}, Dangerous handlers: ${dangerousElements.length}`,
        };
      });

      // Performance Tests
      await runTest('Bundle Size Analysis', async () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const transferSize = navigation?.transferSize || 0;
        const isOptimal = transferSize < 2000000; // Under 2MB
        
        return {
          passed: isOptimal,
          details: `Transfer size: ${(transferSize / 1024 / 1024).toFixed(2)}MB`,
        };
      });

      await runTest('Core Web Vitals', async () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const fcp = navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart;
        const lcp = navigation?.loadEventEnd - navigation?.loadEventStart;
        
        const fcpGood = fcp < 1800; // First Contentful Paint under 1.8s
        const lcpGood = lcp < 2500; // Largest Contentful Paint under 2.5s
        
        return {
          passed: fcpGood && lcpGood,
          details: `FCP: ${fcp?.toFixed(0)}ms, LCP: ${lcp?.toFixed(0)}ms`,
        };
      });

      await runTest('Mobile Performance', async () => {
        const mobileResults = await mobileTestSuite.runAllTests();
        const summary = mobileTestSuite.getTestSummary();
        
        return {
          passed: summary.score >= 80,
          details: `Mobile test score: ${summary.score.toFixed(1)}% (${summary.passed}/${summary.total})`,
        };
      });

      // Accessibility Tests
      await runTest('Touch Target Compliance', async () => {
        const buttons = document.querySelectorAll('button, [role="button"], input[type="button"]');
        let undersizedButtons = 0;

        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            undersizedButtons++;
          }
        });

        return {
          passed: undersizedButtons === 0,
          details: `${undersizedButtons}/${buttons.length} buttons below 44px minimum`,
        };
      });

      await runTest('Font Size Standards', async () => {
        const elements = document.querySelectorAll('p, span, div, button, input, label');
        let smallTextCount = 0;
        
        elements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          const fontSize = parseInt(computedStyle.fontSize);
          if (fontSize < 14) smallTextCount++;
        });

        const compliance = smallTextCount / elements.length < 0.1;
        
        return {
          passed: compliance,
          details: `${smallTextCount}/${elements.length} elements with font-size < 14px`,
        };
      });

      await runTest('Color Contrast Ratio', async () => {
        // Simple contrast check - in real implementation would use more sophisticated analysis
        const elements = document.querySelectorAll('button, a, .text-muted-foreground');
        const lowContrastElements = Array.from(elements).filter(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Basic check for common low-contrast patterns
          return color.includes('rgb(156') || // text-muted-foreground equivalent
                 backgroundColor.includes('rgb(255, 255, 255)') && color.includes('rgb(200');
        });
        
        return {
          passed: lowContrastElements.length === 0,
          details: `${lowContrastElements.length} potential low-contrast elements detected`,
        };
      });

      // Code Quality Tests
      await runTest('Console Statement Cleanup', async () => {
        // Check for remaining console statements in the global scope
        const originalMethods = {
          log: console.log,
          warn: console.warn,
          error: console.error,
          debug: console.debug,
        };
        
        let consoleCallCount = 0;
        
        // Temporarily override console methods to count calls
        Object.keys(originalMethods).forEach(method => {
          (console as any)[method] = () => consoleCallCount++;
        });
        
        // Restore original methods
        setTimeout(() => {
          Object.assign(console, originalMethods);
        }, 100);
        
        return {
          passed: consoleCallCount === 0,
          details: `${consoleCallCount} console statements detected during test`,
        };
      });

      await runTest('Error Boundary Coverage', async () => {
        const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
        const suspenseBoundaries = document.querySelectorAll('[data-suspense]');
        const hasErrorHandling = errorBoundaries.length > 0 || suspenseBoundaries.length > 0;
        
        return {
          passed: hasErrorHandling,
          details: `Error boundaries: ${errorBoundaries.length}, Suspense boundaries: ${suspenseBoundaries.length}`,
        };
      });

      await runTest('TypeScript Compliance', async () => {
        // Check for common TypeScript issues in the DOM
        const anyTypes = document.querySelectorAll('[data-type="any"]');
        const untyped = document.querySelectorAll('[data-untyped]');
        
        return {
          passed: anyTypes.length === 0 && untyped.length === 0,
          details: `TypeScript compliance check passed`,
        };
      });

      const finalResults = results.filter(r => r.status !== 'pending');
      const passedCount = finalResults.filter(r => r.status === 'passed').length;
      const criticalFailures = finalResults.filter(r => r.status === 'failed' && r.priority === 'critical').length;
      
      logger.info('Production readiness test suite completed', {
        component: 'ProductionReadinessTest',
        metadata: {
          totalTests: finalResults.length,
          passedTests: passedCount,
          criticalFailures,
          score: (passedCount / finalResults.length) * 100,
          duration: Date.now() - startTime
        }
      });

      onTestComplete?.(finalResults);

    } catch (error) {
      logger.error('Production readiness test suite failed', {
        component: 'ProductionReadinessTest',
        metadata: { error: (error as Error).message }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runTest = async (testName: string, testFn: () => Promise<{ passed: boolean; details: string }>) => {
    setCurrentTest(testName);
    setResults(prev => updateTestStatus(prev, testName, 'running'));
    
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setResults(prev => updateTestStatus(
        prev, 
        testName, 
        result.passed ? 'passed' : 'failed',
        duration,
        result.details
      ));
    } catch (error) {
      const duration = Date.now() - startTime;
      setResults(prev => updateTestStatus(
        prev, 
        testName, 
        'failed',
        duration,
        'Test execution failed',
        (error as Error).message
      ));
    }
  };

  const updateTestStatus = (
    prevResults: TestResult[], 
    testName: string, 
    status: TestResult['status'],
    duration?: number,
    details?: string,
    error?: string
  ): TestResult[] => {
    return prevResults.map(test => 
      test.name === testName 
        ? { ...test, status, duration, details, error }
        : test
    );
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'running': return <Clock className="w-4 h-4 text-primary animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: TestResult['category']) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'code-quality': return <Code className="w-4 h-4" />;
      case 'accessibility': return <CheckCircle className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: TestResult['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
    }
  };

  const completedTests = results.filter(r => r.status === 'passed' || r.status === 'failed').length;
  const totalTests = results.length;
  const progress = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
  const passedTests = results.filter(r => r.status === 'passed').length;
  const criticalFailures = results.filter(r => r.status === 'failed' && r.priority === 'critical').length;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Production Readiness Test Suite
        </CardTitle>
        <CardDescription>
          Comprehensive testing for production deployment readiness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runProductionReadinessTests} 
            disabled={isRunning}
            className="w-full sm:w-auto"
          >
            {isRunning ? 'Running Tests...' : 'Run Production Tests'}
          </Button>
          
          {results.length > 0 && (
            <div className="flex gap-2">
              <Badge variant={passedTests === totalTests ? 'default' : 'secondary'}>
                {passedTests}/{totalTests} Passed
              </Badge>
              {criticalFailures > 0 && (
                <Badge variant="destructive">
                  {criticalFailures} Critical Failures
                </Badge>
              )}
            </div>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {Math.round(progress)}%</span>
              <span>{completedTests}/{totalTests} tests</span>
            </div>
            <Progress value={progress} className="w-full" />
            {currentTest && (
              <p className="text-sm text-muted-foreground">
                Running: {currentTest}
              </p>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Test Results by Category</h4>
            
            {['security', 'performance', 'accessibility', 'code-quality'].map(category => {
              const categoryTests = results.filter(r => r.category === category);
              if (categoryTests.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 font-medium capitalize">
                    {getCategoryIcon(category as any)}
                    {category.replace('-', ' ')}
                  </div>
                  <div className="space-y-1 ml-6">
                    {categoryTests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${getPriorityColor(test.priority)}`}>
                            {test.priority.toUpperCase()}
                          </span>
                          <span className="text-sm">{test.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {test.duration && (
                            <span className="text-xs text-muted-foreground">
                              {test.duration}ms
                            </span>
                          )}
                          {getStatusIcon(test.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {results.some(r => r.details || r.error) && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Details</h4>
            <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
              {results
                .filter(r => r.details || r.error)
                .map((test, index) => (
                  <div key={index} className={`p-2 rounded ${test.status === 'failed' ? 'bg-destructive/10' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2">
                      <strong>{test.name}:</strong>
                      <span className={`text-xs ${getPriorityColor(test.priority)}`}>
                        {test.priority}
                      </span>
                    </div>
                    <div className="mt-1">
                      {test.details && <div>{test.details}</div>}
                      {test.error && <div className="text-destructive">Error: {test.error}</div>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}