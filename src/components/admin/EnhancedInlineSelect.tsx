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
  const [currentValue, setCurrentValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newValue = currentValue === '' ? null : currentValue;
      await onSave(newValue);
      setIsEditing(false);
      
      toast({ 
        title: 'Update Successful', 
        description: `${placeholder} updated successfully.`
      });
    } catch (error) {
      toast({ 
        title: 'Save Failed', 
        description: 'Could not update override.', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value || '');
    setIsEditing(false);
  };

  const hasOverride = value !== null;

  if (isEditing && !disabled) {
    return (
      <div className="flex items-center gap-1">
        <Select value={currentValue} onValueChange={setCurrentValue}>
          <SelectTrigger className="h-6 text-xs min-w-24">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
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
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => !disabled && setIsEditing(true)}
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