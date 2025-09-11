import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface BigFiveEditorProps {
  value: any;
  onSave: (value: BigFiveScores | null) => Promise<void>;
  onCancel: () => void;
}

const BIG_FIVE_TRAITS = {
  openness: 'Openness',
  conscientiousness: 'Conscientiousness', 
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  neuroticism: 'Neuroticism'
} as const;

export const BigFiveEditor: React.FC<BigFiveEditorProps> = ({ value, onSave, onCancel }) => {
  const initialScores: BigFiveScores = value ? {
    openness: value.openness || 50,
    conscientiousness: value.conscientiousness || 50,
    extraversion: value.extraversion || 50,
    agreeableness: value.agreeableness || 50,
    neuroticism: value.neuroticism || 50
  } : {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50
  };

  const [scores, setScores] = useState<BigFiveScores>(initialScores);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTraitChange = (trait: keyof BigFiveScores, value: number[]) => {
    setScores(prev => ({ ...prev, [trait]: value[0] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Validate scores
      const isValid = Object.values(scores).every(score => 
        score >= 0 && score <= 100 && !isNaN(score)
      );
      
      if (!isValid) {
        throw new Error('All scores must be between 0 and 100');
      }
      
      await onSave(scores);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save scores';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear scores';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Edit Big Five Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(BIG_FIVE_TRAITS).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">{label}</Label>
              <Badge variant="outline" className="text-xs">
                {scores[key as keyof BigFiveScores]}
              </Badge>
            </div>
            <Slider
              value={[scores[key as keyof BigFiveScores]]}
              onValueChange={(value) => handleTraitChange(key as keyof BigFiveScores, value)}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        ))}
        
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={saving}
          >
            Clear
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};