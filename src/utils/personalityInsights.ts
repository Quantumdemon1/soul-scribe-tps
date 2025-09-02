import { PersonalityProfile, DominantTraits, TPSScores } from '../types/tps.types';

export interface PersonalityInsight {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

export interface CareerRecommendation {
  field: string;
  roles: string[];
  reason: string;
  workEnvironment: string;
}

export interface DevelopmentArea {
  area: string;
  description: string;
  activities: string[];
  timeframe: string;
}

export class PersonalityInsightGenerator {
  static generateCoreInsights(profile: PersonalityProfile): PersonalityInsight {
    const { dominantTraits, domainScores, traitScores } = profile;
    
    const summary = this.generateSummary(dominantTraits, domainScores);
    const strengths = this.identifyStrengths(traitScores, dominantTraits);
    const growthAreas = this.identifyGrowthAreas(traitScores, dominantTraits);
    const recommendations = this.generateRecommendations(dominantTraits, domainScores);

    return { summary, strengths, growthAreas, recommendations };
  }

  static generateCareerRecommendations(profile: PersonalityProfile): CareerRecommendation[] {
    const { dominantTraits, traitScores } = profile;
    const recommendations: CareerRecommendation[] = [];

    // External domain analysis
    const controlTrait = this.getDominantInTriad(dominantTraits, 'External-Control');
    const willTrait = this.getDominantInTriad(dominantTraits, 'External-Will');
    const designTrait = this.getDominantInTriad(dominantTraits, 'External-Design');

    // High-level career mapping based on dominant traits
    if (controlTrait === 'Structured' && designTrait === 'Lawful') {
      recommendations.push({
        field: 'Business & Management',
        roles: ['Project Manager', 'Operations Director', 'Business Analyst'],
        reason: 'Your structured approach and preference for established systems make you excellent at organizing and managing complex projects.',
        workEnvironment: 'Corporate environments with clear hierarchies and defined processes'
      });
    }

    if (this.getTraitScore(traitScores, 'Analytical') > 7 && this.getTraitScore(traitScores, 'Intuitive') > 6) {
      recommendations.push({
        field: 'Technology & Research',
        roles: ['Software Engineer', 'Data Scientist', 'Research Analyst'],
        reason: 'Your analytical thinking combined with intuitive insights makes you ideal for solving complex technical problems.',
        workEnvironment: 'Innovative tech companies or research institutions with flexible schedules'
      });
    }

    if (this.getTraitScore(traitScores, 'Communal Navigate') > 7 && willTrait === 'Diplomatic') {
      recommendations.push({
        field: 'Human Resources & Counseling',
        roles: ['HR Manager', 'Therapist', 'Team Coach'],
        reason: 'Your ability to navigate social dynamics diplomatically makes you excellent at helping others and managing relationships.',
        workEnvironment: 'People-focused organizations with emphasis on team collaboration'
      });
    }

    if (this.getTraitScore(traitScores, 'Dynamic') > 7 && willTrait === 'Assertive') {
      recommendations.push({
        field: 'Sales & Marketing',
        roles: ['Sales Manager', 'Marketing Director', 'Business Development'],
        reason: 'Your dynamic energy and assertive approach make you naturally effective at driving growth and persuading others.',
        workEnvironment: 'Fast-paced, results-oriented environments with performance incentives'
      });
    }

    // Ensure we always have at least 3 recommendations
    if (recommendations.length < 3) {
      recommendations.push({
        field: 'Education & Training',
        roles: ['Educator', 'Corporate Trainer', 'Curriculum Designer'],
        reason: 'Your personality profile suggests you would excel at sharing knowledge and helping others develop their skills.',
        workEnvironment: 'Educational institutions or corporate learning environments'
      });
    }

    return recommendations.slice(0, 3);
  }

  static generateDevelopmentAreas(profile: PersonalityProfile): DevelopmentArea[] {
    const { traitScores, dominantTraits } = profile;
    const areas: DevelopmentArea[] = [];

    // Identify lowest scoring traits for development
    const sortedTraits = Object.entries(traitScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    sortedTraits.forEach(([trait, score]) => {
      if (score < 5) {
        areas.push(this.createDevelopmentArea(trait, score));
      }
    });

    // Add domain-specific development areas
    const lowestDomain = Object.entries(profile.domainScores)
      .sort(([,a], [,b]) => a - b)[0];

    if (lowestDomain[1] < 6) {
      areas.push(this.createDomainDevelopmentArea(lowestDomain[0]));
    }

    return areas.slice(0, 4);
  }

  private static generateSummary(dominantTraits: DominantTraits, domainScores: Record<string, number>): string {
    const highestDomain = Object.entries(domainScores)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const summaryMap = {
      'External': 'You are naturally oriented toward organizing and managing your external environment. You likely excel at structure, planning, and implementing systems.',
      'Internal': 'You have a strong focus on inner growth and self-understanding. You tend to be motivated by personal values and authentic self-expression.',
      'Interpersonal': 'You thrive in social environments and are skilled at navigating relationships. Communication and collaboration are likely your natural strengths.',
      'Processing': 'You excel at analytical thinking and information processing. You likely approach problems methodically and enjoy complex mental challenges.'
    };

    return summaryMap[highestDomain] || 'You have a balanced personality profile with strengths across multiple domains.';
  }

  private static identifyStrengths(traitScores: TPSScores, dominantTraits: DominantTraits): string[] {
    const strengths: string[] = [];
    
    // Top 5 traits by score
    const topTraits = Object.entries(traitScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const strengthMap: Record<string, string> = {
      'Structured': 'Excellent organizational and planning abilities',
      'Assertive': 'Natural leadership and decision-making skills',
      'Analytical': 'Strong problem-solving and critical thinking',
      'Communal Navigate': 'Exceptional interpersonal and team collaboration skills',
      'Self-Mastery': 'High emotional intelligence and self-regulation',
      'Dynamic': 'Energetic and adaptable to changing situations',
      'Optimistic': 'Positive outlook that inspires and motivates others',
      'Direct': 'Clear, honest communication style',
      'Intuitive': 'Creative thinking and pattern recognition abilities'
    };

    topTraits.forEach(([trait, score]) => {
      if (score > 7 && strengthMap[trait]) {
        strengths.push(strengthMap[trait]);
      }
    });

    return strengths.slice(0, 4);
  }

  private static identifyGrowthAreas(traitScores: TPSScores, dominantTraits: DominantTraits): string[] {
    const growthAreas: string[] = [];
    
    const bottomTraits = Object.entries(traitScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    const growthMap: Record<string, string> = {
      'Structured': 'Developing better organization and planning systems',
      'Diplomatic': 'Improving conflict resolution and negotiation skills',
      'Self-Aware': 'Enhancing emotional intelligence and self-reflection',
      'Optimistic': 'Building resilience and positive thinking patterns',
      'Dynamic': 'Increasing adaptability and comfort with change',
      'Communal Navigate': 'Strengthening team collaboration and social skills'
    };

    bottomTraits.forEach(([trait, score]) => {
      if (score < 5 && growthMap[trait]) {
        growthAreas.push(growthMap[trait]);
      }
    });

    return growthAreas.slice(0, 3);
  }

  private static generateRecommendations(dominantTraits: DominantTraits, domainScores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    // Domain-based recommendations
    Object.entries(domainScores).forEach(([domain, score]) => {
      if (score > 7) {
        const recMap = {
          'External': 'Take on leadership roles or project management responsibilities',
          'Internal': 'Pursue mindfulness practices or personal development coaching',
          'Interpersonal': 'Consider roles that involve mentoring or team facilitation',
          'Processing': 'Engage in complex problem-solving projects or analytical work'
        };
        
        if (recMap[domain]) {
          recommendations.push(recMap[domain]);
        }
      }
    });

    return recommendations;
  }

  private static getDominantInTriad(dominantTraits: DominantTraits, triadKey: string): string {
    return dominantTraits[triadKey] || '';
  }

  private static getTraitScore(traitScores: TPSScores, trait: string): number {
    return traitScores[trait] || 0;
  }

  private static createDevelopmentArea(trait: string, score: number): DevelopmentArea {
    const areaMap: Record<string, DevelopmentArea> = {
      'Structured': {
        area: 'Organization & Planning',
        description: 'Improve your ability to create and maintain structured systems and processes.',
        activities: ['Use digital planning tools', 'Practice time-blocking', 'Create daily/weekly routines'],
        timeframe: '2-3 months'
      },
      'Self-Aware': {
        area: 'Self-Reflection & Awareness',
        description: 'Develop deeper understanding of your emotions, motivations, and patterns.',
        activities: ['Daily journaling', 'Mindfulness meditation', 'Personality assessments'],
        timeframe: '3-6 months'
      },
      'Diplomatic': {
        area: 'Conflict Resolution',
        description: 'Enhance your ability to navigate disagreements and find win-win solutions.',
        activities: ['Active listening practice', 'Negotiation training', 'Empathy exercises'],
        timeframe: '1-2 months'
      }
    };

    return areaMap[trait] || {
      area: 'Personal Growth',
      description: 'Focus on developing this aspect of your personality.',
      activities: ['Self-reflection', 'Practice in real situations', 'Seek feedback'],
      timeframe: '2-4 months'
    };
  }

  private static createDomainDevelopmentArea(domain: string): DevelopmentArea {
    const domainMap: Record<string, DevelopmentArea> = {
      'External': {
        area: 'External Management',
        description: 'Strengthen your ability to organize and control your external environment.',
        activities: ['Project management courses', 'Leadership training', 'System design practice'],
        timeframe: '3-4 months'
      },
      'Internal': {
        area: 'Self-Development',
        description: 'Deepen your understanding of personal motivations and self-regulation.',
        activities: ['Therapy or coaching', 'Values clarification exercises', 'Goal-setting practice'],
        timeframe: '4-6 months'
      },
      'Interpersonal': {
        area: 'Relationship Skills',
        description: 'Improve your ability to connect with and influence others effectively.',
        activities: ['Communication workshops', 'Team sports or group activities', 'Public speaking'],
        timeframe: '2-3 months'
      },
      'Processing': {
        area: 'Cognitive Enhancement',
        description: 'Develop stronger analytical and problem-solving capabilities.',
        activities: ['Logic puzzles', 'Data analysis courses', 'Critical thinking exercises'],
        timeframe: '3-5 months'
      }
    };

    return domainMap[domain] || {
      area: 'General Development',
      description: 'Focus on overall personality development in this domain.',
      activities: ['Self-study', 'Practice opportunities', 'Mentorship'],
      timeframe: '3-6 months'
    };
  }
}