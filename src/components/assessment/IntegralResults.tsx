import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Eye, 
  Lightbulb, 
  Download, 
  Share2,
  RefreshCw,
  ArrowLeft 
} from 'lucide-react';
import { INTEGRAL_LEVELS } from '@/mappings/integral.enhanced';

interface IntegralLevel {
  number: number;
  color: string;
  name: string;
  score: number;
  confidence: number;
}

interface IntegralResultsProps {
  primaryLevel: IntegralLevel;
  confidence: number;
  reasoning: string;
  onRetakeAssessment: () => void;
  onBackToSelection: () => void;
  personalityProfile?: any; // Optional existing personality profile for context
}

export const IntegralResults: React.FC<IntegralResultsProps> = ({
  primaryLevel,
  confidence,
  reasoning,
  onRetakeAssessment,
  onBackToSelection,
  personalityProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'integration'>('overview');

  const levelDetails = INTEGRAL_LEVELS[primaryLevel.color.toLowerCase() as keyof typeof INTEGRAL_LEVELS];
  
  const getLevelColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'Red': '#e74c3c',
      'Blue': '#3498db', 
      'Orange': '#f39c12',
      'Green': '#27ae60',
      'Yellow': '#f1c40f',
      'Turquoise': '#16a085'
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
            style={{ backgroundColor: getLevelColor(primaryLevel.color) }}
          />
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: getLevelColor(primaryLevel.color) }}
              >
                {primaryLevel.number}
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl">
                  Level {primaryLevel.number} - {primaryLevel.color}
                </CardTitle>
                <p className="text-xl text-muted-foreground">
                  {primaryLevel.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{confidence}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{levelDetails?.cognitiveStage || 'Advanced'}</div>
                <div className="text-sm text-muted-foreground">Cognitive Stage</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Worldview & Thinking Pattern</h4>
                <p className="text-muted-foreground">{levelDetails?.worldview}</p>
                <p className="text-sm text-muted-foreground mt-2">{levelDetails?.thinkingPattern}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Assessment Reasoning</h4>
                <p className="text-muted-foreground">{reasoning}</p>
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
                    {levelDetails?.characteristics.map((characteristic, index) => (
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
                    {levelDetails?.typicalConcerns.map((concern, index) => (
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
                    {levelDetails?.growthEdge.map((edge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: getLevelColor(primaryLevel.color) }}
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
                        Level {primaryLevel.number} - {primaryLevel.color} ({primaryLevel.name})
                      </div>
                    </div>
                    
                    {primaryLevel.number < 7 && (
                      <div className="text-sm">
                        <div className="font-semibold mb-2">Next Developmental Stage</div>
                        <div className="pl-4 border-l-2 border-muted text-muted-foreground">
                          Level {primaryLevel.number + 1} - Evolution toward greater complexity and integration
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
                      {personalityProfile.mbti && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-semibold text-sm mb-1">MBTI: {personalityProfile.mbti.type}</div>
                          <div className="text-xs text-muted-foreground">
                            Your {personalityProfile.mbti.type} type at the {primaryLevel.color} level typically focuses on {levelDetails?.typicalConcerns[0]?.toLowerCase()}
                          </div>
                        </div>
                      )}
                      {personalityProfile.enneagram && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-semibold text-sm mb-1">Enneagram: Type {personalityProfile.enneagram.type}</div>
                          <div className="text-xs text-muted-foreground">
                            Type {personalityProfile.enneagram.type} at this developmental level emphasizes {levelDetails?.thinkingPattern?.toLowerCase()}
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
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
};