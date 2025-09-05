import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Info } from 'lucide-react';
import { PersonalityArchetype } from '@/types/tps.types';
import { HelpTooltip } from '@/components/ui/help-tooltip';

interface PersonalityMatchesProps {
  matches: PersonalityArchetype[];
}

export const PersonalityMatches: React.FC<PersonalityMatchesProps> = ({ matches }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedMatches = showAll ? matches : matches.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personality Matches
          <HelpTooltip content="These are historical figures and fictional characters who share similar personality traits with you, based on your assessment results." />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover historical figures and fictional characters who share your personality traits. 
          These matches are based on detailed trait analysis and can offer insights into your unique personality expression.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMatches.map((match, index) => (
            <div key={index} className="group p-5 rounded-lg border bg-card hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-base mb-1">{match.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={match.type === 'real' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {match.type === 'real' ? 'Historical' : 'Fictional'}
                    </Badge>
                    {match.confidence && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Match:</span>
                        <span className="text-xs font-medium">{match.confidence}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Similarity</span>
                  <span className="text-xs font-medium">
                    {Math.round(Math.min(match.similarity * 100, 100))}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(match.similarity * 100, 100)} 
                  className="h-2"
                />
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {match.description}
              </p>
              
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Based on trait similarity analysis</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!showAll && matches.length > 6 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(true)}
              className="w-full md:w-auto"
            >
              Show All {matches.length} Matches
            </Button>
          </div>
        )}
        
        {showAll && matches.length > 6 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(false)}
              className="w-full md:w-auto"
            >
              Show Less
            </Button>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h5 className="font-medium mb-2 text-sm">Understanding Your Matches</h5>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• <strong>Historical:</strong> Real people from history who exhibited similar personality patterns</p>
            <p>• <strong>Fictional:</strong> Well-developed characters who demonstrate comparable traits</p>
            <p>• <strong>Similarity Score:</strong> Calculated based on weighted trait analysis across multiple dimensions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};