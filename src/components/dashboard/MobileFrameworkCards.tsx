import React, { useState } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MobileFrameworkCardsProps {
  profile: PersonalityProfile;
}

export const MobileFrameworkCards: React.FC<MobileFrameworkCardsProps> = ({ profile }) => {
  const isMobile = useIsMobile();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (!isMobile) {
    // Desktop layout - original grid
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Personality Framework Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-2">MBTI Type</h3>
              <p className="text-xs text-muted-foreground mb-3">Your personality preferences in how you interact, process information, make decisions, and approach life</p>
              <Badge variant="default" className="text-lg px-4 py-2">
                {profile.mappings.mbti}
              </Badge>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-2">Enneagram</h3>
              <p className="text-xs text-muted-foreground mb-3">Your core motivation, fears, and behavioral patterns based on nine fundamental personality types</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {profile.mappings.enneagram}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Tritype: {profile.mappings.enneagramDetails.tritype}
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-2">Socionics</h3>
              <p className="text-xs text-muted-foreground mb-3">How you process and exchange information with others, based on cognitive functions and social dynamics</p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {profile.mappings.socionics}
              </Badge>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-2">Holland Code</h3>
              <p className="text-xs text-muted-foreground mb-3">Your career interests and work environment preferences across six occupational themes</p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {profile.mappings.hollandCode}
              </Badge>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-2">D&D Alignment</h3>
              <p className="text-xs text-muted-foreground mb-3">Your ethical and moral compass, measuring your approach to rules and concern for others</p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {profile.mappings.dndAlignment}
              </Badge>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-muted-foreground mb-4">Big Five</h3>
              <p className="text-xs text-muted-foreground mb-3">Your personality across five major dimensions that influence behavior and thinking patterns</p>
              <div className="space-y-3">
                {Object.entries(profile.mappings.bigFive).map(([trait, score]) => (
                  <div key={trait} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{trait}</span>
                      <span className="font-semibold">{score.toFixed(1)}</span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile layout - stack cards with collapsible content
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4 px-4">
        <Target className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Framework Correlations</h2>
      </div>

      {/* MBTI Card */}
      <Card className="mx-4">
        <Collapsible 
          open={expandedCards.mbti} 
          onOpenChange={() => toggleCard('mbti')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-sm px-3 py-1">
                  {profile.mappings.mbti}
                </Badge>
                <span className="font-medium">MBTI Type</span>
              </div>
              {expandedCards.mbti ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">
                Your personality preferences in how you interact, process information, make decisions, and approach life
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Enneagram Card */}
      <Card className="mx-4">
        <Collapsible 
          open={expandedCards.enneagram} 
          onOpenChange={() => toggleCard('enneagram')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {profile.mappings.enneagram}
                </Badge>
                <span className="font-medium">Enneagram</span>
              </div>
              {expandedCards.enneagram ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Your core motivation, fears, and behavioral patterns based on nine fundamental personality types
              </p>
              <div className="text-xs text-muted-foreground">
                Tritype: {profile.mappings.enneagramDetails.tritype}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Big Five Card */}
      <Card className="mx-4">
        <Collapsible 
          open={expandedCards.bigfive} 
          onOpenChange={() => toggleCard('bigfive')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Big Five
                </Badge>
                <span className="font-medium">Personality Dimensions</span>
              </div>
              {expandedCards.bigfive ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Your personality across five major dimensions that influence behavior and thinking patterns
              </p>
              {Object.entries(profile.mappings.bigFive).map(([trait, score]) => (
                <div key={trait} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{trait}</span>
                    <span className="font-semibold">{score.toFixed(1)}</span>
                  </div>
                  <Progress value={score * 10} className="h-2" />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Other frameworks - collapsed by default */}
      <Card className="mx-4">
        <Collapsible 
          open={expandedCards.other} 
          onOpenChange={() => toggleCard('other')}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer">
              <span className="font-medium">Other Frameworks</span>
              {expandedCards.other ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Socionics */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Socionics</span>
                  <Badge variant="outline" className="text-sm">
                    {profile.mappings.socionics}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  How you process and exchange information with others
                </p>
              </div>

              {/* Holland Code */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Holland Code</span>
                  <Badge variant="secondary" className="text-sm">
                    {profile.mappings.hollandCode}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your career interests and work environment preferences
                </p>
              </div>

              {/* D&D Alignment */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">D&D Alignment</span>
                  <Badge variant="outline" className="text-sm">
                    {profile.mappings.dndAlignment}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your ethical and moral compass
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
