import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { logger } from '@/utils/structuredLogging';

interface LoadingState<T = any> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseLoadingStateOptions {
  initialData?: unknown;
  timeout?: number;
  retryCount?: number;
  showErrorToast?: boolean;
}

export function useLoadingState<T = any>(options: UseLoadingStateOptions = {}) {
  const {
    initialData = null,
    timeout = 30000, // 30 seconds default timeout
    retryCount = 3,
    showErrorToast = true
  } = options;

  const [state, setState] = useState<LoadingState<T>>({
    isLoading: false,
    error: null,
    data: initialData as T
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  
  const { handleError } = useErrorHandler({ 
    showToast: showErrorToast,
    fallbackMessage: "Operation failed. Please try again."
  });

  const execute = useCallback(async <R = T>(
    asyncOperation: (signal?: AbortSignal) => Promise<R>,
    options?: { retryOnError?: boolean; customTimeout?: number }
  ): Promise<R | null> => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const effectiveTimeout = options?.customTimeout || timeout;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, effectiveTimeout);

    try {
      const result = await asyncOperation(controller.signal);
      
      if (!controller.signal.aborted) {
        setState({
          isLoading: false,
          error: null,
          data: result as T
        });
        retryCountRef.current = 0;
        return result;
      }
      
      return null;
    } catch (error) {
      if (controller.signal.aborted) {
        // Operation was cancelled
        return null;
      }

      const errorObj = error as Error;
      
      // Handle timeout
      if (errorObj.name === 'AbortError') {
        const timeoutError = new Error(`Operation timed out after ${effectiveTimeout}ms`);
        setState({
          isLoading: false,
          error: timeoutError,
          data: state.data
        });
        handleError(timeoutError, { timeout: effectiveTimeout });
        return null;
      }

      // Retry logic
      if (options?.retryOnError && retryCountRef.current < retryCount) {
        retryCountRef.current++;
        logger.info(`Retrying operation (attempt ${retryCountRef.current}/${retryCount})`, { component: 'useLoadingState' });
        
        // Exponential backoff
        const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return execute(asyncOperation, options);
      }

      setState({
        isLoading: false,
        error: errorObj,
        data: state.data
      });
      
      handleError(errorObj, { 
        retryAttempt: retryCountRef.current,
        operation: asyncOperation.name 
      });
      
      return null;
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
    }
  }, [timeout, retryCount, showErrorToast, handleError, state.data]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isLoading: false,
      error: null,
      data: initialData as T
    });
    retryCountRef.current = 0;
  }, [initialData]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isRetrying: retryCountRef.current > 0
  };
}