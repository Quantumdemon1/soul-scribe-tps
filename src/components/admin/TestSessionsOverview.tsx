import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TestSession } from '@/hooks/useTestSession';
import { logger } from '@/utils/structuredLogging';
import { 
  Activity, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TestSessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  averageCompletion: number;
}

export const TestSessionsOverview: React.FC = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TestSession[]>([]);
  const [stats, setStats] = useState<TestSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter, typeFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select(`
          *,
          profiles!test_sessions_user_id_fkey(display_name, username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions((data || []) as TestSession[]);
      calculateStats((data || []) as TestSession[]);
    } catch (error) {
      logger.error('Failed to fetch test sessions', {
        component: 'TestSessionsOverview',
        action: 'fetchTestSessions'
      }, error as Error);
      toast({
        title: "Error",
        description: "Failed to load test sessions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: TestSession[]) => {
    const stats: TestSessionStats = {
      totalSessions: data.length,
      activeSessions: data.filter(s => s.status === 'active').length,
      completedSessions: data.filter(s => s.status === 'completed').length,
      abandonedSessions: data.filter(s => s.status === 'abandoned').length,
      averageCompletion: data.length > 0 
        ? data.reduce((sum, s) => sum + s.completion_percentage, 0) / data.length 
        : 0
    };
    setStats(stats);
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.session_token.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.test_type === typeFilter);
    }

    setFilteredSessions(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'success';
      case 'abandoned': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'abandoned': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  };

  const copyShareableLink = (sessionToken: string) => {
    const link = `${window.location.origin}/?resume=${sessionToken}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Shareable test link copied to clipboard."
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading test sessions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Sessions</p>
                <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{stats?.activeSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Abandoned</p>
                <p className="text-2xl font-bold">{stats?.abandonedSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg. Completion</p>
                <p className="text-2xl font-bold">{Math.round(stats?.averageCompletion || 0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Test Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by test name or session token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full">Full Assessment</SelectItem>
                <SelectItem value="quick">Quick Assessment</SelectItem>
                <SelectItem value="mini">Mini Assessment</SelectItem>
                <SelectItem value="integral">Integral Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No test sessions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.test_name}</div>
                          <div className="text-sm text-muted-foreground">{session.test_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(session as any).profiles?.display_name || 
                           (session as any).profiles?.username || 
                           'Unknown User'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(session.status)}
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={session.completion_percentage} className="w-24" />
                          <div className="text-xs text-muted-foreground">
                            {Math.round(session.completion_percentage)}% ({session.current_page}/{session.total_pages})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDuration(session.created_at, session.updated_at)}
                      </TableCell>
                      <TableCell>
                        {new Date(session.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {session.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyShareableLink(session.session_token)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Session Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Session Token</label>
                                    <p className="text-sm text-muted-foreground font-mono">{session.session_token}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Test Type</label>
                                    <p className="text-sm text-muted-foreground">{session.test_type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Current Page</label>
                                    <p className="text-sm text-muted-foreground">{session.current_page} / {session.total_pages}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Expires At</label>
                                    <p className="text-sm text-muted-foreground">{new Date(session.expires_at).toLocaleString()}</p>
                                  </div>
                                </div>
                                {session.status === 'active' && (
                                  <div>
                                    <label className="text-sm font-medium">Shareable Link</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Input
                                        readOnly
                                        value={`${window.location.origin}/?resume=${session.session_token}`}
                                        className="text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => copyShareableLink(session.session_token)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {session.responses && session.responses.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">Responses ({session.responses.length})</label>
                                    <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                      {JSON.stringify(session.responses, null, 2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};