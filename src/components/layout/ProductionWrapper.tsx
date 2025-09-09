import React from 'react';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import { PerformanceTracker } from '@/components/ui/performance-tracker';
import { logger } from '@/utils/structuredLogging';

interface ProductionWrapperProps {
  children: React.ReactNode;
}

export const ProductionWrapper: React.FC<ProductionWrapperProps> = ({ children }) => {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Global application error', {
      component: 'ProductionWrapper',
      action: 'handleGlobalError',
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }, error);
  };

  return (
    <ErrorBoundaryWrapper onError={handleGlobalError}>
      {children}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <PerformanceTracker />
        </div>
      )}
    </ErrorBoundaryWrapper>
  );
};