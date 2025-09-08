import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { IntegralLevelBadge } from './IntegralLevelBadge';
import { CognitiveComplexityMeter } from './CognitiveComplexityMeter';
import { RealityTriadVisualization } from './RealityTriadVisualization';
import { SpiralDynamicsTimeline } from './SpiralDynamicsTimeline';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Eye, TrendingUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface IntegralInsightsPanelProps {
  integralDetail: IntegralDetail;
  className?: string;
}

export const IntegralInsightsPanel: React.FC<IntegralInsightsPanelProps> = ({
  integralDetail,
  className
}) => {
  const [openSections, setOpenSections] = useState({
    worldview: true,
    characteristics: false,
    growth: false,
    concerns: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Level Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Integral Level Assessment
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {Math.round(integralDetail.confidence)}% confident
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Level Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <IntegralLevelBadge level={integralDetail.primaryLevel} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{integralDetail.primaryLevel.name}</h3>
                <p className="text-sm text-muted-foreground">{integralDetail.primaryLevel.cognitiveStage}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {Math.round(integralDetail.primaryLevel.confidence)}% match
                </Badge>
              </div>
            </div>

            {/* Secondary Level if present */}
            {integralDetail.secondaryLevel && (
              <div className="flex items-center gap-4 ml-8 border-l-2 border-muted pl-4">
                <IntegralLevelBadge level={integralDetail.secondaryLevel} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Secondary influence: {integralDetail.secondaryLevel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(integralDetail.secondaryLevel.confidence)}% influence
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Sections */}
          <div className="space-y-3">
            {/* Worldview */}
            <Collapsible open={openSections.worldview} onOpenChange={() => toggleSection('worldview')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">Worldview & Thinking Pattern</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.worldview ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3">
                <div className="p-4 bg-background border rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Worldview</h4>
                  <p className="text-sm text-muted-foreground">{integralDetail.primaryLevel.worldview}</p>
                </div>
                <div className="p-4 bg-background border rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Thinking Pattern</h4>
                  <p className="text-sm text-muted-foreground">{integralDetail.primaryLevel.thinkingPattern}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Characteristics */}
            <Collapsible open={openSections.characteristics} onOpenChange={() => toggleSection('characteristics')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-medium">Core Characteristics</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.characteristics ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-background border rounded-lg">
                  <ul className="space-y-2">
                    {integralDetail.primaryLevel.characteristics.map((characteristic, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">•</span>
                        <span className="text-muted-foreground">{characteristic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Growth Edge */}
            <Collapsible open={openSections.growth} onOpenChange={() => toggleSection('growth')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Growth Opportunities</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.growth ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-background border rounded-lg">
                  <ul className="space-y-2">
                    {integralDetail.primaryLevel.growthEdge.map((edge, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 font-bold">→</span>
                        <span className="text-muted-foreground">{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <CognitiveComplexityMeter 
          complexity={integralDetail.cognitiveComplexity}
          primaryLevel={integralDetail.primaryLevel}
        />
        <RealityTriadVisualization triadMapping={integralDetail.realityTriadMapping} />
      </div>

      {/* Development Timeline */}
      <SpiralDynamicsTimeline 
        primaryLevel={integralDetail.primaryLevel}
        secondaryLevel={integralDetail.secondaryLevel}
        developmentalEdge={integralDetail.developmentalEdge}
      />
    </div>
  );
};