import { TPSScores, HollandDetail } from '../types/tps.types';
import { calculateConfidence } from './index';

export const TPS_TO_HOLLAND_COMPREHENSIVE = {
  R: { // Realistic
    primary_traits: ['Physical', 'Pragmatic', 'Independent Navigate', 'Stoic'],
    secondary_traits: ['Structured', 'Analytical', 'Static', 'Self-Mastery'],
    description: 'Prefers concrete tasks, tools, and measurable outcomes',
    careers: {
      technical: ['Engineering', 'IT Systems', 'Architecture'],
      manual: ['Construction', 'Mechanics', 'Agriculture'],
      scientific: ['Laboratory Work', 'Field Research', 'Quality Control']
    },
    work_environment: 'Structured environments with clear procedures and tangible results'
  },
  
  I: { // Investigative
    primary_traits: ['Analytical', 'Intrinsic', 'Independent', 'Universal'],
    secondary_traits: ['Self-Aware', 'Intuitive', 'Stoic', 'Self-Mastery'],
    description: 'Prefers intellectual challenges and autonomous work',
    careers: {
      research: ['Scientific Research', 'Data Science', 'Academic Research'],
      analytical: ['Financial Analysis', 'Strategic Planning', 'Market Research'],
      technical: ['Software Development', 'Medical Research', 'Engineering Design']
    },
    work_environment: 'Autonomous environments that encourage intellectual exploration'
  },
  
  A: { // Artistic
    primary_traits: ['Intuitive', 'Self-Aware', 'Self-Principled', 'Dynamic'],
    secondary_traits: ['Turbulent', 'Universal', 'Independent', 'Varied'],
    description: 'Prefers creative expression and unstructured environments',
    careers: {
      creative: ['Fine Arts', 'Graphic Design', 'Music', 'Writing'],
      performance: ['Acting', 'Dance', 'Public Speaking'],
      design: ['Interior Design', 'Fashion', 'Product Design']
    },
    work_environment: 'Flexible, creative environments with freedom of expression'
  },
  
  S: { // Social
    primary_traits: ['Communal Navigate', 'Social', 'Diplomatic', 'Responsive'],
    secondary_traits: ['Optimistic', 'Dynamic', 'Passive', 'Mixed Communication'],
    description: 'Prefers helping others and collaborative settings',
    careers: {
      helping: ['Counseling', 'Social Work', 'Nursing', 'Teaching'],
      community: ['Community Organization', 'HR', 'Public Relations'],
      healthcare: ['Psychology', 'Therapy', 'Patient Care']
    },
    work_environment: 'Collaborative environments focused on human development'
  },
  
  E: { // Enterprising
    primary_traits: ['Assertive', 'Extrinsic', 'Direct', 'Optimistic'],
    secondary_traits: ['Dynamic', 'Pragmatic', 'Social', 'Varied'],
    description: 'Prefers leadership roles and competitive environments',
    careers: {
      leadership: ['Executive Management', 'Entrepreneurship', 'Politics'],
      sales: ['Sales Management', 'Real Estate', 'Marketing'],
      influence: ['Law', 'Consulting', 'Public Speaking']
    },
    work_environment: 'Dynamic, competitive environments with leadership opportunities'
  },
  
  C: { // Conventional
    primary_traits: ['Structured', 'Lawful', 'Passive', 'Realistic'],
    secondary_traits: ['Analytical', 'Static', 'Physical', 'Stoic'],
    description: 'Prefers structured tasks and clear procedures',
    careers: {
      administrative: ['Accounting', 'Office Management', 'Data Entry'],
      organizational: ['Project Coordination', 'Operations', 'Logistics'],
      regulatory: ['Compliance', 'Quality Assurance', 'Auditing']
    },
    work_environment: 'Organized environments with established procedures'
  }
};

function calculateTypeScore(scores: TPSScores, typeConfig: any): number {
  const primaryScore = typeConfig.primary_traits.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / typeConfig.primary_traits.length;
  
  const secondaryScore = typeConfig.secondary_traits.reduce((sum: number, trait: string) => 
    sum + (scores[trait] || 5), 0) / typeConfig.secondary_traits.length;
  
  // Weight primary traits more heavily
  return (primaryScore * 0.7) + (secondaryScore * 0.3);
}

export function calculateHollandEnhanced(scores: TPSScores): HollandDetail {
  const typeScores: Record<string, number> = {};
  const typeDetails: Record<string, any> = {};
  
  // Calculate scores for all Holland types
  Object.entries(TPS_TO_HOLLAND_COMPREHENSIVE).forEach(([typeKey, typeConfig]) => {
    const score = calculateTypeScore(scores, typeConfig);
    typeScores[typeKey] = score;
    
    // Gather career areas from all categories
    const allCareers = Object.values(typeConfig.careers).flat();
    
    typeDetails[typeKey] = {
      score,
      description: typeConfig.description,
      careerAreas: allCareers,
      workEnvironment: typeConfig.work_environment
    };
  });
  
  // Sort types by score to determine primary and secondary
  const sortedTypes = Object.entries(typeScores).sort(([,a], [,b]) => b - a);
  const primaryType = sortedTypes[0][0];
  const secondaryType = sortedTypes[1][0];
  
  // Generate Holland Code (up to 3 highest scoring types)
  const code = sortedTypes
    .slice(0, 3)
    .filter(([, score]) => score > 6.0) // Only include strong preferences
    .map(([type]) => type)
    .join('');
  
  // Calculate confidence based on separation between types
  const primaryScore = sortedTypes[0][1];
  const secondaryScore = sortedTypes[1][1];
  const separation = primaryScore - secondaryScore;
  const confidence = calculateConfidence(separation, 0.5);
  
  return {
    code: code || primaryType, // Fallback to primary type if no strong preferences
    types: typeDetails,
    primaryType,
    secondaryType,
    confidence
  };
}