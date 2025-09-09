import { useState, useEffect } from 'react';
import { ProductionReadinessChecker, ProductionReadinessStatus } from '@/utils/productionReadinessChecker';
import { logger } from '@/utils/structuredLogging';

interface UseProductionReadinessReturn {
  status: ProductionReadinessStatus | null;
  isLoading: boolean;
  error: string | null;
  checkReadiness: () => Promise<void>;
  generateReport: () => string | null;
}

export const useProductionReadiness = (): UseProductionReadinessReturn => {
  const [status, setStatus] = useState<ProductionReadinessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkReadiness = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const readinessStatus = await ProductionReadinessChecker.checkReadiness();
      setStatus(readinessStatus);
      
      logger.info('Production readiness check completed via hook', {
        component: 'useProductionReadiness',
        action: 'checkReadiness',
        metadata: {
          score: readinessStatus.score,
          isReady: readinessStatus.isReady
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      logger.error('Production readiness check failed via hook', {
        component: 'useProductionReadiness',
        action: 'checkReadiness'
      }, err as Error);

    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = (): string | null => {
    if (!status) return null;
    return ProductionReadinessChecker.generateProductionReport(status);
  };

  // Auto-check on mount
  useEffect(() => {
    checkReadiness();
  }, []);

  return {
    status,
    isLoading,
    error,
    checkReadiness,
    generateReport
  };
};