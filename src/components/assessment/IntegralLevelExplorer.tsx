import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, Users, Globe, User } from 'lucide-react';
import { INTEGRAL_LEVELS, IntegralLevel } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';

interface IntegralLevelExplorerProps {
  currentLevel: IntegralLevel;
  personalityProfile?: PersonalityProfile;
  className?: string;
}

export const IntegralLevelExplorer: React.FC<IntegralLevelExplorerProps> = ({
  currentLevel,
  personalityProfile,
  className
}) => {
  const [selectedLevel, setSelectedLevel] = useState<IntegralLevel>(currentLevel);
  
  const allLevels = Object.values(INTEGRAL_LEVELS).map(level => ({
    ...level,
    score: 0,
    confidence: 0
  })).sort((a, b) => a.number - b.number);

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

  const getRealityDominance = (level: IntegralLevel) => {
    // Simplified reality triad mapping based on level characteristics
    if (level.number <= 3) return { dominant: 'Physical', icon: User, percentage: 70 };
    if (level.number <= 6) return { dominant: 'Social', icon: Users, percentage: 65 };
    return { dominant: 'Universal', icon: Globe, percentage: 60 };
  };

  const getPersonalityManifestationExample = (level: IntegralLevel) => {
    if (!personalityProfile?.mappings?.mbti) return null;
    
    const mbtiType = personalityProfile.mappings.mbti;
    const examples: Record<string, Record<string, string>> = {
      'INTJ': {
        'Blue': 'Systematic strategic planning with focus on proven methodologies',
        'Orange': 'Competitive achievement-oriented goal setting and execution',
        'Green': 'Collaborative strategic thinking that considers team dynamics',
        'Yellow': 'Meta-systemic thinking integrating multiple strategic frameworks',
        'Turquoise': 'Holistic strategic vision encompassing global interconnectedness'
      },
      'ENFP': {
        'Blue': 'Enthusiastic support for traditional values and established communities',
        'Orange': 'Energetic pursuit of personal achievement and innovation',
        'Green': 'Passionate advocacy for social causes and community harmony',
        'Yellow': 'Adaptive thinking that synthesizes multiple perspectives flexibly',
        'Turquoise': 'Integral awareness bringing together diverse human potentials'
      }
    };
    
    return examples[mbtiType]?.[level.color];
  };

  const realityDominance = getRealityDominance(selectedLevel);
  const personalityExample = getPersonalityManifestationExample(selectedLevel);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Integral Level Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Level Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Select a level to explore:</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {allLevels.map((level) => (
                <Button
                  key={level.number}
                  variant={selectedLevel.number === level.number ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                  className="h-auto p-2 flex flex-col items-center"
                  style={{
                    backgroundColor: selectedLevel.number === level.number 
                      ? getLevelColor(level.color) 
                      : undefined,
                    color: selectedLevel.number === level.number ? 'white' : undefined,
                    borderColor: currentLevel.number === level.number ? getLevelColor(level.color) : undefined,
                    borderWidth: currentLevel.number === level.number ? '2px' : '1px'
                  }}
                >
                  <span className="text-xs font-bold">{level.number}</span>
                  <span className="text-xs">{level.color}</span>
                  {currentLevel.number === level.number && (
                    <Badge className="mt-1 text-xs" variant="secondary">
                      Your Level
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Level Details */}
          <div className="space-y-6">
            {/* Level Header */}
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: getLevelColor(selectedLevel.color) }}
              >
                {selectedLevel.number}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Level {selectedLevel.number}: {selectedLevel.color}
                </h3>
                <p className="text-lg text-muted-foreground">{selectedLevel.name}</p>
                <p className="text-sm text-muted-foreground">{selectedLevel.cognitiveStage}</p>
              </div>
            </div>

            {/* Detailed Information */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="characteristics">Traits</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Worldview & Thinking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Worldview</h4>
                      <p className="text-sm text-muted-foreground">{selectedLevel.worldview}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Thinking Pattern</h4>
                      <p className="text-sm text-muted-foreground">{selectedLevel.thinkingPattern}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <realityDominance.icon className="w-5 h-5" />
                      Reality Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{realityDominance.dominant} Reality</span>
                        <span className="text-sm text-muted-foreground">{realityDominance.percentage}%</span>
                      </div>
                      <Progress value={realityDominance.percentage} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        Primary focus area at this developmental level
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="characteristics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Characteristics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedLevel.characteristics.map((characteristic, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{characteristic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Typical Concerns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedLevel.typicalConcerns.map((concern, index) => (
                        <Badge key={index} variant="outline">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="growth" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Growth Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedLevel.growthEdge.map((edge, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{edge}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                {personalityExample && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Your Personality Type at This Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          {personalityProfile?.mappings?.mbti} at {selectedLevel.color} Level:
                        </p>
                        <p className="text-sm text-muted-foreground">{personalityExample}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Historical & Cultural Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Societies & Cultures</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedLevel.number <= 2 && (
                            <>
                              <li>• Hunter-gatherer societies</li>
                              <li>• Tribal communities</li>
                            </>
                          )}
                          {selectedLevel.number === 3 && (
                            <>
                              <li>• Feudal kingdoms</li>
                              <li>• Gang territories</li>
                            </>
                          )}
                          {selectedLevel.number === 4 && (
                            <>
                              <li>• Military organizations</li>
                              <li>• Religious institutions</li>
                            </>
                          )}
                          {selectedLevel.number === 5 && (
                            <>
                              <li>• Corporate capitalism</li>
                              <li>• Modern democracies</li>
                            </>
                          )}
                          {selectedLevel.number === 6 && (
                            <>
                              <li>• Social movements</li>
                              <li>• NGOs and nonprofits</li>
                            </>
                          )}
                          {selectedLevel.number >= 7 && (
                            <>
                              <li>• Systems science</li>
                              <li>• Integral communities</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};