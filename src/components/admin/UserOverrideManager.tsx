import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { usePersonalityOverrides } from '@/hooks/usePersonalityOverrides';
import { saveUserOverride, loadUserOverride, type FrameworkType } from '@/services/scoringConfigService';
import { UserCheck, Search, Save, AlertTriangle } from 'lucide-react';

export const UserOverrideManager: React.FC = () => {
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>('mbti');
  const [overrideValue, setOverrideValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [currentOverride, setCurrentOverride] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const frameworks: { value: FrameworkType; label: string }[] = [
    { value: 'mbti', label: 'MBTI' },
    { value: 'bigfive', label: 'Big Five' },
    { value: 'enneagram', label: 'Enneagram' },
    { value: 'alignment', label: 'Alignment' },
    { value: 'holland', label: 'Holland Code' },
    { value: 'socionics', label: 'Socionics' },
    { value: 'integral', label: 'Integral Level' },
    { value: 'attachment', label: 'Attachment Style' },
  ];

  const loadUserData = async () => {
    if (!searchUserId.trim()) {
      toast({ title: 'Invalid Input', description: 'Please enter a valid User ID.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const override = await loadUserOverride(searchUserId);
      setCurrentOverride(override);
      setSelectedUserId(searchUserId);
      
      if (override) {
        toast({ title: 'User Found', description: 'Loaded existing override data.' });
      } else {
        toast({ title: 'User Found', description: 'No existing overrides for this user.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load user data.', variant: 'destructive' });
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOverride = async () => {
    if (!selectedUserId || !overrideValue.trim()) {
      toast({ title: 'Invalid Input', description: 'Please provide both user ID and override value.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const overrides = { [selectedFramework]: overrideValue };
      await saveUserOverride(selectedUserId, selectedFramework, overrides, reason);
      
      toast({ title: 'Override Saved', description: `${selectedFramework.toUpperCase()} override applied for user.` });
      
      // Reload data to show updated state
      const updated = await loadUserOverride(selectedUserId);
      setCurrentOverride(updated);
      setOverrideValue('');
      setReason('');
    } catch (error) {
      toast({ title: 'Save Failed', description: 'Could not save user override.', variant: 'destructive' });
      console.error('Save override error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameworkValue = (framework: FrameworkType) => {
    if (!currentOverride) return null;
    
    const mapping: Record<FrameworkType, string> = {
      mbti: 'mbti_type',
      bigfive: 'big_five_scores',
      enneagram: 'enneagram_type',
      alignment: 'alignment',
      holland: 'holland_code',
      socionics: 'socionics_type',
      integral: 'integral_level',
      attachment: 'attachment_style',
    };
    
    return currentOverride[mapping[framework]];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" /> User Override Manager
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search & Selection Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" /> Find User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter User ID"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
                <Button onClick={loadUserData} disabled={loading} size="sm">
                  {loading ? 'Loading...' : 'Search'}
                </Button>
              </div>
              
              {selectedUserId && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">Selected User: {selectedUserId}</div>
                  {currentOverride ? (
                    <div className="text-xs text-muted-foreground mt-1">
                      Has existing overrides • Created: {new Date(currentOverride.created_at).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">No existing overrides</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedUserId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create New Override</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Framework</Label>
                  <Select value={selectedFramework} onValueChange={(value: FrameworkType) => setSelectedFramework(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Override Value</Label>
                  <Input
                    placeholder={`Enter ${selectedFramework.toUpperCase()} value (e.g., INFJ, 7, Secure)`}
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Reason (Optional)</Label>
                  <Textarea
                    placeholder="Explain why this override is needed..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={saveOverride} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Apply Override'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Overrides Panel */}
        <div className="space-y-4">
          {currentOverride ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Overrides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworks.map((framework) => {
                  const value = getFrameworkValue(framework.value);
                  return (
                    <div key={framework.value} className="flex justify-between items-center">
                      <span className="text-sm">{framework.label}</span>
                      {value ? (
                        <Badge variant="secondary" className="text-xs">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Created by: {currentOverride.created_by}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(currentOverride.updated_at).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedUserId ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No overrides found for this user.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                Search for a user to view or create overrides.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Override Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Use overrides sparingly and document the reason clearly</p>
              <p>• MBTI: 4-letter code (e.g., INFJ, ESTP)</p>
              <p>• Enneagram: Type number 1-9 (e.g., 4w5, 7)</p>
              <p>• Big Five: JSON object with scores 0-10</p>
              <p>• Alignment: Format like "Chaotic Good"</p>
              <p>• Holland: 3-letter code (e.g., ARI, SEC)</p>
              <p>• Overrides take precedence over calculated results</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserOverrideManager;