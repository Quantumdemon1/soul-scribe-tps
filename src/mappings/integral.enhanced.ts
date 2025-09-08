// Integral Theory Cognitive Development Mapping
// Based on Ken Wilber's Integral Theory and Spiral Dynamics

import { TPSScores } from '../types/tps.types';
import { calculateConfidence, calculateWeightedScore } from './index';

export interface IntegralLevel {
  number: number;
  color: string;
  name: string;
  cognitiveStage: string;
  worldview: string;
  thinkingPattern: string;
  score: number;
  confidence: number;
  characteristics: string[];
  growthEdge: string[];
  typicalConcerns: string[];
}

export interface IntegralDetail {
  primaryLevel: IntegralLevel;
  secondaryLevel?: IntegralLevel;
  realityTriadMapping: {
    physical: number; // Red/Amber
    social: number;   // Orange/Green  
    universal: number; // Teal/Turquoise+
  };
  cognitiveComplexity: number;
  developmentalEdge: string;
  confidence: number;
}

export const INTEGRAL_LEVELS = {
  red: {
    number: 2,
    color: 'Red',
    name: 'Power/Control',
    cognitiveStage: 'Preoperational to early Concrete',
    worldview: 'Egocentric, immediate gratification - "I live in a world full of different people..."',
    thinkingPattern: 'Impulsive, power-based, here-and-now',
    characteristics: [
      'Immediate gratification focus',
      'Power and dominance oriented',
      'Concrete, literal thinking',
      'Self-centered perspective'
    ],
    growthEdge: [
      'Develop impulse control',
      'Learn rule-following',
      'Consider others\' needs',
      'Build basic structure'
    ],
    typicalConcerns: ['Survival', 'Power', 'Respect', 'Freedom from constraint'],
    strong_indicators: ['Self-Indulgent', 'Assertive', 'Physical', 'Dynamic'],
    moderate_indicators: ['Direct', 'Independent', 'Turbulent']
  },
  
  amber: {
    number: 3,
    color: 'Blue',
    name: 'Order/Belong',
    cognitiveStage: 'Concrete Operational',
    worldview: 'Ethnocentric, rule-based order - "We all have our own lives to deal with..."',
    thinkingPattern: 'Rule-based, hierarchical, conformist',
    characteristics: [
      'Strong adherence to rules and authority',
      'Traditional values and customs',
      'Clear hierarchy and order',
      'Group conformity important'
    ],
    growthEdge: [
      'Question rigid rules when appropriate',
      'Develop critical thinking',
      'Consider multiple perspectives',
      'Balance tradition with innovation'
    ],
    typicalConcerns: ['Order', 'Tradition', 'Belonging', 'Moral righteousness'],
    strong_indicators: ['Lawful', 'Structured', 'Passive', 'Pessimistic'],
    moderate_indicators: ['Communal Navigate', 'Stoic', 'Responsive']
  },
  
  orange: {
    number: 4,
    color: 'Orange',
    name: 'Achieve',
    cognitiveStage: 'Early Formal Operational',
    worldview: 'World-centric, rational, achievement-focused - "Everyone\'s unique, and we should all be allowed..."',
    thinkingPattern: 'Strategic, analytical, goal-oriented',
    characteristics: [
      'Rational, scientific thinking',
      'Achievement and success oriented',
      'Strategic planning abilities',
      'Material progress focused'
    ],
    growthEdge: [
      'Integrate emotional intelligence',
      'Consider community impact',
      'Balance competition with cooperation',
      'Develop systems thinking'
    ],
    typicalConcerns: ['Success', 'Achievement', 'Rational progress', 'Individual excellence'],
    strong_indicators: ['Analytical', 'Extrinsic', 'Pragmatic', 'Realistic'],
    moderate_indicators: ['Assertive', 'Self-Mastery', 'Direct', 'Independent']
  },
  
  green: {
    number: 5,
    color: 'Green',
    name: 'Understand',
    cognitiveStage: 'Formal Operational',
    worldview: 'World-centric, pluralistic, community-focused - "When you think about what\'s \'good\' and \'bad\'..."',
    thinkingPattern: 'Relativistic, consensus-seeking, inclusive',
    characteristics: [
      'Egalitarian and inclusive values',
      'Consensus and community focus',
      'Cultural sensitivity and diversity',
      'Environmental and social consciousness'
    ],
    growthEdge: [
      'Integrate healthy hierarchy',
      'Develop discernment skills',
      'Balance relativism with truth',
      'Move beyond group-think'
    ],
    typicalConcerns: ['Equality', 'Community', 'Relationships', 'Cultural sensitivity'],
    strong_indicators: ['Social', 'Diplomatic', 'Responsive', 'Mixed Navigate'],
    moderate_indicators: ['Communal Navigate', 'Mixed Communication', 'Optimistic']
  },
  
  teal: {
    number: 6,
    color: 'Yellow',
    name: 'Harmonize',
    cognitiveStage: 'Post-Formal/Integral',
    worldview: 'Integral, systematic, holistic - "You can\'t know for sure what will happen before you act..."',
    thinkingPattern: 'Integrative, systematic, paradox-comfortable',
    characteristics: [
      'Integrates multiple perspectives',
      'Systems and complexity thinking',
      'Comfortable with paradox',
      'Natural hierarchy and holarchy'
    ],
    growthEdge: [
      'Deepen spiritual understanding',
      'Expand cosmic perspective',
      'Integrate body-mind-spirit',
      'Develop global consciousness'
    ],
    typicalConcerns: ['Integration', 'Systems health', 'Global sustainability', 'Evolutionary development'],
    strong_indicators: ['Universal', 'Self-Aware', 'Varied', 'Intrinsic'],
    moderate_indicators: ['Self-Principled', 'Intuitive', 'Ambivalent']
  },
  
  turquoise: {
    number: 7,
    color: 'Turquoise',
    name: 'Sanctify',
    cognitiveStage: 'Meta-Systematic/Transpersonal',
    worldview: 'Kosmo-centric, holistic, transpersonal - "The world is too complex to control..."',
    thinkingPattern: 'Holistic, transpersonal, cosmic',
    characteristics: [
      'Cosmic and transpersonal perspective',
      'Holistic, non-linear thinking',
      'Spiritual and mystical integration',
      'Global and ecological consciousness'
    ],
    growthEdge: [
      'Deepen cosmic consciousness',
      'Integrate higher spiritual states',
      'Expand trans-rational awareness',
      'Embody universal compassion'
    ],
    typicalConcerns: ['Cosmic harmony', 'Universal consciousness', 'Ecological wholeness', 'Transpersonal evolution'],
    strong_indicators: ['Universal', 'Self-Mastery', 'Intuitive', 'Stoic'],
    moderate_indicators: ['Self-Aware', 'Intrinsic', 'Independent Navigate']
  }
};

export function calculateIntegralDevelopment(traitScores: TPSScores): IntegralDetail {
  // Calculate scores for each integral level
  const levelScores = Object.entries(INTEGRAL_LEVELS).map(([key, level]) => {
    const score = calculateWeightedScore(traitScores, level);
    const confidence = calculateConfidence(score - 5, 1.0);
    
    return {
      key,
      score,
      confidence,
      level: {
        ...level,
        score,
        confidence
      }
    };
  });

  // Sort by score to find primary and secondary levels
  levelScores.sort((a, b) => b.score - a.score);
  
  const primaryLevel = levelScores[0].level;
  const secondaryLevel = levelScores.length > 1 ? levelScores[1].level : undefined;

  // Map Reality Triad to Integral Levels
  const realityTriadMapping = {
    physical: calculatePhysicalTriadLevel(traitScores),
    social: calculateSocialTriadLevel(traitScores), 
    universal: calculateUniversalTriadLevel(traitScores)
  };

  // Calculate overall cognitive complexity
  const cognitiveComplexity = calculateCognitiveComplexity(traitScores, primaryLevel);

  // Determine developmental edge
  const developmentalEdge = determineDevelopmentalEdge(primaryLevel, secondaryLevel);

  // Overall confidence based on primary level confidence and score separation
  const confidence = calculateOverallConfidence(levelScores);

  return {
    primaryLevel,
    secondaryLevel,
    realityTriadMapping,
    cognitiveComplexity,
    developmentalEdge,
    confidence
  };
}

function calculatePhysicalTriadLevel(traitScores: TPSScores): number {
  // Physical triad maps to Red/Amber levels (concrete operational)
  const redScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.red);
  const amberScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.amber);
  
  // Weight toward concrete, rule-based thinking
  const physicalWeight = (
    (traitScores['Physical'] * 0.40) +
    (traitScores['Structured'] * 0.20) +
    (traitScores['Lawful'] * 0.20) +
    (traitScores['Self-Indulgent'] * 0.10) +
    (traitScores['Direct'] * 0.10)
  );
  
  return Math.max(redScore, amberScore) * (physicalWeight / 10);
}

function calculateSocialTriadLevel(traitScores: TPSScores): number {
  // Social triad maps to Orange/Green levels (formal operational)
  const orangeScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.orange);
  const greenScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.green);
  
  // Weight toward interpersonal and systems thinking
  const socialWeight = (
    (traitScores['Social'] * 0.40) +
    (traitScores['Diplomatic'] * 0.20) +
    (traitScores['Analytical'] * 0.15) +
    (traitScores['Communal Navigate'] * 0.15) +
    (traitScores['Responsive'] * 0.10)
  );
  
  return Math.max(orangeScore, greenScore) * (socialWeight / 10);
}

function calculateUniversalTriadLevel(traitScores: TPSScores): number {
  // Universal triad maps to Teal/Turquoise levels (post-formal)
  const tealScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.teal);
  const turquoiseScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.turquoise);
  
  // Weight toward abstract, integral thinking
  const universalWeight = (
    (traitScores['Universal'] * 0.40) +
    (traitScores['Intuitive'] * 0.20) +
    (traitScores['Self-Aware'] * 0.15) +
    (traitScores['Varied'] * 0.15) +
    (traitScores['Intrinsic'] * 0.10)
  );
  
  return Math.max(tealScore, turquoiseScore) * (universalWeight / 10);
}

function calculateCognitiveComplexity(traitScores: TPSScores, primaryLevel: IntegralLevel): number {
  // Cognitive complexity increases with developmental level
  const levelComplexity = {
    'Red': 2,
    'Amber': 3,
    'Orange': 5,
    'Green': 6,
    'Teal': 8,
    'Turquoise': 10
  }[primaryLevel.color] || 5;

  // Adjust for thinking style traits
  const complexityModifiers = (
    (traitScores['Varied'] * 0.20) +
    (traitScores['Intuitive'] * 0.20) +
    (traitScores['Self-Aware'] * 0.15) +
    (traitScores['Analytical'] * 0.15) +
    (traitScores['Universal'] * 0.15) +
    (traitScores['Ambivalent'] * 0.15) // Comfort with paradox
  );

  return Math.min(10, levelComplexity + (complexityModifiers - 5) * 0.5);
}

function determineDevelopmentalEdge(primaryLevel: IntegralLevel, secondaryLevel?: IntegralLevel): string {
  if (!secondaryLevel) {
    return `Focus on integrating ${primaryLevel.growthEdge[0]}`;
  }

  // If secondary level is higher, that's the growth edge
  const levelOrder = ['Red', 'Amber', 'Orange', 'Green', 'Teal', 'Turquoise'];
  const primaryIndex = levelOrder.indexOf(primaryLevel.color);
  const secondaryIndex = levelOrder.indexOf(secondaryLevel.color);

  if (secondaryIndex > primaryIndex) {
    return `Developing toward ${secondaryLevel.name}: ${secondaryLevel.growthEdge[0]}`;
  } else {
    return `Strengthening current level while preparing for next: ${primaryLevel.growthEdge[0]}`;
  }
}

function calculateOverallConfidence(levelScores: any[]): number {
  if (levelScores.length < 2) return levelScores[0]?.confidence || 50;
  
  // Higher confidence when there's clear separation between top scores
  const topScore = levelScores[0].score;
  const secondScore = levelScores[1].score;
  const separation = topScore - secondScore;
  
  // Base confidence from primary level, adjusted for score separation
  const baseConfidence = levelScores[0].confidence;
  const separationBonus = Math.min(20, separation * 10);
  
  return Math.min(100, baseConfidence + separationBonus);
}

// Socratic clarification helpers for integral development
export function getIntegralClarificationQuestions(level: IntegralLevel): string[] {
  const clarificationPrompts = {
    'Red': [
      "When you want something, how important is it to get it right away versus waiting?",
      "How do you typically handle situations where someone tells you what to do?",
      "When making decisions, how much do you consider the long-term consequences?"
    ],
    'Amber': [
      "How important are rules and traditions in guiding your decisions?",
      "When there's a conflict between personal preference and group expectations, which do you typically choose?",
      "How do you feel about questioning established authorities or procedures?"
    ],
    'Orange': [
      "How do you approach achieving your goals - through systematic planning or intuitive action?",
      "When evaluating ideas, how much weight do you give to scientific evidence versus other factors?",
      "How important is personal success and achievement compared to other values?"
    ],
    'Green': [
      "How do you balance individual needs with community wellbeing in your decisions?",
      "When there are cultural differences, how do you navigate finding common ground?",
      "How comfortable are you with the idea that different perspectives can be equally valid?"
    ],
    'Teal': [
      "How do you handle situations where you need to integrate seemingly contradictory viewpoints?",
      "When solving complex problems, how do you account for multiple systems and levels of influence?",
      "How do you balance rational analysis with intuitive understanding in your decision-making?"
    ],
    'Turquoise': [
      "How do you experience your connection to larger patterns or cosmic processes?",
      "In what ways do you integrate spiritual or transcendent perspectives into practical decisions?",
      "How do you hold both local concerns and universal wellbeing in your awareness?"
    ]
  };

  return clarificationPrompts[level.color] || [];
}

export function validateIntegralAssessment(responses: string[], level: IntegralLevel): boolean {
  // Validate that responses align with the assessed integral level
  // This could be enhanced with more sophisticated NLP analysis
  
  const responseText = responses.join(' ').toLowerCase();
  const levelKeywords = {
    'Red': ['power', 'control', 'immediate', 'want', 'strong', 'force'],
    'Amber': ['rules', 'tradition', 'should', 'proper', 'authority', 'order'],
    'Orange': ['achieve', 'success', 'logical', 'efficient', 'rational', 'goal'],
    'Green': ['community', 'together', 'feelings', 'inclusive', 'caring', 'harmony'],
    'Teal': ['integrate', 'systems', 'complex', 'balance', 'paradox', 'holistic'],
    'Turquoise': ['cosmic', 'universal', 'transcendent', 'spiritual', 'consciousness', 'unity']
  };

  const keywords = levelKeywords[level.color] || [];
  const keywordMatches = keywords.filter(keyword => responseText.includes(keyword)).length;
  
  // Simple validation - at least some keyword alignment
  return keywordMatches >= Math.ceil(keywords.length * 0.3);
}