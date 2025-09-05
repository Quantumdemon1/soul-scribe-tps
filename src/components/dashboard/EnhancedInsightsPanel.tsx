import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Users, Target, Compass, Shield } from 'lucide-react';
import { MBTIDetail, EnneagramDetail, BigFiveDetail, AttachmentStyle, AlignmentDetail, HollandDetail } from '@/types/tps.types';

interface EnhancedInsightsPanelProps {
  mbtiDetail?: MBTIDetail;
  enneagramDetail?: EnneagramDetail;
  bigFiveDetail?: BigFiveDetail;
  attachmentStyle?: AttachmentStyle;
  alignmentDetail?: AlignmentDetail;
  hollandDetail?: HollandDetail;
}

export const EnhancedInsightsPanel: React.FC<EnhancedInsightsPanelProps> = ({
  mbtiDetail,
  enneagramDetail,
  bigFiveDetail,
  attachmentStyle,
  alignmentDetail,
  hollandDetail
}) => {
  if (!mbtiDetail && !enneagramDetail && !bigFiveDetail) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Enhanced insights are being generated. Please retake the assessment for detailed framework analysis.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* MBTI Enhanced Details */}
      {mbtiDetail && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Brain className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">MBTI Cognitive Functions</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(mbtiDetail.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mbtiDetail.preferences).map(([dimension, pref]) => (
                <div key={dimension} className="text-center space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {pref.letter}
                  </Badge>
                  <Progress value={pref.confidence} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(pref.confidence)}% confident
                  </p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Dominant Function</h4>
                <Badge variant="default" className="mr-2">
                  {mbtiDetail.cognitiveFunctions.dominant.function}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Strength: {mbtiDetail.cognitiveFunctions.dominant.strength.toFixed(1)}
                </span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Auxiliary Function</h4>
                <Badge variant="outline" className="mr-2">
                  {mbtiDetail.cognitiveFunctions.auxiliary.function}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Strength: {mbtiDetail.cognitiveFunctions.auxiliary.strength.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enneagram Enhanced Details */}
      {enneagramDetail && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Target className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Enneagram Deep Dive</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(enneagramDetail.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h4 className="font-medium mb-2">Core Type</h4>
                <Badge variant="default" className="text-lg">
                  {enneagramDetail.type}w{enneagramDetail.wing}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Wing influence: {Math.round(enneagramDetail.wingInfluence * 100)}%
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Instinctual Variant</h4>
                <Badge variant="secondary">
                  {enneagramDetail.instinctualVariant.primary}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Secondary: {enneagramDetail.instinctualVariant.secondary}
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-medium mb-2">Health Level</h4>
                <Badge 
                  variant={
                    enneagramDetail.healthLevel === 'healthy' ? 'default' :
                    enneagramDetail.healthLevel === 'average' ? 'secondary' : 'destructive'
                  }
                >
                  {enneagramDetail.healthLevel}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Tritype: {enneagramDetail.tritype}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachment Style */}
      {attachmentStyle && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Heart className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Attachment Style</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(attachmentStyle.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <Badge variant="default" className="text-base mb-2">
                {attachmentStyle.style}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {attachmentStyle.description}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Key Characteristics:</h4>
              <ul className="space-y-1">
                {attachmentStyle.characteristics.slice(0, 3).map((char, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-2 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Big Five Facets */}
      {bigFiveDetail && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Big Five Facet Breakdown</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(bigFiveDetail.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(bigFiveDetail.dimensions).slice(0, 3).map(([dimension, data]) => (
              <div key={dimension} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{dimension}</h4>
                  <Badge variant="outline">
                    {data.score.toFixed(1)}
                  </Badge>
                </div>
                <Progress value={(data.score / 10) * 100} className="h-2" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {Object.entries(data.facets).slice(0, 3).map(([facet, score]) => (
                    <div key={facet} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {facet.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span>{(score as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* D&D Alignment Enhanced */}
      {alignmentDetail && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Alignment Analysis</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(alignmentDetail.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="default" className="text-lg mb-3">
                {alignmentDetail.alignment}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Ethical Axis</h4>
                <Badge variant="secondary" className="mb-2">
                  {alignmentDetail.ethicalAxis.position}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {alignmentDetail.ethicalAxis.reasoning}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Moral Axis</h4>
                <Badge variant="secondary" className="mb-2">
                  {alignmentDetail.moralAxis.position}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {alignmentDetail.moralAxis.reasoning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holland Code Career Insights */}
      {hollandDetail && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Compass className="w-5 h-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Career Preferences</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {Math.round(hollandDetail.confidence)}% confident
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="default" className="text-lg mb-2">
                {hollandDetail.code}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Primary: {hollandDetail.primaryType} | Secondary: {hollandDetail.secondaryType}
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(hollandDetail.types)
                .filter(([, data]) => data.score > 6.0)
                .slice(0, 2)
                .map(([type, data]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{type}</Badge>
                      <span className="text-sm">{data.score.toFixed(1)}/10</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {data.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {data.careerAreas.slice(0, 3).map((career, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {career}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};