import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { TPS_QUESTIONS } from '@/data/questions';
import { TPSScoring } from '@/utils/tpsScoring';
import { readLocalOverrides } from '@/services/scoringConfigService';
import { calculateMBTIEnhanced } from '@/mappings/mbti.enhanced';
import { calculateBigFiveEnhanced } from '@/mappings/bigfive.enhanced';
import { calculateEnneagramEnhanced } from '@/mappings/enneagram.enhanced';
import { Play, RotateCcw, Calculator, Users } from 'lucide-react';

export const ScoringSimulator: React.FC = () => {
  const [responses, setResponses] = useState<number[]>(Array(TPS_QUESTIONS.length).fill(5));
  const [originalResponses, setOriginalResponses] = useState<number[]>(Array(TPS_QUESTIONS.length).fill(5));
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customUserId, setCustomUserId] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  
  const overrides = useMemo(() => readLocalOverrides(), []);
  
  const simulatedResults = useMemo(() => {
    try {
      const scores = TPSScoring.calculateTraitScores(responses);
      return {
        scores,
        mbti: calculateMBTIEnhanced(scores),
        bigfive: calculateBigFiveEnhanced(scores),
        enneagram: calculateEnneagramEnhanced(scores),
      };
    } catch (error) {
      console.error('Simulation error:', error);
      return null;
    }
  }, [responses, overrides]);

  const handleResponseChange = (questionIndex: number, value: number) => {
    setResponses(prev => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const randomizeResponses = () => {
    if (!showComparison) setOriginalResponses([...responses]);
    const newResponses = Array(TPS_QUESTIONS.length).fill(0).map(() => Math.floor(Math.random() * 10) + 1);
    setResponses(newResponses);
    toast({ title: 'Randomized', description: 'Generated random responses for testing.' });
  };

  const resetToNeutral = () => {
    if (!showComparison) setOriginalResponses([...responses]);
    setResponses(Array(TPS_QUESTIONS.length).fill(5));
    toast({ title: 'Reset', description: 'All responses set to neutral (5).' });
  };
  
  const enableComparison = () => {
    setOriginalResponses([...responses]);
    setShowComparison(true);
    toast({ title: 'Comparison Mode', description: 'Now showing before/after comparison. Make changes to see differences.' });
  };
  
  const originalResults = useMemo(() => {
    if (!showComparison) return null;
    try {
      const scores = TPSScoring.calculateTraitScores(originalResponses);
      return {
        scores,
        mbti: calculateMBTIEnhanced(scores),
        bigfive: calculateBigFiveEnhanced(scores),
        enneagram: calculateEnneagramEnhanced(scores),
      };
    } catch (error) {
      return null;
    }
  }, [originalResponses, showComparison, overrides]);

  const loadUserProfile = async () => {
    if (!customUserId.trim()) {
      toast({ title: 'Invalid Input', description: 'Please enter a User ID.', variant: 'destructive' });
      return;
    }
    
    // Mock loading user responses - in real implementation this would fetch from assessments table
    const mockResponses = Array(TPS_QUESTIONS.length).fill(0).map(() => Math.floor(Math.random() * 6) + 3); // 3-8 range for more realistic responses
    setResponses(mockResponses);
    toast({ title: 'User Profile Loaded', description: `Loaded responses for user ${customUserId}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" /> Scoring Simulator
        </h2>
        <div className="flex gap-2">
          <Button onClick={resetToNeutral} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={randomizeResponses} variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" /> Randomize
          </Button>
          {!showComparison && (
            <Button onClick={enableComparison} variant="outline" size="sm">
              Compare Changes
            </Button>
          )}
          {showComparison && (
            <Button onClick={() => setShowComparison(false)} variant="outline" size="sm">
              Exit Compare
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Load User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter User ID"
                  value={customUserId}
                  onChange={(e) => setCustomUserId(e.target.value)}
                />
                <Button onClick={loadUserProfile} variant="outline" size="sm">
                  Load Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question Responses (1-10 scale)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-auto">
              {TPS_QUESTIONS.map((question, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-center text-xs">
                  <div className="col-span-4 truncate" title={question}>
                    Q{index + 1}: {question}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={responses[index]}
                    onChange={(e) => handleResponseChange(index, parseInt(e.target.value) || 5)}
                    className="col-span-2 h-8"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {simulatedResults ? (
            <Tabs defaultValue="mbti" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mbti">MBTI</TabsTrigger>
                <TabsTrigger value="bigfive">Big Five</TabsTrigger>
                <TabsTrigger value="enneagram">Enneagram</TabsTrigger>
              </TabsList>

              <TabsContent value="mbti">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MBTI Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-center">
                      {simulatedResults.mbti.type}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(simulatedResults.mbti.preferences).map(([dim, data]) => (
                        <div key={dim} className="text-center">
                          <div className="text-xs text-muted-foreground">{dim}</div>
                          <Badge variant="outline" className="text-xs">
                            {data.letter} ({data.strength})
                          </Badge>
                          <div className="text-xs">{data.confidence.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      Confidence: {(simulatedResults.mbti.confidence * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bigfive">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Big Five Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(simulatedResults.bigfive.dimensions).map(([factor, data]: [string, any]) => (
                      <div key={factor} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{factor}</span>
                          <span>{data.score ? data.score.toFixed(1) : 'N/A'}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${data.score ? (data.score / 10) * 100 : 50}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enneagram">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Enneagram Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-center">
                      <div className="text-xl font-bold">Type {simulatedResults.enneagram.type || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">
                        Confidence: {(simulatedResults.enneagram.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>Wing: {simulatedResults.enneagram.wing || 'Unknown'}</div>
                      <div>Tritype: {simulatedResults.enneagram.tritype || 'Unknown'}</div>
                      <div>Health Level: {simulatedResults.enneagram.healthLevel || 'Unknown'}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                Error calculating results. Check console for details.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoringSimulator;