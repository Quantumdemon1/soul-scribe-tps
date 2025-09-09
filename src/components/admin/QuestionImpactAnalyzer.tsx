import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTPSScoring } from '@/utils/enhancedTPSScoring';
import { TPS_QUESTIONS } from '@/data/questions';
import { useToast } from '@/hooks/use-toast';

interface QuestionImpactAnalyzerProps {
  responses: number[];
}

export function QuestionImpactAnalyzer({ responses }: QuestionImpactAnalyzerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runImpactAnalysis = async (questionIndex: number) => {
    if (responses.length !== 108) {
      toast({
        title: "Invalid Data",
        description: "Need complete 108 responses for analysis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = EnhancedTPSScoring.analyzeQuestionImpact(responses, questionIndex);
      setAnalysisResult(result);
      setSelectedQuestion(questionIndex);
      
      toast({
        title: "Analysis Complete",
        description: `Impact analysis for Q${questionIndex + 1} completed`,
      });
    } catch (error) {
      console.error('Impact analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to run question impact analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runThresholdSensitivity = async () => {
    if (responses.length !== 108) {
      toast({
        title: "Invalid Data",
        description: "Need complete 108 responses for sensitivity analysis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = EnhancedTPSScoring.analyzeThresholdSensitivity(responses);
      setAnalysisResult({ ...result, type: 'threshold' });
      
      toast({
        title: "Sensitivity Analysis Complete",
        description: "Threshold sensitivity analysis completed",
      });
    } catch (error) {
      console.error('Threshold analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to run threshold sensitivity analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Impact & Sensitivity Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Question Number (1-108)</label>
              <Input
                type="number"
                min={1}
                max={108}
                value={selectedQuestion + 1}
                onChange={(e) => setSelectedQuestion(Math.max(0, Math.min(107, parseInt(e.target.value) - 1 || 0)))}
                placeholder="Enter question number"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => runImpactAnalysis(selectedQuestion)}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Question Impact'}
              </Button>
              <Button 
                variant="outline"
                onClick={runThresholdSensitivity}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Threshold Sensitivity'}
              </Button>
            </div>
          </div>

          {TPS_QUESTIONS[selectedQuestion] && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-1">Q{selectedQuestion + 1}</div>
              <div className="text-sm text-muted-foreground">{TPS_QUESTIONS[selectedQuestion]}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Current response: {responses[selectedQuestion] || 'Not answered'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              {analysisResult.type === 'threshold' ? 'Threshold Sensitivity Results' : `Impact Analysis - Q${selectedQuestion + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult.type === 'threshold' ? (
              <Tabs defaultValue="mbti" className="w-full">
                <TabsList>
                  <TabsTrigger value="mbti">MBTI Thresholds</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mbti" className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(analysisResult.sensitivityReport.mbti).map(([dimension, data]: [string, any]) => (
                      <div key={dimension} className="p-3 border rounded-lg">
                        <div className="font-medium mb-2">{dimension} Dimension</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Current threshold: {data.currentThreshold}
                        </div>
                        <div className="text-xs">
                          Alternative thresholds tested: {data.alternativeResults.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="summary">
                  <div className="space-y-3">
                    <div className="text-sm">
                      Current MBTI Type: <Badge>{analysisResult.currentProfile.mappings.mbti}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Threshold sensitivity analysis shows how changes to MBTI dimension thresholds would affect classification.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs defaultValue="changes" className="w-full">
                <TabsList>
                  <TabsTrigger value="changes">Significant Changes</TabsTrigger>
                  <TabsTrigger value="mbti">MBTI Impact</TabsTrigger>
                  <TabsTrigger value="traits">Trait Changes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="changes" className="space-y-4">
                  <div className="space-y-2">
                    {analysisResult.impactAnalysis.significantChanges.length > 0 ? (
                      analysisResult.impactAnalysis.significantChanges.map((change: string, index: number) => (
                        <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                          {change}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No significant changes detected for this question.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="mbti" className="space-y-4">
                  <div className="text-sm mb-3">
                    Original MBTI: <Badge>{analysisResult.originalProfile.mappings.mbti}</Badge>
                  </div>
                  <div className="space-y-2">
                    {analysisResult.impactAnalysis.mbtiChanges.length > 0 ? (
                      analysisResult.impactAnalysis.mbtiChanges.map((change: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium text-sm">Response Value: {change.value}</div>
                          <div className="text-sm">
                            <Badge variant="outline">{change.from}</Badge> → <Badge>{change.to}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        This question does not cause MBTI type changes.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="traits" className="space-y-4">
                  <div className="grid gap-2">
                    {Object.entries(analysisResult.impactAnalysis.traitChanges).length > 0 ? (
                      Object.entries(analysisResult.impactAnalysis.traitChanges).map(([key, change]: [string, any]) => (
                        <div key={key} className="p-2 border rounded text-sm">
                          <span className="font-medium">{key}:</span> Change of {change.toFixed(3)}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No significant trait changes detected.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}