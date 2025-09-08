import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import { errorLogger } from '@/services/errorLoggingService';
import { logger } from '@/utils/structuredLogging';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Error caught by boundary', {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: { errorInfo }
    }, error);
    
    // Log error with enhanced context
    errorLogger.logError({
      error_type: 'javascript',
      error_message: error.message,
      error_stack: error.stack,
      severity: this.props.level === 'critical' ? 'critical' : 'high',
      context: {
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
        errorId: this.state.errorId
      }
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  private handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isPageLevel = this.props.level === 'page' || this.props.level === 'critical';
      
      return (
        <Card className={`max-w-2xl mx-auto mt-8 ${isPageLevel ? 'min-h-[50vh]' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {isPageLevel ? 'Application Error' : 'Component Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isPageLevel 
                  ? 'A critical error occurred. The development team has been notified.'
                  : 'This component encountered an error. Other parts of the application should still work.'
                }
              </p>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground">
                  Error ID: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                </p>
              )}
            </div>

            {this.state.error && (
              <details className="text-xs bg-muted p-3 rounded">
                <summary className="cursor-pointer font-medium flex items-center gap-2">
                  <Bug className="w-3 h-3" />
                  Technical Details
                </summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 overflow-auto text-xs">{this.state.error.message}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 overflow-auto text-xs max-h-32">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 overflow-auto text-xs max-h-32">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-2">
              {!isPageLevel && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              {isPageLevel ? (
                <>
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}