import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorRecovery } from '@/components/ui/error-recovery';
import { logger } from '@/utils/structuredLogging';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback: CustomFallback,
  onError
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Component error caught by boundary', {
      component: 'ErrorBoundaryWrapper',
      action: 'handleError',
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack
      }
    }, error);
    
    onError?.(error, errorInfo);
  };

  const DefaultFallback = () => (
    <ErrorRecovery 
      onRetry={() => window.location.reload()}
    />
  );

  const FallbackComponent = CustomFallback || DefaultFallback;

  return (
    <ErrorBoundary fallback={<FallbackComponent />} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};