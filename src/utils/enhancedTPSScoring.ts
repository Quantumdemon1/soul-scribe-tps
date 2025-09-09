import { TPSScores, PersonalityProfile } from '../types/tps.types';
import { TPSScoring } from './tpsScoring';
import { calculateMBTIEnhanced } from '../mappings/mbti.enhanced';
import { calculateBigFiveEnhanced } from '../mappings/bigfive.enhanced';
import { calculateEnneagramEnhanced } from '../mappings/enneagram.enhanced';
import { calculateHollandEnhanced } from '../mappings/holland.enhanced';
import { calculateAlignmentEnhanced } from '../mappings/alignment.enhanced';
import { calculateAttachmentStyle } from '../mappings/attachment.mapping';
import { calculateSocionicsEnhanced } from '../mappings/socionics.enhanced';
import { calculateIntegralDevelopment } from '../mappings/integral.enhanced';
import { logger } from './structuredLogging';

interface ScoringOverrides {
  traitMappings?: Record<string, number[]>;
  mbti?: Record<'EI' | 'SN' | 'TF' | 'JP', { traits: Record<string, number>; threshold?: number }>;
  bigfive?: any;
  enneagram?: any;
  alignment?: any;
  holland?: any;
  socionics?: any;
  integral?: any;
  attachment?: any;
}

// Enhanced TPS Scoring with override support
export class EnhancedTPSScoring extends TPSScoring {
  private static getOverrides(): ScoringOverrides | null {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('tps_scoring_overrides') : null;
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static calculateTraitScoresWithOverrides(userScores: number[]): TPSScores {
    const overrides = this.getOverrides();
    const traitMappings = overrides?.traitMappings || this.TRAIT_MAPPINGS as any;
    
    const traitScores: TPSScores = {};
    
    for (const [trait, indices] of Object.entries(traitMappings)) {
      const indexArray = Array.isArray(indices) ? indices : [];
      const scores = indexArray.map(i => userScores[i - 1] || 5);
      traitScores[trait] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
    
    return traitScores;
  }

  static generateEnhancedProfile(responses: number[]): PersonalityProfile & {
    detailedMappings: {
      mbti: any;
      bigfive: any;
      enneagram: any;
      alignment?: any;
      holland?: any;
      attachment?: any;
      socionics?: any;
      integral?: any;
    };
    diagnostics: {
      traitScores: TPSScores;
      scoringOverrides: ScoringOverrides | null;
      calculationTrace: any[];
    };
  } {
    const validatedResponses = responses; // Skip validation for now
    const traitScores = this.calculateTraitScoresWithOverrides(validatedResponses);
    const overrides = this.getOverrides();
    
    // Base profile
    const baseProfile = this.generateFullProfile(validatedResponses);
    
    // Calculate enhanced mappings with override support
    const calculationTrace: any[] = [];
    
    try {
      const mbtiDetail = calculateMBTIEnhanced(traitScores);
      calculationTrace.push({ framework: 'mbti', success: true, detail: mbtiDetail });
      
      const bigfiveDetail = calculateBigFiveEnhanced(traitScores);
      calculationTrace.push({ framework: 'bigfive', success: true, detail: bigfiveDetail });
      
      const enneagramDetail = calculateEnneagramEnhanced(traitScores);
      calculationTrace.push({ framework: 'enneagram', success: true, detail: enneagramDetail });
      
      const alignmentDetail = calculateAlignmentEnhanced ? calculateAlignmentEnhanced(traitScores) : null;
      if (alignmentDetail) calculationTrace.push({ framework: 'alignment', success: true, detail: alignmentDetail });
      
      const hollandDetail = calculateHollandEnhanced ? calculateHollandEnhanced(traitScores) : null;
      if (hollandDetail) calculationTrace.push({ framework: 'holland', success: true, detail: hollandDetail });
      
      const attachmentDetail = calculateAttachmentStyle ? calculateAttachmentStyle(traitScores) : null;
      if (attachmentDetail) calculationTrace.push({ framework: 'attachment', success: true, detail: attachmentDetail });
      
      const socionicsDetail = calculateSocionicsEnhanced ? calculateSocionicsEnhanced(baseProfile.mappings.mbti, traitScores) : null;
      if (socionicsDetail) calculationTrace.push({ framework: 'socionics', success: true, detail: socionicsDetail });
      
      const integralDetail = calculateIntegralDevelopment ? calculateIntegralDevelopment(traitScores) : null;
      if (integralDetail) calculationTrace.push({ framework: 'integral', success: true, detail: integralDetail });

      return {
        ...baseProfile,
        detailedMappings: {
          mbti: mbtiDetail,
          bigfive: bigfiveDetail,
          enneagram: enneagramDetail,
          alignment: alignmentDetail,
          holland: hollandDetail,
          attachment: attachmentDetail,
          socionics: socionicsDetail,
          integral: integralDetail
        },
        diagnostics: {
          traitScores,
          scoringOverrides: overrides,
          calculationTrace
        }
      };
    } catch (error) {
      logger.error('Enhanced scoring calculation failed', { component: 'enhancedTPSScoring' }, error as Error);
      calculationTrace.push({ framework: 'error', success: false, error: (error as Error).message });
      
      return {
        ...baseProfile,
        detailedMappings: {
          mbti: null,
          bigfive: null,
          enneagram: null
        },
        diagnostics: {
          traitScores,
          scoringOverrides: overrides,
          calculationTrace
        }
      };
    }
  }

  // Question impact analysis
  static analyzeQuestionImpact(responses: number[], questionIndex: number): {
    originalProfile: any;
    modifiedProfiles: { value: number; profile: any }[];
    impactAnalysis: {
      mbtiChanges: any[];
      traitChanges: Record<string, number>;
      significantChanges: string[];
    };
  } {
    const originalProfile = this.generateEnhancedProfile(responses);
    const modifiedProfiles: { value: number; profile: any }[] = [];
    
    // Test all possible values for this question
    for (let value = 1; value <= 10; value++) {
      if (value === responses[questionIndex]) continue; // Skip original value
      
      const modifiedResponses = [...responses];
      modifiedResponses[questionIndex] = value;
      
      const modifiedProfile = this.generateEnhancedProfile(modifiedResponses);
      modifiedProfiles.push({ value, profile: modifiedProfile });
    }
    
    // Analyze impact
    const traitChanges: Record<string, number> = {};
    const mbtiChanges: any[] = [];
    const significantChanges: string[] = [];
    
    modifiedProfiles.forEach(({ value, profile }) => {
      // Check MBTI changes
      if (profile.mappings.mbti !== originalProfile.mappings.mbti) {
        mbtiChanges.push({
          value,
          from: originalProfile.mappings.mbti,
          to: profile.mappings.mbti
        });
        significantChanges.push(`Q${questionIndex + 1}=${value}: MBTI ${originalProfile.mappings.mbti} → ${profile.mappings.mbti}`);
      }
      
      // Check trait score changes
      Object.keys(originalProfile.diagnostics.traitScores).forEach(trait => {
        const originalScore = originalProfile.diagnostics.traitScores[trait];
        const modifiedScore = profile.diagnostics.traitScores[trait];
        const change = Math.abs(modifiedScore - originalScore);
        
        if (change > 0.5) { // Significant change threshold
          const key = `${trait}_Q${questionIndex + 1}_${value}`;
          traitChanges[key] = change;
          if (change > 1.0) {
            significantChanges.push(`Q${questionIndex + 1}=${value}: ${trait} changes by ${change.toFixed(2)}`);
          }
        }
      });
    });
    
    return {
      originalProfile,
      modifiedProfiles,
      impactAnalysis: {
        mbtiChanges,
        traitChanges,
        significantChanges
      }
    };
  }

  // Threshold sensitivity analysis
  static analyzeThresholdSensitivity(responses: number[]): {
    currentProfile: any;
    sensitivityReport: {
      mbti: Record<string, { currentThreshold: number; alternativeResults: any[] }>;
      frameworks: Record<string, any>;
    };
  } {
    const currentProfile = this.generateEnhancedProfile(responses);
    const overrides = this.getOverrides();
    
    const mbtiSensitivity: Record<string, { currentThreshold: number; alternativeResults: any[] }> = {};
    
    // Test MBTI threshold sensitivity
    ['EI', 'SN', 'TF', 'JP'].forEach(dimension => {
      const currentThreshold = overrides?.mbti?.[dimension as 'EI' | 'SN' | 'TF' | 'JP']?.threshold ?? 5;
      const alternativeResults: any[] = [];
      
      // Test thresholds from 4.0 to 6.0 in 0.2 increments
      for (let threshold = 4.0; threshold <= 6.0; threshold += 0.2) {
        if (Math.abs(threshold - currentThreshold) < 0.1) continue; // Skip current
        
        // Temporarily override threshold (this would need actual implementation)
        const testResult = {
          threshold: threshold,
          // This would need actual MBTI calculation with modified threshold
          result: `${dimension} with threshold ${threshold.toFixed(1)}`
        };
        alternativeResults.push(testResult);
      }
      
      mbtiSensitivity[dimension] = {
        currentThreshold,
        alternativeResults
      };
    });
    
    return {
      currentProfile,
      sensitivityReport: {
        mbti: mbtiSensitivity,
        frameworks: {
          bigfive: "Framework weight sensitivity analysis needed",
          enneagram: "Framework weight sensitivity analysis needed"
        }
      }
    };
  }
}