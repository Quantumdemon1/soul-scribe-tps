import { TPSScores, MBTIDetail } from '../types/tps.types';
import { calculateConfidence } from './index';

export const TPS_TO_MBTI_COMPREHENSIVE = {
  extraversion: {
    indicators: {
      strong_E: {
        traits: ['Communal Navigate', 'Dynamic', 'Assertive', 'Direct', 'Extrinsic'],
        description: 'Strong preference for external engagement and social stimulation'
      },
      moderate_E: {
        traits: ['Mixed Navigate', 'Modular', 'Diplomatic', 'Social'],
        description: 'Balanced but leaning toward external focus'
      },
      moderate_I: {
        traits: ['Mixed Navigate', 'Static', 'Mixed Communication'],
        description: 'Balanced but leaning toward internal focus'
      },
      strong_I: {
        traits: ['Independent Navigate', 'Static', 'Passive', 'Passive Communication', 'Intrinsic'],
        description: 'Strong preference for solitude and internal processing'
      }
    }
  },

  sensing_intuition: {
    indicators: {
      strong_S: {
        traits: ['Physical', 'Structured', 'Analytical', 'Pragmatic', 'Realistic'],
        description: 'Focus on concrete, tangible, observable information'
      },
      moderate_S: {
        traits: ['Lawful', 'Static', 'Pessimistic'],
        description: 'Preference for established patterns and past experiences'
      },
      moderate_N: {
        traits: ['Varied', 'Mixed Navigate', 'Responsive'],
        description: 'Balanced approach with intuitive tendencies'
      },
      strong_N: {
        traits: ['Intuitive', 'Universal', 'Self-Aware', 'Dynamic', 'Self-Principled'],
        description: 'Focus on patterns, possibilities, and abstract concepts'
      }
    }
  },

  thinking_feeling: {
    indicators: {
      strong_T: {
        traits: ['Analytical', 'Stoic', 'Direct', 'Pragmatic', 'Physical'],
        description: 'Logical, objective decision-making'
      },
      moderate_T: {
        traits: ['Realistic', 'Assertive', 'Independent'],
        description: 'Balanced with thinking preference'
      },
      moderate_F: {
        traits: ['Mixed Communication', 'Responsive', 'Varied'],
        description: 'Balanced with feeling preference'
      },
      strong_F: {
        traits: ['Diplomatic', 'Turbulent', 'Social', 'Passive', 'Self-Aware'],
        description: 'Value-based, empathetic decision-making'
      }
    }
  },

  judging_perceiving: {
    indicators: {
      strong_J: {
        traits: ['Structured', 'Lawful', 'Self-Mastery', 'Assertive', 'Direct'],
        description: 'Preference for closure, planning, and organization'
      },
      moderate_J: {
        traits: ['Pragmatic', 'Realistic', 'Stoic'],
        description: 'Structured but adaptable approach'
      },
      moderate_P: {
        traits: ['Responsive', 'Mixed Navigate', 'Modular'],
        description: 'Flexible with some structure'
      },
      strong_P: {
        traits: ['Ambivalent', 'Independent', 'Self-Principled', 'Varied', 'Dynamic'],
        description: 'Preference for flexibility and spontaneity'
      }
    }
  }
};

const COGNITIVE_FUNCTION_MAPPINGS = {
  'Fe': { traits: ['Diplomatic', 'Social', 'Responsive', 'Communal Navigate'], description: 'Extraverted Feeling' },
  'Te': { traits: ['Assertive', 'Direct', 'Pragmatic', 'Extrinsic'], description: 'Extraverted Thinking' },
  'Fi': { traits: ['Self-Aware', 'Self-Principled', 'Independent Navigate', 'Intrinsic'], description: 'Introverted Feeling' },
  'Ti': { traits: ['Analytical', 'Independent', 'Stoic', 'Physical'], description: 'Introverted Thinking' },
  'Se': { traits: ['Physical', 'Dynamic', 'Assertive', 'Self-Indulgent'], description: 'Extraverted Sensing' },
  'Si': { traits: ['Physical', 'Structured', 'Static', 'Pessimistic'], description: 'Introverted Sensing' },
  'Ne': { traits: ['Intuitive', 'Dynamic', 'Varied', 'Optimistic'], description: 'Extraverted Intuition' },
  'Ni': { traits: ['Intuitive', 'Universal', 'Self-Aware', 'Self-Mastery'], description: 'Introverted Intuition' }
};

const TYPE_COGNITIVE_STACKS = {
  'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
  'INTP': ['Ti', 'Ne', 'Si', 'Fe'],
  'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
  'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
  'INFJ': ['Ni', 'Fe', 'Ti', 'Se'],
  'INFP': ['Fi', 'Ne', 'Si', 'Te'],
  'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'],
  'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
  'ISTJ': ['Si', 'Te', 'Fi', 'Ne'],
  'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
  'ESTJ': ['Te', 'Si', 'Ne', 'Fi'],
  'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'],
  'ISTP': ['Ti', 'Se', 'Ni', 'Fe'],
  'ISFP': ['Fi', 'Se', 'Ni', 'Te'],
  'ESTP': ['Se', 'Ti', 'Fe', 'Ni'],
  'ESFP': ['Se', 'Fi', 'Te', 'Ni']
};

function calculateDimensionScore(scores: TPSScores, dimension: string): { score: number; letter: string; strength: number; confidence: number } {
  const indicators = TPS_TO_MBTI_COMPREHENSIVE[dimension as keyof typeof TPS_TO_MBTI_COMPREHENSIVE].indicators;
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(indicators).forEach(([level, config]) => {
    const weight = level.includes('strong') ? 1.5 : 1.0;
    const traitAverage = config.traits.reduce((sum, trait) => 
      sum + (scores[trait] || 5), 0) / config.traits.length;
    
    if (level.includes('E') || level.includes('N') || level.includes('T') || level.includes('J')) {
      totalScore += traitAverage * weight;
    } else {
      totalScore -= traitAverage * weight;
    }
    totalWeight += weight;
  });
  
  const normalizedScore = totalScore / totalWeight;
  const isPositive = normalizedScore > 0;
  
  let letter: string;
  switch (dimension) {
    case 'extraversion': letter = isPositive ? 'E' : 'I'; break;
    case 'sensing_intuition': letter = isPositive ? 'N' : 'S'; break;
    case 'thinking_feeling': letter = isPositive ? 'T' : 'F'; break;
    case 'judging_perceiving': letter = isPositive ? 'J' : 'P'; break;
    default: letter = '';
  }
  
  return {
    score: normalizedScore,
    letter,
    strength: Math.abs(normalizedScore),
    confidence: calculateConfidence(normalizedScore, 1.0)
  };
}

function calculateCognitiveFunctions(type: string, scores: TPSScores) {
  const stack = TYPE_COGNITIVE_STACKS[type as keyof typeof TYPE_COGNITIVE_STACKS];
  if (!stack) return null;
  
  const functions = stack.map((func, index) => {
    const mapping = COGNITIVE_FUNCTION_MAPPINGS[func as keyof typeof COGNITIVE_FUNCTION_MAPPINGS];
    const strength = mapping.traits.reduce((sum, trait) => sum + (scores[trait] || 5), 0) / mapping.traits.length;
    
    return {
      function: func,
      strength: strength,
      description: mapping.description
    };
  });
  
  return {
    dominant: functions[0],
    auxiliary: functions[1],
    tertiary: functions[2],
    inferior: functions[3]
  };
}

export function calculateMBTIEnhanced(scores: TPSScores): MBTIDetail {
  const e_i = calculateDimensionScore(scores, 'extraversion');
  const s_n = calculateDimensionScore(scores, 'sensing_intuition');
  const t_f = calculateDimensionScore(scores, 'thinking_feeling');
  const j_p = calculateDimensionScore(scores, 'judging_perceiving');
  
  const type = `${e_i.letter}${s_n.letter}${t_f.letter}${j_p.letter}`;
  const cognitiveFunctions = calculateCognitiveFunctions(type, scores);
  
  const overallConfidence = (e_i.confidence + s_n.confidence + t_f.confidence + j_p.confidence) / 4;
  
  return {
    type,
    preferences: {
      E_I: e_i,
      S_N: s_n,
      T_F: t_f,
      J_P: j_p
    },
    cognitiveFunctions: cognitiveFunctions || {
      dominant: { function: 'Unknown', strength: 5 },
      auxiliary: { function: 'Unknown', strength: 5 },
      tertiary: { function: 'Unknown', strength: 5 },
      inferior: { function: 'Unknown', strength: 5 }
    },
    confidence: overallConfidence
  };
}