import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';
import { useIntegralAssessment } from '@/hooks/useIntegralAssessment';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  TrendingUp, 
  Eye, 
  Lightbulb, 
  Download, 
  Share2,
  RefreshCw,
  ArrowLeft,
  Save
} from 'lucide-react';
import { ComplexityTooltip } from '@/components/ui/complexity-tooltip';
import { AssessmentValidation } from '@/components/assessment/AssessmentValidation';
import { INTEGRAL_LEVELS } from '@/mappings/integral.enhanced';
import { logger } from '@/utils/structuredLogging';

interface IntegralResultsProps {
  integralDetail: IntegralDetail;
  onRetakeAssessment: () => void;
  onBackToSelection: () => void;
  personalityProfile?: PersonalityProfile; // Optional existing personality profile for context
}

export const IntegralResults: React.FC<IntegralResultsProps> = ({
  integralDetail,
  onRetakeAssessment,
  onBackToSelection,
  personalityProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'integration'>('overview');
  const { saveIntegralResults, isLoading } = useIntegralAssessment();
  const { toast } = useToast();

  const levelDetails = INTEGRAL_LEVELS[integralDetail.primaryLevel.color.toLowerCase() as keyof typeof INTEGRAL_LEVELS];
  
  const handleSaveResults = async () => {
    try {
      await saveIntegralResults(integralDetail);
      toast({
        title: "Results Saved",
        description: "Your Integral Level assessment has been saved to your profile.",
      });
    } catch (error) {
      logger.error('Failed to save integral results', {
        component: 'IntegralResults',
        metadata: { errorMessage: error.message }
      });
    }
  };
  
  const getLevelColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'Red': '#e74c3c',
      'Amber': '#f39c12',
      'Orange': '#f97316',
      'Green': '#22c55e',
      'Yellow': '#eab308',
      'Turquoise': '#06b6d4',
      'Coral': '#fb7185'
    };
    return colorMap[color] || '#6b7280';
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
            Your cognitive development profile based on Integral Theory
          </p>
        </div>

        {/* Primary Level Card */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className="h-2"
            style={{ backgroundColor: getLevelColor(integralDetail.primaryLevel.color) }}
          />
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: getLevelColor(integralDetail.primaryLevel.color) }}
              >
                {integralDetail.primaryLevel.number}
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl">
                  Level {integralDetail.primaryLevel.number} - {integralDetail.primaryLevel.color}
                </CardTitle>
                <p className="text-xl text-muted-foreground">
                  {integralDetail.primaryLevel.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(integralDetail.confidence)}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(integralDetail.cognitiveComplexity)}</div>
                <ComplexityTooltip 
                  score={Math.round(integralDetail.cognitiveComplexity)} 
                  className="text-sm text-muted-foreground justify-center"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Worldview & Thinking Pattern</h4>
                <p className="text-muted-foreground">{integralDetail.primaryLevel.worldview}</p>
                <p className="text-sm text-muted-foreground mt-2">{integralDetail.primaryLevel.thinkingPattern}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Developmental Edge</h4>
                <p className="text-muted-foreground">{integralDetail.developmentalEdge}</p>
              </div>

              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Reality Triad Mapping</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-primary">Physical</div>
                    <div className="text-2xl font-bold">{Math.round(integralDetail.realityTriadMapping.physical)}</div>
                    <div className="text-xs text-muted-foreground">Concrete Thinking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">Social</div>
                    <div className="text-2xl font-bold">{Math.round(integralDetail.realityTriadMapping.social)}</div>
                    <div className="text-xs text-muted-foreground">Systems Thinking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-primary">Universal</div>
                    <div className="text-2xl font-bold">{Math.round(integralDetail.realityTriadMapping.universal)}</div>
                    <div className="text-xs text-muted-foreground">Integral Thinking</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'development', label: 'Development', icon: TrendingUp },
              { id: 'integration', label: 'Integration', icon: Lightbulb }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Assessment Validation */}
        <AssessmentValidation 
          integralDetail={integralDetail}
          className="mb-6"
        />

        {/* Tab Content */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {activeTab === 'overview' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Core Characteristics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {integralDetail.primaryLevel.characteristics.map((characteristic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{characteristic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Typical Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {integralDetail.primaryLevel.typicalConcerns.map((concern, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'development' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Growth Edge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Areas for continued development and evolution:
                  </p>
                  <ul className="space-y-3">
                    {integralDetail.primaryLevel.growthEdge.map((edge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: getLevelColor(integralDetail.primaryLevel.color) }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm">{edge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Developmental Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div className="font-semibold mb-2">Current Level</div>
                      <div className="pl-4 border-l-2 border-primary">
                        Level {integralDetail.primaryLevel.number} - {integralDetail.primaryLevel.color} ({integralDetail.primaryLevel.name})
                      </div>
                    </div>
                    
                    {integralDetail.primaryLevel.number < 7 && (
                      <div className="text-sm">
                        <div className="font-semibold mb-2">Next Developmental Stage</div>
                        <div className="pl-4 border-l-2 border-muted text-muted-foreground">
                          Level {integralDetail.primaryLevel.number + 1} - Evolution toward greater complexity and integration
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'integration' && (
            <>
              {personalityProfile ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Personality Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      How your personality type manifests at your current integral level:
                    </p>
                    <div className="space-y-3">
                      {personalityProfile.mappings?.mbti && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-semibold text-sm mb-1">MBTI: {personalityProfile.mappings.mbti}</div>
                          <div className="text-xs text-muted-foreground">
                            Your {personalityProfile.mappings.mbti} type at the {integralDetail.primaryLevel.color} level typically focuses on {integralDetail.primaryLevel.typicalConcerns[0]?.toLowerCase()}
                          </div>
                        </div>
                      )}
                      {personalityProfile.mappings?.enneagramDetails && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-semibold text-sm mb-1">Enneagram: Type {personalityProfile.mappings.enneagramDetails.type}</div>
                          <div className="text-xs text-muted-foreground">
                            Type {personalityProfile.mappings.enneagramDetails.type} at this developmental level emphasizes {integralDetail.primaryLevel.thinkingPattern?.toLowerCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Recommended Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      To get the full picture of how your personality manifests at your integral level:
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={onBackToSelection}
                      className="w-full"
                    >
                      Take Personality Assessment
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Level Integration Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-semibold mb-1">Strengthen Current Level</div>
                      <div className="text-muted-foreground">
                        Master the thinking patterns and worldview of your current level before moving to the next.
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Practice Perspective-Taking</div>
                      <div className="text-muted-foreground">
                        Understand how people at other levels see and think about the world.
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Embrace Complexity</div>
                      <div className="text-muted-foreground">
                        Gradually increase your comfort with paradox and nuanced thinking.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={handleSaveResults} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save to Profile'}
          </Button>
          <Button variant="outline" onClick={onBackToSelection}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
          <Button variant="outline" onClick={onRetakeAssessment}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `My Integral Level: ${integralDetail.primaryLevel.color}`,
                  text: `I just completed an Integral Level assessment! My cognitive development level is ${integralDetail.primaryLevel.number} (${integralDetail.primaryLevel.color}) - ${integralDetail.primaryLevel.name}.`,
                  url: window.location.href
                });
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
};