import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTestSession, TestSession } from '@/hooks/useTestSession';
import { logger } from '@/utils/structuredLogging';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Play,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const TestSessionDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { generateShareableLink, abandonSession } = useTestSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as TestSession[]);
    } catch (error) {
      logger.error('Failed to fetch user test sessions', {
        component: 'TestSessionDashboard',
        action: 'fetchTestSessions'
      }, error as Error);
      toast({
        title: "Error",
        description: "Failed to load your test sessions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'default'; // Use default instead of success
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'abandoned': return 'text-red-500';
      case 'expired': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const handleResumeTest = (session: TestSession) => {
    const shareableLink = generateShareableLink(session.session_token);
    window.location.href = shareableLink;
  };

  const handleCopyLink = (sessionToken: string) => {
    const link = generateShareableLink(sessionToken);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Test session link copied to clipboard."
    });
  };

  const handleAbandonSession = async (sessionId: string) => {
    try {
      await abandonSession(sessionId);
      await fetchUserSessions(); // Refresh the list
      toast({
        title: "Session Abandoned",
        description: "Test session has been marked as abandoned."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to abandon session.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const otherSessions = sessions.filter(s => !['active', 'completed'].includes(s.status));

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading your test sessions...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Test Sessions</h1>
        <p className="text-muted-foreground">Manage your active tests and view completed assessments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active Tests</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
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
                <p className="text-2xl font-bold">{completedSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Active Test Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{session.test_name}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Progress: {Math.round(session.completion_percentage)}%</span>
                        <span>Page {session.current_page + 1}/{session.total_pages}</span>
                        <span>Started: {new Date(session.created_at).toLocaleDateString()}</span>
                      </div>
                      <Progress value={session.completion_percentage} className="w-64" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleResumeTest(session)}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Resume Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(session.session_token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbandonSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Test Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No test sessions found. Start a new assessment to see your progress here.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.test_name}</div>
                        <div className="text-sm text-muted-foreground">{session.test_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(session.status) as any} className="flex items-center gap-1 w-fit">
                        <span className={getStatusIcon(session.status) ? getStatusColor(session.status) : ''}>
                          {getStatusIcon(session.status)}
                        </span>
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
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleResumeTest(session)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(session.session_token)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Session Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Test Name</label>
                                  <p className="text-sm text-muted-foreground">{session.test_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Test Type</label>
                                  <p className="text-sm text-muted-foreground">{session.test_type}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Progress</label>
                                  <p className="text-sm text-muted-foreground">{session.current_page} / {session.total_pages} pages</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <p className="text-sm text-muted-foreground">{session.status}</p>
                                </div>
                              </div>
                              {session.status === 'active' && (
                                <div>
                                  <label className="text-sm font-medium">Shareable Link</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      readOnly
                                      value={generateShareableLink(session.session_token)}
                                      className="text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleCopyLink(session.session_token)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
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
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/')}>
              Start New Assessment
            </Button>
            <Button variant="outline" onClick={() => navigate('/history')}>
              View Assessment History
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};