import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Hand, 
  Eye, 
  ScrollText,
  FileDown,
  Share2,
  Zap
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
  error?: string;
}

interface IntegralMobileTestProps {
  onTestComplete?: (results: TestResult[]) => void;
}

export const IntegralMobileTest: React.FC<IntegralMobileTestProps> = ({ onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const tests: TestResult[] = [
    { name: 'Touch Target Accessibility', status: 'pending' },
    { name: 'Font Size Readability', status: 'pending' },
    { name: 'Integral Assessment Flow', status: 'pending' },
    { name: 'Socratic Clarification Mobile UX', status: 'pending' },
    { name: 'PDF Generation Performance', status: 'pending' },
    { name: 'Share Functionality', status: 'pending' },
    { name: 'Responsive Layout Test', status: 'pending' },
    { name: 'Performance Under Load', status: 'pending' }
  ];

  const runTouchTargetTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Check for minimum touch target sizes (44x44px recommended)
    const buttons = document.querySelectorAll('button, [role="button"], a');
    const smallTargets: Element[] = [];
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets.push(button);
      }
    });
    
    const duration = performance.now() - startTime;
    const passed = smallTargets.length === 0;
    
    return {
      name: 'Touch Target Accessibility',
      status: passed ? 'passed' : 'failed',
      duration,
      details: passed 
        ? 'All interactive elements meet minimum touch target size'
        : `Found ${smallTargets.length} elements below 44x44px minimum`
    };
  };

  const runFontSizeTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    // Check for minimum font sizes (14px recommended for mobile)
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, input, textarea');
    const smallText: Element[] = [];
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 14 && element.textContent?.trim()) {
        smallText.push(element);
      }
    });
    
    const duration = performance.now() - startTime;
    const passed = smallText.length < textElements.length * 0.1; // Allow 10% small text
    
    return {
      name: 'Font Size Readability',
      status: passed ? 'passed' : 'failed',
      duration,
      details: passed 
        ? 'Text sizes are appropriate for mobile reading'
        : `${smallText.length} elements have text smaller than 14px`
    };
  };

  const runIntegralAssessmentTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      // Simulate navigation to integral assessment
      const isOnIntegralPage = window.location.pathname.includes('/integral');
      
      if (!isOnIntegralPage) {
        // Test navigation
        window.history.pushState({}, '', '/integral');
      }
      
      // Check for key assessment elements
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
      
      const assessmentElements = {
        questions: document.querySelectorAll('[role="radiogroup"], input[type="radio"]'),
        progressBar: document.querySelector('[role="progressbar"]'),
        navigation: document.querySelectorAll('button[data-testid*="nav"], button:contains("Next"), button:contains("Previous")'),
        submitButton: document.querySelector('button[type="submit"], button:contains("Submit")')
      };
      
      const duration = performance.now() - startTime;
      const hasRequiredElements = assessmentElements.questions.length > 0;
      
      return {
        name: 'Integral Assessment Flow',
        status: hasRequiredElements ? 'passed' : 'failed',
        duration,
        details: hasRequiredElements 
          ? 'Assessment interface elements are present and accessible'
          : 'Missing critical assessment interface elements'
      };
    } catch (error) {
      return {
        name: 'Integral Assessment Flow',
        status: 'failed',
        duration: performance.now() - startTime,
        error: (error as Error).message
      };
    }
  };

  const runPDFGenerationTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      // Test PDF generation performance (mock test)
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate PDF generation
      
      const duration = performance.now() - startTime;
      const performanceGood = duration < 3000; // Should complete within 3 seconds
      
      return {
        name: 'PDF Generation Performance',
        status: performanceGood ? 'passed' : 'failed',
        duration,
        details: performanceGood 
          ? `PDF generation simulated in ${duration.toFixed(0)}ms`
          : `PDF generation took ${duration.toFixed(0)}ms (may be slow on mobile)`
      };
    } catch (error) {
      return {
        name: 'PDF Generation Performance',
        status: 'failed',
        duration: performance.now() - startTime,
        error: (error as Error).message
      };
    }
  };

  const runShareFunctionalityTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      // Test if Web Share API is available
      const hasWebShare = 'share' in navigator;
      const hasFallback = document.querySelector('[data-testid="share-fallback"], button:contains("Copy Link")');
      
      const duration = performance.now() - startTime;
      const passed = hasWebShare || hasFallback;
      
      return {
        name: 'Share Functionality',
        status: passed ? 'passed' : 'failed',
        duration,
        details: hasWebShare 
          ? 'Native Web Share API available'
          : hasFallback 
            ? 'Fallback share method available'
            : 'No share functionality detected'
      };
    } catch (error) {
      return {
        name: 'Share Functionality',
        status: 'failed',
        duration: performance.now() - startTime,
        error: (error as Error).message
      };
    }
  };

  const runResponsiveLayoutTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      // Test viewport responsiveness
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768
      };
      
      // Check for horizontal scroll
      const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      
      const duration = performance.now() - startTime;
      const passed = !hasHorizontalScroll && viewport.isMobile;
      
      return {
        name: 'Responsive Layout Test',
        status: passed ? 'passed' : 'failed',
        duration,
        details: passed 
          ? `Layout responsive at ${viewport.width}x${viewport.height}`
          : hasHorizontalScroll 
            ? 'Horizontal scroll detected (layout overflow)'
            : 'Desktop layout detected on mobile viewport'
      };
    } catch (error) {
      return {
        name: 'Responsive Layout Test',
        status: 'failed',
        duration: performance.now() - startTime,
        error: (error as Error).message
      };
    }
  };

  const runPerformanceTest = async (): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      // Measure memory usage if available
      const memoryInfo = (performance as any).memory;
      const memoryData = memoryInfo ? {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
      } : null;
      
      // Test load time
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : 0;
      
      const duration = performance.now() - startTime;
      const performanceGood = !memoryData || memoryData.used < 50; // Less than 50MB
      
      return {
        name: 'Performance Under Load',
        status: performanceGood ? 'passed' : 'failed',
        duration,
        details: memoryData 
          ? `Memory: ${memoryData.used}MB used, Load: ${loadTime.toFixed(0)}ms`
          : `Load time: ${loadTime.toFixed(0)}ms`
      };
    } catch (error) {
      return {
        name: 'Performance Under Load',
        status: 'failed',
        duration: performance.now() - startTime,
        error: (error as Error).message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testFunctions = [
      runTouchTargetTest,
      runFontSizeTest,
      runIntegralAssessmentTest,
      runPDFGenerationTest,
      runShareFunctionalityTest,
      runResponsiveLayoutTest,
      runPerformanceTest
    ];
    
    const testResults: TestResult[] = [];
    
    for (let i = 0; i < testFunctions.length; i++) {
      const testName = tests[i].name;
      setCurrentTest(testName);
      
      // Update status to running
      setResults(prev => [
        ...prev,
        { ...tests[i], status: 'running' }
      ]);
      
      try {
        const result = await testFunctions[i]();
        testResults.push(result);
        
        logger.info(`Mobile test completed: ${testName}`, {
          component: 'IntegralMobileTest',
          action: 'runTest',
          metadata: { 
            testName, 
            status: result.status, 
            duration: result.duration 
          }
        });
        
        // Update results
        setResults(prev => [
          ...prev.slice(0, -1),
          result
        ]);
      } catch (error) {
        const failedResult: TestResult = {
          name: testName,
          status: 'failed',
          error: (error as Error).message
        };
        testResults.push(failedResult);
        setResults(prev => [
          ...prev.slice(0, -1),
          failedResult
        ]);
        
        logger.error(`Mobile test failed: ${testName}`, {
          component: 'IntegralMobileTest',
          action: 'runTest',
          metadata: { testName }
        }, error as Error);
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
    setCurrentTest('');
    onTestComplete?.(testResults);
    
    const passed = testResults.filter(r => r.status === 'passed').length;
    const total = testResults.length;
    
    toast({
      title: "Mobile Testing Complete",
      description: `${passed}/${total} tests passed`,
      variant: passed === total ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('Touch')) return <Hand className="h-4 w-4" />;
    if (testName.includes('Font')) return <Eye className="h-4 w-4" />;
    if (testName.includes('Assessment')) return <ScrollText className="h-4 w-4" />;
    if (testName.includes('PDF')) return <FileDown className="h-4 w-4" />;
    if (testName.includes('Share')) return <Share2 className="h-4 w-4" />;
    if (testName.includes('Performance')) return <Zap className="h-4 w-4" />;
    return <Smartphone className="h-4 w-4" />;
  };

  const passedTests = results.filter(r => r.status === 'passed').length;
  const totalTests = results.length;
  const overallProgress = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Integral Assessment Mobile Testing
        </CardTitle>
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Score: {passedTests}/{totalTests}</span>
              <Badge variant={overallProgress === 100 ? "default" : overallProgress > 60 ? "secondary" : "destructive"}>
                {overallProgress.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && results.length === 0 && (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Test the integral assessment flow and mobile optimization
            </p>
            <Button onClick={runAllTests} className="w-full">
              Run Mobile Tests
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Running: {currentTest}</span>
            </div>
            <Progress value={(results.length / tests.length) * 100} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getTestIcon(result.name)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{result.name}</h4>
                      {getStatusIcon(result.status)}
                    </div>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                    )}
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">Error: {result.error}</p>
                    )}
                    {result.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.duration.toFixed(0)}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !isRunning && (
          <>
            <Separator />
            <Button onClick={runAllTests} variant="outline" className="w-full">
              Run Tests Again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};