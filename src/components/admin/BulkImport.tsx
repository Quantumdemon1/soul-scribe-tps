import React, { useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface ParsedUserRow {
  email: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

interface ParsedAssessmentRow {
  email: string;
  variant?: string;
  responses: number[];
}

function downloadTemplate(type: 'users' | 'assessments') {
  if (type === 'users') {
    const csv = Papa.unparse([
      { email: 'jane@example.com', first_name: 'Jane', last_name: 'Doe', password: '' },
      { email: 'john@example.com', first_name: 'John', last_name: 'Smith', password: '' },
    ], { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const header: any = { email: 'jane@example.com', variant: 'full' };
    for (let i = 1; i <= 108; i++) header[`q${i}`] = i % 10 || 10;
    const csv = Papa.unparse([header], { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessments_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const BulkImport: React.FC = () => {
  const [usersRows, setUsersRows] = useState<ParsedUserRow[]>([]);
  const [assessmentRows, setAssessmentRows] = useState<ParsedAssessmentRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const parseUsersCsv = (file: File) => {
    Papa.parse<ParsedUserRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows = (results.data || []).filter((r: any) => r.email);
        setUsersRows(rows);
        toast({ title: 'Users CSV parsed', description: `${rows.length} rows ready.` });
      },
      error: (err) => {
        toast({ title: 'Parse error', description: err.message, variant: 'destructive' });
      }
    });
  };

  const parseAssessmentsCsv = (file: File) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        try {
          const rows: ParsedAssessmentRow[] = [];
          for (const r of results.data as any[]) {
            if (!r || !r.email) continue;
            const responses: number[] = [];
            for (let i = 1; i <= 108; i++) {
              const val = Number(r[`q${i}`] ?? r[`question_${i}`] ?? r[`q${i.toString().padStart(3,'0')}`]);
              if (Number.isNaN(val)) throw new Error(`Row for ${r.email}: q${i} is missing or not a number`);
              if (val < 1 || val > 10) throw new Error(`Row for ${r.email}: q${i} must be 1-10`);
              responses.push(val);
            }
            rows.push({ email: String(r.email).trim(), variant: (r.variant || 'full').toString(), responses });
          }
          setAssessmentRows(rows);
          toast({ title: 'Assessments CSV parsed', description: `${rows.length} rows ready.` });
        } catch (e: any) {
          toast({ title: 'Parse error', description: e.message, variant: 'destructive' });
        }
      },
      error: (err) => {
        toast({ title: 'Parse error', description: err.message, variant: 'destructive' });
      }
    });
  };

  const invokeImport = async (type: 'users' | 'assessments') => {
    const batchId = `batch_${Date.now()}`;
    setProcessing(true);
    setProgress(5);
    try {
      const payload = type === 'users'
        ? { type, batchId, filename: 'users.csv', users: usersRows }
        : { type, batchId, filename: 'assessments.csv', assessments: assessmentRows };

      const { data, error } = await supabase.functions.invoke('bulk-import', {
        body: payload
      });

      if (error) throw error;
      setProgress(100);
      toast({ title: 'Import completed', description: `${data.successCount} succeeded, ${data.errorCount} failed.` });
    } catch (e: any) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Create Users from CSV</Label>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate('users')}>
                  <Download className="w-4 h-4 mr-2" /> Template
                </Button>
              </div>
              <Input type="file" accept=".csv" onChange={(e) => e.target.files && parseUsersCsv(e.target.files[0])} />
              <div className="text-sm text-muted-foreground">
                Required headers: email, first_name, last_name, password (optional)
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{usersRows.length} rows</Badge>
                <Button size="sm" onClick={() => invokeImport('users')} disabled={!usersRows.length || processing}>
                  <Upload className="w-4 h-4 mr-2" /> Import Users
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Import Assessments from CSV</Label>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate('assessments')}>
                  <Download className="w-4 h-4 mr-2" /> Template
                </Button>
              </div>
              <Input type="file" accept=".csv" onChange={(e) => e.target.files && parseAssessmentsCsv(e.target.files[0])} />
              <div className="text-sm text-muted-foreground">
                Required headers: email, variant (optional), q1..q108 (values 1-10)
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{assessmentRows.length} rows</Badge>
                <Button size="sm" onClick={() => invokeImport('assessments')} disabled={!assessmentRows.length || processing}>
                  <Upload className="w-4 h-4 mr-2" /> Import Assessments
                </Button>
              </div>
            </div>
          </div>

          {processing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {progress >= 100 ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4 animate-pulse" />}
                <span>{progress >= 100 ? 'Completed' : 'Processing import...'}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            • Only administrators can run imports. • Users without passwords will receive a random temporary password. • Assessments will be computed and available in dashboards.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImport;
