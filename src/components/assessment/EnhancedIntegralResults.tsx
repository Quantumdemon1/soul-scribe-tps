import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Download, Share2, RotateCcw, ArrowLeft, Target, TrendingUp, Users, Sparkles } from 'lucide-react';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';
import { ComplexityTooltip } from '@/components/ui/complexity-tooltip';
import { RealityTriadVisualization } from '@/components/dashboard/RealityTriadVisualization';
import { SpiralDynamicsTimeline } from '@/components/dashboard/SpiralDynamicsTimeline';
import { IntegralLevelExplorer } from '@/components/assessment/IntegralLevelExplorer';
import { IntegralPersonalityService, PersonalityIntegration } from '@/services/integralPersonalityService';
import { useIntegralAssessment } from '@/hooks/useIntegralAssessment';
import { useToast } from '@/hooks/use-toast';
import { logScoringDetails } from '@/utils/integralValidation';

interface EnhancedIntegralResultsProps {
  integralDetail: IntegralDetail;
  onRetakeAssessment: () => void;
  onBackToSelection: () => void;
  personalityProfile?: PersonalityProfile;
}

export const EnhancedIntegralResults: React.FC<EnhancedIntegralResultsProps> = ({
  integralDetail,
  onRetakeAssessment,
  onBackToSelection,
  personalityProfile
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [personalityIntegration, setPersonalityIntegration] = useState<PersonalityIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personalityService] = useState(() => new IntegralPersonalityService());
  const { saveIntegralResults, isLoading: isSaving } = useIntegralAssessment();
  const { toast } = useToast();

  useEffect(() => {
    // Log scoring details for transparency
    logScoringDetails('Final Results', { [integralDetail.primaryLevel.color]: integralDetail.primaryLevel.score });
    
    // Generate personality integration if available
    if (personalityProfile) {
      generatePersonalityIntegration();
    }
  }, [integralDetail, personalityProfile]);

  const generatePersonalityIntegration = async () => {
    if (!personalityProfile) return;
    
    try {
      setIsLoading(true);
      const integration = await personalityService.generatePersonalityIntegration(
        integralDetail,
        personalityProfile
      );
      setPersonalityIntegration(integration);
    } catch (error) {
      console.error('Error generating personality integration:', error);
      toast({
        title: 'Integration Note',
        description: 'Some personality integration features may be limited.',
        variant: 'default'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResults = async () => {
    try {
      await saveIntegralResults(integralDetail);
      toast({
        title: 'Results Saved',
        description: 'Your Integral Level assessment has been saved to your profile.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Unable to save results. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getLevelColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      'Beige': '#d4b896',
      'Purple': '#8b5cf6',
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Orange': '#f97316',
      'Green': '#22c55e',
      'Yellow': '#eab308',
      'Turquoise': '#06b6d4',
      'Coral': '#fb7185'
    };
    return colorMap[color] || '#6b7280';
  };

  const getConfidenceDescription = (confidence: number): string => {
    if (confidence >= 85) return 'Very High - Strong indicators across multiple areas';
    if (confidence >= 75) return 'High - Clear pattern with good consistency';
    if (confidence >= 65) return 'Moderate - Generally consistent with some variability';
    if (confidence >= 55) return 'Fair - Some mixed signals, may benefit from clarification';
    return 'Low - Significant uncertainty, consider retaking assessment';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 75) return 'text-green-600';
    if (confidence >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">
              Your Integral Level Assessment
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your cognitive development profile based on Integral Theory and Spiral Dynamics
          </p>
        </div>

        {/* Primary Level Card */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className="h-3"
            style={{ backgroundColor: getLevelColor(integralDetail.primaryLevel.color) }}
          />
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-6 mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: getLevelColor(integralDetail.primaryLevel.color) }}
              >
                {integralDetail.primaryLevel.number}
              </div>
              <div className="text-left">
                <CardTitle className="text-3xl mb-2">
                  Level {integralDetail.primaryLevel.number} - {integralDetail.primaryLevel.color}
                </CardTitle>
                <p className="text-xl text-muted-foreground mb-1">
                  {integralDetail.primaryLevel.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {integralDetail.primaryLevel.cognitiveStage}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getConfidenceColor(integralDetail.confidence)}`}>
                  {Math.round(integralDetail.confidence)}%
                </div>
                <div className="text-sm text-muted-foreground mb-1">Assessment Confidence</div>
                <div className="text-xs text-muted-foreground">
                  {getConfidenceDescription(integralDetail.confidence)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(integralDetail.cognitiveComplexity)}/10
                </div>
                <ComplexityTooltip 
                  score={Math.round(integralDetail.cognitiveComplexity)} 
                  className="text-sm text-muted-foreground justify-center"
                />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {integralDetail.secondaryLevel ? `+${integralDetail.secondaryLevel.number}` : 'None'}
                </div>
                <div className="text-sm text-muted-foreground">Secondary Level</div>
                {integralDetail.secondaryLevel && (
                  <div className="text-xs text-muted-foreground">
                    {integralDetail.secondaryLevel.color}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="personality" disabled={!personalityProfile}>
              Personality
            </TabsTrigger>
            <TabsTrigger value="explore">Explore Levels</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Core Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Core Characteristics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Worldview</h4>
                    <p className="text-sm text-muted-foreground">
                      {integralDetail.primaryLevel.worldview}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Thinking Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      {integralDetail.primaryLevel.thinkingPattern}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Traits</h4>
                    <ul className="space-y-1">
                      {integralDetail.primaryLevel.characteristics.slice(0, 4).map((char, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Reality Triad */}
              <div>
                <RealityTriadVisualization 
                  triadMapping={integralDetail.realityTriadMapping}
                />
              </div>
            </div>

            {/* Development Edge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Development Edge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {integralDetail.developmentalEdge}
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Growth Opportunities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {integralDetail.primaryLevel.growthEdge.map((edge, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{edge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typical Concerns */}
            <Card>
              <CardHeader>
                <CardTitle>Typical Life Concerns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {integralDetail.primaryLevel.typicalConcerns.map((concern, index) => (
                    <Badge key={index} variant="outline">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Development Tab */}
          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Development Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Focus Areas</h4>
                  <ul className="space-y-2">
                    {integralDetail.primaryLevel.growthEdge.map((edge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {personalityIntegration?.developmentRecommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Personalized Development Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personalityIntegration.developmentRecommendations.map((rec, index) => (
                    <div key={rec.id} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant="outline">{rec.timeframe}</Badge>
                        <Badge variant="secondary">{rec.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <div className="text-xs text-muted-foreground mb-2">
                        <strong>Why this fits you:</strong> {rec.personalityRelevance}
                      </div>
                      <div className="space-y-1">
                        <strong className="text-xs">Action Steps:</strong>
                        {rec.specificActions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-start gap-1">
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Personality Integration Tab */}
          <TabsContent value="personality" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
                  <p>Generating personality integration insights...</p>
                </CardContent>
              </Card>
            ) : personalityIntegration ? (
              <>
                {/* Integration Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Personality Integration Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {personalityIntegration.integrationInsights.map((insight, index) => (
                      <div key={insight.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <strong>Personality Aspect:</strong>
                            <p className="text-muted-foreground">{insight.personalityAspect}</p>
                          </div>
                          <div>
                            <strong>Integral Aspect:</strong>
                            <p className="text-muted-foreground">{insight.integralAspect}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <strong>In Practice:</strong>
                          <p className="text-muted-foreground">{insight.practicalImplication}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Level Manifestations */}
                {personalityIntegration.levelSpecificManifestations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Type at Different Levels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {personalityIntegration.levelSpecificManifestations.map((manifestation, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 capitalize">
                            {manifestation.framework} Type: {manifestation.type}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>At Current Level:</strong>
                              <p className="text-muted-foreground">{manifestation.atCurrentLevel}</p>
                            </div>
                            <div>
                              <strong>At Next Level:</strong>
                              <p className="text-muted-foreground">{manifestation.atNextLevel}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <strong>Strengths to Leverage:</strong>
                              <ul className="text-muted-foreground mt-1">
                                {manifestation.strengthsToLeverage.map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>Challenges to Watch:</strong>
                              <ul className="text-muted-foreground mt-1">
                                {manifestation.tensionsAndChallenges.map((challenge, i) => (
                                  <li key={i}>• {challenge}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <p>Complete a personality assessment to see integration insights.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Explore Levels Tab */}
          <TabsContent value="explore">
            <IntegralLevelExplorer 
              currentLevel={integralDetail.primaryLevel}
              personalityProfile={personalityProfile}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <SpiralDynamicsTimeline
              primaryLevel={integralDetail.primaryLevel}
              secondaryLevel={integralDetail.secondaryLevel}
              developmentalEdge={integralDetail.developmentalEdge}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToSelection}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>
            <Button variant="outline" onClick={onRetakeAssessment}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveResults} 
              disabled={isSaving}
              variant="default"
            >
              {isSaving ? 'Saving...' : 'Save Results'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};