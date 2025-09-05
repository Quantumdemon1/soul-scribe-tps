import { TPSScores, AttachmentStyle } from '../types/tps.types';
import { calculateConfidence } from './index';

export const TPS_TO_ATTACHMENT = {
  secure: {
    primary_traits: ['Mixed Navigate', 'Responsive', 'Diplomatic', 'Optimistic'],
    secondary_traits: ['Self-Aware', 'Realistic', 'Modular'],
    description: 'Comfortable with intimacy and independence',
    characteristics: [
      'Comfortable with closeness and autonomy',
      'Effective communication in relationships',
      'Positive view of self and others',
      'Able to seek and provide support',
      'Handles conflict constructively'
    ]
  },
  
  'anxious-preoccupied': {
    primary_traits: ['Communal Navigate', 'Turbulent', 'Passive', 'Social'],
    secondary_traits: ['Pessimistic', 'Extrinsic', 'Responsive'],
    description: 'High need for connection, fear of abandonment',
    characteristics: [
      'Seeks high levels of intimacy and approval',
      'Worries about being alone or unloved',
      'Can be overly dependent on relationships',
      'Sensitive to partner mood changes',
      'May use protest behaviors when distressed'
    ]
  },
  
  'dismissive-avoidant': {
    primary_traits: ['Independent Navigate', 'Stoic', 'Self-Mastery', 'Physical'],
    secondary_traits: ['Assertive', 'Analytical', 'Static'],
    description: 'Values independence, uncomfortable with closeness',
    characteristics: [
      'Prefers self-sufficiency over relationships',
      'Uncomfortable with emotional expression',
      'May suppress or ignore attachment needs',
      'Values achievement over relationships',
      'Tends to minimize importance of close relationships'
    ]
  },
  
  'fearful-avoidant': {
    primary_traits: ['Independent Navigate', 'Turbulent', 'Pessimistic', 'Ambivalent'],
    secondary_traits: ['Self-Aware', 'Passive', 'Universal'],
    description: 'Desires closeness but fears vulnerability',
    characteristics: [
      'Wants close relationships but fears getting hurt',
      'Mixed feelings about depending on others',
      'May have difficulty trusting partners',
      'Can be emotionally volatile in relationships',
      'Struggles between approach and avoidance'
    ]
  }
};

function calculateAttachmentScore(scores: TPSScores, styleConfig: any): number {
  const primaryScore = styleConfig.primary_traits.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / styleConfig.primary_traits.length;
  
  const secondaryScore = styleConfig.secondary_traits.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / styleConfig.secondary_traits.length;
  
  // Weight primary traits more heavily
  return (primaryScore * 0.7) + (secondaryScore * 0.3);
}

export function calculateAttachmentStyle(scores: TPSScores): AttachmentStyle {
  const styleScores: Record<string, number> = {};
  
  // Calculate scores for all attachment styles
  Object.entries(TPS_TO_ATTACHMENT).forEach(([styleName, styleConfig]) => {
    styleScores[styleName] = calculateAttachmentScore(scores, styleConfig);
  });
  
  // Find the highest scoring style
  const sortedStyles = Object.entries(styleScores).sort(([,a], [,b]) => b - a);
  const primaryStyle = sortedStyles[0][0] as 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'fearful-avoidant';
  const primaryScore = sortedStyles[0][1];
  
  // Calculate confidence based on separation from other styles
  const secondaryScore = sortedStyles[1][1];
  const separation = primaryScore - secondaryScore;
  const confidence = calculateConfidence(separation, 0.5);
  
  const styleConfig = TPS_TO_ATTACHMENT[primaryStyle];
  
  return {
    style: primaryStyle,
    score: primaryScore,
    description: styleConfig.description,
    characteristics: styleConfig.characteristics,
    confidence
  };
}