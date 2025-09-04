import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PersonalityProfile } from '@/types/tps.types';
import { 
  GitCompare, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface Assessment {
  id: string;
  created_at: string;
  profile: PersonalityProfile;
}

interface InsightComparison {
  id: string;
  baseline_assessment_id: string;
  comparison_assessment_id: string;
  section_name: string;
  changes_detected: any;
  confidence_change: number;
  created_at: string;
}

interface InsightComparisonPanelProps {
  currentProfile?: PersonalityProfile;
}

export const InsightComparisonPanel: React.FC<InsightComparisonPanelProps> = ({ 
  currentProfile 
}) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [comparisons, setComparisons] = useState<InsightComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [selectedBaseline, setSelectedBaseline] = useState<string>('');
  const [selectedComparison, setSelectedComparison] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAssessments();
      fetchComparisons();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, created_at, profile')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments((data || []).map(item => ({
        ...item,
        profile: item.profile as unknown as PersonalityProfile
      })));
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchComparisons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insight_comparisons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComparisons(data || []);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    }
  };

  const generateComparison = async () => {
    if (!user || !selectedBaseline || !selectedComparison) return;

    setLoading(true);
    try {
      const baselineAssessment = assessments.find(a => a.id === selectedBaseline);
      const comparisonAssessment = assessments.find(a => a.id === selectedComparison);

      if (!baselineAssessment || !comparisonAssessment) return;

      // Compare domain scores
      const domainChanges = Object.keys(baselineAssessment.profile.domainScores).reduce((acc, domain) => {
        const baseline = baselineAssessment.profile.domainScores[domain as keyof typeof baselineAssessment.profile.domainScores];
        const comparison = comparisonAssessment.profile.domainScores[domain as keyof typeof comparisonAssessment.profile.domainScores];
        const change = comparison - baseline;
        
        acc[domain] = {
          baseline,
          comparison,
          change,
          percentChange: (change / baseline) * 100
        };
        return acc;
      }, {} as Record<string, any>);

      // Compare MBTI changes
      const mbtiChange = baselineAssessment.profile.mappings.mbti !== comparisonAssessment.profile.mappings.mbti;
      
      const changesDetected = {
        domainChanges,
        mbtiChange: {
          from: baselineAssessment.profile.mappings.mbti,
          to: comparisonAssessment.profile.mappings.mbti,
          changed: mbtiChange
        },
        enneagramChange: {
          from: baselineAssessment.profile.mappings.enneagram,
          to: comparisonAssessment.profile.mappings.enneagram,
          changed: baselineAssessment.profile.mappings.enneagram !== comparisonAssessment.profile.mappings.enneagram
        }
      };

      // Save comparison
      const { error } = await supabase
        .from('insight_comparisons')
        .insert({
          user_id: user.id,
          baseline_assessment_id: selectedBaseline,
          comparison_assessment_id: selectedComparison,
          section_name: 'overall',
          changes_detected: changesDetected,
          confidence_change: 0 // Would calculate based on actual confidence scores
        });

      if (error) throw error;
      await fetchComparisons();
    } catch (error) {
      console.error('Error generating comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0.1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -0.1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const filteredComparisons = comparisons.filter(comparison => {
    const matchesSearch = comparison.section_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'all' || comparison.section_name === filterSection;
    return matchesSearch && matchesSection;
  });

  return (
    <div className="space-y-6">
      {/* Comparison Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Generate Insight Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Baseline Assessment</label>
              <Select value={selectedBaseline} onValueChange={setSelectedBaseline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select baseline assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {format(new Date(assessment.created_at), 'MMM d, yyyy')} - {assessment.profile.mappings.mbti}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comparison Assessment</label>
              <Select value={selectedComparison} onValueChange={setSelectedComparison}>
                <SelectTrigger>
                  <SelectValue placeholder="Select comparison assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {format(new Date(assessment.created_at), 'MMM d, yyyy')} - {assessment.profile.mappings.mbti}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateComparison}
            disabled={!selectedBaseline || !selectedComparison || loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Comparison'}
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search comparisons..."
                className="pl-10"
              />
            </div>
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="domains">Domains</SelectItem>
                <SelectItem value="insights">Insights</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comparisons List */}
      {filteredComparisons.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comparisons yet</h3>
            <p className="text-muted-foreground">
              Generate your first insight comparison to track your personality development over time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredComparisons.map((comparison) => (
            <Card key={comparison.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {comparison.section_name.charAt(0).toUpperCase() + comparison.section_name.slice(1)} Changes
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(comparison.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {comparison.changes_detected && (
                  <div className="space-y-4">
                    {/* Domain Changes */}
                    {comparison.changes_detected.domainChanges && (
                      <div>
                        <h4 className="font-medium mb-3">Domain Score Changes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(comparison.changes_detected.domainChanges).map(([domain, data]: [string, any]) => (
                            <div key={domain} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{domain}</span>
                                {getTrendIcon(data.change)}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>From: {data.baseline.toFixed(1)}</div>
                                <div>To: {data.comparison.toFixed(1)}</div>
                                <div className={`font-medium ${data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {data.change > 0 ? '+' : ''}{data.change.toFixed(1)} ({data.percentChange > 0 ? '+' : ''}{data.percentChange.toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Framework Changes */}
                    <div className="space-y-2">
                      {comparison.changes_detected.mbtiChange?.changed && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <span className="text-sm font-medium">MBTI Change</span>
                          <div className="text-sm">
                            <Badge variant="outline" className="mr-2">{comparison.changes_detected.mbtiChange.from}</Badge>
                            →
                            <Badge variant="default" className="ml-2">{comparison.changes_detected.mbtiChange.to}</Badge>
                          </div>
                        </div>
                      )}
                      
                      {comparison.changes_detected.enneagramChange?.changed && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                          <span className="text-sm font-medium">Enneagram Change</span>
                          <div className="text-sm">
                            <Badge variant="outline" className="mr-2">{comparison.changes_detected.enneagramChange.from}</Badge>
                            →
                            <Badge variant="default" className="ml-2">{comparison.changes_detected.enneagramChange.to}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};