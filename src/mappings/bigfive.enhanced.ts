import { TPSScores, BigFiveDetail } from '../types/tps.types';
import { calculateConfidence } from './index';
import type { DimensionConfig, FacetConfig } from '../types/mapping.types';

export const TPS_TO_BIG_FIVE_FACETS = {
  Openness: {
    facets: {
      imagination: {
        high: ['Intuitive', 'Universal', 'Self-Aware', 'Dynamic'],
        low: ['Physical', 'Structured', 'Realistic', 'Static']
      },
      artisticInterests: {
        high: ['Intuitive', 'Self-Principled', 'Turbulent', 'Universal'],
        low: ['Pragmatic', 'Physical', 'Stoic', 'Lawful']
      },
      emotionality: {
        high: ['Turbulent', 'Self-Aware', 'Responsive', 'Social'],
        low: ['Stoic', 'Physical', 'Independent Navigate', 'Analytical']
      },
      adventurousness: {
        high: ['Dynamic', 'Independent', 'Varied', 'Optimistic'],
        low: ['Static', 'Structured', 'Lawful', 'Pessimistic']
      },
      intellect: {
        high: ['Analytical', 'Universal', 'Intrinsic', 'Self-Aware'],
        low: ['Self-Indulgent', 'Physical', 'Passive', 'Static']
      },
      liberalism: {
        high: ['Self-Principled', 'Independent', 'Varied', 'Dynamic'],
        low: ['Lawful', 'Structured', 'Static', 'Passive']
      }
    }
  },
  
  Conscientiousness: {
    facets: {
      selfEfficacy: {
        high: ['Self-Mastery', 'Assertive', 'Optimistic', 'Direct'],
        low: ['Self-Indulgent', 'Passive', 'Pessimistic', 'Turbulent']
      },
      orderliness: {
        high: ['Structured', 'Lawful', 'Analytical', 'Self-Mastery'],
        low: ['Ambivalent', 'Self-Indulgent', 'Dynamic', 'Varied']
      },
      dutifulness: {
        high: ['Lawful', 'Diplomatic', 'Structured', 'Social'],
        low: ['Self-Principled', 'Independent', 'Self-Indulgent', 'Dynamic']
      },
      achievementStriving: {
        high: ['Self-Mastery', 'Extrinsic', 'Assertive', 'Optimistic'],
        low: ['Self-Indulgent', 'Passive', 'Pessimistic', 'Static']
      },
      selfDiscipline: {
        high: ['Self-Mastery', 'Structured', 'Stoic', 'Analytical'],
        low: ['Self-Indulgent', 'Turbulent', 'Dynamic', 'Ambivalent']
      },
      cautiousness: {
        high: ['Pessimistic', 'Structured', 'Analytical', 'Lawful'],
        low: ['Optimistic', 'Dynamic', 'Self-Indulgent', 'Varied']
      }
    }
  },

  Extraversion: {
    facets: {
      friendliness: {
        high: ['Social', 'Diplomatic', 'Optimistic', 'Communal Navigate'],
        low: ['Independent Navigate', 'Stoic', 'Pessimistic', 'Physical']
      },
      gregariousness: {
        high: ['Communal Navigate', 'Social', 'Dynamic', 'Extrinsic'],
        low: ['Independent Navigate', 'Intrinsic', 'Static', 'Passive']
      },
      assertiveness: {
        high: ['Assertive', 'Direct', 'Self-Mastery', 'Dynamic'],
        low: ['Passive', 'Diplomatic', 'Ambivalent', 'Mixed Communication']
      },
      activityLevel: {
        high: ['Dynamic', 'Assertive', 'Optimistic', 'Extrinsic'],
        low: ['Static', 'Passive', 'Pessimistic', 'Intrinsic']
      },
      excitementSeeking: {
        high: ['Dynamic', 'Self-Indulgent', 'Varied', 'Optimistic'],
        low: ['Static', 'Structured', 'Cautious', 'Pessimistic']
      },
      cheerfulness: {
        high: ['Optimistic', 'Social', 'Dynamic', 'Responsive'],
        low: ['Pessimistic', 'Stoic', 'Independent Navigate', 'Static']
      }
    }
  },

  Agreeableness: {
    facets: {
      trust: {
        high: ['Optimistic', 'Social', 'Communal Navigate', 'Responsive'],
        low: ['Pessimistic', 'Independent Navigate', 'Stoic', 'Direct']
      },
      morality: {
        high: ['Lawful', 'Self-Principled', 'Diplomatic', 'Social'],
        low: ['Self-Indulgent', 'Pragmatic', 'Independent', 'Direct']
      },
      altruism: {
        high: ['Communal Navigate', 'Diplomatic', 'Social', 'Responsive'],
        low: ['Independent Navigate', 'Self-Indulgent', 'Assertive', 'Extrinsic']
      },
      cooperation: {
        high: ['Diplomatic', 'Passive', 'Social', 'Mixed Navigate'],
        low: ['Assertive', 'Independent', 'Direct', 'Self-Principled']
      },
      modesty: {
        high: ['Passive', 'Intrinsic', 'Diplomatic', 'Mixed Communication'],
        low: ['Assertive', 'Extrinsic', 'Direct', 'Self-Indulgent']
      },
      sympathy: {
        high: ['Responsive', 'Social', 'Turbulent', 'Diplomatic'],
        low: ['Stoic', 'Independent Navigate', 'Analytical', 'Physical']
      }
    }
  },

  Neuroticism: {
    facets: {
      anxiety: {
        high: ['Turbulent', 'Pessimistic', 'Ambivalent', 'Responsive Regulation'],
        low: ['Stoic', 'Optimistic', 'Self-Mastery', 'Static']
      },
      anger: {
        high: ['Turbulent', 'Assertive', 'Direct', 'Independent'],
        low: ['Passive', 'Diplomatic', 'Stoic', 'Social']
      },
      depression: {
        high: ['Pessimistic', 'Turbulent', 'Passive', 'Intrinsic'],
        low: ['Optimistic', 'Dynamic', 'Extrinsic', 'Social']
      },
      selfConsciousness: {
        high: ['Self-Aware', 'Turbulent', 'Ambivalent', 'Intrinsic'],
        low: ['Assertive', 'Stoic', 'Extrinsic', 'Direct']
      },
      immoderation: {
        high: ['Self-Indulgent', 'Dynamic', 'Varied', 'Turbulent'],
        low: ['Self-Mastery', 'Structured', 'Stoic', 'Lawful']
      },
      vulnerability: {
        high: ['Passive', 'Pessimistic', 'Turbulent', 'Ambivalent'],
        low: ['Assertive', 'Stoic', 'Self-Mastery', 'Independent']
      }
    }
  }
};

function calculateFacetScore(scores: TPSScores, facetConfig: { high: string[]; low: string[] }): number {
  const highScore = facetConfig.high.reduce((sum, trait) => sum + (scores[trait] || 5), 0) / facetConfig.high.length;
  const lowScore = facetConfig.low.reduce((sum, trait) => sum + (scores[trait] || 5), 0) / facetConfig.low.length;
  
  // Calculate normalized score (high traits contribute positively, low traits negatively)
  return (highScore + (10 - lowScore)) / 2;
}

function calculateDimensionScore(scores: TPSScores, dimensionConfig: DimensionConfig) {
  const facetScores: Record<string, number> = {};
  let totalScore = 0;
  
  Object.entries(dimensionConfig.facets).forEach(([facetName, facetConfig]: [string, FacetConfig]) => {
    const facetScore = calculateFacetScore(scores, facetConfig);
    facetScores[facetName] = facetScore;
    totalScore += facetScore;
  });
  
  const dimensionScore = totalScore / Object.keys(dimensionConfig.facets).length;
  
  return {
    score: dimensionScore,
    facets: facetScores
  };
}

export function calculateBigFiveEnhanced(scores: TPSScores): BigFiveDetail {
  const dimensions = {} as any; // Complex nested structure, using any for flexibility
  let totalConfidence = 0;
  
  Object.entries(TPS_TO_BIG_FIVE_FACETS).forEach(([dimensionName, dimensionConfig]) => {
    const result = calculateDimensionScore(scores, dimensionConfig);
    dimensions[dimensionName] = result;
    
    // Calculate confidence based on facet consistency
    const facetValues = Object.values(result.facets) as number[];
    const variance = facetValues.reduce((sum, val) => sum + Math.pow(val - result.score, 2), 0) / facetValues.length;
    const consistency = Math.max(0, 100 - (variance * 10)); // Lower variance = higher confidence
    totalConfidence += consistency;
  });
  
  const overallConfidence = totalConfidence / Object.keys(TPS_TO_BIG_FIVE_FACETS).length;
  
  return {
    dimensions,
    confidence: overallConfidence
  };
}