import React, { useState } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FrameworkDescriptions } from '../../utils/frameworkDescriptions';
import { ChevronDown, ChevronUp, Star, Users, Brain, Shield } from 'lucide-react';

interface PersonalityTypesProps {
  profile: PersonalityProfile;
}

export const PersonalityTypes: React.FC<PersonalityTypesProps> = ({ profile }) => {
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);
  
  const mbtiDescription = FrameworkDescriptions.getMBTIDescription(profile.mappings.mbti);
  const enneagramDescription = FrameworkDescriptions.getEnneagramDescription(profile.mappings.enneagram);
  const bigFiveDescriptions = FrameworkDescriptions.getBigFiveDescription(profile.mappings.bigFive);
  const alignmentDescription = FrameworkDescriptions.getDnDAlignmentDescription(profile.mappings.dndAlignment);

  const toggleFramework = (framework: string) => {
    setExpandedFramework(expandedFramework === framework ? null : framework);
  };

  return (
    <div className="space-y-6">
      {/* MBTI Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl">MBTI: {profile.mappings.mbti}</h3>
                <p className="text-sm text-muted-foreground font-normal">{mbtiDescription.name}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFramework('mbti')}
            >
              {expandedFramework === 'mbti' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {expandedFramework === 'mbti' && (
          <CardContent className="space-y-4">
            <p className="text-foreground/80">{mbtiDescription.description}</p>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Your Strengths
              </h4>
              <div className="space-y-1">
                {mbtiDescription.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground/70">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Growth Areas</h4>
              <div className="space-y-1">
                {mbtiDescription.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground/70">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Work Style</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">{mbtiDescription.workStyle}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Relationships</h4>
                <p className="text-green-800 dark:text-green-200 text-sm">{mbtiDescription.relationships}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Enneagram Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl">Enneagram: {profile.mappings.enneagram}</h3>
                <p className="text-sm text-muted-foreground font-normal">{enneagramDescription.name}</p>
                <p className="text-xs text-muted-foreground">Wing: {profile.mappings.enneagramDetails.wing} • Tritype: {profile.mappings.enneagramDetails.tritype}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFramework('enneagram')}
            >
              {expandedFramework === 'enneagram' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {expandedFramework === 'enneagram' && (
          <CardContent className="space-y-4">
            <p className="text-foreground/80">{enneagramDescription.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Core Strengths</h4>
                <div className="space-y-1">
                  {enneagramDescription.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Growth Challenges</h4>
                <div className="space-y-1">
                  {enneagramDescription.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Growth Tips</h4>
              <div className="space-y-1">
                {enneagramDescription.growthTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-purple-800 dark:text-purple-200 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Big Five Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl">Big Five Traits</h3>
                <p className="text-sm text-muted-foreground font-normal">Five-Factor Model of Personality</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFramework('bigfive')}
            >
              {expandedFramework === 'bigfive' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {expandedFramework === 'bigfive' && (
          <CardContent>
            <div className="space-y-4">
              {bigFiveDescriptions.map(({ trait, score, description, level }) => (
                <div key={trait} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{trait}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={level === 'High' ? 'default' : level === 'Moderate' ? 'secondary' : 'outline'}>
                        {level}
                      </Badge>
                      <span className="text-sm font-medium">{score.toFixed(1)}/10</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* D&D Alignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl">Moral Alignment: {profile.mappings.dndAlignment}</h3>
                <p className="text-sm text-muted-foreground font-normal">{alignmentDescription.name}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFramework('alignment')}
            >
              {expandedFramework === 'alignment' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {expandedFramework === 'alignment' && (
          <CardContent className="space-y-4">
            <p className="text-foreground/80">{alignmentDescription.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Ethical Strengths</h4>
                <div className="space-y-1">
                  {alignmentDescription.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Potential Challenges</h4>
                <div className="space-y-1">
                  {alignmentDescription.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};