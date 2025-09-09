import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { TestResult } from '@/hooks/useTestResultsTracking';
import { Search, Download, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';

export function TestResultsList() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [testResults, searchTerm, statusFilter, typeFilter]);

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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = testResults;

    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => result.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(result => result.test_type === typeFilter);
    }

    setFilteredResults(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'started': return 'secondary';
      case 'abandoned': return 'destructive';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportResults = () => {
    const csv = [
      ['Test Name', 'Type', 'Status', 'User', 'Score', 'Duration', 'Completion %', 'Start Time', 'End Time'].join(','),
      ...filteredResults.map(result => [
        result.test_name,
        result.test_type,
        result.status,
        result.profiles?.display_name || 'Unknown',
        result.score || 'N/A',
        formatDuration(result.duration_ms),
        result.completion_percentage,
        result.start_time,
        result.end_time || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueTypes = Array.from(new Set(testResults.map(r => r.test_type)));
  const uniqueStatuses = Array.from(new Set(testResults.map(r => r.status)));

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading test results...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test Results
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>
            Detailed view of all test sessions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests, users, or session IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.test_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.test_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(result.status)}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.profiles?.display_name || 'Unknown User'}
                    </TableCell>
                    <TableCell>{result.score ? result.score.toFixed(1) : 'N/A'}</TableCell>
                    <TableCell>{formatDuration(result.duration_ms)}</TableCell>
                    <TableCell>{result.completion_percentage}%</TableCell>
                    <TableCell>
                      {format(new Date(result.start_time), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Test Result Details</DialogTitle>
                            <DialogDescription>
                              Session ID: {result.session_id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedResult && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">Test Information</h4>
                                  <p><strong>Name:</strong> {selectedResult.test_name}</p>
                                  <p><strong>Type:</strong> {selectedResult.test_type}</p>
                                  <p><strong>Status:</strong> {selectedResult.status}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Performance</h4>
                                  <p><strong>Score:</strong> {selectedResult.score || 'N/A'}</p>
                                  <p><strong>Duration:</strong> {formatDuration(selectedResult.duration_ms)}</p>
                                  <p><strong>Completion:</strong> {selectedResult.completion_percentage}%</p>
                                </div>
                              </div>
                              
                              {selectedResult.errors && selectedResult.errors.length > 0 && (
                                <div>
                                  <h4 className="font-semibold">Errors</h4>
                                  <div className="bg-destructive/10 p-3 rounded">
                                    {selectedResult.errors.map((error: any, index: number) => (
                                      <div key={index} className="mb-2">
                                        <p className="text-sm"><strong>{error.type}:</strong> {error.message}</p>
                                        <p className="text-xs text-muted-foreground">{error.timestamp}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {selectedResult.metadata && Object.keys(selectedResult.metadata).length > 0 && (
                                <div>
                                  <h4 className="font-semibold">Metadata</h4>
                                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                    {JSON.stringify(selectedResult.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No test results found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}