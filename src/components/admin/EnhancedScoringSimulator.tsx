import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';
import { TPS_QUESTIONS } from '@/data/questions';
import { TPSScoring } from '@/utils/tpsScoring';
import { readLocalOverrides } from '@/services/scoringConfigService';
import { calculateMBTIEnhanced } from '@/mappings/mbti.enhanced';
import { calculateBigFiveEnhanced } from '@/mappings/bigfive.enhanced';
import { calculateEnneagramEnhanced } from '@/mappings/enneagram.enhanced';
import { TrendingUp, AlertCircle, Eye, BarChart3 } from 'lucide-react';

interface ComparisonData {
  before: any;
  after: any;
  changes: string[];
}

export const EnhancedScoringSimulator: React.FC = () => {
  const [responses, setResponses] = useState<number[]>(Array(TPS_QUESTIONS.length).fill(5));
  const [compareMode, setCompareMode] = useState(false);
  const [baselineResults, setBaselineResults] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  
  const overrides = useMemo(() => readLocalOverrides(), []);
  
  const currentResults = useMemo(() => {
    try {
      const scores = TPSScoring.calculateTraitScores(responses);
      const results = {
        scores,
        mbti: calculateMBTIEnhanced(scores),
        bigfive: calculateBigFiveEnhanced(scores),
        enneagram: calculateEnneagramEnhanced(scores),
      };
      
      // Generate diagnostics
      setDiagnostics({
        totalResponses: responses.length,
        averageResponse: (responses.reduce((a, b) => a + b, 0) / responses.length).toFixed(2),
        extremes: {
          high: responses.filter(r => r >= 9).length,
          low: responses.filter(r => r <= 2).length,
        },
        mbtiConfidence: (results.mbti.confidence * 100).toFixed(1),
        strongestTrait: Object.entries(results.scores).sort(([,a], [,b]) => Math.abs(b as number) - Math.abs(a as number))[0],
      });
      
      return results;
    } catch (error) {
      logger.error('Enhanced scoring simulation failed', {
        component: 'EnhancedScoringSimulator',
        action: 'runSimulation'
      }, error as Error);
      return null;
    }
  }, [responses, overrides]);

  const comparison = useMemo((): ComparisonData | null => {
    if (!compareMode || !baselineResults || !currentResults) return null;
    
    const changes: string[] = [];
    
    // MBTI changes
    if (baselineResults.mbti.type !== currentResults.mbti.type) {
      changes.push(`MBTI: ${baselineResults.mbti.type} → ${currentResults.mbti.type}`);
    }
    
    // Enneagram changes
    if (baselineResults.enneagram.type !== currentResults.enneagram.type) {
      changes.push(`Enneagram: Type ${baselineResults.enneagram.type} → Type ${currentResults.enneagram.type}`);
    }
    
    // Big Five significant changes (>1.0 difference)
    Object.entries(currentResults.bigfive.dimensions).forEach(([factor, data]: [string, any]) => {
      const beforeScore = baselineResults.bigfive.dimensions[factor]?.score || 0;
      const diff = Math.abs(data.score - beforeScore);
      if (diff > 1.0) {
        changes.push(`${factor}: ${beforeScore.toFixed(1)} → ${data.score.toFixed(1)} (${diff > 0 ? '+' : ''}${(data.score - beforeScore).toFixed(1)})`);
      }
    });
    
    return {
      before: baselineResults,
      after: currentResults,
      changes,
    };
  }, [compareMode, baselineResults, currentResults]);

  const startComparison = () => {
    setBaselineResults(currentResults);
    setCompareMode(true);
    toast({ title: 'Comparison Started', description: 'Baseline captured. Make changes to see differences.' });
  };

  const loadPreset = (preset: 'extreme-introvert' | 'extreme-extrovert' | 'balanced' | 'decision-maker') => {
    let newResponses: number[];
    
    switch (preset) {
      case 'extreme-introvert':
        newResponses = responses.map((_, i) => {
          // Questions related to extraversion/social energy - respond low
          if ([26, 27, 62, 98].includes(i + 1)) return 2;
          // Questions about independence/solitude - respond high
          if ([3, 4, 20, 56].includes(i + 1)) return 9;
          return Math.floor(Math.random() * 3) + 4; // 4-6 range for others
        });
        break;
      case 'extreme-extrovert':
        newResponses = responses.map((_, i) => {
          // Questions related to extraversion/social energy - respond high
          if ([26, 27, 62, 98].includes(i + 1)) return 9;
          // Questions about independence/solitude - respond low
          if ([3, 4, 20, 56].includes(i + 1)) return 2;
          return Math.floor(Math.random() * 3) + 4; // 4-6 range for others
        });
        break;
      case 'balanced':
        newResponses = Array(TPS_QUESTIONS.length).fill(0).map(() => Math.floor(Math.random() * 3) + 4); // 4-6 range
        break;
      case 'decision-maker':
        newResponses = responses.map((_, i) => {
          // Structure and planning questions - respond high
          if ([1, 8, 38, 74, 110].includes(i + 1)) return 9;
          // Assertiveness questions - respond high
          if ([6, 43, 79, 115].includes(i + 1)) return 9;
          return Math.floor(Math.random() * 4) + 4; // 4-7 range for others
        });
        break;
      default:
        newResponses = [...responses];
    }
    
    setResponses(newResponses);
    toast({ title: 'Preset Loaded', description: `Applied ${preset.replace('-', ' ')} personality preset.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> Enhanced Scoring Simulator
        </h2>
        <div className="flex gap-2">
          {!compareMode ? (
            <Button onClick={startComparison} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" /> Start Comparison
            </Button>
          ) : (
            <Button onClick={() => setCompareMode(false)} variant="outline" size="sm">
              Exit Comparison
            </Button>
          )}
        </div>
      </div>

      {compareMode && comparison && comparison.changes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Changes Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {comparison.changes.map((change, i) => (
                <div key={i} className="text-sm text-amber-800">{change}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: 'extreme-introvert', label: 'Extreme Introvert' },
                { key: 'extreme-extrovert', label: 'Extreme Extrovert' },
                { key: 'balanced', label: 'Balanced Profile' },
                { key: 'decision-maker', label: 'Strong Decision Maker' },
              ].map(preset => (
                <Button
                  key={preset.key}
                  onClick={() => loadPreset(preset.key as any)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {diagnostics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs space-y-1">
                  <div>Avg Response: {diagnostics.averageResponse}</div>
                  <div>Extreme High (9-10): {diagnostics.extremes.high}</div>
                  <div>Extreme Low (1-2): {diagnostics.extremes.low}</div>
                  <div>MBTI Confidence: {diagnostics.mbtiConfidence}%</div>
                  <div>Strongest Trait: {diagnostics.strongestTrait?.[0]} ({diagnostics.strongestTrait?.[1]})</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Response Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Questions (Sample)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-auto">
              {[1, 6, 26, 29, 38, 43, 62, 74, 98, 115].map(qNum => (
                <div key={qNum} className="space-y-1">
                  <div className="text-xs font-medium">Q{qNum}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {TPS_QUESTIONS[qNum - 1].substring(0, 50)}...
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={responses[qNum - 1]}
                    onChange={(e) => {
                      const newResponses = [...responses];
                      newResponses[qNum - 1] = parseInt(e.target.value) || 5;
                      setResponses(newResponses);
                    }}
                    className="h-8"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {currentResults ? (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-primary">{currentResults.mbti.type}</div>
                        <div className="text-xs text-muted-foreground">MBTI Type</div>
                        <div className="text-xs">{(currentResults.mbti.confidence * 100).toFixed(1)}% confidence</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-primary">Type {currentResults.enneagram.type || '?'}</div>
                        <div className="text-xs text-muted-foreground">Enneagram</div>
                        <div className="text-xs">{(currentResults.enneagram.confidence * 100).toFixed(1)}% confidence</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium">Big Five Highlights</div>
                      {Object.entries(currentResults.bigfive.dimensions).slice(0, 3).map(([factor, data]: [string, any]) => (
                        <div key={factor} className="flex justify-between text-xs">
                          <span>{factor}</span>
                          <Badge variant="outline" className="text-xs">
                            {data.score?.toFixed(1) || 'N/A'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="detailed">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detailed Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[400px] overflow-auto">
                    <div className="text-xs font-medium">Trait Scores</div>
                    {Object.entries(currentResults.scores).slice(0, 10).map(([trait, score]) => (
                      <div key={trait} className="flex justify-between text-xs">
                        <span className="truncate">{trait}</span>
                        <span className="ml-2">{(score as number).toFixed(2)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                Error calculating results.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedScoringSimulator;