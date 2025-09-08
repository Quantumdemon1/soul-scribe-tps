import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, Lightbulb, ArrowRight } from 'lucide-react';
import { LLMService } from '@/services/llmService';
import { INTEGRAL_LEVELS, calculateIntegralDevelopment, IntegralDetail, IntegralLevel } from '@/mappings/integral.enhanced';
import { logScoringDetails, validateScores, explainScores } from '@/utils/integralValidation';
import { logger } from '@/utils/structuredLogging';

// Helper function to map question level keys to enhanced mapping keys
function mapQuestionKeyToEnhancedKey(questionKey: string): string {
  const mapping: Record<string, string> = {
    'beige': 'beige',
    'purple': 'purple', 
    'red': 'red',
    'blue': 'blue',
    'orange': 'orange',
    'green': 'green',
    'yellow': 'yellow',
    'turquoise': 'turquoise',
    'coral': 'coral'
  };
  return mapping[questionKey] || questionKey;
}


interface IntegralSocraticClarificationProps {
  preliminaryScores: Record<string, number>;
  onComplete: (finalAssessment: IntegralDetail) => void;
  onBack: () => void;
}

export const IntegralSocraticClarification: React.FC<IntegralSocraticClarificationProps> = ({
  preliminaryScores,
  onComplete,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [topLevels, setTopLevels] = useState<IntegralLevel[]>([]);
  
  const llmService = new LLMService();

  useEffect(() => {
    generateClarificationQuestions();
  }, []);

  const generateClarificationQuestions = async () => {
    setIsLoading(true);
    try {
      // Log and validate preliminary scores
      logScoringDetails('Socratic Clarification Started', preliminaryScores);
      const validation = validateScores(preliminaryScores);
      
      if (!validation.isValid) {
        logger.warn('Preliminary integral scores validation failed', { 
          component: 'IntegralSocraticClarification',
          metadata: { issues: validation.issues }
        });
      }
      // Identify top 2-3 levels from preliminary scores
      const levelEntries = Object.entries(preliminaryScores)
        .map(([key, score]) => {
          // Map question level keys to enhanced mapping keys
          const mappedKey = mapQuestionKeyToEnhancedKey(key);
          return {
            key: mappedKey,
            score,
            level: INTEGRAL_LEVELS[mappedKey as keyof typeof INTEGRAL_LEVELS]
          };
        })
        .filter(entry => entry.level) // Remove unmapped entries
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const topLevelsData = levelEntries.map(({ level, score }) => ({
        ...level,
        score,
        confidence: Math.min(100, Math.max(50, (score / Math.max(...Object.values(preliminaryScores))) * 100))
      }));

      setTopLevels(topLevelsData);

      // Generate targeted clarification questions using LLM
      const levelsContext = topLevelsData.map(level => 
        `${level.number} - ${level.color} (${level.name}): Score ${level.score.toFixed(1)}`
      ).join('\n');

      const prompt = `You are an expert in Integral Theory and Spiral Dynamics. Based on these preliminary cognitive development assessment scores, generate 4-5 targeted Socratic questions to help determine the person's definitive Integral Level.

Preliminary Scores:
${levelsContext}

The top contenders are ${topLevelsData[0].color} and ${topLevelsData[1].color} levels.

Generate questions that:
1. Probe specific cognitive patterns characteristic of these levels
2. Explore meta-cognitive awareness and thinking about thinking
3. Test complexity tolerance and paradox comfort
4. Examine perspective-taking abilities and worldview
5. Are conversational and thought-provoking

Each question should help distinguish between the top levels clearly. Focus on HOW they think, not WHAT they think about.

Return only the questions, one per line, numbered 1-5.`;

      const response = await llmService.callLLM(prompt, 'tieBreaking');
      const generatedQuestions = response
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      if (generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
      } else {
        // Fallback to default questions
        setQuestions([
          "Describe a time when you had to make a decision while holding multiple contradictory viewpoints. How did you navigate this?",
          "When you encounter a complex problem, walk me through your typical thinking process from start to finish.",
          "How do you typically respond when someone challenges your fundamental beliefs or worldview?",
          "Describe how you think about your own thinking. Are you aware of your cognitive patterns?",
          "When facing uncertainty, how comfortable are you with not having clear answers or solutions?"
        ]);
      }
    } catch (error) {
      logger.error('Failed to generate clarification questions', {
        component: 'IntegralSocraticClarification',
        action: 'generateQuestions'
      }, error as Error);
      // Use fallback questions
      setQuestions([
        "Describe a time when you had to make a decision while holding multiple contradictory viewpoints. How did you navigate this?",
        "When you encounter a complex problem, walk me through your typical thinking process from start to finish.",
        "How do you typically respond when someone challenges your fundamental beliefs or worldview?",
        "Describe how you think about your own thinking. Are you aware of your cognitive patterns?",
        "When facing uncertainty, how comfortable are you with not having clear answers or solutions?"
      ]);
    }
    setIsLoading(false);
  };

  const handleResponseSubmit = () => {
    if (currentResponse.trim()) {
      const newResponses = [...responses, currentResponse.trim()];
      setResponses(newResponses);
      setCurrentResponse('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, generate final assessment
        generateFinalAssessment(newResponses);
      }
    }
  };

  const generateFinalAssessment = async (allResponses: string[]) => {
    setIsLoading(true);
    try {
      const levelsContext = topLevels.map(level => 
        `Level ${level.number} - ${level.color} (${level.name}): ${INTEGRAL_LEVELS[level.color.toLowerCase() as keyof typeof INTEGRAL_LEVELS]?.worldview || ''}`
      ).join('\n\n');

      const responsesText = questions.map((q, i) => 
        `Q${i+1}: ${q}\nA${i+1}: ${allResponses[i] || 'No response'}`
      ).join('\n\n');

      const prompt = `You are an expert in Integral Theory cognitive development assessment. Analyze these responses to determine the person's definitive Integral Level.

INTEGRAL LEVELS BEING ASSESSED:
${levelsContext}

CLARIFICATION QUESTIONS AND RESPONSES:
${responsesText}

Based on the cognitive patterns, complexity tolerance, meta-cognitive awareness, and thinking styles demonstrated in these responses, determine:

1. The person's primary Integral Level (choose from the assessed levels)
2. Confidence level (0-100) in this assessment
3. Brief reasoning explaining the key indicators that led to this determination

Focus on:
- Cognitive complexity and abstraction level
- Meta-cognitive awareness (thinking about thinking)
- Comfort with paradox and uncertainty
- Perspective-taking abilities
- Problem-solving approaches
- Worldview and value systems expressed

Return your analysis in this JSON format:
{
  "primaryLevel": "${topLevels[0].color}",
  "confidence": 85,
  "reasoning": "Brief explanation of key indicators..."
}

Be definitive in your assessment while acknowledging the confidence level.`;

      const response = await llmService.callLLM(prompt, 'tieBreaking');
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);

          // Map LLM-selected primary level (by color/name) back to our level keys
          const keys = Object.keys(INTEGRAL_LEVELS) as Array<keyof typeof INTEGRAL_LEVELS>;
          const directKey = keys.find(k => k.toLowerCase() === String(analysis.primaryLevel || '').toLowerCase());
          const levelEntries = Object.entries(INTEGRAL_LEVELS);
          const selectedEntry = directKey
            ? [directKey, INTEGRAL_LEVELS[directKey]] as const
            : (
                levelEntries.find(([, lvl]) =>
                  lvl.color.toLowerCase() === String(analysis.primaryLevel || '').toLowerCase() ||
                  lvl.name.toLowerCase() === String(analysis.primaryLevel || '').toLowerCase()
                ) || levelEntries.find(([, lvl]) => lvl.color === topLevels[0].color) || levelEntries[0]
              );

          const selectedKey = selectedEntry[0] as keyof typeof INTEGRAL_LEVELS;

          // Build normalized distributions - map question scores to enhanced keys
          const prelimRaw: Record<string, number> = {};
          keys.forEach(k => { 
            // Find matching question score using reverse mapping
            const questionScore = Object.entries(preliminaryScores).find(([qKey]) => 
              mapQuestionKeyToEnhancedKey(qKey) === k
            )?.[1] || 0;
            prelimRaw[k] = Math.max(0, Number(questionScore)); 
          });
          const prelimSum = Object.values(prelimRaw).reduce((a, b) => a + b, 0);
          const prelim: Record<string, number> = {};
          if (prelimSum > 0) {
            keys.forEach(k => { prelim[k] = prelimRaw[k] / prelimSum; });
          } else {
            const uniform = 1 / keys.length; keys.forEach(k => { prelim[k] = uniform; });
          }

          const socratic: Record<string, number> = {}; keys.forEach(k => { socratic[k] = 0; });
          socratic[selectedKey] = 1;

          // Weighted blend (60% initial, 40% Socratic)
          const combinedRaw: Record<string, number> = {};
          keys.forEach(k => { combinedRaw[k] = 0.6 * prelim[k] + 0.4 * socratic[k]; });
          const combinedSum = Object.values(combinedRaw).reduce((a, b) => a + b, 0) || 1;
          const combined: Record<string, number> = {}; keys.forEach(k => { combined[k] = combinedRaw[k] / combinedSum; });

          // Determine primary/secondary
          const sortedKeys = [...keys].sort((a, b) => combined[b] - combined[a]);
          const primaryKey = sortedKeys[0];
          const secondaryKey = sortedKeys[1];
          const separation = Math.max(0, combined[primaryKey] - combined[secondaryKey]);

          // Build IntegralDetail from distribution
          const basePrimary = INTEGRAL_LEVELS[primaryKey];
          const baseSecondary = INTEGRAL_LEVELS[secondaryKey];
          const llmConfidence = Math.min(100, Math.max(0, Number(analysis.confidence) || 70));
          const primaryConfidence = Math.min(100, Math.round(0.5 * llmConfidence + 0.5 * separation * 100));

          const primaryLevel: IntegralLevel = {
            ...basePrimary,
            score: Math.round(combined[primaryKey] * 1000) / 10,
            confidence: primaryConfidence
          };

          const secondaryLevel: IntegralLevel | undefined = baseSecondary
            ? { ...baseSecondary, score: Math.round(combined[secondaryKey] * 1000) / 10, confidence: Math.max(30, Math.round((1 - separation) * 70)) }
            : undefined;

          const levelComplexity: Record<string, number> = { 
            Beige: 1, Purple: 2, Red: 2, Blue: 3, Orange: 5, Green: 6, Yellow: 8, Turquoise: 9, Coral: 10 
          };
          const cognitiveComplexity = Math.min(10, levelComplexity[basePrimary.color] || 5);

          const realityTriadMapping = {
            physical: Math.round((((combined['beige'] || 0) + (combined['purple'] || 0) + (combined['red'] || 0) + (combined['blue'] || 0)) * 10) * 10) / 10,
            social: Math.round((((combined['orange'] || 0) + (combined['green'] || 0)) * 10) * 10) / 10,
            universal: Math.round((((combined['yellow'] || 0) + (combined['turquoise'] || 0) + (combined['coral'] || 0)) * 10) * 10) / 10
          };

          const developmentalEdge = secondaryLevel && (baseSecondary.number > basePrimary.number)
            ? `Developing toward ${baseSecondary.name}: ${baseSecondary.growthEdge[0]}`
            : `Strengthening current level while preparing for next: ${basePrimary.growthEdge[0]}`;

          const integralDetail: IntegralDetail = {
            primaryLevel,
            secondaryLevel,
            realityTriadMapping,
            cognitiveComplexity,
            developmentalEdge,
            confidence: primaryConfidence
          };

          // Log final assessment details
          logScoringDetails('Socratic Assessment Complete', preliminaryScores, combined);
          logger.info('Final assessment completed', {
            component: 'IntegralSocraticClarification',
            action: 'finalAssessment',
            metadata: { 
              primaryLevel: `${primaryLevel.number} - ${primaryLevel.color}`,
              confidence: primaryConfidence,
              reasoning: 'LLM-guided assessment'
            }
          });

          onComplete(integralDetail);
        } else {
          throw new Error('No valid JSON in response');
        }
      } catch (parseError) {
        logger.error('Failed to parse LLM assessment response', {
          component: 'IntegralSocraticClarification',
          action: 'parseAssessment'
        }, parseError as Error);
        // Fallback: use only preliminary distribution - map question scores to enhanced keys
        const keys = Object.keys(INTEGRAL_LEVELS) as Array<keyof typeof INTEGRAL_LEVELS>;
        const prelimRaw: Record<string, number> = {};
        keys.forEach(k => { 
          const questionScore = Object.entries(preliminaryScores).find(([qKey]) => 
            mapQuestionKeyToEnhancedKey(qKey) === k
          )?.[1] || 0;
          prelimRaw[k] = Math.max(0, Number(questionScore)); 
        });
        const sum = Object.values(prelimRaw).reduce((a, b) => a + b, 0) || 1;
        const dist: Record<string, number> = {}; keys.forEach(k => { dist[k] = prelimRaw[k] / sum; });
        const sorted = [...keys].sort((a, b) => dist[b] - dist[a]);
        const primaryKey = sorted[0]; const secondaryKey = sorted[1];
        const basePrimary = INTEGRAL_LEVELS[primaryKey]; const baseSecondary = INTEGRAL_LEVELS[secondaryKey];
        const separation = Math.max(0, dist[primaryKey] - dist[secondaryKey]);
        const primaryLevel: IntegralLevel = { ...basePrimary, score: Math.round(dist[primaryKey] * 1000) / 10, confidence: Math.round(separation * 100) };
        const secondaryLevel: IntegralLevel | undefined = baseSecondary ? { ...baseSecondary, score: Math.round(dist[secondaryKey] * 1000) / 10, confidence: Math.max(30, Math.round((1 - separation) * 70)) } : undefined;
        const levelComplexity: Record<string, number> = { 
          Beige: 1, Purple: 2, Red: 2, Blue: 3, Orange: 5, Green: 6, Yellow: 8, Turquoise: 9, Coral: 10 
        };
        const cognitiveComplexity = Math.min(10, levelComplexity[basePrimary.color] || 5);
        const realityTriadMapping = {
          physical: Math.round((((dist['beige'] || 0) + (dist['purple'] || 0) + (dist['red'] || 0) + (dist['blue'] || 0)) * 10) * 10) / 10,
          social: Math.round((((dist['orange'] || 0) + (dist['green'] || 0)) * 10) * 10) / 10,
          universal: Math.round((((dist['yellow'] || 0) + (dist['turquoise'] || 0) + (dist['coral'] || 0)) * 10) * 10) / 10
        };
        const developmentalEdge = secondaryLevel && (baseSecondary.number > basePrimary.number)
          ? `Developing toward ${baseSecondary.name}: ${baseSecondary.growthEdge[0]}`
          : `Strengthening current level while preparing for next: ${basePrimary.growthEdge[0]}`;
        const integralDetail: IntegralDetail = { primaryLevel, secondaryLevel, realityTriadMapping, cognitiveComplexity, developmentalEdge, confidence: primaryLevel.confidence };
        onComplete(integralDetail);
      }
    } catch (error) {
      logger.error('Failed to generate final assessment', {
        component: 'IntegralSocraticClarification',
        action: 'generateFinalAssessment'
      }, error as Error);
      // Fallback to calculated assessment
      const integralDetail = calculateIntegralDevelopment(preliminaryScores);
      onComplete(integralDetail);
    }
    setIsLoading(false);
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-primary mx-auto animate-pulse" />
              <h3 className="text-lg font-semibold">Generating Clarification Questions</h3>
              <p className="text-sm text-muted-foreground">
                Creating personalized questions based on your preliminary assessment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 md:w-12 md:h-12 text-primary mr-2 md:mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Enhanced Clarification
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 px-4">
            AI-guided questions to refine your cognitive development assessment
          </p>
          
          {/* Progress */}
          <div className="mb-4 md:mb-6 px-4">
            <div className="flex justify-between text-xs md:text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Top Levels Preview */}
        <Card className="mb-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Preliminary Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your initial responses, you're likely at one of these cognitive development levels:
            </p>
            <div className="flex flex-wrap gap-3">
              {topLevels.slice(0, 3).map((level, index) => (
                <Badge 
                  key={level.color} 
                  variant={index === 0 ? "default" : "outline"}
                  className="text-sm py-1 px-3"
                  style={index === 0 ? { backgroundColor: `var(--${level.color.toLowerCase()})` } : {}}
                >
                  Level {level.number} - {level.color} ({level.name})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {questions.length > 0 && (
          <Card className="mb-6 md:mb-8 mx-4 md:mx-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl flex items-start gap-2 md:gap-3">
                <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold text-primary">
                  {currentQuestionIndex + 1}
                </span>
                <span className="flex-1 text-base md:text-xl">{questions[currentQuestionIndex]}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Take your time to reflect deeply on this question. There are no right or wrong answers - 
                we're interested in how you think and approach complex situations.
              </p>
              
              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Share your thoughts in detail..."
                className="min-h-24 md:min-h-32 resize-none text-sm md:text-base"
                disabled={isLoading}
              />
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 md:pt-4">
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  disabled={isLoading}
                  size="sm"
                  className="w-full sm:w-auto text-sm"
                >
                  Back to Assessment
                </Button>
                
                <Button 
                  onClick={handleResponseSubmit}
                  disabled={!currentResponse.trim() || isLoading}
                  className="flex items-center gap-2 w-full sm:w-auto text-sm"
                  size="sm"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    'Complete Assessment'
                  ) : (
                    <>Next Question <ArrowRight className="w-3 h-3 md:w-4 md:h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Responses Summary */}
        {responses.length > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Your Previous Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.map((response, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-primary mb-1">
                      Q{index + 1}: {questions[index]}
                    </div>
                    <div className="text-muted-foreground pl-4 border-l-2 border-muted">
                      {response}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};