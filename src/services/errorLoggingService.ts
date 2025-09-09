import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

export interface ErrorLog {
  id?: string;
  user_id?: string;
  error_type: 'javascript' | 'network' | 'authentication' | 'validation' | 'llm' | 'database';
  error_message: string;
  error_stack?: string;
  user_agent?: string;
  url?: string;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorLoggingService {
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineErrors();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        error_type: 'javascript',
        error_message: event.message,
        error_stack: event.error?.stack,
        url: event.filename,
        severity: 'medium',
        context: {
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        error_type: 'javascript',
        error_message: `Unhandled Promise Rejection: ${event.reason}`,
        error_stack: event.reason?.stack,
        severity: 'high',
        context: {
          reason: event.reason
        }
      });
    });
  }

  async logError(errorData: Omit<ErrorLog, 'id' | 'timestamp' | 'user_agent' | 'url'> & { url?: string }): Promise<void> {
    const enhancedError: ErrorLog = {
      ...errorData,
      user_agent: navigator.userAgent,
      url: errorData.url || window.location.href,
      timestamp: new Date().toISOString(),
      user_id: (await supabase.auth.getUser()).data.user?.id
    };

    if (!this.isOnline) {
      this.storeOfflineError(enhancedError);
      return;
    }

    try {
      const { error } = await supabase
        .from('error_logs')
        .insert([enhancedError]);

      if (error) {
        logger.error('Failed to log error to database', { component: 'ErrorLoggingService' }, error as Error);
        this.storeOfflineError(enhancedError);
      }
    } catch (dbError) {
      logger.error('Database error while logging', { component: 'ErrorLoggingService' }, dbError as Error);
      this.storeOfflineError(enhancedError);
    }
  }

  private storeOfflineError(errorData: ErrorLog): void {
    try {
      const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
      offlineErrors.push(errorData);
      
      // Keep only last 50 offline errors to prevent localStorage overflow
      if (offlineErrors.length > 50) {
        offlineErrors.splice(0, offlineErrors.length - 50);
      }
      
      localStorage.setItem('offline_errors', JSON.stringify(offlineErrors));
    } catch (storageError) {
      logger.error('Failed to store offline error', { component: 'ErrorLoggingService' }, storageError as Error);
    }
  }

  private async flushOfflineErrors(): Promise<void> {
    try {
      const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
      
      if (offlineErrors.length === 0) return;

      const { error } = await supabase
        .from('error_logs')
        .insert(offlineErrors);

      if (!error) {
        localStorage.removeItem('offline_errors');
        logger.info(`Flushed ${offlineErrors.length} offline errors`, { component: 'ErrorLoggingService' });
      }
    } catch (error) {
      logger.error('Failed to flush offline errors', { component: 'ErrorLoggingService' }, error as Error);
    }
  }

  // Specific error logging methods
  async logNetworkError(url: string, status: number, message: string, context?: Record<string, any>): Promise<void> {
    await this.logError({
      error_type: 'network',
      error_message: `Network error: ${status} - ${message}`,
      severity: status >= 500 ? 'high' : 'medium',
      context: { url, status, ...context }
    });
  }

  async logAuthenticationError(message: string, context?: Record<string, any>): Promise<void> {
    await this.logError({
      error_type: 'authentication',
      error_message: message,
      severity: 'high',
      context
    });
  }

  async logValidationError(field: string, message: string, context?: Record<string, any>): Promise<void> {
    await this.logError({
      error_type: 'validation',
      error_message: `Validation error in ${field}: ${message}`,
      severity: 'low',
      context: { field, ...context }
    });
  }

  async logLLMError(provider: string, model: string, message: string, context?: Record<string, any>): Promise<void> {
    await this.logError({
      error_type: 'llm',
      error_message: `LLM error (${provider}/${model}): ${message}`,
      severity: 'medium',
      context: { provider, model, ...context }
    });
  }

  async logDatabaseError(operation: string, table: string, message: string, context?: Record<string, any>): Promise<void> {
    await this.logError({
      error_type: 'database',
      error_message: `Database error in ${operation} on ${table}: ${message}`,
      severity: 'high',
      context: { operation, table, ...context }
    });
  }

  // User-friendly error handling with toast notifications
  handleUserError(error: Error, userMessage: string, showToast = true): void {
    this.logError({
      error_type: 'javascript',
      error_message: error.message,
      error_stack: error.stack,
      severity: 'medium',
      context: { userMessage }
    });

    if (showToast) {
      toast({
        title: "Something went wrong",
        description: userMessage,
        variant: "destructive"
      });
    }
  }

  async handleAsyncError<T>(
    asyncOperation: () => Promise<T>,
    userMessage: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await asyncOperation();
    } catch (error) {
      this.handleUserError(error as Error, userMessage);
      return fallbackValue;
    }
  }

  isOffline(): boolean {
    return !this.isOnline;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLoggingService();
