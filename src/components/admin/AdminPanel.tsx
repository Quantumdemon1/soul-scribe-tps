import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { LLMService } from '@/services/llmService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Database, Brain, BarChart3, Save, RefreshCw, CheckCircle, AlertCircle, Copy, Upload, Download } from 'lucide-react';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { SystemHealth } from '@/components/analytics/SystemHealth';
import { CacheIntegrationTest } from '@/components/test/CacheIntegrationTest';
import { DEFAULT_SYSTEM_PROMPTS } from '@/config/systemPrompts';

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
  systemPrompts: { ...DEFAULT_SYSTEM_PROMPTS }
};

const modelOptions = {
  openai: [
    'gpt-5-2025-08-07',
    'gpt-5-mini-2025-08-07',
    'gpt-5-nano-2025-08-07',
    'gpt-4.1-2025-04-14',
    'o3-2025-04-16',
    'o4-mini-2025-04-16',
    'gpt-4o-mini'
  ],
  anthropic: [
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    'claude-3-5-haiku-20241022',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022'
  ]
};

export const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<keyof typeof DEFAULT_SYSTEM_PROMPTS>('tieBreaking');

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_config')
        .select('config')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data && !error) {
        setConfig(data.config as unknown as LLMConfig);
      } else if (error) {
        console.error('Error loading config:', error);
        toast({
          title: "Configuration Error",
          description: "Failed to load LLM configuration. Using default settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.log('Using default config:', error);
      toast({
        title: "Configuration Warning",
        description: "Using default LLM configuration.",
        variant: "default"
      });
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
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('llm_config')
        .upsert({ 
          id: '00000000-0000-0000-0000-000000000000',
          config: config as any,
          mapping_weights: {} as any
        });

      if (error) throw error;

      setSaveStatus('saved');
      toast({
        title: "Configuration Saved",
        description: "LLM configuration has been updated successfully."
      });
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const testLLM = async () => {
    setLoading(true);
    try {
      const llmService = new LLMService();
      const result = await llmService.callLLM('Test connection. Respond with "Connected successfully."', 'insightGeneration');
      
      setTestResult('✅ Connection successful');
      toast({
        title: "LLM Test Successful",
        description: "Connection and configuration are working properly."
      });
    } catch (error) {
      setTestResult('❌ Connection failed: ' + (error as Error).message);
      toast({
        title: "LLM Test Failed",
        description: "Check your API keys and configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tps-llm-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setConfig(imported);
          setSaveStatus('idle');
          toast({
            title: "Configuration Imported",
            description: "Configuration has been imported successfully."
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid configuration file.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const resetPrompt = () => {
    setConfig({
      ...config,
      systemPrompts: {
        ...config.systemPrompts,
        [selectedPrompt]: DEFAULT_SYSTEM_PROMPTS[selectedPrompt]
      }
    });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(config.systemPrompts[selectedPrompt]);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Manage TPS assessment system configuration</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="llm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cache Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Provider Settings */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Provider Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>LLM Provider</Label>
                    <Select 
                      value={config.provider} 
                      onValueChange={(value: 'openai' | 'anthropic') => 
                        setConfig({...config, provider: value, model: modelOptions[value][0]})
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

                  <div className="space-y-3">
                    <Label>Model</Label>
                    <Select
                      value={config.model}
                      onValueChange={(value) => setConfig({...config, model: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions[config.provider].map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Temperature: {config.temperature}</Label>
                      <span className="text-xs text-muted-foreground">
                        {config.temperature <= 0.3 ? 'Focused' : config.temperature >= 0.7 ? 'Creative' : 'Balanced'}
                      </span>
                    </div>
                    <Slider
                      value={[config.temperature]}
                      onValueChange={([value]) => setConfig({...config, temperature: value})}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.0</span>
                      <span>1.0</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value) || 2000})}
                      min={100}
                      max={8000}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={saveConfig} 
                      disabled={saveStatus === 'saving'} 
                      className="flex-1"
                      variant={saveStatus === 'saved' ? 'default' : 'default'}
                    >
                      {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      {saveStatus === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {saveStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                      {saveStatus === 'idle' && <Save className="w-4 h-4 mr-2" />}
                      {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Config'}
                    </Button>
                    <Button onClick={testLLM} variant="outline" disabled={loading}>
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Test'}
                    </Button>
                  </div>

                  {testResult && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-mono">{testResult}</p>
                    </div>
                  )}

                  {/* Import/Export */}
                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <Button
                        onClick={exportConfig}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <label className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importConfig}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Prompts */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    System Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prompt Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(DEFAULT_SYSTEM_PROMPTS).map((key) => (
                      <Button
                        key={key}
                        variant={selectedPrompt === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPrompt(key as keyof typeof DEFAULT_SYSTEM_PROMPTS)}
                        className="text-xs"
                      >
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">
                        {selectedPrompt.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={copyPrompt}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={resetPrompt}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={config.systemPrompts[selectedPrompt]}
                      onChange={(e) => setConfig({
                        ...config,
                        systemPrompts: {
                          ...config.systemPrompts,
                          [selectedPrompt]: e.target.value
                        }
                      })}
                      className="min-h-[400px] font-mono text-xs leading-relaxed resize-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{config.systemPrompts[selectedPrompt].length} characters</span>
                      <span>{Math.ceil(config.systemPrompts[selectedPrompt].length / 4)} tokens (est.)</span>
                    </div>
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
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
                <TabsTrigger value="system">System Health</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <AnalyticsOverview />
              </TabsContent>
              
              <TabsContent value="system">
                <SystemHealth />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <CacheIntegrationTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};