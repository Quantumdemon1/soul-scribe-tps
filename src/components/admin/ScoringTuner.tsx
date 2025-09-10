import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { TPSScoring } from '@/utils/tpsScoring';
import { EnhancedTPSScoring } from '@/utils/enhancedTPSScoring';
import { bulkListAssessments, bulkApplyRecalculation } from '@/services/bulkRecalculationService';
import { TPS_QUESTIONS } from '@/data/questions';
import { saveScoringOverrides, loadScoringOverrides, writeLocalOverrides, type ScoringOverrides, type MBTIDimensionKey } from '@/services/scoringConfigService';
import { ScoringValidator, ValidationResult } from '@/utils/scoringValidation';
import { AuditTrailService } from '@/services/auditTrailService';
import { ImpactAssessment } from './ImpactAssessment';
import { SlidersHorizontal, RefreshCw, Save, ListChecks, Calculator, Settings, AlertTriangle } from 'lucide-react';

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
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showImpactAssessment, setShowImpactAssessment] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ScoringOverrides | null>(null);
  // Bulk recalculation state (lightweight, we compute on demand)
  const [recalcRunning, setRecalcRunning] = useState(false);
  const [recalcProcessed, setRecalcProcessed] = useState(0);
  const [recalcUpdated, setRecalcUpdated] = useState(0);
  const [recalcError, setRecalcError] = useState<string | null>(null);

  // Framework weights state (simple flat weight maps)
  const [bigFive, setBigFive] = useState<Record<string, number>>({
    Openness: 1.0, Conscientiousness: 1.0, Extraversion: 1.0, Agreeableness: 1.0, Neuroticism: 1.0
  });
  const [enneagram, setEnneagram] = useState<Record<string, number>>(
    Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`Type ${i + 1}`, 1.0]))
  );
  const [holland, setHolland] = useState<Record<string, number>>({
    Realistic: 1.0, Investigative: 1.0, Artistic: 1.0, Social: 1.0, Enterprising: 1.0, Conventional: 1.0
  });
  const [alignment, setAlignment] = useState<Record<string, Record<string, number>>>(
    { Lawful: { Good: 1.0, Neutral: 1.0, Evil: 1.0 }, Neutral: { Good: 1.0, Neutral: 1.0, Evil: 1.0 }, Chaotic: { Good: 1.0, Neutral: 1.0, Evil: 1.0 } }
  );

  const extractWeights = (fw?: any): Record<string, number> => {
    if (!fw) return {};
    const first = Object.values(fw)[0] as any;
    return first?.traits || {};
  };

  useEffect(() => {
    (async () => {
      const existing = await loadScoringOverrides();
      const baseTraitMappings = TPSScoring.TRAIT_MAPPINGS as Record<string, number[]>;
      setTraitMappings(existing?.traitMappings || baseTraitMappings);
      setMbti(existing?.mbti || DEFAULT_MBTI_WEIGHTS);
      setSelectedTrait(Object.keys(existing?.traitMappings || baseTraitMappings)[0] || '');
      setCurrentConfig(existing || null);
      // hydrate framework weights if present
      const bf = extractWeights(existing?.bigfive);
      if (Object.keys(bf).length) setBigFive(prev => ({ ...prev, ...bf }));
      const en = extractWeights(existing?.enneagram);
      if (Object.keys(en).length) setEnneagram(prev => ({ ...prev, ...en }));
      const ho = extractWeights(existing?.holland);
      if (Object.keys(ho).length) setHolland(prev => ({ ...prev, ...ho }));
      const al = extractWeights(existing?.alignment);
      if (Object.keys(al).length) {
        // try map back into grid if using flattened keys
        const next = { Lawful: { Good: 1.0, Neutral: 1.0, Evil: 1.0 }, Neutral: { Good: 1.0, Neutral: 1.0, Evil: 1.0 }, Chaotic: { Good: 1.0, Neutral: 1.0, Evil: 1.0 } } as Record<string, Record<string, number>>;
        Object.entries(al).forEach(([k, v]) => {
          const [eth, mor] = k.split(/[_\s-]/);
          if (next[eth]?.[mor]) next[eth][mor] = v as number;
        });
        setAlignment(next);
      }
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="weights">MBTI Weights</TabsTrigger>
          <TabsTrigger value="mappings">Question Mappings</TabsTrigger>
          <TabsTrigger value="usage">Question Usage</TabsTrigger>
          <TabsTrigger value="frameworks">All Frameworks</TabsTrigger>
          <TabsTrigger value="recalc">Bulk Recalc</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <CardTitle className="text-sm flex items-center gap-2"><ListChecks className="h-4 w-4" /> Question Browser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search questions..."
                  className="flex-1"
                />
                <select className="px-3 py-2 border rounded-md text-sm">
                  <option value="">All Traits</option>
                  {Object.keys(traitMappings).map(trait => (
                    <option key={trait} value={trait}>{trait}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                <div className="font-medium">Coverage Summary:</div>
                <div>Mapped: {Object.values(questionUsage).length}/{TPS_QUESTIONS.length}</div>
                <div>Unmapped: {TPS_QUESTIONS.length - Object.values(questionUsage).length}</div>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-auto">
                {TPS_QUESTIONS.map((q, i) => {
                  const traits = questionUsage[i+1] || [];
                  const isMapped = traits.length > 0;
                  return (
                    <div key={i} className={`rounded-md border p-3 ${!isMapped ? 'border-amber-200 bg-amber-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium">Q{i+1}: {q}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {isMapped ? (
                              <span className="flex flex-wrap gap-1">
                                {traits.map(trait => (
                                  <span key={trait} className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                                    {trait}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-amber-600">Not mapped to any traits</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {traits.length} trait{traits.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Big Five Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].map((factor) => (
                  <div key={factor} className="grid grid-cols-4 gap-2 items-center">
                    <Label className="col-span-2 text-sm">{factor}</Label>
                    <Input
                      type="number"
                      value={bigFive[factor]}
                      step={0.1}
                      min={0}
                      max={3}
                      onChange={(e) => setBigFive(prev => ({ ...prev, [factor]: parseFloat(e.target.value) || 0 }))}
                      className="col-span-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Enneagram Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({length: 9}, (_, i) => i + 1).map((type) => (
                  <div key={type} className="grid grid-cols-4 gap-2 items-center">
                    <Label className="col-span-2 text-sm">Type {type}</Label>
                    <Input
                      type="number"
                      value={enneagram[`Type ${type}`]}
                      step={0.1}
                      min={0}
                      max={3}
                      onChange={(e) => setEnneagram(prev => ({ ...prev, [`Type ${type}`]: parseFloat(e.target.value) || 0 }))}
                      className="col-span-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Holland Code Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'].map((type) => (
                  <div key={type} className="grid grid-cols-4 gap-2 items-center">
                    <Label className="col-span-2 text-sm">{type}</Label>
                    <Input
                      type="number"
                      value={holland[type]}
                      step={0.1}
                      min={0}
                      max={3}
                      onChange={(e) => setHolland(prev => ({ ...prev, [type]: parseFloat(e.target.value) || 0 }))}
                      className="col-span-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alignment Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Lawful', 'Neutral', 'Chaotic'].map((ethical) => (
                  <div key={ethical} className="space-y-2">
                    <Label className="text-xs font-medium">{ethical} Axis</Label>
                    {['Good', 'Neutral', 'Evil'].map((moral) => (
                      <div key={`${ethical}-${moral}`} className="grid grid-cols-4 gap-2 items-center">
                        <Label className="col-span-2 text-sm">{moral}</Label>
                        <Input
                          type="number"
                          value={alignment[ethical][moral]}
                          step={0.1}
                          min={0}
                          max={3}
                          onChange={(e) => setAlignment(prev => ({
                            ...prev,
                            [ethical]: { ...prev[ethical], [moral]: parseFloat(e.target.value) || 0 }
                          }))}
                          className="col-span-2"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                setLoading(true);
                const flattenAlignment: Record<string, number> = {};
                Object.entries(alignment).forEach(([eth, row]) => {
                  Object.entries(row).forEach(([mor, val]) => {
                    flattenAlignment[`${eth}_${mor}`] = val;
                  });
                });
                const toFW = (traits: Record<string, number>) => ({ weights: { traits } });
                const payload: ScoringOverrides = {
                  bigfive: toFW(bigFive) as any,
                  enneagram: toFW(enneagram) as any,
                  holland: toFW(holland) as any,
                  alignment: toFW(flattenAlignment) as any,
                } as any;
                try {
                  await saveScoringOverrides(payload);
                  // merge local overrides
                  const merged = { ...(currentConfig || {}), ...payload } as ScoringOverrides;
                  writeLocalOverrides(merged);
                  toast({ title: 'Saved', description: 'Framework weights saved.', variant: 'default' });
                } catch (e) {
                  toast({ title: 'Save failed', description: 'Could not save framework weights.', variant: 'destructive' });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Save className="h-4 w-4 mr-2" /> Save Framework Weights
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recalc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bulk Recalculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Since (optional)</Label>
                  <Input type="datetime-local" id="recalc-since" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Variant</Label>
                  <Input placeholder="full (optional)" id="recalc-variant" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Batch size</Label>
                  <Input type="number" defaultValue={200} min={50} max={1000} step={50} id="recalc-batch" />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" id="recalc-dry" /> Dry run
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={recalcRunning}
                  onClick={async () => {
                    const sinceEl = document.getElementById('recalc-since') as HTMLInputElement | null;
                    const variantEl = document.getElementById('recalc-variant') as HTMLInputElement | null;
                    const batchEl = document.getElementById('recalc-batch') as HTMLInputElement | null;
                    const dryEl = document.getElementById('recalc-dry') as HTMLInputElement | null;
                    const since = sinceEl?.value ? new Date(sinceEl.value).toISOString() : null;
                    const variant = variantEl?.value?.trim() || null;
                    const batch = Math.min(1000, Math.max(50, parseInt(batchEl?.value || '200')));
                    const dryRun = !!dryEl?.checked;
                    try {
                      let offset = 0;
                      let totalProcessed = 0;
                      let operationId: string | null = null;
                      let updatedCount = 0;
                      let batchNum = 1;
                      const start = Date.now();
                      // eslint-disable-next-line no-constant-condition
                      while (true) {
                        const res = await bulkListAssessments({ offset, limit: batch, since, variant });
                        const items = res.items || [];
                        if (!items.length) break;
                        const updates = items.map((it) => {
                          const responses = (it.responses || []) as number[];
                          const newProfile = EnhancedTPSScoring.generateEnhancedProfile(responses);
                          return { id: it.id, oldProfile: it.profile, newProfile };
                        });
                        if (!dryRun) {
                          const apply = await bulkApplyRecalculation({ items: updates, operationId, dryRun });
                          operationId = apply.operationId;
                          updatedCount += apply.success || 0;
                        }
                        totalProcessed += items.length;
                        offset += items.length;
                        toast({ title: `Batch ${batchNum++} processed`, description: `${totalProcessed} items scanned${dryRun ? '' : `, ${updatedCount} updated`}` });
                        if (!res.nextOffset || items.length < batch) break;
                      }
                      const took = Math.round((Date.now()-start)/1000);
                      toast({ title: 'Bulk recalculation completed', description: `${totalProcessed} scanned in ${took}s${dryRun ? ' (dry run)' : `, ${updatedCount} updated`}` });
                    } catch (e: any) {
                      toast({ title: 'Bulk recalculation failed', description: e?.message || 'Unknown error', variant: 'destructive' });
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Run
                </Button>
              </div>
              <Alert>
                <AlertDescription className="text-xs">This will recompute profiles from responses using the current tuner settings. Use Dry run to sample without saving.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Scoring Changes Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              <p>Track all changes to scoring configurations and their impact on results.</p>
              <p>Feature coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScoringTuner;
