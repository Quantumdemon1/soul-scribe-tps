import { ScoringOverrides, MBTIDimensionKey, FrameworkWeights } from '@/services/scoringConfigService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WeightValidationOptions {
  allowZeroWeights?: boolean;
  maxTotalDeviation?: number;
  minWeight?: number;
  maxWeight?: number;
}

const DEFAULT_VALIDATION_OPTIONS: WeightValidationOptions = {
  allowZeroWeights: false,
  maxTotalDeviation: 0.1, // 10% deviation from sum of 1.0
  minWeight: 0.0,
  maxWeight: 1.0
};

export class ScoringValidator {
  static validateMBTIWeights(
    mbti: Record<MBTIDimensionKey, { traits: Record<string, number>; threshold?: number }>,
    options: WeightValidationOptions = DEFAULT_VALIDATION_OPTIONS
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    Object.entries(mbti).forEach(([dimension, config]) => {
      const weights = Object.values(config.traits);
      const sum = weights.reduce((a, b) => a + b, 0);
      
      // Check sum constraint
      const deviation = Math.abs(sum - 1.0);
      if (deviation > (options.maxTotalDeviation || 0.1)) {
        errors.push(`${dimension}: Weights sum to ${sum.toFixed(3)}, should sum to 1.0 (±${options.maxTotalDeviation})`);
      }

      // Check individual weight bounds
      weights.forEach((weight, idx) => {
        const traitName = Object.keys(config.traits)[idx];
        if (weight < (options.minWeight || 0)) {
          errors.push(`${dimension}.${traitName}: Weight ${weight} below minimum ${options.minWeight}`);
        }
        if (weight > (options.maxWeight || 1)) {
          errors.push(`${dimension}.${traitName}: Weight ${weight} above maximum ${options.maxWeight}`);
        }
        if (!options.allowZeroWeights && weight === 0) {
          warnings.push(`${dimension}.${traitName}: Zero weight will ignore this trait entirely`);
        }
      });

      // Check threshold bounds
      if (config.threshold !== undefined) {
        if (config.threshold < 1 || config.threshold > 10) {
          errors.push(`${dimension}: Threshold ${config.threshold} outside valid range [1, 10]`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateFrameworkWeights(
    framework: FrameworkWeights,
    frameworkName: string,
    options: WeightValidationOptions = DEFAULT_VALIDATION_OPTIONS
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    Object.entries(framework).forEach(([dimension, config]) => {
      if (!config.traits) {
        errors.push(`${frameworkName}.${dimension}: Missing traits configuration`);
        return;
      }

      const weights = Object.values(config.traits);
      const sum = weights.reduce((a, b) => a + b, 0);
      
      // Check sum constraint
      const deviation = Math.abs(sum - 1.0);
      if (deviation > (options.maxTotalDeviation || 0.1)) {
        errors.push(`${frameworkName}.${dimension}: Weights sum to ${sum.toFixed(3)}, should sum to 1.0`);
      }

      // Check individual weights
      weights.forEach((weight, idx) => {
        const traitName = Object.keys(config.traits)[idx];
        if (weight < (options.minWeight || 0)) {
          errors.push(`${frameworkName}.${dimension}.${traitName}: Weight ${weight} below minimum`);
        }
        if (weight > (options.maxWeight || 1)) {
          errors.push(`${frameworkName}.${dimension}.${traitName}: Weight ${weight} above maximum`);
        }
      });

      // Validate threshold and scaling
      if (config.threshold !== undefined && (config.threshold < 0 || config.threshold > 10)) {
        errors.push(`${frameworkName}.${dimension}: Invalid threshold ${config.threshold}`);
      }
      if (config.scaling !== undefined && (config.scaling <= 0 || config.scaling > 10)) {
        warnings.push(`${frameworkName}.${dimension}: Unusual scaling factor ${config.scaling}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateTraitMappings(traitMappings: Record<string, number[]>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const usedQuestions = new Set<number>();
    const duplicateUsage: Record<number, string[]> = {};

    Object.entries(traitMappings).forEach(([trait, questions]) => {
      if (!Array.isArray(questions)) {
        errors.push(`${trait}: Question mapping must be an array`);
        return;
      }

      questions.forEach(qIndex => {
        if (!Number.isInteger(qIndex) || qIndex < 1 || qIndex > 145) {
          errors.push(`${trait}: Invalid question index ${qIndex} (must be 1-145)`);
        }

        if (usedQuestions.has(qIndex)) {
          if (!duplicateUsage[qIndex]) {
            duplicateUsage[qIndex] = [];
          }
          duplicateUsage[qIndex].push(trait);
        } else {
          usedQuestions.add(qIndex);
        }
      });

      if (questions.length === 0) {
        warnings.push(`${trait}: No questions mapped to this trait`);
      }
    });

    // Report duplicate usage
    Object.entries(duplicateUsage).forEach(([qIndex, traits]) => {
      warnings.push(`Question ${qIndex} mapped to multiple traits: ${traits.join(', ')}`);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateCompleteOverrides(overrides: ScoringOverrides): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate MBTI
    if (overrides.mbti) {
      const mbtiResult = this.validateMBTIWeights(overrides.mbti);
      allErrors.push(...mbtiResult.errors);
      allWarnings.push(...mbtiResult.warnings);
    }

    // Validate other frameworks
    const frameworks = ['bigfive', 'enneagram', 'alignment', 'holland', 'socionics', 'integral', 'attachment'] as const;
    frameworks.forEach(framework => {
      if (overrides[framework]) {
        const result = this.validateFrameworkWeights(overrides[framework]!, framework);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    });

    // Validate trait mappings
    if (overrides.traitMappings) {
      const mappingResult = this.validateTraitMappings(overrides.traitMappings);
      allErrors.push(...mappingResult.errors);
      allWarnings.push(...mappingResult.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  static autoFixWeights(weights: Record<string, number>): Record<string, number> {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    
    if (sum === 0) {
      // If all weights are zero, distribute equally
      const equalWeight = 1.0 / Object.keys(weights).length;
      const fixed: Record<string, number> = {};
      Object.keys(weights).forEach(trait => {
        fixed[trait] = equalWeight;
      });
      return fixed;
    }

    // Normalize to sum to 1.0
    const fixed: Record<string, number> = {};
    Object.entries(weights).forEach(([trait, weight]) => {
      fixed[trait] = weight / sum;
    });
    return fixed;
  }
}