export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class StructuredLogger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private formatConsoleOutput(entry: LogEntry): string {
    const contextStr = entry.context ? 
      `[${entry.context.component || 'Unknown'}${entry.context.action ? `:${entry.context.action}` : ''}] ` : '';
    
    return `${entry.timestamp} ${entry.level.toUpperCase()} ${contextStr}${entry.message}`;
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry('ERROR', message, context, error);
    this.addToBuffer(entry);
    
    // Use structured logging only - console suppressed in production
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('WARN', message, context);
    this.addToBuffer(entry);
    
    // Use structured logging only - console suppressed in production
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('INFO', message, context);
    this.addToBuffer(entry);
    
    // Use structured logging only - console suppressed in production
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('DEBUG', message, context);
    this.addToBuffer(entry);
    
    // Use structured logging only - console suppressed in production
  }

  getLogs(level?: keyof LogLevel): LogEntry[] {
    if (!level) return [...this.logBuffer];
    
    return this.logBuffer.filter(entry => entry.level === level);
  }

  clearLogs(): void {
    this.logBuffer = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  // Utility methods for specific scenarios
  assessmentFlow(action: string, message: string, metadata?: Record<string, any>): void {
    this.info(message, {
      component: 'AssessmentFlow',
      action,
      metadata
    });
  }

  aiService(action: string, message: string, metadata?: Record<string, any>, error?: Error): void {
    if (error) {
      this.error(message, {
        component: 'AIService',
        action,
        metadata
      }, error);
    } else {
      this.info(message, {
        component: 'AIService',
        action,
        metadata
      });
    }
  }

  performance(action: string, duration: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${action} completed in ${duration}ms`, {
      component: 'Performance',
      action,
      metadata: { ...metadata, duration }
    });
  }

  userInteraction(action: string, message: string, metadata?: Record<string, any>): void {
    this.info(message, {
      component: 'UserInteraction',
      action,
      metadata
    });
  }
}

export const logger = new StructuredLogger();

// Performance monitoring utilities
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: LogContext
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    logger.performance(operationName, duration, {
      success: true,
      ...context?.metadata
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error(`Performance: ${operationName} failed after ${duration}ms`, context, error as Error);
    throw error;
  }
};