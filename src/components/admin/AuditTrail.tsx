import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AuditTrailService, AuditLogEntry, ConfigSnapshot } from '@/services/auditTrailService';
import { loadScoringOverrides, saveScoringOverrides, ScoringOverrides } from '@/services/scoringConfigService';
import { toast } from '@/hooks/use-toast';
import { Clock, User, Target, Undo2, Eye, AlertTriangle, History } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const AuditTrail: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ConfigSnapshot | null>(null);
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    const [logs, snaps] = await Promise.all([
      AuditTrailService.getAuditLog(),
      AuditTrailService.getSnapshots()
    ]);
    setAuditLog(logs);
    setSnapshots(snaps);
  };

  const handleCreateSnapshot = async () => {
    if (!snapshotDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for this snapshot.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const currentConfig = await loadScoringOverrides();
      if (!currentConfig) {
        throw new Error('No configuration to snapshot');
      }

      const changesSummary = ['Manual snapshot created'];
      await AuditTrailService.createSnapshot(
        'current-user', // In production, get from auth
        snapshotDescription,
        currentConfig,
        changesSummary
      );

      setSnapshotDescription('');
      loadAuditData();
      
      toast({
        title: "Snapshot Created",
        description: "Configuration snapshot has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Failed to Create Snapshot",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (snapshotId: string) => {
    setLoading(true);
    try {
      const restoredConfig = await AuditTrailService.rollbackToSnapshot(snapshotId, 'current-user');
      if (!restoredConfig) {
        throw new Error('Failed to restore configuration');
      }

      await saveScoringOverrides(restoredConfig);
      loadAuditData();
      
      toast({
        title: "Configuration Restored",
        description: "Successfully rolled back to the selected snapshot."
      });
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <span className="text-green-500">+</span>;
      case 'update': return <span className="text-blue-500">~</span>;
      case 'delete': return <span className="text-red-500">-</span>;
      case 'rollback': return <Undo2 className="h-3 w-3 text-orange-500" />;
      default: return <span>•</span>;
    }
  };

  const getActionColor = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case 'create': return 'secondary';
      case 'update': return 'default';
      case 'delete': return 'destructive';
      case 'rollback': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">Audit Log</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Changes ({auditLog.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No audit entries found.</p>
              ) : (
                <div className="space-y-3">
                  {auditLog.slice(0, 50).map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionColor(entry.action)}>
                            {entry.action.toUpperCase()}
                          </Badge>
                          {entry.framework && (
                            <Badge variant="outline">{entry.framework}</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), 'MMM dd, HH:mm:ss')}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium">{entry.changeDescription}</p>
                        
                        {entry.target && (
                          <div className="flex items-center gap-1 mt-1">
                            <Target className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">{entry.target}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshots" className="space-y-4">
          {/* Create Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Create Configuration Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="snapshot-description">Description</Label>
                <Input
                  id="snapshot-description"
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                  placeholder="Describe this configuration snapshot..."
                />
              </div>
              <Button 
                onClick={handleCreateSnapshot}
                disabled={loading || !snapshotDescription.trim()}
              >
                Create Snapshot
              </Button>
            </CardContent>
          </Card>

          {/* Snapshots List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuration Snapshots ({snapshots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {snapshots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No snapshots found.</p>
              ) : (
                <div className="space-y-3">
                  {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{snapshot.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(snapshot.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {snapshot.userId}
                          </span>
                          <span>{snapshot.changesSummary.length} changes</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSnapshot(snapshot)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Snapshot Details</DialogTitle>
                            </DialogHeader>
                            {selectedSnapshot && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm">{selectedSnapshot.description}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Changes Summary</h4>
                                  <ul className="space-y-1">
                                    {selectedSnapshot.changesSummary.map((change, idx) => (
                                      <li key={idx} className="text-sm font-mono bg-muted p-2 rounded">
                                        {change}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRollback(snapshot.id)}
                          disabled={loading}
                        >
                          <Undo2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};