import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTPSScoring } from '@/utils/enhancedTPSScoring';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  userId: string;
  responses: number[];
  profile: any;
  timestamp: string;
}

export function UserComparisonTool() {
  const [userIds, setUserIds] = useState<string>('');
  const [loadedProfiles, setLoadedProfiles] = useState<UserProfile[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUserProfiles = async () => {
    const ids = userIds.split(',').map(id => id.trim()).filter(Boolean);
    
    if (ids.length < 2) {
      toast({
        title: "Invalid Input",
        description: "Please enter at least 2 user IDs separated by commas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profiles: UserProfile[] = [];
      
      for (const userId of ids) {
        const { data: assessment, error } = await supabase
          .from('assessments')
          .select('responses, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (assessment?.responses) {
          const responses = assessment.responses as number[];
          const profile = EnhancedTPSScoring.generateEnhancedProfile(responses);
          
          profiles.push({
            userId,
            responses,
            profile,
            timestamp: assessment.created_at
          });
        }
      }

      setLoadedProfiles(profiles);
      
      if (profiles.length > 0) {
        generateComparison(profiles);
      }
      
      toast({
        title: "Profiles Loaded",
        description: `Successfully loaded ${profiles.length} user profiles`,
      });
    } catch (error) {
      console.error('Failed to load user profiles:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateComparison = (profiles: UserProfile[]) => {
    if (profiles.length < 2) return;

    const comparison: any = {
      profiles: profiles.length,
      mbtiDistribution: {},
      enneagramDistribution: {},
      traitAverages: {},
      similarities: [],
      differences: []
    };

    // MBTI distribution
    profiles.forEach(({ profile, userId }) => {
      const mbti = profile.mappings.mbti;
      comparison.mbtiDistribution[mbti] = (comparison.mbtiDistribution[mbti] || 0) + 1;
    });

    // Enneagram distribution
    profiles.forEach(({ profile, userId }) => {
      const enneagram = profile.mappings.enneagram;
      comparison.enneagramDistribution[enneagram] = (comparison.enneagramDistribution[enneagram] || 0) + 1;
    });

    // Trait averages
    const allTraits = Object.keys(profiles[0].profile.traitScores);
    allTraits.forEach(trait => {
      const scores = profiles.map(p => p.profile.traitScores[trait]);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
      
      comparison.traitAverages[trait] = {
        average: average.toFixed(2),
        variance: variance.toFixed(3),
        min: Math.min(...scores).toFixed(2),
        max: Math.max(...scores).toFixed(2)
      };
    });

    // Pairwise similarities and differences
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const profileA = profiles[i];
        const profileB = profiles[j];
        
        const similarities = [];
        const differences = [];
        
        // MBTI comparison
        if (profileA.profile.mappings.mbti === profileB.profile.mappings.mbti) {
          similarities.push(`Same MBTI type: ${profileA.profile.mappings.mbti}`);
        } else {
          differences.push(`MBTI: ${profileA.userId} (${profileA.profile.mappings.mbti}) vs ${profileB.userId} (${profileB.profile.mappings.mbti})`);
        }
        
        // Enneagram comparison
        if (profileA.profile.mappings.enneagram === profileB.profile.mappings.enneagram) {
          similarities.push(`Same Enneagram: ${profileA.profile.mappings.enneagram}`);
        } else {
          differences.push(`Enneagram: ${profileA.userId} (${profileA.profile.mappings.enneagram}) vs ${profileB.userId} (${profileB.profile.mappings.enneagram})`);
        }
        
        // Trait differences
        allTraits.forEach(trait => {
          const scoreA = profileA.profile.traitScores[trait];
          const scoreB = profileB.profile.traitScores[trait];
          const diff = Math.abs(scoreA - scoreB);
          
          if (diff > 2.0) {
            differences.push(`${trait}: ${profileA.userId} (${scoreA.toFixed(1)}) vs ${profileB.userId} (${scoreB.toFixed(1)}) - diff: ${diff.toFixed(1)}`);
          } else if (diff < 0.5) {
            similarities.push(`${trait}: Both ~${scoreA.toFixed(1)}`);
          }
        });
        
        comparison.similarities.push({
          pair: `${profileA.userId} & ${profileB.userId}`,
          items: similarities
        });
        
        comparison.differences.push({
          pair: `${profileA.userId} & ${profileB.userId}`,
          items: differences
        });
      }
    }

    setComparisonResult(comparison);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Comparison Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              User IDs (comma-separated)
            </label>
            <Input
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="user1-id, user2-id, user3-id..."
              className="mb-2"
            />
            <div className="text-xs text-muted-foreground">
              Enter 2 or more user IDs to compare their personality profiles
            </div>
          </div>
          
          <Button 
            onClick={loadUserProfiles}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading Profiles...' : 'Load & Compare Users'}
          </Button>
        </CardContent>
      </Card>

      {loadedProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loaded Profiles ({loadedProfiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {loadedProfiles.map((profile) => (
                <div key={profile.userId} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{profile.userId}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(profile.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{profile.profile.mappings.mbti}</Badge>
                    <Badge variant="outline">{profile.profile.mappings.enneagram}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="similarities">Similarities</TabsTrigger>
                <TabsTrigger value="differences">Differences</TabsTrigger>
                <TabsTrigger value="traits">Trait Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-2">MBTI Distribution</div>
                    <div className="space-y-1">
                      {Object.entries(comparisonResult.mbtiDistribution).map(([type, count]: [string, any]) => (
                        <div key={type} className="text-sm">
                          <Badge variant="outline">{type}</Badge> × {count}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium mb-2">Enneagram Distribution</div>
                    <div className="space-y-1">
                      {Object.entries(comparisonResult.enneagramDistribution).map(([type, count]: [string, any]) => (
                        <div key={type} className="text-sm">
                          <Badge variant="outline">{type}</Badge> × {count}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="similarities" className="space-y-4">
                {comparisonResult.similarities.map((similarity: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{similarity.pair}</div>
                    <div className="space-y-1">
                      {similarity.items.map((item: string, i: number) => (
                        <div key={i} className="text-sm text-green-600 dark:text-green-400">
                          ✓ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="differences" className="space-y-4">
                {comparisonResult.differences.map((difference: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{difference.pair}</div>
                    <div className="space-y-1">
                      {difference.items.map((item: string, i: number) => (
                        <div key={i} className="text-sm text-orange-600 dark:text-orange-400">
                          ⚠ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="traits" className="space-y-4">
                <div className="grid gap-2">
                  {Object.entries(comparisonResult.traitAverages).map(([trait, stats]: [string, any]) => (
                    <div key={trait} className="p-2 border rounded text-sm">
                      <div className="font-medium">{trait}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: {stats.average} | Range: {stats.min}-{stats.max} | Variance: {stats.variance}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}