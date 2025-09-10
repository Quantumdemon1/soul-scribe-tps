import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Trash2, Edit } from 'lucide-react';
import { FRAMEWORK_OPTIONS, bulkUpdateOverrides, bulkClearOverrides } from '@/services/userManagementService';

interface BulkOperationsPanelProps {
  selectedUserIds: string[];
  onComplete: () => void;
}

const FRAMEWORK_LABELS = {
  mbti_type: 'MBTI Type',
  enneagram_type: 'Enneagram Type',
  holland_code: 'Holland Code',
  alignment: 'Alignment',
  socionics_type: 'Socionics Type',
  integral_level: 'Integral Level',
  attachment_style: 'Attachment Style'
} as const;

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({ 
  selectedUserIds, 
  onComplete 
}) => {
  const [operation, setOperation] = useState<'update' | 'clear' | ''>('');
  const [framework, setFramework] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBulkUpdate = async () => {
    if (!framework || !value) return;
    
    setLoading(true);
    try {
      const result = await bulkUpdateOverrides(
        selectedUserIds, 
        framework, 
        value === 'none' ? null : value
      );
      
      toast({
        title: 'Bulk Update Complete',
        description: `Updated ${result.success} users. ${result.failed} failed.`,
        variant: result.failed > 0 ? 'destructive' : 'default'
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Bulk Update Failed',
        description: 'Could not complete bulk update.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkClear = async () => {
    if (!framework) return;
    
    setLoading(true);
    try {
      const result = await bulkClearOverrides(selectedUserIds, [framework]);
      
      toast({
        title: 'Bulk Clear Complete',
        description: `Cleared ${result.success} users. ${result.failed} failed.`,
        variant: result.failed > 0 ? 'destructive' : 'default'
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Bulk Clear Failed',
        description: 'Could not complete bulk clear.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFrameworkOptions = () => {
    if (!framework) return [];
    return FRAMEWORK_OPTIONS[framework as keyof typeof FRAMEWORK_OPTIONS] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Bulk Operations
          <Badge variant="outline">{selectedUserIds.length} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={operation === 'update' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOperation('update')}
            className="flex items-center gap-2"
          >
            <Edit className="h-3 w-3" />
            Update
          </Button>
          <Button
            variant={operation === 'clear' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOperation('clear')}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>

        {operation && (
          <>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FRAMEWORK_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {operation === 'update' && framework && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Clear)</SelectItem>
                  {getFrameworkOptions().map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              {operation === 'update' ? (
                <Button
                  onClick={handleBulkUpdate}
                  disabled={!framework || !value || loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? 'Updating...' : `Update ${selectedUserIds.length} Users`}
                </Button>
              ) : (
                <Button
                  onClick={handleBulkClear}
                  disabled={!framework || loading}
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? 'Clearing...' : `Clear ${selectedUserIds.length} Users`}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};