import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { type UserWithOverrides } from '@/services/userManagementService';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExportImportPanelProps {
  users: UserWithOverrides[];
  onImportComplete: () => void;
}

export const ExportImportPanel: React.FC<ExportImportPanelProps> = ({ 
  users, 
  onImportComplete 
}) => {
  const isMobile = useIsMobile();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const headers = [
        'User ID',
        'Email', 
        'Display Name',
        'Username',
        'Verification Level',
        'Assessment Count',
        'MBTI Type',
        'Enneagram Type',
        'Big Five Scores',
        'Holland Code',
        'Alignment',
        'Socionics Type',
        'Integral Level',
        'Attachment Style',
        'Override Created At'
      ];

      const rows = users.map(user => [
        user.id,
        user.email,
        user.display_name || '',
        user.username || '',
        user.verification_level || '',
        user.assessment_count.toString(),
        user.mbti_type || '',
        user.enneagram_type || '',
        user.big_five_scores ? JSON.stringify(user.big_five_scores) : '',
        user.holland_code || '',
        user.alignment || '',
        user.socionics_type || '',
        user.integral_level || '',
        user.attachment_style || '',
        user.override_created_at || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `user-overrides-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Complete',
        description: `Exported ${users.length} users to CSV file.`
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export user data.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      
      // Validate CSV format
      const expectedHeaders = ['User ID', 'MBTI Type', 'Enneagram Type'];
      const hasRequiredHeaders = expectedHeaders.every(header => 
        headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (!hasRequiredHeaders) {
        throw new Error('Invalid CSV format. Required columns: User ID, MBTI Type, Enneagram Type');
      }

      const dataRows = lines.slice(1).filter(line => line.trim());
      
      toast({
        title: 'Import Preview',
        description: `Found ${dataRows.length} rows. Import functionality would process these overrides.`,
      });

      // Note: Actual import logic would go here
      // For demo purposes, we're just showing the preview
      
      onImportComplete();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export & Import
          <Badge variant="outline">{users.length} users</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Export Data</h4>
            <p className="text-xs text-muted-foreground">
              Download current user data as CSV
            </p>
            <Button
              onClick={exportToCSV}
              disabled={exporting || users.length === 0}
              size="sm"
              className="w-full h-11"
            >
              <Download className="h-3 w-3 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Import Overrides</h4>
            <p className="text-xs text-muted-foreground">
              Upload CSV with User ID and override values
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload CSV file"
              />
              <Button
                disabled={importing}
                size="sm"
                variant="outline"
                className="w-full h-11"
              >
                <Upload className="h-3 w-3 mr-2" />
                {importing ? 'Processing...' : 'Upload CSV'}
              </Button>
            </div>
          </div>
        </div>

        {/* Import Instructions */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV Import Format:</p>
              <p>Required columns: User ID, MBTI Type, Enneagram Type</p>
              <p>Optional: Holland Code, Alignment, Socionics Type, Integral Level, Attachment Style</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};