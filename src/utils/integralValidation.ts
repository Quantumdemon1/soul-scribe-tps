// Validation utilities for Integral Assessment scoring

import { INTEGRAL_LEVELS } from '@/mappings/integral.enhanced';
import { logger } from '@/utils/structuredLogging';

/**
 * Validates that scores contain valid level keys and reasonable values
 */
export function validateScores(scores: Record<string, number>): {
  isValid: boolean;
  issues: string[];
  normalizedScores: Record<string, number>;
} {
  const issues: string[] = [];
  const validKeys = Object.keys(INTEGRAL_LEVELS);
  const normalizedScores: Record<string, number> = {};

  // Check for valid keys and normalize scores
  Object.entries(scores).forEach(([key, value]) => {
    if (!validKeys.includes(key)) {
      issues.push(`Invalid level key: ${key}`);
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      issues.push(`Invalid score for ${key}: ${value}`);
      normalizedScores[key] = 0;
    } else {
      normalizedScores[key] = numValue;
    }
  });

  // Ensure all valid keys are present
  validKeys.forEach(key => {
    if (!(key in normalizedScores)) {
      normalizedScores[key] = 0;
    }
  });

  // Check for zero-sum issue
  const totalScore = Object.values(normalizedScores).reduce((sum, score) => sum + score, 0);
  if (totalScore === 0) {
    issues.push('All scores are zero - assessment may have failed');
  }

  return {
    isValid: issues.length === 0 && totalScore > 0,
    issues,
    normalizedScores
  };
}

/**
 * Logs detailed scoring information for debugging
 */
export function logScoringDetails(
  stage: string,
  preliminaryScores: Record<string, number>,
  finalScores?: Record<string, number>
): void {
  logger.debug('Preliminary Scores calculated', { 
    component: 'IntegralValidation', 
    action: 'logScoringDetails',
    metadata: { stage, preliminaryScores, validation: validateScores(preliminaryScores) } 
  });
  
  if (finalScores) {
    const finalValidation = validateScores(finalScores);
    logger.debug('Final Scores computed', { 
      component: 'IntegralValidation', 
      action: 'logScoringDetails',
      metadata: { stage, finalScores, finalValidation } 
    });
  }
  
  // Log top levels for clarity
  const validation = validateScores(finalScores || preliminaryScores);
  const sortedLevels = Object.entries(validation.normalizedScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  logger.info('Top 3 Integral Levels determined', { 
    component: 'IntegralValidation', 
    action: 'logScoringDetails',
    metadata: { stage, sortedLevels } 
  });
}

/**
 * Provides user-friendly explanation of scores
 */
export function explainScores(scores: Record<string, number>): string {
  const validation = validateScores(scores);
  
  if (!validation.isValid) {
    return `Assessment incomplete: ${validation.issues.join(', ')}`;
  }

  const total = Object.values(validation.normalizedScores).reduce((sum, score) => sum + score, 0);
  const topLevels = Object.entries(validation.normalizedScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([level, score]) => {
      const percentage = Math.round((score / total) * 100);
      const levelData = INTEGRAL_LEVELS[level as keyof typeof INTEGRAL_LEVELS];
      return `${levelData?.color || level} (${percentage}%)`;
    });

  return `Primary indicators: ${topLevels.join(', ')}`;
}