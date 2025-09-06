import { PersonalityProfile, TPSScores } from '@/types/tps.types';
import { FrameworkInsights, MBTIInsight, EnneagramInsight, BigFiveInsight, AlignmentInsight, CoreInsight, AIInsights } from '@/types/llm.types';
import { LLMService } from './llmService';
import { parseLLMJson } from '@/utils/jsonUtils';
import { stableHash } from '@/utils/hash';

export class FrameworkInsightsService {
  private llmService = new LLMService();
  private static readonly INSIGHTS_VERSION = 1;
  private static readonly FRAMEWORK_VERSION = 1;

  // Consolidated AI Insights Methods (from AIInsightsService) with caching
  async generateComprehensiveInsights(profile: PersonalityProfile, userId?: string): Promise<AIInsights> {
    try {
      console.log('Starting comprehensive AI insights generation for profile:', profile);

      // Compute cache key (per-user cache due to RLS policies)
      const cacheKey = this.makeCacheKey(profile, 'comprehensive');

      // Try to fetch cached insight for this user
      if (userId) {
        const cached = await this.getCachedInsight(userId, 'comprehensive', cacheKey);
        if (cached) {
          console.log('Returning cached comprehensive AI insights');
          return cached;
        }
      }
      
      // Generate insights in parallel for better performance
      const [general, career, development, relationship] = await Promise.all([
        this.llmService.generateInsight(profile, 'insightGeneration'),
        this.llmService.generateInsight(profile, 'careerGuidance'),
        this.llmService.generateInsight(profile, 'developmentPlanning'),
        this.generateRelationshipInsight(profile)
      ]);

      const insights: AIInsights = { general, career, development, relationship };

      console.log('Successfully generated comprehensive AI insights');

      // Save insights to database if user is provided
      if (userId) {
        await this.saveInsights(insights, userId, profile, cacheKey, FrameworkInsightsService.INSIGHTS_VERSION);
      }

      return insights;
    } catch (error) {
      console.error('Error generating comprehensive AI insights:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate AI insights: ${error.message}`);
      }
      throw new Error('Failed to generate AI insights: Unknown error occurred');
    }
  }

  private async generateRelationshipInsight(profile: PersonalityProfile): Promise<string> {
    const prompt = this.buildRelationshipPrompt(profile);
    return this.llmService.callLLM(prompt, 'insightGeneration');
  }

  private buildRelationshipPrompt(profile: PersonalityProfile): string {
    const { dominantTraits, traitScores, domainScores } = profile;
    
    return `
Personality Profile Analysis for Relationship Insights:

Dominant Traits by Triad:
${Object.entries(dominantTraits).map(([triad, trait]) => `- ${triad}: ${trait}`).join('\n')}

Domain Scores:
- External: ${domainScores.External}/10
- Internal: ${domainScores.Internal}/10  
- Interpersonal: ${domainScores.Interpersonal}/10
- Processing: ${domainScores.Processing}/10

Key Interpersonal Traits:
- Communication Style: ${traitScores['Direct'] > 6 ? 'Direct' : traitScores['Mixed Communication'] > 6 ? 'Adaptive' : 'Passive'}
- Social Navigation: ${traitScores['Communal Navigate'] > 6 ? 'Group-oriented' : traitScores['Independent Navigate'] > 6 ? 'Self-reliant' : 'Flexible'}
- Emotional Regulation: ${traitScores['Stoic'] > 6 ? 'Stable' : traitScores['Turbulent'] > 6 ? 'Expressive' : 'Responsive'}

Provide relationship insights covering:
1. Communication preferences and style
2. Conflict resolution approach
3. Emotional support needs and offerings
4. Compatibility patterns with different personality types
5. Growth areas for relationship skills
6. Strengths in relationships and partnerships

Keep it practical, empathetic, and actionable for building better relationships.
`;
  }

  private async saveInsights(
    insights: AIInsights,
    userId: string,
    profile: PersonalityProfile,
    cacheKey?: string,
    version: number = FrameworkInsightsService.INSIGHTS_VERSION
  ): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Find associated assessment
      const { data: assessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          assessment_id: assessment?.id,
          insight_type: 'comprehensive',
          content: insights as any,
          model_used: 'gpt-5-2025-08-07',
          cache_key: cacheKey,
          version
        });
    } catch (error) {
      console.error('Error saving insights:', error);
      // Don't throw here - insights generation succeeded even if saving failed
    }
  }

  async getExistingInsights(userId: string, assessmentId?: string): Promise<AIInsights | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('ai_insights')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error || !data) {
        return null;
      }

      return data.content as unknown as AIInsights;
    } catch (error) {
      console.error('Error retrieving insights:', error);
      return null;
    }
  }

  private makeCacheKey(profile: PersonalityProfile, type: string): string {
    // Use a subset of profile that affects insight generation to keep key stable
    const basis = {
      type,
      version: FrameworkInsightsService.INSIGHTS_VERSION,
      mappings: profile.mappings,
      domainScores: profile.domainScores,
      traitScores: profile.traitScores,
      dominantTraits: profile.dominantTraits,
    };
    return stableHash(basis);
  }

  private async getCachedInsight(userId: string, insightType: string, cacheKey: string): Promise<AIInsights | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('ai_insights')
        .select('content, version')
        .eq('user_id', userId)
        .eq('insight_type', insightType)
        .eq('cache_key', cacheKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      if (data.version !== FrameworkInsightsService.INSIGHTS_VERSION) return null; // ignore older cache
      return data.content as unknown as AIInsights;
    } catch (e) {
      console.warn('Cache lookup failed, proceeding without cache:', e);
      return null;
    }
  }

  async generateFrameworkInsights(
    profile: PersonalityProfile,
    traitScores: TPSScores,
    userId?: string
  ): Promise<FrameworkInsights> {
    try {
      console.log('Generating framework insights for profile:', profile.mappings);

      // Build cache key
      const cacheKey = this.makeCacheKey(profile, 'framework');

      // 1) Try DB cache when user is logged in
      if (userId) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data, error } = await supabase
            .from('ai_insights')
            .select('content, version')
            .eq('user_id', userId)
            .eq('insight_type', 'framework_correlations')
            .eq('cache_key', cacheKey)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data && data.version === FrameworkInsightsService.FRAMEWORK_VERSION) {
            return data.content as unknown as FrameworkInsights;
          }
        } catch (e) {
          console.warn('Framework DB cache lookup failed, continuing...', e);
        }
      } else {
        // 2) Try localStorage cache for anonymous users
        try {
          const lsKey = `psyforge:fw:${cacheKey}`;
          const raw = localStorage.getItem(lsKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.version === FrameworkInsightsService.FRAMEWORK_VERSION) {
              return parsed.content as FrameworkInsights;
            }
          }
        } catch (_) {
          // ignore localStorage errors
        }
      }

      // 3) Generate fresh insights in parallel
      const [mbti, enneagram, bigFive, alignment, synthesis] = await Promise.all([
        this.generateMBTIInsight(profile.mappings.mbti, traitScores),
        this.generateEnneagramInsight(profile.mappings.enneagramDetails, traitScores),
        this.generateBigFiveInsight(profile.mappings.bigFive, traitScores),
        this.generateAlignmentInsight(profile.mappings.dndAlignment, traitScores),
        this.generateSynthesisInsight(profile)
      ]);

      const insights: FrameworkInsights = {
        mbti,
        enneagram,
        bigFive,
        alignment,
        hollandCode: {
          summary: `Your Holland Code of ${profile.mappings.hollandCode} reflects your interests and work environment preferences.`,
          primaryTypes: profile.mappings.hollandCode.split(''),
          reasoning: 'Based on your External and Processing domain traits that influence work preferences.',
          confidence: 0.7
        },
        socionics: {
          summary: `Your Socionics type correlates with your MBTI profile of ${profile.mappings.mbti}.`,
          reasoning: 'Socionics shares cognitive function theory with MBTI, adapted for information processing preferences.',
          confidence: 0.6
        },
        synthesis,
        overallConfidence: (mbti.confidence + enneagram.confidence + bigFive.confidence + alignment.confidence) / 4
      };

      console.log('Successfully generated framework insights');

      // 4) Persist cache
      if (userId) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('ai_insights').insert({
            user_id: userId,
            insight_type: 'framework_correlations',
            content: insights as any,
            model_used: 'frameworkAnalysis',
            cache_key: cacheKey,
            version: FrameworkInsightsService.FRAMEWORK_VERSION
          });
        } catch (e) {
          console.warn('Failed to save framework insights cache to DB', e);
        }
      } else {
        try {
          const lsKey = `psyforge:fw:${cacheKey}`;
          localStorage.setItem(lsKey, JSON.stringify({
            version: FrameworkInsightsService.FRAMEWORK_VERSION,
            content: insights,
            ts: Date.now()
          }));
        } catch (_) {
          // ignore localStorage errors
        }
      }

      return insights;
    } catch (error) {
      console.error('Error generating framework insights:', error);
      throw new Error(`Failed to generate framework insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateMBTIInsight(mbti: string, scores: TPSScores): Promise<MBTIInsight> {
    const prompt = `
Analyze this MBTI result and explain it in context of the user's TPS traits:

MBTI Type: ${mbti}

Key Contributing Traits:
- E/I: Communal Navigate (${scores['Communal Navigate'] || 0}), Dynamic (${scores['Dynamic'] || 0}), Independent Navigate (${scores['Independent Navigate'] || 0})
- S/N: Intuitive (${scores['Intuitive'] || 0}), Universal (${scores['Universal'] || 0}), Physical (${scores['Physical'] || 0})
- T/F: Analytical (${scores['Analytical'] || 0}), Stoic (${scores['Stoic'] || 0}), Diplomatic (${scores['Diplomatic'] || 0})
- J/P: Structured (${scores['Structured'] || 0}), Lawful (${scores['Lawful'] || 0}), Ambivalent (${scores['Ambivalent'] || 0})

Provide a detailed analysis explaining:
1. Why they got this type (which traits drove each letter)
2. Confidence level for each dimension (0.0-1.0)
3. What this means for their personality
4. Unique aspects of their expression of this type
5. How their other traits modify typical ${mbti} behavior

Format as JSON: {
  "summary": "2-3 sentence overview",
  "breakdown": {
    "E_or_I": { "letter": "E or I", "reason": "explanation", "score": 0.0-1.0 },
    "S_or_N": { "letter": "S or N", "reason": "explanation", "score": 0.0-1.0 },
    "T_or_F": { "letter": "T or F", "reason": "explanation", "score": 0.0-1.0 },
    "J_or_P": { "letter": "J or P", "reason": "explanation", "score": 0.0-1.0 }
  },
  "uniqueExpression": "How they differ from typical ${mbti}",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "growthAreas": ["area1", "area2"],
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<MBTIInsight>(response);
  }

  private async generateEnneagramInsight(
    enneagramDetails: { type: number; wing: number; tritype: string },
    scores: TPSScores
  ): Promise<EnneagramInsight> {
    const prompt = `
Analyze this Enneagram result in context of TPS traits:

Enneagram: Type ${enneagramDetails.type}w${enneagramDetails.wing}
Tritype: ${enneagramDetails.tritype}

Key Contributing Traits:
- Self-Focused vs Self-Mastery: ${scores['Self-Focused'] || 0} vs ${scores['Self-Mastery'] || 0}
- Turbulent vs Stoic: ${scores['Turbulent'] || 0} vs ${scores['Stoic'] || 0}
- Intrinsic vs Extrinsic: ${scores['Intrinsic'] || 0} vs ${scores['Extrinsic'] || 0}
- Control vs Flexible: ${scores['Control'] || 0} vs ${scores['Flexible'] || 0}

Provide detailed analysis of:
1. Why they are Type ${enneagramDetails.type} (which traits indicate this)
2. How wing ${enneagramDetails.wing} modifies their type
3. Core motivations and fears based on their traits
4. How their TPS profile creates a unique version of ${enneagramDetails.type}w${enneagramDetails.wing}

Format as JSON: {
  "summary": "2-3 sentence overview",
  "coreType": {
    "description": "What Type ${enneagramDetails.type} means for them",
    "motivation": "Their core motivation",
    "fear": "Their core fear",
    "contributingTraits": ["trait1", "trait2"]
  },
  "wing": {
    "influence": "How wing ${enneagramDetails.wing} shows up",
    "balance": "How balanced the wing influence is"
  },
  "levels": {
    "healthy": "Healthy expression based on traits",
    "average": "Average expression",
    "unhealthy": "Potential unhealthy patterns"
  },
  "growthPath": "Personalized growth direction",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<EnneagramInsight>(response);
  }

  private async generateBigFiveInsight(
    bigFive: Record<string, number>,
    scores: TPSScores
  ): Promise<BigFiveInsight> {
    const prompt = `
Analyze these Big Five results in context of TPS traits:

Big Five Scores:
- Openness: ${bigFive.Openness || 0}/10
- Conscientiousness: ${bigFive.Conscientiousness || 0}/10  
- Extraversion: ${bigFive.Extraversion || 0}/10
- Agreeableness: ${bigFive.Agreeableness || 0}/10
- Neuroticism: ${bigFive.Neuroticism || 0}/10

TPS Contributing Traits:
- Openness: Intuitive (${scores['Intuitive'] || 0}), Universal (${scores['Universal'] || 0})
- Conscientiousness: Structured (${scores['Structured'] || 0}), Self-Mastery (${scores['Self-Mastery'] || 0})
- Extraversion: Communal Navigate (${scores['Communal Navigate'] || 0}), Dynamic (${scores['Dynamic'] || 0})
- Agreeableness: Diplomatic (${scores['Diplomatic'] || 0}), Responsive (${scores['Responsive'] || 0})
- Neuroticism: Turbulent (${scores['Turbulent'] || 0}), Pessimistic (${scores['Pessimistic'] || 0})

Provide analysis showing:
1. Which specific TPS traits contributed to each Big Five dimension
2. What their scores mean in practical terms
3. How trait interactions create unique patterns

Format as JSON: {
  "summary": "Overview of their Big Five profile",
  "dimensions": {
    "Openness": {
      "score": ${bigFive.Openness || 0},
      "description": "What this means for them",
      "contributingTraits": ["trait1", "trait2"],
      "implications": ["implication1", "implication2"]
    },
    // ... same for other dimensions
  },
  "interactions": "How dimensions interact uniquely",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<BigFiveInsight>(response);
  }

  private async generateAlignmentInsight(
    alignment: string,
    scores: TPSScores
  ): Promise<AlignmentInsight> {
    const prompt = `
Analyze this D&D Alignment result in context of TPS traits:

Alignment: ${alignment}

Key Contributing Traits:
- Ethical Axis (Law/Chaos): Lawful (${scores['Lawful'] || 0}), Self-Principled (${scores['Self-Principled'] || 0}), Ambivalent (${scores['Ambivalent'] || 0})
- Moral Axis (Good/Evil): Diplomatic (${scores['Diplomatic'] || 0}), Responsive (${scores['Responsive'] || 0}), Direct (${scores['Direct'] || 0})
- Control: Structured (${scores['Structured'] || 0}), Control (${scores['Control'] || 0}), Flexible (${scores['Flexible'] || 0})

Explain:
1. Why they got this alignment
2. How their ethical and moral reasoning works
3. How this shows up in decision-making

Format as JSON: {
  "summary": "2-3 sentence overview of their ${alignment} alignment",
  "ethicalAxis": {
    "position": "Lawful/Neutral/Chaotic",
    "reasoning": "Why they fall on this part of the spectrum",
    "manifestations": ["how this shows up 1", "how this shows up 2"]
  },
  "moralAxis": {
    "position": "Good/Neutral/Evil",
    "reasoning": "Why they fall on this part of the spectrum", 
    "manifestations": ["how this shows up 1", "how this shows up 2"]
  },
  "decisionMaking": "How their alignment influences choices",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<AlignmentInsight>(response);
  }

  private async generateSynthesisInsight(profile: PersonalityProfile): Promise<string> {
    const prompt = `
Create a holistic synthesis showing how all personality frameworks connect for this person:

Frameworks:
- MBTI: ${profile.mappings.mbti}
- Enneagram: Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}
- Big Five: ${JSON.stringify(profile.mappings.bigFive)}
- D&D Alignment: ${profile.mappings.dndAlignment}
- Holland Code: ${profile.mappings.hollandCode}

Dominant TPS Traits: ${JSON.stringify(profile.dominantTraits)}

Domain Scores:
- External: ${profile.domainScores.External}/10
- Internal: ${profile.domainScores.Internal}/10  
- Interpersonal: ${profile.domainScores.Interpersonal}/10
- Processing: ${profile.domainScores.Processing}/10

Provide a 3-4 paragraph synthesis that:
1. Shows how these different typings reinforce each other
2. Identifies consistent themes across frameworks
3. Explains apparent contradictions
4. Creates a unified picture of their personality

Write in second person, be specific and insightful. Focus on the interconnections and what makes their particular combination unique.`;
    
    return await this.llmService.callLLM(prompt, 'frameworkAnalysis');
  }

  // Personal Development Methods
  async generatePersonalizedGrowthAreas(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Based on this TPS personality profile, identify personalized growth areas:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Analyze their trait configuration and identify 3-4 specific areas where development would be most beneficial. For each area, provide:

1. The specific challenge or opportunity
2. Why this matters given their traits
3. How their existing strengths can support growth
4. Specific developmental focus

Format as JSON: {
  "growthAreas": [
    {
      "area": "Area name",
      "challenge": "Specific challenge they face",
      "reasoning": "Why this is important for their traits",
      "leverageStrengths": "How their strengths support this",
      "focusPoints": ["point1", "point2", "point3"]
    }
  ]
}`;

    const response = await this.llmService.callLLM(prompt, 'developmentPlanning');
    return parseLLMJson(response);
  }

  async generateDevelopmentActivities(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Create personalized development activities based on this TPS profile:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Design 4-5 development areas with specific activities. Each should include:
- Area name and description  
- 4-5 specific activities tailored to their traits
- Timeframe for development
- Success indicators

Consider their learning style based on traits:
- High Structured: Goal-oriented, systematic approaches
- High Intuitive: Exploratory, pattern-based learning
- High Communal: Group activities, social learning
- High Independent: Self-directed activities
- High Analytical: Data-driven, logical frameworks

Format as JSON: {
  "developmentAreas": [
    {
      "area": "Area name",
      "description": "What this involves",
      "activities": ["activity1", "activity2", "activity3", "activity4"],
      "timeframe": "Short-term/Medium-term/Long-term",
      "successIndicators": ["indicator1", "indicator2"]
    }
  ]
}`;

    const response = await this.llmService.callLLM(prompt, 'developmentPlanning');
    return parseLLMJson(response);
  }

  async generateProgressTracking(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Design progress tracking methods tailored to this TPS profile:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Create tracking methods that align with their personality traits. Consider:
- High Analytical: Data-driven metrics, quantifiable measures
- High Intuitive: Reflection-based, qualitative insights
- High Structured: Regular check-ins, systematic progress
- High Flexible: Adaptive milestones, emergent tracking
- High Self-Mastery: Challenge-based goals, achievement focus
- High Responsive: Feedback-based, relational measures

Format as JSON: {
  "trackingMethods": [
    {
      "method": "Method name",
      "description": "How this works",
      "frequency": "How often to use",
      "metrics": ["metric1", "metric2"],
      "suitedFor": "Which traits this serves"
    }
  ],
  "milestones": [
    {
      "timeframe": "30 days/90 days/6 months",
      "goals": ["goal1", "goal2"],
      "assessmentMethod": "How to evaluate progress"
    }
  ]
}`;

    const response = await this.llmService.callLLM(prompt, 'developmentPlanning');
    return parseLLMJson(response);
  }

  // Career & Lifestyle Analysis Methods
  async generateCareerPathways(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Based on this TPS personality profile, generate personalized career pathway recommendations:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Analyze their trait configuration and provide comprehensive career guidance including:

1. 4-5 ideal career fields with specific roles
2. Work environment preferences based on their traits
3. Industry-specific recommendations
4. Leadership style and team preferences
5. Factors that will drive job satisfaction

Consider how different traits influence career fit:
- External Domain traits → Work environment and organizational preferences
- Internal Domain traits → Motivation and satisfaction factors  
- Interpersonal Domain traits → Team dynamics and communication needs
- Processing Domain traits → Problem-solving and cognitive requirements

Format as JSON: {
  "careerFields": [
    {
      "field": "Field name",
      "roles": ["role1", "role2", "role3"],
      "reasoning": "Why this field matches their traits",
      "workEnvironment": "Ideal environment description",
      "growthPath": "Career progression opportunities",
      "satisfactionFactors": ["factor1", "factor2"]
    }
  ],
  "overallGuidance": {
    "idealWorkEnvironment": "General work environment preferences",
    "leadershipStyle": "Their natural leadership approach",
    "teamDynamics": "How they work best with others",
    "decisionMaking": "Their approach to workplace decisions"
  }
}`;

    const response = await this.llmService.callLLM(prompt, 'careerGuidance');
    return parseLLMJson(response);
  }

  async generateWorkEnvironmentPreferences(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Analyze work environment preferences based on this TPS profile:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Determine specific work environment factors that will support their success:

1. Physical workspace preferences
2. Team structure and collaboration style
3. Communication patterns and needs
4. Management and autonomy preferences
5. Stress management and support needs
6. Productivity optimization factors

Format as JSON: {
  "physicalWorkspace": {
    "preferences": ["preference1", "preference2"],
    "needsToAvoid": ["avoid1", "avoid2"],
    "optimalConditions": "Description of ideal setup"
  },
  "teamCollaboration": {
    "workingStyle": "How they collaborate best",
    "idealTeamSize": "Preferred team size",
    "communicationNeeds": "Communication preferences",
    "conflictResolution": "How they handle workplace conflicts"
  },
  "managementStyle": {
    "autonomyNeeds": "Level of independence required",
    "feedbackPreferences": "How they prefer to receive feedback",
    "goalSetting": "How they work best with goals and deadlines",
    "supportNeeds": "What kind of management support helps them"
  },
  "stressFactors": {
    "triggers": ["stressor1", "stressor2"],
    "mitigationStrategies": ["strategy1", "strategy2"],
    "warningSignsToWatch": ["sign1", "sign2"]
  }
}`;

    const response = await this.llmService.callLLM(prompt, 'careerGuidance');
    return parseLLMJson(response);
  }

  async generateLifestyleRecommendations(profile: PersonalityProfile): Promise<any> {
    const prompt = `
Generate comprehensive lifestyle recommendations based on this TPS profile:

PERSONALITY PROFILE:
${this.buildProfileSummary(profile)}

Provide personalized guidance for:

1. Social life and relationship patterns
2. Living environment and organization
3. Recreation and hobby preferences  
4. Work-life balance strategies
5. Personal development and growth activities
6. Health and wellness approaches
7. Financial and life planning style

Consider how their traits influence lifestyle choices and what will support their wellbeing.

Format as JSON: {
  "socialLife": {
    "socialNeeds": "Their social interaction preferences",
    "relationshipStyle": "How they approach relationships",
    "networkingApproach": "Best networking strategies for them",
    "communityInvolvement": "Types of community activities that fit"
  },
  "livingEnvironment": {
    "homeEnvironment": "Ideal home setup and organization",
    "locationPreferences": "Urban/suburban/rural preferences and why",
    "organizationStyle": "How they manage their physical space",
    "personalSpace": "Privacy and personal space needs"
  },
  "recreation": {
    "hobbies": ["hobby1", "hobby2", "hobby3"],
    "recreationStyle": "Active vs passive recreation preferences",
    "learningActivities": "Types of personal learning they enjoy",
    "creativePursuits": "Creative outlets that match their traits"
  },
  "workLifeBalance": {
    "balanceStrategy": "Their approach to balancing work and life",
    "boundaryManagement": "How to set and maintain boundaries",
    "energyManagement": "How to maintain energy and avoid burnout",
    "recoveryNeeds": "What they need to recharge"
  },
  "healthWellness": {
    "exercisePreferences": "Types of physical activity that appeal",
    "stressManagement": "Stress relief strategies that work for them",
    "sleepOptimization": "Sleep habits that support their personality",
    "nutritionApproach": "Eating patterns that fit their lifestyle"
  }
}`;

    const response = await this.llmService.callLLM(prompt, 'developmentPlanning');
    return parseLLMJson(response);
  }

  private buildProfileSummary(profile: PersonalityProfile): string {
    return `
TRAIT SCORES:
${Object.entries(profile.traitScores)
  .map(([trait, score]) => `- ${trait}: ${score.toFixed(1)}`)
  .join('\n')}

DOMAIN SCORES:
${Object.entries(profile.domainScores)
  .map(([domain, score]) => `- ${domain}: ${(score * 10).toFixed(1)}/10`)
  .join('\n')}

DOMINANT TRAITS:
${Object.entries(profile.dominantTraits || {})
  .map(([triad, trait]) => `- ${triad}: ${trait}`)
  .join('\n')}

FRAMEWORK MAPPINGS:
- MBTI: ${profile.mappings.mbti}
- Enneagram: ${profile.mappings.enneagram}
- Big Five: ${JSON.stringify(profile.mappings.bigFive)}
`.trim();
  }

  async generateCoreInsights(profile: PersonalityProfile): Promise<CoreInsight> {
    const { DEFAULT_SYSTEM_PROMPTS } = await import('@/config/systemPrompts');
    
    const profileData = `
PERSONALITY PROFILE TO ANALYZE:

TRAIT SCORES:
${Object.entries(profile.traitScores)
  .map(([trait, score]) => `- ${trait}: ${score.toFixed(1)}`)
  .join('\n')}

DOMAIN SCORES:
${Object.entries(profile.domainScores)
  .map(([domain, score]) => `- ${domain}: ${(score * 10).toFixed(1)}/10`)
  .join('\n')}

DOMINANT TRAITS:
${Object.entries(profile.dominantTraits || {})
  .map(([triad, trait]) => `- ${triad}: ${trait}`)
  .join('\n')}

FRAMEWORK MAPPINGS:
- MBTI: ${profile.mappings.mbti}
- Enneagram: ${profile.mappings.enneagram}
- Big Five: ${JSON.stringify(profile.mappings.bigFive)}
- Alignment: ${profile.mappings.dndAlignment}
- Holland Code: ${profile.mappings.hollandCode}
    `.trim();

    // Create a complete prompt that includes both the system instructions and the specific profile data
    const fullPrompt = `${DEFAULT_SYSTEM_PROMPTS.coreInsights}

${profileData}

Please analyze this specific personality profile and return the JSON object with personalized core insights as specified above. Focus on their actual trait scores and combinations to provide truly personalized explanations.`;

    console.log('Generating core insights for profile data:', profileData);

    try {
      const response = await this.llmService.callLLM(fullPrompt, 'coreInsights');
      console.log('Raw LLM response for core insights:', response);
      
      // Clean and parse the JSON response
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const insights = parseLLMJson<CoreInsight>(cleanResponse);
      console.log('Parsed core insights:', insights);
      
      return insights;
    } catch (error) {
      console.error('Error generating core insights:', error);
      throw new Error('Failed to generate core insights');
    }
  }
}