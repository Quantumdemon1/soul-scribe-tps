// Integral Theory Cognitive Development Mapping
// Based on Ken Wilber's Integral Theory and Spiral Dynamics

import { TPSScores } from '../types/tps.types';
import { calculateConfidence, calculateWeightedScore } from './utils';

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
  beige: {
    number: 1,
    color: 'Beige',
    name: 'Survive',
    cognitiveStage: 'Archaic-Instinctual',
    worldview: 'Basic survival instincts, automatic responses to biological needs',
    thinkingPattern: 'Instinctual, reactive, basic survival focus',
    characteristics: [
      'Basic survival instincts',
      'Immediate biological needs focus',
      'Limited cognitive processing',
      'Reactive rather than proactive'
    ],
    growthEdge: [
      'Develop basic social bonds',
      'Learn simple cause-and-effect',
      'Build basic trust',
      'Form tribal connections'
    ],
    typicalConcerns: ['Survival', 'Food', 'Shelter', 'Safety'],
    strong_indicators: ['Physical', 'Reactive', 'Basic'],
    moderate_indicators: ['Immediate', 'Instinctual']
  },

  purple: {
    number: 2,
    color: 'Purple',
    name: 'Bond',
    cognitiveStage: 'Magical-Animistic',
    worldview: 'Magical thinking, animistic beliefs, tribal bonds and rituals',
    thinkingPattern: 'Magical, ritualistic, group-centered',
    characteristics: [
      'Strong tribal and family bonds',
      'Magical thinking and superstitions',
      'Ritual and ceremony importance',
      'Group safety and belonging'
    ],
    growthEdge: [
      'Develop individual identity',
      'Build personal power',
      'Question magical thinking',
      'Assert individual needs'
    ],
    typicalConcerns: ['Tribal safety', 'Ancestral spirits', 'Group harmony', 'Magical protection'],
    strong_indicators: ['Mystical', 'Tribal', 'Protective', 'Traditional'],
    moderate_indicators: ['Communal', 'Ritualistic', 'Bonding']
  },

  red: {
    number: 3,
    color: 'Red',
    name: 'Power',
    cognitiveStage: 'Power Gods',
    worldview: 'Egocentric, immediate gratification, power and dominance focused',
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
  
  blue: {
    number: 4,
    color: 'Blue',
    name: 'Order',
    cognitiveStage: 'Mythic Order',
    worldview: 'Absolutistic, rule-based order, traditional hierarchy and morality',
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
    number: 5,
    color: 'Orange',
    name: 'Achieve',
    cognitiveStage: 'Rational Achievement',
    worldview: 'Multiplistic, rational, achievement-focused, scientific materialism',
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
    number: 6,
    color: 'Green',
    name: 'Community',
    cognitiveStage: 'Pluralistic',
    worldview: 'Relativistic, pluralistic, community-focused, egalitarian values',
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
  
  yellow: {
    number: 7,
    color: 'Yellow',
    name: 'Integrate',
    cognitiveStage: 'Systemic/Integral',
    worldview: 'Integral, systematic, holistic, natural hierarchies and systems',
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
    number: 8,
    color: 'Turquoise',
    name: 'Holistic',
    cognitiveStage: 'Meta-Systemic/Holistic',
    worldview: 'Holistic, transpersonal, cosmic consciousness, global networks',
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
  },

  coral: {
    number: 9,
    color: 'Coral',
    name: 'Global',
    cognitiveStage: 'Meta-Meta-Systemic/Cosmic',
    worldview: 'Planetary consciousness, cosmic-planetary integration, universal love',
    thinkingPattern: 'Meta-systemic, cosmic-planetary, universal',
    characteristics: [
      'Planetary and cosmic consciousness',
      'Universal love and compassion',
      'Meta-systemic integration',
      'Transcendent yet grounded perspective'
    ],
    growthEdge: [
      'Embody cosmic love',
      'Integrate universal wisdom',
      'Transcend all limitations',
      'Serve planetary evolution'
    ],
    typicalConcerns: ['Planetary wellbeing', 'Universal love', 'Cosmic evolution', 'Transcendent service'],
    strong_indicators: ['Cosmic', 'Universal', 'Transcendent', 'Loving'],
    moderate_indicators: ['Meta-Systemic', 'Planetary', 'Evolutionary']
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
  // Physical triad maps to Beige/Purple/Red/Blue levels (concrete operational)
  const beigeScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.beige);
  const purpleScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.purple);
  const redScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.red);
  const blueScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.blue);
  
  // Weight toward concrete, rule-based thinking
  const physicalWeight = (
    (traitScores['Physical'] * 0.40) +
    (traitScores['Structured'] * 0.20) +
    (traitScores['Lawful'] * 0.20) +
    (traitScores['Self-Indulgent'] * 0.10) +
    (traitScores['Direct'] * 0.10)
  );
  
  const maxScore = Math.max(beigeScore, purpleScore, redScore, blueScore);
  return maxScore * (physicalWeight / 10);
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
  // Universal triad maps to Yellow/Turquoise/Coral levels (post-formal)
  const yellowScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.yellow);
  const turquoiseScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.turquoise);
  const coralScore = calculateWeightedScore(traitScores, INTEGRAL_LEVELS.coral);
  
  // Weight toward abstract, integral thinking
  const universalWeight = (
    (traitScores['Universal'] * 0.40) +
    (traitScores['Intuitive'] * 0.20) +
    (traitScores['Self-Aware'] * 0.15) +
    (traitScores['Varied'] * 0.15) +
    (traitScores['Intrinsic'] * 0.10)
  );
  
  const maxScore = Math.max(yellowScore, turquoiseScore, coralScore);
  return maxScore * (universalWeight / 10);
}

function calculateCognitiveComplexity(traitScores: TPSScores, primaryLevel: IntegralLevel): number {
  // Cognitive complexity increases with developmental level
  const levelComplexity = {
    'Beige': 1,
    'Purple': 2,
    'Red': 2,
    'Blue': 3,
    'Orange': 5,
    'Green': 6,
    'Yellow': 8,
    'Turquoise': 9,
    'Coral': 10
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
  const levelOrder = ['Beige', 'Purple', 'Red', 'Blue', 'Orange', 'Green', 'Yellow', 'Turquoise', 'Coral'];
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
    'Beige': [
      "What drives your most immediate daily decisions and priorities?",
      "How do you typically respond when your basic needs feel threatened?",
      "What gives you the strongest sense of safety and security?"
    ],
    'Purple': [
      "How important are family traditions and group rituals in your life?",
      "When making decisions, how much do you consider the impact on your closest community?",
      "How do you handle situations that feel mysterious or beyond rational explanation?"
    ],
    'Red': [
      "When you want something, how important is it to get it right away versus waiting?",
      "How do you typically handle situations where someone tells you what to do?",
      "When making decisions, how much do you consider the long-term consequences?"
    ],
    'Blue': [
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
    'Yellow': [
      "How do you handle situations where you need to integrate seemingly contradictory viewpoints?",
      "When solving complex problems, how do you account for multiple systems and levels of influence?",
      "How do you balance rational analysis with intuitive understanding in your decision-making?"
    ],
    'Turquoise': [
      "How do you experience your connection to larger patterns or cosmic processes?",
      "In what ways do you integrate spiritual or transcendent perspectives into practical decisions?",
      "How do you hold both local concerns and universal wellbeing in your awareness?"
    ],
    'Coral': [
      "How do you experience your connection to planetary and cosmic consciousness?",
      "In what ways do you serve the evolution of humanity and the planet?",
      "How do you integrate universal love and wisdom into your daily actions?"
    ]
  };

  return clarificationPrompts[level.color] || [];
}

export function validateIntegralAssessment(responses: string[], level: IntegralLevel): boolean {
  // Validate that responses align with the assessed integral level
  // This could be enhanced with more sophisticated NLP analysis
  
  const responseText = responses.join(' ').toLowerCase();
  const levelKeywords = {
    'Beige': ['survive', 'basic', 'needs', 'immediate', 'safety', 'instinct'],
    'Purple': ['family', 'tribe', 'ritual', 'tradition', 'magical', 'ancestors'],
    'Red': ['power', 'control', 'immediate', 'want', 'strong', 'force'],
    'Blue': ['rules', 'tradition', 'should', 'proper', 'authority', 'order'],
    'Orange': ['achieve', 'success', 'logical', 'efficient', 'rational', 'goal'],
    'Green': ['community', 'together', 'feelings', 'inclusive', 'caring', 'harmony'],
    'Yellow': ['integrate', 'systems', 'complex', 'balance', 'paradox', 'holistic'],
    'Turquoise': ['cosmic', 'universal', 'transcendent', 'spiritual', 'consciousness', 'unity'],
    'Coral': ['planetary', 'global', 'cosmic', 'universal', 'love', 'evolution']
  };

  const keywords = levelKeywords[level.color] || [];
  const keywordMatches = keywords.filter(keyword => responseText.includes(keyword)).length;
  
  // Simple validation - at least some keyword alignment
  return keywordMatches >= Math.ceil(keywords.length * 0.3);
}