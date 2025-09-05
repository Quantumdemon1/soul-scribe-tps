import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { FrameworkInsights, MBTIInsight, EnneagramInsight, BigFiveInsight, AlignmentInsight } from '@/types/llm.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Brain, Users, Star, Shield, Briefcase, Target } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FrameworkCorrelationsProps {
  profile: PersonalityProfile;
}

export const FrameworkCorrelations: React.FC<FrameworkCorrelationsProps> = ({ profile }) => {
  const [insights, setInsights] = useState<FrameworkInsights | null>(null);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [profile]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if insights already exist in profile
      if (profile.frameworkInsights) {
        setInsights(profile.frameworkInsights);
        setLoading(false);
        return;
      }

      const service = new FrameworkInsightsService();
      const data = await service.generateFrameworkInsights(profile, profile.traitScores);
      setInsights(data);
    } catch (err) {
      console.error('Error loading framework insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const toggleFramework = (framework: string) => {
    setExpandedFramework(expandedFramework === framework ? null : framework);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">🎯</span>
            Personality Framework Correlations
          </h2>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">🎯</span>
            Personality Framework Correlations
          </h2>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadInsights} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have the required data
  if (!profile.mappings) {
    return (
      <div className="space-y-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="text-primary">🎯</span>
            Personality Framework Correlations
          </h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Framework correlations are not available for this assessment. Please take a new assessment to see your personality framework correlations.
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Take New Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="text-primary">🎯</span>
          Personality Framework Correlations
        </h2>
        <p className="text-muted-foreground mb-6">
          Understanding how your unique personality maps across different psychological frameworks
        </p>

        {/* Quick Overview Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">MBTI Type</div>
            <div className="text-xs text-muted-foreground mb-2">Your personality preferences in how you interact, process information, make decisions, and approach life</div>
            <div className="text-2xl font-bold text-primary">{profile.mappings?.mbti || 'N/A'}</div>
            {insights?.mbti && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                Confidence: 
                <span className={getConfidenceColor(insights.mbti.confidence)}>
                  {getConfidenceLabel(insights.mbti.confidence)}
                </span>
              </div>
            )}
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Enneagram</div>
            <div className="text-xs text-muted-foreground mb-2">Your core motivation, fears, and behavioral patterns based on nine fundamental personality types</div>
            <div className="text-2xl font-bold text-primary">
              {profile.mappings?.enneagramDetails ? 
                `Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}` : 
                profile.mappings?.enneagram || 'N/A'
              }
            </div>
            {profile.mappings?.enneagramDetails?.tritype && (
              <div className="text-xs text-muted-foreground">Tritype: {profile.mappings.enneagramDetails.tritype}</div>
            )}
          </div>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">D&D Alignment</div>
            <div className="text-xs text-muted-foreground mb-2">Your ethical and moral compass, measuring your approach to rules and concern for others</div>
            <div className="text-2xl font-bold text-primary">{profile.mappings?.dndAlignment || 'N/A'}</div>
            {insights?.alignment && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                Confidence: 
                <span className={getConfidenceColor(insights.alignment.confidence)}>
                  {getConfidenceLabel(insights.alignment.confidence)}
                </span>
              </div>
            )}
          </div>
        </div>

        {insights && profile.mappings && (
          <div className="space-y-4">
            {/* MBTI Detailed */}
            {profile.mappings.mbti && (
              <FrameworkCard
                title="MBTI"
                subtitle={profile.mappings.mbti}
                description="Your personality preferences in how you interact, process information, make decisions, and approach life"
                icon={Brain}
                expanded={expandedFramework === 'mbti'}
                onToggle={() => toggleFramework('mbti')}
                confidence={insights.mbti?.confidence}
              >
                <MBTIDetails mbti={profile.mappings.mbti} insight={insights.mbti} />
              </FrameworkCard>
            )}

            {/* Enneagram Detailed */}
            {profile.mappings.enneagramDetails && (
              <FrameworkCard
                title="Enneagram"
                subtitle={`Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}`}
                description="Your core motivation, fears, and behavioral patterns based on nine fundamental personality types"
                icon={Users}
                expanded={expandedFramework === 'enneagram'}
                onToggle={() => toggleFramework('enneagram')}
                confidence={insights.enneagram?.confidence}
              >
                <EnneagramDetails enneagram={profile.mappings.enneagramDetails} insight={insights.enneagram} />
              </FrameworkCard>
            )}

            {/* Big Five Detailed */}
            {profile.mappings.bigFive && insights.bigFive && (
              <FrameworkCard
                title="Big Five Traits"
                subtitle="Five-Factor Model of Personality"
                description="Your personality across five major dimensions that influence behavior and thinking patterns"
                icon={Star}
                expanded={expandedFramework === 'bigfive'}
                onToggle={() => toggleFramework('bigfive')}
                confidence={insights.bigFive.confidence}
              >
                <BigFiveDetails bigFive={profile.mappings.bigFive} insight={insights.bigFive} />
              </FrameworkCard>
            )}

            {/* Alignment Detailed */}
            {profile.mappings.dndAlignment && insights.alignment && (
              <FrameworkCard
                title="Moral Alignment"
                subtitle={profile.mappings.dndAlignment}
                description="Your ethical and moral compass, measuring your approach to rules and concern for others"
                icon={Shield}
                expanded={expandedFramework === 'alignment'}
                onToggle={() => toggleFramework('alignment')}
                confidence={insights.alignment.confidence}
              >
                <AlignmentDetails alignment={profile.mappings.dndAlignment} insight={insights.alignment} />
              </FrameworkCard>
            )}

            {/* Holland Code */}
            {profile.mappings.hollandCode && insights.hollandCode && (
              <FrameworkCard
                title="Holland Code"
                subtitle={profile.mappings.hollandCode}
                description="Your career interests and work environment preferences across six occupational themes"
                icon={Briefcase}
                expanded={expandedFramework === 'holland'}
                onToggle={() => toggleFramework('holland')}
                confidence={insights.hollandCode.confidence}
              >
                <div className="space-y-4">
                  <p className="text-muted-foreground">{insights.hollandCode.summary}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Primary Interest Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.hollandCode.primaryTypes.map((type, i) => (
                        <Badge key={i} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{insights.hollandCode.reasoning}</p>
                </div>
              </FrameworkCard>
            )}

            {/* Socionics */}
            {profile.mappings.socionics && insights.socionics && (
              <FrameworkCard
                title="Socionics"
                subtitle={profile.mappings.socionics}
                description="How you process and exchange information with others, based on cognitive functions and social dynamics"
                icon={Target}
                expanded={expandedFramework === 'socionics'}
                onToggle={() => toggleFramework('socionics')}
                confidence={insights.socionics.confidence}
              >
                <div className="space-y-4">
                  <p className="text-muted-foreground">{insights.socionics.summary}</p>
                  <p className="text-sm text-muted-foreground">{insights.socionics.reasoning}</p>
                </div>
              </FrameworkCard>
            )}
          </div>
        )}

        {/* Holistic Synthesis */}
        {insights?.synthesis && (
          <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">🔮</span>
              Your Integrated Personality Profile
            </h3>
            <div className="text-muted-foreground space-y-3 leading-relaxed">
              {insights.synthesis.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Overall Framework Confidence: 
              <span className={`ml-1 font-medium ${getConfidenceColor(insights.overallConfidence)}`}>
                {getConfidenceLabel(insights.overallConfidence)} ({Math.round(insights.overallConfidence * 100)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Framework Card Wrapper
interface FrameworkCardProps {
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  confidence?: number;
  children: React.ReactNode;
}

const FrameworkCard: React.FC<FrameworkCardProps> = ({ 
  title, 
  subtitle, 
  description,
  icon: Icon, 
  expanded, 
  onToggle, 
  confidence,
  children 
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-400';
    if (conf >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card>
      <CardHeader>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left hover:opacity-80 transition"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}: {subtitle}</h3>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {description ? description : `Click to explore your ${title} profile`}
                </p>
                {confidence !== undefined && (
                  <span className="text-xs flex items-center gap-1">
                    Confidence: 
                    <span className={getConfidenceColor(confidence)}>
                      {getConfidenceLabel(confidence)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="border-t border-border pt-6">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// MBTI Details Component
const MBTIDetails: React.FC<{ mbti: string; insight: MBTIInsight }> = ({ mbti, insight }) => {
  const dimensions = ['E_or_I', 'S_or_N', 'T_or_F', 'J_or_P'] as const;
  const labels: Record<typeof dimensions[number], [string, string]> = {
    'E_or_I': ['Extraversion', 'Introversion'],
    'S_or_N': ['Sensing', 'Intuition'],
    'T_or_F': ['Thinking', 'Feeling'],
    'J_or_P': ['Judging', 'Perceiving']
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-foreground">{insight.summary}</p>
      </div>

      {/* Dimension Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {dimensions.map(dim => {
          const data = insight.breakdown[dim];
          const [left, right] = labels[dim];
          const isFirst = data?.letter === mbti[dimensions.indexOf(dim)];
          
          return (
            <div key={dim} className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-primary">
                  {isFirst ? left : right}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((data?.score || 0) * 100)}% preference
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  style={{ width: `${(data?.score || 0) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{data?.reason}</p>
            </div>
          );
        })}
      </div>

      {/* Unique Expression */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-2">
          Your Unique {mbti} Expression
        </h4>
        <p className="text-foreground text-sm">{insight.uniqueExpression}</p>
      </div>

      {/* Strengths & Growth */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">Key Strengths</h4>
          <ul className="space-y-2">
            {insight.keyStrengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span className="text-foreground text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">Growth Areas</h4>
          <ul className="space-y-2">
            {insight.growthAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-foreground text-sm">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Enneagram Details Component
const EnneagramDetails: React.FC<{ 
  enneagram: { type: number; wing: number; tritype: string }; 
  insight: EnneagramInsight 
}> = ({ enneagram, insight }) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-foreground">{insight.summary}</p>
      </div>

      {/* Core Type Analysis */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-3">Core Type {enneagram.type}</h4>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Description</span>
            <p className="text-sm text-foreground">{insight.coreType.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Core Motivation</span>
              <p className="text-sm text-foreground">{insight.coreType.motivation}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Core Fear</span>
              <p className="text-sm text-foreground">{insight.coreType.fear}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Contributing Traits</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {insight.coreType.contributingTraits.map((trait, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wing Influence */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-3">Wing {enneagram.wing} Influence</h4>
        <div className="space-y-2">
          <p className="text-sm text-foreground">{insight.wing.influence}</p>
          <p className="text-xs text-muted-foreground">{insight.wing.balance}</p>
        </div>
      </div>

      {/* Development Levels */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Healthy</h4>
          <p className="text-xs text-green-600 dark:text-green-400">{insight.levels.healthy}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Average</h4>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">{insight.levels.average}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Unhealthy</h4>
          <p className="text-xs text-red-600 dark:text-red-400">{insight.levels.unhealthy}</p>
        </div>
      </div>

      {/* Growth Path */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-2">Your Growth Path</h4>
        <p className="text-foreground text-sm">{insight.growthPath}</p>
      </div>
    </div>
  );
};

// Big Five Details Component
const BigFiveDetails: React.FC<{ bigFive: Record<string, number>; insight: BigFiveInsight }> = ({ 
  bigFive, 
  insight 
}) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-foreground">{insight.summary}</p>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        {Object.entries(insight.dimensions).map(([trait, data]) => (
          <div key={trait} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground">{trait}</h4>
              <div className="flex items-center gap-2">
                <Badge variant={data.score >= 7 ? 'default' : data.score >= 4 ? 'secondary' : 'outline'}>
                  {data.score >= 7 ? 'High' : data.score >= 4 ? 'Moderate' : 'Low'}
                </Badge>
                <span className="text-sm font-medium">{data.score.toFixed(1)}/10</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                style={{ width: `${data.score * 10}%` }}
              />
            </div>
            <p className="text-sm text-foreground mb-3">{data.description}</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Contributing Traits</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.contributingTraits.map((trait, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{trait}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Implications</span>
                <ul className="mt-1 space-y-1">
                  {data.implications.map((implication, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 text-xs">•</span>
                      <span className="text-xs text-foreground">{implication}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactions */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-2">Trait Interactions</h4>
        <p className="text-foreground text-sm">{insight.interactions}</p>
      </div>
    </div>
  );
};

// Alignment Details Component
const AlignmentDetails: React.FC<{ alignment: string; insight: AlignmentInsight }> = ({ 
  alignment, 
  insight 
}) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-foreground">{insight.summary}</p>
      </div>

      {/* Ethical and Moral Axes */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-primary mb-3">Ethical Axis: {insight.ethicalAxis.position}</h4>
          <p className="text-sm text-foreground mb-3">{insight.ethicalAxis.reasoning}</p>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">How This Shows Up</span>
            <ul className="mt-2 space-y-1">
              {insight.ethicalAxis.manifestations.map((manifestation, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span className="text-xs text-foreground">{manifestation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-primary mb-3">Moral Axis: {insight.moralAxis.position}</h4>
          <p className="text-sm text-foreground mb-3">{insight.moralAxis.reasoning}</p>
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">How This Shows Up</span>
            <ul className="mt-2 space-y-1">
              {insight.moralAxis.manifestations.map((manifestation, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span className="text-xs text-foreground">{manifestation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Decision Making */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-primary mb-2">Decision-Making Style</h4>
        <p className="text-foreground text-sm">{insight.decisionMaking}</p>
      </div>
    </div>
  );
};