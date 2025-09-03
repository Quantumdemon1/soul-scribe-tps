import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FrameworkInsightsService } from '../../services/frameworkInsightsService';
import { Target, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, TrendingUp, Calendar, BarChart } from 'lucide-react';

interface PersonalDevelopmentProps {
  profile: PersonalityProfile;
}

export const PersonalDevelopment: React.FC<PersonalDevelopmentProps> = ({ profile }) => {
  const [aiGrowthAreas, setAiGrowthAreas] = useState<any>(null);
  const [aiActivities, setAiActivities] = useState<any>(null);
  const [aiTracking, setAiTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    growth: true,
    activities: false,
    tracking: false,
    mindset: false,
  });

  const frameworkService = new FrameworkInsightsService();

  useEffect(() => {
    const generateDevelopmentInsights = async () => {
      try {
        setLoading(true);
        const [growthAreas, activities, tracking] = await Promise.all([
          frameworkService.generatePersonalizedGrowthAreas(profile),
          frameworkService.generateDevelopmentActivities(profile),
          frameworkService.generateProgressTracking(profile)
        ]);

        setAiGrowthAreas(growthAreas);
        setAiActivities(activities);
        setAiTracking(tracking);
      } catch (err) {
        console.error('Error generating development insights:', err);
        setError('Failed to generate personalized development insights');
      } finally {
        setLoading(false);
      }
    };

    generateDevelopmentInsights();
  }, [profile]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Generating personalized development insights...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI-Generated Growth Areas */}
      <Collapsible open={openSections.growth} onOpenChange={() => toggleSection('growth')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Personalized Growth Areas
                </span>
                {openSections.growth ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                {aiGrowthAreas?.growthAreas?.map((area: any, index: number) => (
                  <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{area.area}</h4>
                        <p className="text-foreground/80 text-sm">{area.challenge}</p>
                        <p className="text-muted-foreground text-sm italic">{area.reasoning}</p>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-foreground mb-1">Leverage Your Strengths:</p>
                          <p className="text-sm text-foreground/70">{area.leverageStrengths}</p>
                        </div>
                        {area.focusPoints && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-foreground mb-1">Focus Points:</p>
                            <div className="flex flex-wrap gap-1">
                              {area.focusPoints.map((point: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Development Activities */}
      <Collapsible open={openSections.activities} onOpenChange={() => toggleSection('activities')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Development Activities
                </span>
                {openSections.activities ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                {aiActivities?.developmentAreas?.map((area: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          {area.area}
                        </span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {area.timeframe}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-foreground/80 text-sm">{area.description}</p>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Recommended Activities
                        </h4>
                        <div className="space-y-2">
                          {area.activities?.map((activity: string, actIndex: number) => (
                            <div key={actIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-sm text-foreground/70">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {area.successIndicators && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-blue-600" />
                            Success Indicators
                          </h4>
                          <div className="space-y-1">
                            {area.successIndicators.map((indicator: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                <span className="text-xs text-foreground/60">{indicator}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Progress Tracking */}
      <Collapsible open={openSections.tracking} onOpenChange={() => toggleSection('tracking')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  Progress Tracking
                </span>
                {openSections.tracking ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-6">
                {aiTracking?.trackingMethods && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Tracking Methods</h4>
                    <div className="grid gap-3">
                      {aiTracking.trackingMethods.map((method: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-foreground">{method.method}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {method.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/70 mb-2">{method.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {method.metrics?.map((metric: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiTracking?.milestones && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Development Milestones</h4>
                    <div className="space-y-3">
                      {aiTracking.milestones.map((milestone: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-foreground">{milestone.timeframe}</span>
                          </div>
                          <div className="space-y-2">
                            {milestone.goals?.map((goal: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                                <span className="text-sm text-foreground/80">{goal}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Assessment: {milestone.assessmentMethod}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Development Mindset */}
      <Collapsible open={openSections.mindset} onOpenChange={() => toggleSection('mindset')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Development Mindset
                </span>
                {openSections.mindset ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card border border-info/20 hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium text-info mb-2">Remember: Growth is a Journey</h4>
                  <p className="text-foreground/80 text-sm">
                    Personal development is an ongoing process. Focus on one area at a time and celebrate small wins along the way.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-card border border-success/20 hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium text-success mb-2">Leverage Your Strengths</h4>
                  <p className="text-foreground/80 text-sm">
                    While working on growth areas, don't forget to continue developing and utilizing your natural strengths.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-primary/20 hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium text-primary mb-2">Personality-Aligned Growth</h4>
                  <p className="text-foreground/80 text-sm">
                    These recommendations are tailored to your specific personality traits. Trust your natural inclinations while gently expanding your comfort zone.
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};