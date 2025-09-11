import React from 'react';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import { logger } from '@/utils/structuredLogging';

interface ProductionErrorBoundaryWrapperProps {
  children: React.ReactNode;
  component?: string;
  fallback?: React.ComponentType<any>;
}

export const ProductionErrorBoundaryWrapper: React.FC<ProductionErrorBoundaryWrapperProps> = ({
  children,
  component = 'Unknown',
  fallback
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Production component error caught', {
      component: 'ProductionErrorBoundaryWrapper',
      action: 'handleError',
      metadata: {
        sourceComponent: component,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack
      }
    }, error);

    // In production, suppress error details and show user-friendly message
    if (!import.meta.env.DEV) {
      const userFriendlyError = new Error('Something went wrong. Please refresh the page and try again.');
      userFriendlyError.name = 'UserFriendlyError';
      
      logger.info('Error sanitized for production display', {
        component: 'ProductionErrorBoundaryWrapper',
        action: 'sanitizeError',
        metadata: {
          originalError: error.name,
          sanitizedMessage: userFriendlyError.message
        }
      });
    }
  };

  return (
    <EnhancedErrorBoundary
      fallback={fallback}
      onError={handleError}
      resetKeys={[component]}
    >
      <ErrorBoundaryWrapper onError={handleError}>
        {children}
      </ErrorBoundaryWrapper>
    </EnhancedErrorBoundary>
  );
};