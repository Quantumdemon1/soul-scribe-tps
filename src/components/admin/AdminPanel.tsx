import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LLMService } from '@/services/llmService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Database, Brain, BarChart3 } from 'lucide-react';

interface LLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompts: {
    tieBreaking: string;
    insightGeneration: string;
    careerGuidance: string;
    developmentPlanning: string;
  };
}

const defaultConfig: LLMConfig = {
  provider: 'openai',
  model: 'gpt-5-2025-08-07',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompts: {
    tieBreaking: 'You are an expert personality assessment assistant. Help clarify personality trait preferences through thoughtful questions and analysis.',
    insightGeneration: 'You are a personality psychologist. Generate deep, actionable insights about personality patterns and characteristics.',
    careerGuidance: 'You are a career counselor with expertise in personality psychology. Provide specific, practical career guidance.',
    developmentPlanning: 'You are a personal development coach. Create actionable development plans based on personality insights.'
  }
};

export const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_config')
        .select('config')
        .single();
      
      if (data && !error) {
        setConfig(data.config as unknown as LLMConfig);
      }
    } catch (error) {
      console.log('Using default config');
    }
  };

  const loadStats = async () => {
    try {
      const [assessments, insights, sessions] = await Promise.all([
        supabase.from('assessments').select('id').order('created_at', { ascending: false }),
        supabase.from('ai_insights').select('id').order('created_at', { ascending: false }),
        supabase.from('socratic_sessions').select('id').order('created_at', { ascending: false })
      ]);

      setStats({
        totalAssessments: assessments.data?.length || 0,
        totalInsights: insights.data?.length || 0,
        totalSessions: sessions.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('llm_config')
        .upsert({ 
          id: '00000000-0000-0000-0000-000000000000',
          config: config as any,
          mapping_weights: {} as any
        });

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: "LLM configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testLLM = async () => {
    setLoading(true);
    try {
      const llmService = new LLMService();
      const result = await llmService.callLLM('Hello, this is a test.', 'insightGeneration');
      
      toast({
        title: "LLM Test Successful",
        description: "Connection and configuration are working properly."
      });
    } catch (error) {
      toast({
        title: "LLM Test Failed",
        description: "Check your API keys and configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage TPS assessment system configuration</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="llm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              LLM Configuration
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">LLM Provider</Label>
                    <Select 
                      value={config.provider} 
                      onValueChange={(value: 'openai' | 'anthropic') => 
                        setConfig({...config, provider: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={config.model}
                      onChange={(e) => setConfig({...config, model: e.target.value})}
                      placeholder="gpt-5-2025-08-07"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveConfig} disabled={loading} className="flex-1">
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                    <Button onClick={testLLM} variant="outline" disabled={loading}>
                      Test LLM
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tieBreaking">Tie Breaking</Label>
                    <Textarea
                      id="tieBreaking"
                      value={config.systemPrompts.tieBreaking}
                      onChange={(e) => setConfig({
                        ...config,
                        systemPrompts: {...config.systemPrompts, tieBreaking: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insightGeneration">Insight Generation</Label>
                    <Textarea
                      id="insightGeneration"
                      value={config.systemPrompts.insightGeneration}
                      onChange={(e) => setConfig({
                        ...config,
                        systemPrompts: {...config.systemPrompts, insightGeneration: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careerGuidance">Career Guidance</Label>
                    <Textarea
                      id="careerGuidance"
                      value={config.systemPrompts.careerGuidance}
                      onChange={(e) => setConfig({
                        ...config,
                        systemPrompts: {...config.systemPrompts, careerGuidance: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="developmentPlanning">Development Planning</Label>
                    <Textarea
                      id="developmentPlanning"
                      value={config.systemPrompts.developmentPlanning}
                      onChange={(e) => setConfig({
                        ...config,
                        systemPrompts: {...config.systemPrompts, developmentPlanning: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">AI Insights Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalInsights}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Socratic Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics dashboard coming soon. This will include usage statistics, 
                  performance metrics, and user insights.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};