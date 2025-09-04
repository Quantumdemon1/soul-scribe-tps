import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { CoreInsight } from '../../types/llm.types';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FrameworkInsightsService } from '../../services/frameworkInsightsService';
import { TrendingUp, Brain, Target, Lightbulb, ChevronDown, Sparkles, RefreshCw } from 'lucide-react';
import { RefreshButton } from '@/components/ui/refresh-button';

interface CoreInsightsProps {
  profile: PersonalityProfile;
}

export const CoreInsights: React.FC<CoreInsightsProps> = ({ profile }) => {
  const { data, loading, errors, generateSection, refreshSection, getLastGenerated } = useDashboard();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    domains: true,
    strengths: true
  });

  const coreInsights = data.coreInsights;
  const isLoading = loading.coreInsights;
  const error = errors.coreInsights;

  const generateInsights = async () => {
    await generateSection('coreInsights', profile);
  };

  useEffect(() => {
    if (!coreInsights && !isLoading) {
      generateInsights();
    }
  }, [profile]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Generating personalized insights...</span>
      </div>
    );
  }

  if (error || !coreInsights) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Failed to load insights'}</p>
            <Button onClick={generateInsights} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI-Generated Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            AI-generated personalized insights (Confidence: {(coreInsights.confidence * 100).toFixed(0)}%)
          </span>
        </div>
        <RefreshButton
          onRefresh={() => refreshSection('coreInsights', profile)}
          isLoading={loading.coreInsights}
          lastGenerated={getLastGenerated('coreInsights')}
          variant="ghost"
          size="sm"
        />
      </div>

      {/* Personality Summary */}
      <Collapsible open={openSections.summary} onOpenChange={() => toggleSection('summary')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Personality Summary
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.summary ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Overview</h4>
                  <p className="text-foreground/80 leading-relaxed">
                    {coreInsights.personalitySummary?.overview || 'Personality overview not available.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Your Unique Expression</h4>
                  <p className="text-foreground/80 leading-relaxed">
                    {coreInsights.personalitySummary?.uniqueExpression || 'Unique expression analysis not available.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Trait Integration</h4>
                  <p className="text-foreground/80 leading-relaxed">
                    {coreInsights.personalitySummary?.traitIntegration || 'Trait integration analysis not available.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Domain Analysis */}
      <Collapsible open={openSections.domains} onOpenChange={() => toggleSection('domains')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Domain Analysis
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.domains ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(coreInsights.domainAnalysis || {}).map(([domain, analysis]) => (
                  <div key={domain} className="space-y-4 p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{domain}</h3>
                      <Badge variant={analysis.score > 7 ? "default" : analysis.score > 5 ? "secondary" : "outline"}>
                        {(analysis.score * 10).toFixed(1)}/10
                      </Badge>
                    </div>
                    <Progress value={analysis.score * 10} className="h-2" />
                    <p className="text-sm text-foreground/80">{analysis.explanation}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Contributing Traits:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(analysis.contributingTraits || []).map((trait, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Implications:</h4>
                      <ul className="text-sm text-foreground/80 space-y-1">
                        {(analysis.implications || []).map((implication, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {implication}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Strengths Analysis */}
      <Collapsible open={openSections.strengths} onOpenChange={() => toggleSection('strengths')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Your Core Strengths
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections.strengths ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Primary Strengths</h4>
                  <div className="space-y-4">
                    {(coreInsights.strengthsAnalysis?.primary || []).map((strength, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h5 className="font-medium text-foreground mb-2">{strength.trait}</h5>
                        <p className="text-sm text-foreground/80 mb-3">{strength.description}</p>
                        <div className="space-y-1">
                          <h6 className="text-xs font-medium text-foreground/60">Applications:</h6>
                          <ul className="text-xs text-foreground/70 space-y-1">
                            {(strength.applications || []).map((app, appIdx) => (
                              <li key={appIdx} className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                {app}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Secondary Strengths</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(coreInsights.strengthsAnalysis?.secondary || []).map((strength, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <h5 className="font-medium text-foreground mb-1">{strength.trait}</h5>
                        <p className="text-sm text-foreground/80 mb-2">{strength.description}</p>
                        <div className="space-y-1">
                          <h6 className="text-xs font-medium text-foreground/60">Applications:</h6>
                          <ul className="text-xs text-foreground/70 space-y-0.5">
                            {(strength.applications || []).slice(0, 2).map((app, appIdx) => (
                              <li key={appIdx} className="flex items-start gap-1.5">
                                <span className="w-0.5 h-0.5 rounded-full bg-foreground/50 mt-1.5 flex-shrink-0" />
                                {app}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2">Strength Interactions</h4>
                  <p className="text-sm text-foreground/80">{coreInsights.strengthsAnalysis?.interactions || 'No interaction analysis available.'}</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

// Helper function to get domain descriptions
function getDomainDescription(domain: string, score: number): string {
  const descriptions = {
    'External': score > 7 ? 'You excel at organizing and managing your environment' : 
                score > 5 ? 'You have moderate skills in external organization' : 
                'Focus on developing better organizational systems',
    'Internal': score > 7 ? 'You have strong self-awareness and emotional regulation' : 
                score > 5 ? 'You show good internal awareness with room for growth' : 
                'Developing self-awareness could be beneficial',
    'Interpersonal': score > 7 ? 'You navigate relationships and social situations skillfully' : 
                     score > 5 ? 'You handle social interactions reasonably well' : 
                     'Building stronger interpersonal skills could help',
    'Processing': score > 7 ? 'You have excellent analytical and cognitive abilities' : 
                  score > 5 ? 'You show solid problem-solving capabilities' : 
                  'Strengthening analytical thinking could be valuable'
  };
  
  return descriptions[domain as keyof typeof descriptions] || 'This domain reflects important aspects of your personality.';
}