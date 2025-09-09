import { logger } from './structuredLogging';

interface DebugInfo {
  consoleCallsFound: number;
  filesProcessed: number;
  debugStatementsRemoved: number;
}

export class DebugCleanup {
  private static isDevelopment = import.meta.env.DEV;

  static suppressConsoleInProduction(): void {
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Only suppress in production builds
      const originalMethods = {
        log: console.log,
        debug: console.debug,
        trace: console.trace,
        info: console.info
      };

      // Override console methods to be no-ops in production
      console.log = () => {};
      console.debug = () => {};
      console.trace = () => {};
      
      // Keep warn and error for critical issues
      logger.info('Debug console methods suppressed in production', {
        component: 'DebugCleanup',
        action: 'suppressConsole'
      });
    }
  }

  static detectDebugStatements(): DebugInfo {
    let consoleCallsFound = 0;
    let filesProcessed = 0;
    let debugStatementsRemoved = 0;

    if (this.isDevelopment) {
      // In development, we can track console usage
      const originalLog = console.log;
      const originalDebug = console.debug;

      console.log = (...args) => {
        consoleCallsFound++;
        originalLog.apply(console, args);
      };

      console.debug = (...args) => {
        consoleCallsFound++;
        originalDebug.apply(console, args);
      };

      logger.debug('Debug statement detection enabled', {
        component: 'DebugCleanup',
        action: 'detectDebugStatements'
      });
    }

    return {
      consoleCallsFound,
      filesProcessed,
      debugStatementsRemoved
    };
  }

  static reportDebugUsage(): void {
    if (this.isDevelopment) {
      logger.info('Debug usage report generated', {
        component: 'DebugCleanup',
        action: 'reportDebugUsage',
        metadata: {
          environment: 'development',
          debuggingEnabled: true
        }
      });
    } else {
      logger.info('Production build - debug statements should be minimal', {
        component: 'DebugCleanup',
        action: 'reportDebugUsage',
        metadata: {
          environment: 'production',
          debuggingEnabled: false
        }
      });
    }
  }

  static initialize(): void {
    this.suppressConsoleInProduction();
    this.detectDebugStatements();
    this.reportDebugUsage();
  }
}

// Auto-initialize on import
DebugCleanup.initialize();
