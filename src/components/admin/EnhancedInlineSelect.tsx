import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EnhancedInlineSelectProps {
  value: string | null;
  options: readonly string[];
  onSave: (value: string | null) => Promise<void>;
  placeholder: string;
  disabled?: boolean;
}

export const EnhancedInlineSelect: React.FC<EnhancedInlineSelectProps> = ({ 
  value, 
  options, 
  onSave, 
  placeholder,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '__NONE__');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const newValue = currentValue === '__NONE__' ? null : currentValue;
      await onSave(newValue);
      setIsEditing(false);
      
      toast({ 
        title: 'Update Successful', 
        description: `${placeholder} updated successfully.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not update override.';
      setError(errorMessage);
      toast({ 
        title: 'Save Failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value || '__NONE__');
    setError(null);
    setIsEditing(false);
  };

  const hasOverride = value !== null;

  if (isEditing && !disabled) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Select value={currentValue} onValueChange={setCurrentValue}>
            <SelectTrigger className="h-6 text-xs min-w-24">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-md z-50">
              <SelectItem value="__NONE__">None</SelectItem>
              {options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-1"
            onClick={handleCancel}
            disabled={saving}
          >
            ✕
          </Button>
        </div>
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-1 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              if (!disabled) {
                setCurrentValue(value || '__NONE__');
                setError(null);
                setIsEditing(true);
              }
            }}
            disabled={disabled}
            className={`text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors min-h-6 w-full ${
              hasOverride ? 'bg-primary/10 border border-primary/20' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {value ? (
              <Badge variant={hasOverride ? "default" : "secondary"} className="text-xs">
                {value}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {disabled 
              ? 'Editing disabled' 
              : hasOverride 
                ? 'Manual override active - click to edit' 
                : 'Click to set override'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};