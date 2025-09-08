import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorRecoveryProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  showActions?: boolean;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onGoHome,
  onGoBack,
  className,
  variant = 'default',
  showActions = true
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {showActions && onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('min-h-[400px] flex items-center justify-center', className)}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {onRetry && (
                  <Button onClick={onRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                {onGoBack && (
                  <Button onClick={onGoBack} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
                {onGoHome && (
                  <Button onClick={onGoHome} variant="outline" className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                )}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>If this problem persists:</p>
              <ul className="text-left space-y-1">
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Contact support if the issue continues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn('w-full max-w-lg mx-auto', className)}>
      <CardContent className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        
        {showActions && (
          <div className="flex flex-wrap gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
            {onGoHome && (
              <Button onClick={onGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};