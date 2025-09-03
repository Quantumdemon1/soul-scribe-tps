import { useCallback } from 'react';
import { errorLogger } from '@/services/errorLoggingService';
import { toast } from '@/hooks/use-toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    showToast = true,
    fallbackMessage = "Something went wrong. Please try again.",
    onError
  } = options;

  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    // Log the error
    errorLogger.logError({
      error_type: 'javascript',
      error_message: error.message,
      error_stack: error.stack,
      severity: 'medium',
      context
    });

    // Call custom error handler
    if (onError) {
      onError(error);
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: "Error",
        description: fallbackMessage,
        variant: "destructive"
      });
    }
  }, [showToast, fallbackMessage, onError]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    errorMessage?: string,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, { operation: asyncOperation.name });
      
      if (showToast && errorMessage) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      return fallbackValue;
    }
  }, [handleError, showToast]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
    errorMessage?: string
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        const result = fn(...args);
        return result instanceof Promise ? await result : result;
      } catch (error) {
        handleError(error as Error, { function: fn.name, args });
        
        if (showToast && errorMessage) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
        
        return undefined;
      }
    };
  }, [handleError, showToast]);

  return {
    handleError,
    handleAsyncError,
    withErrorHandling
  };
}