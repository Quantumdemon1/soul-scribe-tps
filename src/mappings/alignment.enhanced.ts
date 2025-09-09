import { TPSScores, AlignmentDetail } from '../types/tps.types';
import { calculateConfidence } from './index';
import type { AlignmentAxisConfig } from '../types/mapping.types';

export const TPS_TO_ALIGNMENT_COMPREHENSIVE = {
  ethical_axis: {
    lawful: {
      strong_indicators: ['Lawful', 'Structured', 'Self-Mastery'],
      moderate_indicators: ['Diplomatic', 'Analytical', 'Stoic'],
      description: 'Values order, tradition, and established systems'
    },
    neutral_ethical: {
      indicators: ['Pragmatic', 'Ambivalent', 'Responsive', 'Varied'],
      description: 'Balances rules with practical considerations'
    },
    chaotic: {
      strong_indicators: ['Self-Principled', 'Independent', 'Dynamic'],
      moderate_indicators: ['Intuitive', 'Varied', 'Self-Indulgent'],
      description: 'Values freedom, creativity, and individual choice'
    }
  },
  
  moral_axis: {
    good: {
      strong_indicators: ['Communal Navigate', 'Diplomatic', 'Optimistic'],
      moderate_indicators: ['Responsive', 'Social', 'Passive'],
      description: 'Prioritizes helping others and collective wellbeing'
    },
    neutral_moral: {
      indicators: ['Realistic', 'Mixed Navigate', 'Pragmatic', 'Stoic'],
      description: 'Balances self-interest with consideration for others'
    },
    evil: {
      strong_indicators: ['Self-Indulgent', 'Assertive', 'Independent Navigate'],
      moderate_indicators: ['Pessimistic', 'Direct', 'Physical'],
      description: 'Prioritizes self-interest and personal power'
    }
  }
};

function calculateAxisScore(scores: TPSScores, axisConfig: AlignmentAxisConfig): { position: string; score: number; reasoning: string } {
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  // Calculate positive axis score (lawful or good)
  const positiveConfig = Object.values(axisConfig)[0] as any;
  if (positiveConfig.strong_indicators) {
    positiveScore += positiveConfig.strong_indicators.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / positiveConfig.strong_indicators.length * 1.5;
  }
  if (positiveConfig.moderate_indicators) {
    positiveScore += positiveConfig.moderate_indicators.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / positiveConfig.moderate_indicators.length;
  }
  positiveScore = positiveScore / (positiveConfig.strong_indicators ? 2 : 1);
  
  // Calculate negative axis score (chaotic or evil)
  const negativeConfig = Object.values(axisConfig)[2] as any;
  if (negativeConfig.strong_indicators) {
    negativeScore += negativeConfig.strong_indicators.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / negativeConfig.strong_indicators.length * 1.5;
  }
  if (negativeConfig.moderate_indicators) {
    negativeScore += negativeConfig.moderate_indicators.reduce((sum: number, trait: string) => 
      sum + (scores[trait] || 5), 0) / negativeConfig.moderate_indicators.length;
  }
  negativeScore = negativeScore / (negativeConfig.strong_indicators ? 2 : 1);
  
  // Calculate neutral score
  const neutralConfig = Object.values(axisConfig)[1] as any;
  neutralScore = neutralConfig.indicators.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / neutralConfig.indicators.length;
  
  // Determine position based on scores
  const threshold = 1.5; // Minimum difference required for non-neutral alignment
  
  let position: string;
  let finalScore: number;
  let reasoning: string;
  
  if (positiveScore > negativeScore && positiveScore > neutralScore && (positiveScore - Math.max(negativeScore, neutralScore)) > threshold) {
    position = Object.keys(axisConfig)[0] === 'lawful' ? 'Lawful' : 'Good';
    finalScore = positiveScore;
    reasoning = positiveConfig.description;
  } else if (negativeScore > positiveScore && negativeScore > neutralScore && (negativeScore - Math.max(positiveScore, neutralScore)) > threshold) {
    position = Object.keys(axisConfig)[2] === 'chaotic' ? 'Chaotic' : 'Evil';
    finalScore = negativeScore;
    reasoning = negativeConfig.description;
  } else {
    position = 'Neutral';
    finalScore = neutralScore;
    reasoning = neutralConfig.description;
  }
  
  return { position, score: finalScore, reasoning };
}

export function calculateAlignmentEnhanced(scores: TPSScores): AlignmentDetail {
  const ethicalResult = calculateAxisScore(scores, TPS_TO_ALIGNMENT_COMPREHENSIVE.ethical_axis);
  const moralResult = calculateAxisScore(scores, TPS_TO_ALIGNMENT_COMPREHENSIVE.moral_axis);
  
  // Determine final alignment
  const alignment = ethicalResult.position === 'Neutral' && moralResult.position === 'Neutral' 
    ? 'True Neutral' 
    : `${ethicalResult.position} ${moralResult.position}`;
  
  // Calculate overall confidence based on score separation
  const ethicalConfidence = calculateConfidence(Math.abs(ethicalResult.score - 5), 1.0);
  const moralConfidence = calculateConfidence(Math.abs(moralResult.score - 5), 1.0);
  const overallConfidence = (ethicalConfidence + moralConfidence) / 2;
  
  return {
    alignment,
    ethicalAxis: {
      position: ethicalResult.position as 'Lawful' | 'Neutral' | 'Chaotic',
      score: ethicalResult.score,
      reasoning: ethicalResult.reasoning
    },
    moralAxis: {
      position: moralResult.position as 'Good' | 'Neutral' | 'Evil',
      score: moralResult.score,
      reasoning: moralResult.reasoning
    },
    confidence: overallConfidence
  };
}