import { TPSScores, EnneagramDetail } from '../types/tps.types';
import { calculateConfidence } from './index';

export const TPS_TO_ENNEAGRAM_COMPREHENSIVE = {
  types: {
    1: { // The Reformer/Perfectionist
      core_traits: {
        primary: ['Self-Mastery', 'Lawful', 'Structured'],
        secondary: ['Analytical', 'Stoic', 'Direct'],
        tertiary: ['Realistic', 'Physical']
      },
      instinctual_variants: {
        self_preservation: ['Structured', 'Physical', 'Pessimistic'],
        social: ['Lawful', 'Social', 'Diplomatic'],
        sexual: ['Self-Mastery', 'Direct', 'Assertive']
      },
      health_levels: {
        healthy: ['Self-Mastery', 'Diplomatic', 'Responsive'],
        average: ['Lawful', 'Structured', 'Stoic'],
        unhealthy: ['Pessimistic', 'Direct', 'Turbulent']
      }
    },
    
    2: { // The Helper
      core_traits: {
        primary: ['Communal Navigate', 'Diplomatic', 'Responsive'],
        secondary: ['Social', 'Passive', 'Extrinsic'],
        tertiary: ['Optimistic', 'Dynamic']
      },
      instinctual_variants: {
        self_preservation: ['Passive', 'Social', 'Structured'],
        social: ['Communal Navigate', 'Diplomatic', 'Extrinsic'],
        sexual: ['Assertive', 'Dynamic', 'Direct']
      },
      health_levels: {
        healthy: ['Diplomatic', 'Responsive', 'Optimistic'],
        average: ['Communal Navigate', 'Social', 'Passive'],
        unhealthy: ['Passive', 'Pessimistic', 'Turbulent']
      }
    },
    
    3: { // The Achiever
      core_traits: {
        primary: ['Extrinsic', 'Assertive', 'Pragmatic'],
        secondary: ['Dynamic', 'Optimistic', 'Social'],
        tertiary: ['Varied', 'Responsive']
      },
      instinctual_variants: {
        self_preservation: ['Pragmatic', 'Self-Mastery', 'Structured'],
        social: ['Social', 'Extrinsic', 'Dynamic'],
        sexual: ['Assertive', 'Dynamic', 'Direct']
      },
      health_levels: {
        healthy: ['Optimistic', 'Dynamic', 'Responsive'],
        average: ['Assertive', 'Pragmatic', 'Extrinsic'],
        unhealthy: ['Self-Indulgent', 'Pessimistic', 'Turbulent']
      }
    },
    
    4: { // The Individualist
      core_traits: {
        primary: ['Self-Aware', 'Intuitive', 'Turbulent'],
        secondary: ['Self-Principled', 'Universal', 'Independent'],
        tertiary: ['Pessimistic', 'Dynamic']
      },
      instinctual_variants: {
        self_preservation: ['Self-Aware', 'Pessimistic', 'Physical'],
        social: ['Social', 'Turbulent', 'Responsive'],
        sexual: ['Dynamic', 'Assertive', 'Self-Principled']
      },
      health_levels: {
        healthy: ['Self-Aware', 'Intuitive', 'Universal'],
        average: ['Self-Principled', 'Independent', 'Turbulent'],
        unhealthy: ['Pessimistic', 'Self-Indulgent', 'Passive']
      }
    },
    
    5: { // The Investigator
      core_traits: {
        primary: ['Analytical', 'Independent Navigate', 'Intrinsic'],
        secondary: ['Stoic', 'Physical', 'Independent'],
        tertiary: ['Universal', 'Self-Mastery']
      },
      instinctual_variants: {
        self_preservation: ['Physical', 'Structured', 'Pessimistic'],
        social: ['Social', 'Analytical', 'Universal'],
        sexual: ['Assertive', 'Self-Principled', 'Direct']
      },
      health_levels: {
        healthy: ['Analytical', 'Universal', 'Self-Mastery'],
        average: ['Independent Navigate', 'Stoic', 'Intrinsic'],
        unhealthy: ['Pessimistic', 'Passive', 'Static']
      }
    },
    
    6: { // The Loyalist
      core_traits: {
        primary: ['Ambivalent', 'Pessimistic', 'Lawful'],
        secondary: ['Responsive Regulation', 'Mixed Navigate', 'Social'],
        tertiary: ['Structured', 'Analytical']
      },
      instinctual_variants: {
        self_preservation: ['Structured', 'Pessimistic', 'Physical'],
        social: ['Social', 'Lawful', 'Responsive Regulation'],
        sexual: ['Assertive', 'Direct', 'Dynamic']
      },
      health_levels: {
        healthy: ['Lawful', 'Social', 'Responsive Regulation'],
        average: ['Ambivalent', 'Pessimistic', 'Structured'],
        unhealthy: ['Pessimistic', 'Passive', 'Turbulent']
      }
    },
    
    7: { // The Enthusiast
      core_traits: {
        primary: ['Dynamic', 'Optimistic', 'Self-Indulgent'],
        secondary: ['Varied', 'Independent', 'Intuitive'],
        tertiary: ['Extrinsic', 'Social']
      },
      instinctual_variants: {
        self_preservation: ['Self-Indulgent', 'Physical', 'Pragmatic'],
        social: ['Social', 'Optimistic', 'Dynamic'],
        sexual: ['Dynamic', 'Assertive', 'Self-Principled']
      },
      health_levels: {
        healthy: ['Optimistic', 'Dynamic', 'Varied'],
        average: ['Self-Indulgent', 'Independent', 'Intuitive'],
        unhealthy: ['Self-Indulgent', 'Turbulent', 'Pessimistic']
      }
    },
    
    8: { // The Challenger
      core_traits: {
        primary: ['Assertive', 'Direct', 'Independent'],
        secondary: ['Physical', 'Self-Principled', 'Stoic'],
        tertiary: ['Pragmatic', 'Dynamic']
      },
      instinctual_variants: {
        self_preservation: ['Physical', 'Pragmatic', 'Structured'],
        social: ['Social', 'Assertive', 'Direct'],
        sexual: ['Assertive', 'Direct', 'Dynamic']
      },
      health_levels: {
        healthy: ['Assertive', 'Self-Principled', 'Stoic'],
        average: ['Direct', 'Independent', 'Physical'],
        unhealthy: ['Aggressive', 'Pessimistic', 'Self-Indulgent']
      }
    },
    
    9: { // The Peacemaker
      core_traits: {
        primary: ['Passive', 'Ambivalent', 'Optimistic'],
        secondary: ['Mixed Navigate', 'Responsive', 'Social'],
        tertiary: ['Modular', 'Diplomatic']
      },
      instinctual_variants: {
        self_preservation: ['Passive', 'Physical', 'Static'],
        social: ['Social', 'Diplomatic', 'Mixed Navigate'],
        sexual: ['Responsive', 'Dynamic', 'Optimistic']
      },
      health_levels: {
        healthy: ['Optimistic', 'Diplomatic', 'Responsive'],
        average: ['Passive', 'Ambivalent', 'Mixed Navigate'],
        unhealthy: ['Passive', 'Pessimistic', 'Static']
      }
    }
  }
};

function calculateTypeScore(scores: TPSScores, typeConfig: any): number {
  const { core_traits } = typeConfig;
  let totalScore = 0;
  let totalWeight = 0;

  // Primary traits (weight 3.0)
  core_traits.primary.forEach((trait: string) => {
    totalScore += (scores[trait] || 5) * 3.0;
    totalWeight += 3.0;
  });

  // Secondary traits (weight 2.0)
  core_traits.secondary.forEach((trait: string) => {
    totalScore += (scores[trait] || 5) * 2.0;
    totalWeight += 2.0;
  });

  // Tertiary traits (weight 1.0)
  core_traits.tertiary.forEach((trait: string) => {
    totalScore += (scores[trait] || 5) * 1.0;
    totalWeight += 1.0;
  });

  return totalScore / totalWeight;
}

function calculateInstinctualVariant(scores: TPSScores, typeConfig: any): { primary: 'self-preservation' | 'social' | 'sexual'; secondary: 'self-preservation' | 'social' | 'sexual' } {
  const variants = typeConfig.instinctual_variants;
  const variantScores: Record<string, number> = {};

  Object.entries(variants).forEach(([variant, traits]: [string, any]) => {
    variantScores[variant] = traits.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / traits.length;
  });

  const sorted = Object.entries(variantScores).sort(([,a], [,b]) => b - a);
  const validVariants = ['self-preservation', 'social', 'sexual'];
  
  return {
    primary: (validVariants.includes(sorted[0][0]) ? sorted[0][0] : 'self-preservation') as 'self-preservation' | 'social' | 'sexual',
    secondary: (validVariants.includes(sorted[1][0]) ? sorted[1][0] : 'social') as 'self-preservation' | 'social' | 'sexual'
  };
}

function calculateHealthLevel(scores: TPSScores, typeConfig: any): 'healthy' | 'average' | 'unhealthy' {
  const healthLevels = typeConfig.health_levels;
  const levelScores: Record<string, number> = {};

  Object.entries(healthLevels).forEach(([level, traits]: [string, any]) => {
    levelScores[level] = traits.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / traits.length;
  });

  const maxLevel = Object.entries(levelScores).reduce((max, current) => 
    current[1] > max[1] ? current : max, ['average', 0]);

  return maxLevel[0] as 'healthy' | 'average' | 'unhealthy';
}

export function calculateEnneagramEnhanced(scores: TPSScores): EnneagramDetail {
  const typeScores: Record<number, number> = {};
  
  // Calculate scores for all types
  Object.entries(TPS_TO_ENNEAGRAM_COMPREHENSIVE.types).forEach(([typeNum, config]) => {
    typeScores[parseInt(typeNum)] = calculateTypeScore(scores, config);
  });

  // Find primary type
  const sortedTypes = Object.entries(typeScores).sort(([,a], [,b]) => b - a);
  const primaryType = parseInt(sortedTypes[0][0]);
  
  // Calculate wing (adjacent type with higher score)
  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  const wing = typeScores[leftWing] > typeScores[rightWing] ? leftWing : rightWing;
  
  // Calculate wing influence
  const wingInfluence = typeScores[wing] / typeScores[primaryType];
  
  // Calculate tritype
  const heartTypes = [2, 3, 4];
  const headTypes = [5, 6, 7];
  const gutTypes = [8, 9, 1];
  
  const heartTop = heartTypes.reduce((max, type) => 
    typeScores[type] > typeScores[max] ? type : max, 2);
  const headTop = headTypes.reduce((max, type) => 
    typeScores[type] > typeScores[max] ? type : max, 5);
  const gutTop = gutTypes.reduce((max, type) => 
    typeScores[type] > typeScores[max] ? type : max, 8);
  
  const tritype = `${primaryType}${
    heartTypes.includes(primaryType) ? headTop : heartTop
  }${gutTypes.includes(primaryType) ? 
    (heartTypes.includes(primaryType) ? gutTop : headTop) : gutTop}`;
  
  // Get type configuration
  const typeConfig = TPS_TO_ENNEAGRAM_COMPREHENSIVE.types[primaryType as keyof typeof TPS_TO_ENNEAGRAM_COMPREHENSIVE.types];
  
  // Calculate instinctual variant and health level
  const instinctualVariant = calculateInstinctualVariant(scores, typeConfig);
  const healthLevel = calculateHealthLevel(scores, typeConfig);
  
  // Calculate confidence based on separation between top types
  const topScore = sortedTypes[0][1];
  const secondScore = sortedTypes[1][1];
  const separation = topScore - secondScore;
  const confidence = calculateConfidence(separation, 0.5);

  return {
    type: primaryType,
    wing,
    tritype,
    instinctualVariant,
    healthLevel,
    wingInfluence,
    confidence
  };
}