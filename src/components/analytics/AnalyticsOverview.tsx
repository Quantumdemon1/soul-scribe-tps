import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, Brain, TrendingUp, Calendar, Activity, Target } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalAssessments: number;
  totalInsights: number;
  totalSessions: number;
  weeklyGrowth: Array<{ date: string; assessments: number; insights: number; sessions: number }>;
  assessmentTypes: Array<{ type: string; count: number; percentage: number }>;
  userActivity: Array<{ hour: number; activity: number }>;
  conversionRate: number;
  avgCompletionTime: number;
  popularTraits: Array<{ trait: string; frequency: number }>;
}

const chartConfig = {
  assessments: {
    label: "Assessments",
    color: "hsl(var(--primary))",
  },
  insights: {
    label: "AI Insights", 
    color: "hsl(var(--secondary))",
  },
  sessions: {
    label: "Socratic Sessions",
    color: "hsl(var(--accent))",
  },
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  'hsl(var(--muted-foreground))',
];

export const AnalyticsOverview: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

      // Load all data in parallel
      const [assessments, insights, sessions] = await Promise.all([
        supabase
          .from('assessments')
          .select('created_at, variant, profile')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('ai_insights') 
          .select('created_at, insight_type')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('socratic_sessions')
          .select('created_at, final_scores')
          .gte('created_at', startDate.toISOString())
      ]);

      // Process data
      const processedData = processAnalyticsData(
        assessments.data || [],
        insights.data || [],
        sessions.data || []
      );

      setAnalytics(processedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (assessments: any[], insights: any[], sessions: any[]): AnalyticsData => {
    // Weekly growth data
    const weeklyGrowth = generateWeeklyGrowth(assessments, insights, sessions);
    
    // Assessment types distribution
    const assessmentTypes = processAssessmentTypes(assessments);
    
    // User activity by hour
    const userActivity = processHourlyActivity([...assessments, ...insights, ...sessions]);
    
    // Popular traits from assessments
    const popularTraits = processPopularTraits(assessments);

    return {
      totalUsers: new Set([...assessments, ...insights, ...sessions].map(item => item.user_id)).size,
      totalAssessments: assessments.length,
      totalInsights: insights.length,
      totalSessions: sessions.length,
      weeklyGrowth,
      assessmentTypes,
      userActivity,
      conversionRate: assessments.length > 0 ? (insights.length / assessments.length) * 100 : 0,
      avgCompletionTime: 12.5, // Mock data - would need actual completion time tracking
      popularTraits
    };
  };

  const generateWeeklyGrowth = (assessments: any[], insights: any[], sessions: any[]) => {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAssessments = assessments.filter(a => 
        new Date(a.created_at).toDateString() === date.toDateString()
      ).length;
      
      const dayInsights = insights.filter(i => 
        new Date(i.created_at).toDateString() === date.toDateString()
      ).length;
      
      const daySessions = sessions.filter(s => 
        new Date(s.created_at).toDateString() === date.toDateString()
      ).length;
      
      data.push({
        date: dateStr,
        assessments: dayAssessments,
        insights: dayInsights,
        sessions: daySessions
      });
    }
    
    return data;
  };

  const processAssessmentTypes = (assessments: any[]) => {
    const types = assessments.reduce((acc, assessment) => {
      const type = assessment.variant || 'standard';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const total = assessments.length;
    return Object.entries(types).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0
    }));
  };

  const processHourlyActivity = (allData: any[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({ hour, activity: 0 }));
    
    allData.forEach(item => {
      if (item.created_at) {
        const hour = new Date(item.created_at).getHours();
        hourlyData[hour].activity++;
      }
    });
    
    return hourlyData;
  };

  const processPopularTraits = (assessments: any[]) => {
    const traitCounts: Record<string, number> = {};
    
    assessments.forEach(assessment => {
      if (assessment.profile?.scores) {
        Object.keys(assessment.profile.scores).forEach(trait => {
          traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
      }
    });
    
    return Object.entries(traitCounts)
      .map(([trait, frequency]) => ({ trait, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Assessment to AI insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCompletionTime}m</div>
            <p className="text-xs text-muted-foreground">Time per assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInsights}</div>
            <p className="text-xs text-muted-foreground">Generated insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={analytics.weeklyGrowth}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="assessments" 
                stroke="var(--color-assessments)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-assessments)" }}
              />
              <Line 
                type="monotone" 
                dataKey="insights" 
                stroke="var(--color-insights)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-insights)" }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="var(--color-sessions)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-sessions)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart>
                <Pie
                  data={analytics.assessmentTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                >
                  {analytics.assessmentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={analytics.userActivity}>
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="activity" fill="var(--color-assessments)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Traits */}
      {analytics.popularTraits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Assessed Personality Traits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.popularTraits.map((trait, index) => (
                <div key={trait.trait} className="flex flex-col items-center">
                  <CircularProgress
                    value={trait.frequency}
                    max={Math.max(...analytics.popularTraits.map(t => t.frequency))}
                    size={80}
                    color={COLORS[index % COLORS.length]}
                  />
                  <p className="mt-2 text-sm font-medium text-center capitalize">
                    {trait.trait.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">{trait.frequency} assessments</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};