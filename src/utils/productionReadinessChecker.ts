// Final production readiness verification and optimization

import { FinalProductionValidator } from './finalProductionValidator';
import { ProductionPerformanceValidator } from './productionPerformanceValidator';
import { ImportOptimizer, MobileValidatorProduction } from './productionValidators';
import { logger } from './structuredLogging';

export interface ProductionReadinessStatus {
  isReady: boolean;
  score: number;
  level: string;
  criticalIssues: string[];
  recommendations: string[];
  testResults: {
    performance: number;
    mobile: number;
    bundle: number;
    typeScript: number;
    errorHandling: number;
  };
}

export class ProductionReadinessChecker {
  static async checkReadiness(): Promise<ProductionReadinessStatus> {
    try {
      logger.info('Starting comprehensive production readiness check', {
        component: 'ProductionReadinessChecker',
        action: 'checkReadiness'
      });

      // Run all production tests in parallel
      const [
        finalReport,
        performanceResults,
        mobileValidation,
        bundleAnalysis
      ] = await Promise.all([
        FinalProductionValidator.generateComprehensiveReport(),
        ProductionPerformanceValidator.validateProductionPerformance(),
        MobileValidatorProduction.validateMobileOptimization(),
        ImportOptimizer.analyzeImports()
      ]);

      // Calculate individual scores
      const performanceScore = ProductionPerformanceValidator.getOverallScore();
      const mobileScore = mobileValidation.score;
      const bundleValidation = await ImportOptimizer.validateBundleSize();
      const bundleScore = bundleValidation.score;

      const testResults = {
        performance: performanceScore,
        mobile: mobileScore,
        bundle: bundleScore,
        typeScript: finalReport.categories.typeScript.score,
        errorHandling: finalReport.categories.errorHandling.score
      };

      // Determine production readiness
      const isReady = finalReport.overallScore >= 95 && performanceScore >= 80 && mobileScore >= 90;
      const level = FinalProductionValidator.getProductionReadinessLevel(finalReport.overallScore);

      const status: ProductionReadinessStatus = {
        isReady,
        score: finalReport.overallScore,
        level,
        criticalIssues: finalReport.critical_issues,
        recommendations: finalReport.recommendations,
        testResults
      };

      logger.info('Production readiness check completed', {
        component: 'ProductionReadinessChecker',
        action: 'checkReadiness',
        metadata: {
          score: finalReport.overallScore,
          isReady,
          level
        }
      });

      return status;

    } catch (error) {
      logger.error('Error during production readiness check', {
        component: 'ProductionReadinessChecker',
        action: 'checkReadiness'
      }, error as Error);

      return {
        isReady: false,
        score: 0,
        level: 'Critical Issues',
        criticalIssues: ['Failed to complete production readiness check'],
        recommendations: ['Fix critical errors and retry'],
        testResults: {
          performance: 0,
          mobile: 0,
          bundle: 0,
          typeScript: 0,
          errorHandling: 0
        }
      };
    }
  }

  static async optimizeForProduction(): Promise<void> {
    logger.info('Starting production optimization', {
      component: 'ProductionReadinessChecker',
      action: 'optimizeForProduction'
    });

    // Run optimization tasks
    try {
      // Import debug cleanup
      const { DebugCleanup } = await import('./debugCleanup');
      DebugCleanup.suppressConsoleInProduction();

      // Run production cleanup
      const { ProductionCleanup } = await import('./productionCleanup');
      await ProductionCleanup.performCleanup();

      logger.info('Production optimization completed successfully', {
        component: 'ProductionReadinessChecker',
        action: 'optimizeForProduction'
      });

    } catch (error) {
      logger.error('Error during production optimization', {
        component: 'ProductionReadinessChecker',
        action: 'optimizeForProduction'
      }, error as Error);
    }
  }

  static generateProductionReport(status: ProductionReadinessStatus): string {
    const { score, level, isReady, testResults, criticalIssues, recommendations } = status;

    let report = `
# Production Readiness Report

## Overall Status
- **Score**: ${score.toFixed(1)}%
- **Level**: ${level}
- **Production Ready**: ${isReady ? '✅ YES' : '❌ NO'}

## Test Results
- **Performance**: ${testResults.performance.toFixed(1)}%
- **Mobile Optimization**: ${testResults.mobile.toFixed(1)}%
- **Bundle Optimization**: ${testResults.bundle.toFixed(1)}%
- **TypeScript Compliance**: ${testResults.typeScript.toFixed(1)}%
- **Error Handling**: ${testResults.errorHandling.toFixed(1)}%

`;

    if (criticalIssues.length > 0) {
      report += `## Critical Issues\n${criticalIssues.map(issue => `- ${issue}`).join('\n')}\n\n`;
    }

    if (recommendations.length > 0) {
      report += `## Recommendations\n${recommendations.map(rec => `- ${rec}`).join('\n')}\n\n`;
    }

    report += `## Next Steps
${isReady 
  ? '✅ Your application is production ready! Consider deploying to production.'
  : '⚠️ Address the critical issues and recommendations above before deploying to production.'
}

Generated on: ${new Date().toISOString()}
`;

    return report;
  }
}