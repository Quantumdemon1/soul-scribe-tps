import { PersonalityProfile } from '../types/tps.types';
import { AIInsights, FrameworkInsights } from '../types/llm.types';
import { PersonalityInsightGenerator } from './personalityInsights';
import { FrameworkDescriptions } from './frameworkDescriptions';
import { enhancedTraitDescriptions } from './enhancedTraitDescriptions';

export interface PDFSection {
  title: string;
  content: PDFContentItem[];
  pageBreak?: boolean;
}

export interface PDFContentItem {
  type: 'text' | 'list' | 'card' | 'chart' | 'grid' | 'progress' | 'badges' | 'table' | 'domain-card';
  data: any;
  style?: any;
}

export class PDFContentGenerator {
  private profile: PersonalityProfile;
  private aiInsights?: AIInsights;

  constructor(profile: PersonalityProfile, aiInsights?: AIInsights) {
    this.profile = profile;
    this.aiInsights = aiInsights;
  }

  generateAllSections(): PDFSection[] {
    return [
      this.generateExecutiveSummary(),
      this.generateDomainAnalysis(),
      this.generateFrameworkCorrelations(),
      this.generateTraitDescriptions(),
      this.generateAIInsights(),
      this.generateCareerRecommendations(),
      this.generateDevelopmentPlan(),
      this.generatePersonalityMatches(),
      this.generateActionPlan()
    ];
  }

  private generateExecutiveSummary(): PDFSection {
    const insights = PersonalityInsightGenerator.generateCoreInsights(this.profile);
    const timestamp = new Date().toLocaleDateString();
    
    return {
      title: 'Executive Summary',
      content: [
        {
          type: 'card',
          data: {
            title: 'Assessment Overview',
            content: [
              { type: 'text', data: `Assessment Date: ${timestamp}` },
              { type: 'text', data: `Assessment Type: Comprehensive TPS Analysis` },
              { type: 'text', data: `Total Questions: 120 trait-based items` },
              { type: 'text', data: `Confidence Level: High (>90%)` }
            ]
          }
        },
        {
          type: 'text',
          data: {
            title: 'Personality Overview',
            content: insights.summary
          }
        },
        {
          type: 'grid',
          data: {
            title: 'Key Personality Indicators',
            items: [
              { label: 'MBTI Type', value: this.profile.mappings.mbti },
              { label: 'Enneagram', value: this.profile.mappings.enneagram },
              { label: 'Alignment', value: this.profile.mappings.dndAlignment },
              { label: 'Holland Code', value: this.profile.mappings.hollandCode }
            ]
          }
        },
        {
          type: 'chart',
          data: {
            title: 'Domain Strengths Overview',
            type: 'radar',
            data: this.profile.domainScores
          }
        }
      ]
    };
  }

  private generateDomainAnalysis(): PDFSection {
    const domainDetails = this.generateDomainDetails();
    
    return {
      title: 'Detailed Domain Analysis',
      content: [
        {
          type: 'text',
          data: {
            title: 'Understanding Your Personality Domains',
            content: 'The TPS framework analyzes personality across four key domains that represent different aspects of human functioning. Each domain contains multiple traits that work together to create your unique personality signature.'
          }
        },
        ...Object.entries(this.profile.domainScores).map(([domain, score]) => ({
          type: 'domain-card' as const,
          data: {
            title: `${domain} Domain`,
            score: score,
            details: domainDetails[domain] || {}
          }
        })),
        {
          type: 'chart' as const,
          data: {
            title: 'Domain Interaction Analysis',
            type: 'bar',
            data: this.profile.domainScores
          }
        }
      ]
    };
  }

  private generateFrameworkCorrelations(): PDFSection {
    const mbtiDescription = FrameworkDescriptions.getMBTIDescription(this.profile.mappings.mbti);
    const enneagramDescription = FrameworkDescriptions.getEnneagramDescription(this.profile.mappings.enneagram);
    const bigFiveDescriptions = FrameworkDescriptions.getBigFiveDescription(this.profile.mappings.bigFive);
    const alignmentDescription = FrameworkDescriptions.getDnDAlignmentDescription(this.profile.mappings.dndAlignment);

    return {
      title: 'Comprehensive Framework Correlations',
      pageBreak: true,
      content: [
        {
          type: 'text',
          data: {
            title: 'Framework Integration',
            content: 'Your TPS profile correlates with several established personality frameworks. This multi-framework approach provides a comprehensive understanding of your personality from different psychological perspectives.'
          }
        },
        {
          type: 'card',
          data: {
            title: `MBTI: ${this.profile.mappings.mbti} - ${mbtiDescription.name}`,
            description: mbtiDescription.description,
            strengths: mbtiDescription.strengths,
            challenges: mbtiDescription.challenges,
            workStyle: mbtiDescription.workStyle,
            relationships: mbtiDescription.relationships,
            growthTips: mbtiDescription.growthTips
          }
        },
        {
          type: 'card',
          data: {
            title: `Enneagram: ${this.profile.mappings.enneagram} - ${enneagramDescription.name}`,
            description: enneagramDescription.description,
            strengths: enneagramDescription.strengths,
            challenges: enneagramDescription.challenges,
            workStyle: enneagramDescription.workStyle,
            relationships: enneagramDescription.relationships,
            growthTips: enneagramDescription.growthTips,
            details: this.profile.mappings.enneagramDetails
          }
        },
        {
          type: 'table',
          data: {
            title: 'Big Five Trait Analysis',
            headers: ['Trait', 'Score', 'Level', 'Description'],
            rows: bigFiveDescriptions.map(desc => [
              desc.trait,
              `${desc.score.toFixed(1)}/10`,
              desc.level,
              desc.description
            ])
          }
        },
        {
          type: 'card',
          data: {
            title: `Moral Alignment: ${this.profile.mappings.dndAlignment}`,
            description: alignmentDescription.description,
            strengths: alignmentDescription.strengths,
            challenges: alignmentDescription.challenges,
            workStyle: alignmentDescription.workStyle,
            relationships: alignmentDescription.relationships
          }
        }
      ]
    };
  }

  private generateTraitDescriptions(): PDFSection {
    const topTraits = Object.entries(this.profile.traitScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return {
      title: 'Enhanced Trait Descriptions',
      pageBreak: true,
      content: [
        {
          type: 'text',
          data: {
            title: 'Your Top Personality Traits',
            content: 'These are your most prominent personality traits based on your assessment responses. Each trait includes detailed behavioral indicators, practical implications, and development suggestions.'
          }
        },
        ...topTraits.map(([trait, score]) => {
          const description = enhancedTraitDescriptions[trait as keyof typeof enhancedTraitDescriptions];
          return {
            type: 'card' as const,
            data: {
              title: `${trait} (Score: ${score.toFixed(1)}/10)`,
              description: description?.description || 'Trait description not available.',
              behavioralIndicators: description?.behavioralIndicators || [],
              practicalImplications: description?.practicalImplications || [],
              developmentTips: description?.developmentTips || []
            }
          };
        })
      ]
    };
  }

  private generateAIInsights(): PDFSection {
    if (!this.aiInsights) {
      return {
        title: 'AI-Generated Insights',
        content: [
          {
            type: 'text',
            data: {
              title: 'Insights Not Available',
              content: 'AI-generated insights were not available for this assessment. Please ensure you have an active internet connection and try generating the report again.'
            }
          }
        ]
      };
    }

    return {
      title: 'AI-Generated Comprehensive Insights',
      pageBreak: true,
      content: [
        {
          type: 'text',
          data: {
            title: 'Personalized AI Analysis',
            content: 'These insights were generated using advanced AI analysis of your personality profile, providing personalized observations and recommendations based on your unique trait combination.'
          }
        },
        {
          type: 'card' as const,
          data: {
            title: 'General Personality Insights',
            content: this.aiInsights.general || 'General insights not available.'
          }
        },
        {
          type: 'card' as const,
          data: {
            title: 'Career Guidance',
            content: this.aiInsights.career || 'Career recommendations not available.'
          }
        },
        {
          type: 'card' as const,
          data: {
            title: 'Personal Development Roadmap',
            content: this.aiInsights.development || 'Development suggestions not available.'
          }
        },
        {
          type: 'card' as const,
          data: {
            title: 'Relationship Insights',
            content: this.aiInsights.relationship || 'Relationship insights not available.'
          }
        }
      ]
    };
  }

  private generateCareerRecommendations(): PDFSection {
    const careerRecs = PersonalityInsightGenerator.generateCareerRecommendations(this.profile);
    
    return {
      title: 'Detailed Career Recommendations',
      pageBreak: true,
      content: [
        {
          type: 'text',
          data: {
            title: 'Career Path Analysis',
            content: 'Based on your personality profile, these career recommendations align with your natural strengths, preferences, and working style. Each recommendation includes specific roles, reasoning, and ideal work environments.'
          }
        },
        ...careerRecs.map((career, index) => ({
          type: 'card' as const,
          data: {
            title: `${index + 1}. ${career.field}`,
            roles: career.roles,
            reason: career.reason,
            workEnvironment: career.workEnvironment,
            priority: index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Alternative'
          }
        })),
        {
          type: 'text' as const,
          data: {
            title: 'Career Development Strategy',
            content: 'Focus on your primary recommendation while keeping secondary options as backup plans. Consider your personal values, life circumstances, and long-term goals when making career decisions.'
          }
        }
      ]
    };
  }

  private generateDevelopmentPlan(): PDFSection {
    const developmentAreas = PersonalityInsightGenerator.generateDevelopmentAreas(this.profile);
    
    return {
      title: 'Personal Development Plan',
      pageBreak: true,
      content: [
        {
          type: 'text',
          data: {
            title: 'Your Growth Journey',
            content: 'This development plan identifies specific areas for growth based on your personality profile. Each area includes practical activities and realistic timeframes for improvement.'
          }
        },
        ...developmentAreas.map((area, index) => ({
          type: 'card' as const,
          data: {
            title: `${index + 1}. ${area.area}`,
            description: area.description,
            activities: area.activities,
            timeframe: area.timeframe,
            priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'
          }
        })),
        {
          type: 'text' as const,
          data: {
            title: 'Implementation Strategy',
            content: 'Start with high-priority areas and gradually work through the development plan. Track your progress and adjust activities based on your experience and changing circumstances.'
          }
        }
      ]
    };
  }

  private generatePersonalityMatches(): PDFSection {
    return {
      title: 'Personality Archetype Matches',
      content: [
        {
          type: 'text',
          data: {
            title: 'Your Personality Matches',
            content: 'These are real and fictional characters that share similar personality traits with you. Understanding these matches can provide insights into your potential and different expressions of your personality type.'
          }
        },
        {
          type: 'grid',
          data: {
            title: 'Top Personality Matches',
            items: this.profile.mappings.personalityMatches?.slice(0, 6).map(match => ({
              name: match.name,
              type: match.type === 'real' ? 'Historical' : 'Fictional',
              similarity: `${(match.similarity * 100).toFixed(0)}%`,
              confidence: match.confidence ? `${match.confidence}%` : 'N/A',
              description: match.description
            })) || []
          }
        }
      ]
    };
  }

  private generateActionPlan(): PDFSection {
    return {
      title: 'Your Personal Action Plan',
      content: [
        {
          type: 'text',
          data: {
            title: 'Next Steps',
            content: 'This action plan provides concrete steps you can take to leverage your personality insights for personal and professional growth.'
          }
        },
        {
          type: 'list',
          data: {
            title: 'Immediate Actions (Next 30 Days)',
            items: [
              'Review and reflect on your personality insights',
              'Share relevant findings with trusted friends or mentors',
              'Identify one development area to focus on first',
              'Research career opportunities that align with your strengths'
            ]
          }
        },
        {
          type: 'list',
          data: {
            title: 'Short-term Goals (3-6 Months)',
            items: [
              'Implement development activities for your priority areas',
              'Seek feedback from others on your growth progress',
              'Explore career paths that match your recommendations',
              'Consider working with a coach or mentor'
            ]
          }
        },
        {
          type: 'list',
          data: {
            title: 'Long-term Vision (6-12 Months)',
            items: [
              'Reassess your personality and track changes',
              'Make career moves aligned with your insights',
              'Develop expertise in your strength areas',
              'Help others understand and appreciate personality differences'
            ]
          }
        }
      ]
    };
  }

  private generateDomainDetails(): Record<string, any> {
    return {
      'External': {
        description: 'How you organize and manage your external environment, including systems, planning, and control.',
        contributingTraits: Object.entries(this.profile.traitScores)
          .filter(([trait]) => trait.includes('Structured') || trait.includes('Assertive') || trait.includes('Control'))
          .map(([trait]) => trait),
        implications: [
          'Your ability to create and maintain organized systems',
          'How you approach planning and goal achievement',
          'Your comfort with leadership and decision-making roles'
        ]
      },
      'Internal': {
        description: 'Your inner emotional life, self-awareness, and personal growth orientation.',
        contributingTraits: Object.entries(this.profile.traitScores)
          .filter(([trait]) => trait.includes('Self') || trait.includes('Emotion') || trait.includes('Aware'))
          .map(([trait]) => trait),
        implications: [
          'Your level of emotional intelligence and regulation',
          'How well you understand your own motivations',
          'Your capacity for personal growth and self-improvement'
        ]
      },
      'Interpersonal': {
        description: 'How you navigate relationships and social interactions with others.',
        contributingTraits: Object.entries(this.profile.traitScores)
          .filter(([trait]) => trait.includes('Social') || trait.includes('Empathy') || trait.includes('Communication'))
          .map(([trait]) => trait),
        implications: [
          'Your effectiveness in building and maintaining relationships',
          'How you communicate and collaborate with others',
          'Your ability to understand and influence social dynamics'
        ]
      },
      'Processing': {
        description: 'Your cognitive style, learning preferences, and information processing approach.',
        contributingTraits: Object.entries(this.profile.traitScores)
          .filter(([trait]) => trait.includes('Analytical') || trait.includes('Creative') || trait.includes('Learning'))
          .map(([trait]) => trait),
        implications: [
          'How you approach complex problems and decisions',
          'Your preferred learning and thinking styles',
          'Your capacity for innovation and creative solutions'
        ]
      }
    };
  }
}