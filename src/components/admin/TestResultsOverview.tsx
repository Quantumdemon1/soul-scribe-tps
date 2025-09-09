import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TestResult } from '@/hooks/useTestResultsTracking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface TestStats {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  averageDuration: number;
  completionRate: number;
  errorRate: number;
}

export function TestResultsOverview() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<TestStats>({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    averageDuration: 0,
    completionRate: 0,
    errorRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          profiles(display_name, username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching test results:', error);
        return;
      }

      setTestResults(data as TestResult[] || []);
      calculateStats(data as TestResult[] || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results: TestResult[]) => {
    const totalTests = results.length;
    const completedTests = results.filter(r => r.status === 'completed').length;
    const averageScore = results
      .filter(r => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0) / Math.max(1, results.filter(r => r.score !== null).length);
    
    const durations = results.filter(r => r.duration_ms).map(r => r.duration_ms || 0);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / Math.max(1, durations.length);
    
    const completionRate = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
    const errorRate = totalTests > 0 ? (results.filter(r => r.errors && r.errors.length > 0).length / totalTests) * 100 : 0;

    setStats({
      totalTests,
      completedTests,
      averageScore,
      averageDuration,
      completionRate,
      errorRate,
    });
  };

  const getTestTypeData = () => {
    const typeGroups = testResults.reduce((acc, result) => {
      acc[result.test_type] = (acc[result.test_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeGroups).map(([type, count]) => ({
      type,
      count,
    }));
  };

  const getStatusData = () => {
    const statusGroups = testResults.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count,
    }));
  };

  const getDailyTestData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTests = testResults.filter(r => 
        r.created_at.split('T')[0] === date
      );
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tests: dayTests.length,
        completed: dayTests.filter(r => r.status === 'completed').length,
      };
    });
  };

  const statusColors = {
    completed: '#10b981',
    started: '#f59e0b',
    abandoned: '#ef4444',
    failed: '#dc2626',
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading test results...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTests} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100 points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Tests with errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="types">Test Types</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Test Activity</CardTitle>
              <CardDescription>Test sessions over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getDailyTestData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Line type="monotone" dataKey="tests" stroke="hsl(var(--primary))" name="Total Tests" />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Types Distribution</CardTitle>
              <CardDescription>Breakdown of test types</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTestTypeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Status Distribution</CardTitle>
              <CardDescription>Current status of all tests</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="status"
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status as keyof typeof statusColors] || '#8884d8'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}