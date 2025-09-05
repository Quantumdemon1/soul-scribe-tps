import { TPSScores, SocionicsDetail } from '../types/tps.types';
import { calculateConfidence } from './index';

export const TPS_TO_SOCIONICS_ELEMENTS = {
  // Extraverted Functions
  Ne: { // Extraverted Intuition - Possibilities
    primary: ['Intuitive', 'Dynamic', 'Varied'],
    secondary: ['Optimistic', 'Extrinsic', 'Social'],
    description: 'Explores external possibilities and connections'
  },
  Se: { // Extraverted Sensing - Force
    primary: ['Physical', 'Assertive', 'Dynamic'],
    secondary: ['Direct', 'Pragmatic', 'Extrinsic'],
    description: 'Direct impact on physical environment'
  },
  Te: { // Extraverted Thinking - Pragmatism
    primary: ['Analytical', 'Pragmatic', 'Direct'],
    secondary: ['Assertive', 'Extrinsic', 'Structured'],
    description: 'Efficient external organization'
  },
  Fe: { // Extraverted Feeling - Emotions
    primary: ['Social', 'Diplomatic', 'Responsive'],
    secondary: ['Communal Navigate', 'Extrinsic', 'Dynamic'],
    description: 'External emotional atmosphere'
  },
  
  // Introverted Functions
  Ni: { // Introverted Intuition - Time
    primary: ['Intuitive', 'Universal', 'Self-Aware'],
    secondary: ['Self-Mastery', 'Intrinsic', 'Static'],
    description: 'Internal vision and convergent insights'
  },
  Si: { // Introverted Sensing - Sensations
    primary: ['Physical', 'Structured', 'Static'],
    secondary: ['Pessimistic', 'Intrinsic', 'Self-Aware'],
    description: 'Internal sensory experience and memory'
  },
  Ti: { // Introverted Thinking - Structure
    primary: ['Analytical', 'Independent', 'Stoic'],
    secondary: ['Intrinsic', 'Self-Mastery', 'Universal'],
    description: 'Internal logical consistency'
  },
  Fi: { // Introverted Feeling - Relations
    primary: ['Self-Aware', 'Self-Principled', 'Intrinsic'],
    secondary: ['Independent Navigate', 'Intuitive', 'Turbulent'],
    description: 'Internal value system and authenticity'
  }
};

const MBTI_TO_SOCIONICS_MAPPING = {
  'INTJ': 'INTp (ILI)',
  'INTP': 'INTj (LII)',
  'ENTJ': 'ENTj (LIE)',
  'ENTP': 'ENTp (ILE)',
  'INFJ': 'INFp (IEI)',
  'INFP': 'INFj (EII)',
  'ENFJ': 'ENFj (EIE)',
  'ENFP': 'ENFp (IEE)',
  'ISTJ': 'ISTp (SLI)',
  'ISFJ': 'ISFp (SEI)',
  'ESTJ': 'ESTj (LSE)',
  'ESFJ': 'ESFj (ESE)',
  'ISTP': 'ISTj (LSI)',
  'ISFP': 'ISFj (ESI)',
  'ESTP': 'ESTp (SLE)',
  'ESFP': 'ESFp (SEE)'
};

const SOCIONICS_FUNCTION_STACKS = {
  'INTp (ILI)': ['Ni', 'Te', 'Fi', 'Se'],
  'INTj (LII)': ['Ti', 'Ne', 'Si', 'Fe'],
  'ENTj (LIE)': ['Te', 'Ni', 'Se', 'Fi'],
  'ENTp (ILE)': ['Ne', 'Ti', 'Fe', 'Si'],
  'INFp (IEI)': ['Ni', 'Fe', 'Ti', 'Se'],
  'INFj (EII)': ['Fi', 'Ne', 'Si', 'Te'],
  'ENFj (EIE)': ['Fe', 'Ni', 'Se', 'Ti'],
  'ENFp (IEE)': ['Ne', 'Fi', 'Te', 'Si'],
  'ISTp (SLI)': ['Si', 'Te', 'Fi', 'Ne'],
  'ISFp (SEI)': ['Si', 'Fe', 'Ti', 'Ne'],
  'ESTj (LSE)': ['Te', 'Si', 'Ne', 'Fi'],
  'ESFj (ESE)': ['Fe', 'Si', 'Ne', 'Ti'],
  'ISTj (LSI)': ['Ti', 'Se', 'Ni', 'Fe'],
  'ISFj (ESI)': ['Fi', 'Se', 'Ni', 'Te'],
  'ESTp (SLE)': ['Se', 'Ti', 'Fe', 'Ni'],
  'ESFp (SEE)': ['Se', 'Fi', 'Te', 'Ni']
};

function calculateElementStrength(scores: TPSScores, elementConfig: any): number {
  const primaryScore = elementConfig.primary.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / elementConfig.primary.length;
  
  const secondaryScore = elementConfig.secondary.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / elementConfig.secondary.length;
  
  // Weight primary traits more heavily
  return (primaryScore * 0.7) + (secondaryScore * 0.3);
}

function calculateInformationElements(socionicsType: string, scores: TPSScores) {
  const functionStack = SOCIONICS_FUNCTION_STACKS[socionicsType as keyof typeof SOCIONICS_FUNCTION_STACKS];
  if (!functionStack) return null;
  
  const elements = functionStack.map((element, index) => {
    const elementConfig = TPS_TO_SOCIONICS_ELEMENTS[element as keyof typeof TPS_TO_SOCIONICS_ELEMENTS];
    const strength = calculateElementStrength(scores, elementConfig);
    
    return {
      element,
      strength,
      description: elementConfig.description
    };
  });
  
  return {
    dominant: elements[0],
    auxiliary: elements[1],
    tertiary: elements[2],
    inferior: elements[3]
  };
}

export function calculateSocionicsEnhanced(mbtiType: string, scores: TPSScores): SocionicsDetail {
  // Map MBTI to Socionics type
  const socionicsType = MBTI_TO_SOCIONICS_MAPPING[mbtiType as keyof typeof MBTI_TO_SOCIONICS_MAPPING] || 'Unknown';
  
  // Calculate information elements
  const informationElements = calculateInformationElements(socionicsType, scores);
  
  // Determine intertype relationships (simplified)
  const intertype = 'Compatible'; // This would be more complex in a full implementation
  
  // Calculate confidence based on element strength consistency
  let confidence = 75; // Base confidence
  if (informationElements) {
    const strengths = [
      informationElements.dominant.strength,
      informationElements.auxiliary.strength,
      informationElements.tertiary.strength,
      informationElements.inferior.strength
    ];
    
    // Higher confidence if dominant/auxiliary are strong and tertiary/inferior are weaker
    const expectedPattern = strengths[0] > strengths[2] && strengths[1] > strengths[3];
    if (expectedPattern) confidence += 15;
    
    // Adjust for overall strength clarity
    const variance = strengths.reduce((sum, strength) => sum + Math.pow(strength - 6.5, 2), 0) / 4;
    confidence = Math.max(50, confidence - (variance * 5));
  }
  
  return {
    type: socionicsType,
    informationElements: informationElements || {
      dominant: { element: 'Unknown', strength: 5 },
      auxiliary: { element: 'Unknown', strength: 5 },
      tertiary: { element: 'Unknown', strength: 5 },
      inferior: { element: 'Unknown', strength: 5 }
    },
    intertype,
    confidence
  };
}