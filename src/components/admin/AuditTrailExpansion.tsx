import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { History, User, Calendar, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  old_values: any;
  new_values: any;
  change_description: string;
  timestamp: string;
  user_id: string;
  framework?: string;
}

interface AuditTrailExpansionProps {
  userId: string;
  onRollback?: () => void;
}

export const AuditTrailExpansion: React.FC<AuditTrailExpansionProps> = ({ 
  userId, 
  onRollback 
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  useEffect(() => {
    loadAuditTrail();
  }, [userId]);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scoring_audit_log')
        .select('*')
        .eq('target_id', userId)
        .eq('target', 'user_override')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAuditEntries(data || []);
    } catch (error) {
      toast({
        title: 'Failed to load audit trail',
        description: 'Could not retrieve override history.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (entry: AuditEntry) => {
    if (!entry.old_values || !entry.framework) return;
    
    setRollbackLoading(true);
    try {
      // Restore the old value
      const { error } = await supabase
        .from('personality_overrides')
        .update({ 
          [entry.framework]: entry.old_values[entry.framework],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the rollback action
      await supabase
        .from('scoring_audit_log')
        .insert({
          action: 'rollback',
          target: 'user_override',
          target_id: userId,
          framework: entry.framework,
          old_values: entry.new_values,
          new_values: entry.old_values,
          change_description: `Rolled back ${entry.framework} override`,
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        });

      toast({
        title: 'Rollback Complete',
        description: `Restored ${entry.framework} to previous value.`
      });

      loadAuditTrail();
      onRollback?.();
    } catch (error) {
      toast({
        title: 'Rollback Failed',
        description: 'Could not restore previous value.',
        variant: 'destructive'
      });
    } finally {
      setRollbackLoading(false);
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-muted-foreground text-sm">
            Loading audit trail...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          Override History
          <Badge variant="outline">{auditEntries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {auditEntries.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No override history found
          </div>
        ) : (
          auditEntries.map((entry, index) => (
            <div key={entry.id}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.framework || 'unknown'}
                    </Badge>
                    <Badge 
                      variant={entry.action === 'rollback' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {entry.action}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-xs">
                  <div className="text-muted-foreground">{entry.change_description}</div>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">From: </span>
                      <span className="font-mono">
                        {formatValue(entry.old_values?.[entry.framework || ''])}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To: </span>
                      <span className="font-mono">
                        {formatValue(entry.new_values?.[entry.framework || ''])}
                      </span>
                    </div>
                  </div>
                </div>

                {entry.action !== 'rollback' && entry.old_values && entry.framework && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6"
                    onClick={() => handleRollback(entry)}
                    disabled={rollbackLoading}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Rollback
                  </Button>
                )}
              </div>
              
              {index < auditEntries.length - 1 && (
                <Separator className="mt-3" />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};