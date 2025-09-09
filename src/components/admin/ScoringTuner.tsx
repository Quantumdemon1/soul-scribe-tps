import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { TPSScoring } from '@/utils/tpsScoring';
import { TPS_QUESTIONS } from '@/data/questions';
import { saveScoringOverrides, loadScoringOverrides, writeLocalOverrides, type ScoringOverrides, type MBTIDimensionKey } from '@/services/scoringConfigService';
import { SlidersHorizontal, RefreshCw, Save, ListChecks } from 'lucide-react';

const DEFAULT_MBTI_WEIGHTS: Record<MBTIDimensionKey, { traits: Record<string, number>; threshold?: number }> = {
  EI: { traits: { 'Communal Navigate': 0.35, 'Dynamic': 0.35, 'Assertive': 0.15, 'Direct': 0.15 }, threshold: 5 },
  SN: { traits: { 'Intuitive': 0.40, 'Universal': 0.30, 'Varied': 0.15, 'Self-Aware': 0.15 }, threshold: 5 },
  TF: { traits: { 'Analytical': 0.35, 'Stoic': 0.25, 'Direct': 0.20, 'Pragmatic': 0.20 }, threshold: 5 },
  JP: { traits: { 'Structured': 0.35, 'Lawful': 0.25, 'Self-Mastery': 0.20, 'Assertive': 0.20 }, threshold: 5 },
};

export const ScoringTuner: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mbti, setMbti] = useState(DEFAULT_MBTI_WEIGHTS);
  const [traitMappings, setTraitMappings] = useState<Record<string, number[]>>({});
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [newIndex, setNewIndex] = useState<string>('');

  useEffect(() => {
    (async () => {
      const existing = await loadScoringOverrides();
      const baseTraitMappings = TPSScoring.TRAIT_MAPPINGS as Record<string, number[]>;
      setTraitMappings(existing?.traitMappings || baseTraitMappings);
      setMbti(existing?.mbti || DEFAULT_MBTI_WEIGHTS);
      setSelectedTrait(Object.keys(existing?.traitMappings || baseTraitMappings)[0] || '');
      setLoading(false);
    })();
  }, []);

  const questionUsage = useMemo(() => {
    const usage: Record<number, string[]> = {};
    Object.entries(traitMappings).forEach(([trait, indices]) => {
      indices.forEach((i) => {
        if (!usage[i]) usage[i] = [];
        usage[i].push(trait);
      });
    });
    return usage;
  }, [traitMappings]);

  const handleWeightChange = (dim: MBTIDimensionKey, trait: string, value: number) => {
    setMbti((prev) => ({
      ...prev,
      [dim]: { ...prev[dim], traits: { ...prev[dim].traits, [trait]: value } }
    }));
  };

  const handleThresholdChange = (dim: MBTIDimensionKey, value: number) => {
    setMbti((prev) => ({
      ...prev,
      [dim]: { ...prev[dim], threshold: value }
    }));
  };

  const addIndexToTrait = () => {
    const idx = parseInt(newIndex, 10);
    if (isNaN(idx) || idx < 1 || idx > TPS_QUESTIONS.length) {
      toast({ title: 'Invalid index', description: `Enter a number between 1 and ${TPS_QUESTIONS.length}`, variant: 'destructive' });
      return;
    }
    if (!selectedTrait) return;
    setTraitMappings((prev) => ({
      ...prev,
      [selectedTrait]: Array.from(new Set([...(prev[selectedTrait] || []), idx])).sort((a, b) => a - b)
    }));
    setNewIndex('');
  };

  const removeIndexFromTrait = (idx: number) => {
    if (!selectedTrait) return;
    setTraitMappings((prev) => ({
      ...prev,
      [selectedTrait]: (prev[selectedTrait] || []).filter((i) => i !== idx)
    }));
  };

  const saveAll = async () => {
    setLoading(true);
    const payload: ScoringOverrides = { traitMappings, mbti };
    try {
      await saveScoringOverrides(payload);
      writeLocalOverrides(payload);
      toast({ title: 'Saved', description: 'Scoring overrides saved and applied.', variant: 'default' });
    } catch (e) {
      toast({ title: 'Save failed', description: 'Could not save overrides.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetDefaults = () => {
    setTraitMappings(TPSScoring.TRAIT_MAPPINGS as Record<string, number[]>);
    setMbti(DEFAULT_MBTI_WEIGHTS);
    toast({ title: 'Reset', description: 'Reverted to default mappings and weights.' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading scoring tuner...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" /> Scoring & Mapping Tuner
        </h2>
        <div className="flex gap-2">
          <Button onClick={resetDefaults} variant="outline" size="sm">
            Reset
          </Button>
          <Button onClick={saveAll} size="sm">
            <Save className="h-4 w-4 mr-2" /> Save & Apply
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weights">MBTI Weights</TabsTrigger>
          <TabsTrigger value="mappings">Question Mappings</TabsTrigger>
          <TabsTrigger value="usage">Question Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['EI','SN','TF','JP'] as MBTIDimensionKey[]).map((dim) => (
              <Card key={dim}>
                <CardHeader>
                  <CardTitle className="text-sm">{dim} Weights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(mbti[dim].traits).map(([trait, weight]) => (
                    <div key={trait} className="grid grid-cols-5 gap-2 items-center">
                      <Label className="col-span-3 text-sm truncate" title={trait}>{trait}</Label>
                      <Input
                        type="number"
                        value={weight}
                        step={0.05}
                        min={0}
                        max={2}
                        onChange={(e) => handleWeightChange(dim, trait, parseFloat(e.target.value))}
                        className="col-span-2"
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-5 gap-2 items-center pt-2 border-t">
                    <Label className="col-span-3 text-sm">Threshold</Label>
                    <Input
                      type="number"
                      value={mbti[dim].threshold ?? 5}
                      step={0.1}
                      min={1}
                      max={9}
                      onChange={(e) => handleThresholdChange(dim, parseFloat(e.target.value))}
                      className="col-span-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Tip: Weights influence the side chosen when the weighted average crosses the threshold (default 5.0).</p>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Edit Trait Question Mappings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Traits</Label>
                  <div className="max-h-[360px] overflow-auto border rounded-md">
                    {Object.keys(traitMappings).map((trait) => (
                      <button
                        key={trait}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${selectedTrait===trait ? 'bg-muted' : ''}`}
                        onClick={() => setSelectedTrait(trait)}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{selectedTrait || 'Select a trait'}</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add question # (1-125)"
                        value={newIndex}
                        onChange={(e) => setNewIndex(e.target.value)}
                        className="w-40"
                      />
                      <Button onClick={addIndexToTrait} variant="outline" size="sm">Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[420px] overflow-auto">
                    {(traitMappings[selectedTrait] || []).map((idx) => (
                      <div key={idx} className="flex items-start justify-between rounded-md border p-2">
                        <div>
                          <div className="text-sm font-medium">Q{idx}: {TPS_QUESTIONS[idx-1]}</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeIndexFromTrait(idx)}>Remove</Button>
                      </div>
                    ))}
                    {(!traitMappings[selectedTrait] || traitMappings[selectedTrait].length===0) && (
                      <div className="text-sm text-muted-foreground">No questions mapped.</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4" /> Question Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-auto">
              {TPS_QUESTIONS.map((q, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="text-sm font-medium">Q{i+1}: {q}</div>
                  <div className="text-xs text-muted-foreground mt-1">Traits: {(questionUsage[i+1] || []).join(', ') || '—'}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScoringTuner;
