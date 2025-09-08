import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Trash2, Download, Shield } from 'lucide-react';
import { logger } from '@/utils/structuredLogging';

export const DataManagement: React.FC = () => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteAllData = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete user data in correct order to respect foreign keys
      const { data: conversations } = await supabase
        .from('mentor_conversations')
        .select('id')
        .eq('user_id', user.id);
      
      const conversationIds = conversations?.map(c => c.id) || [];
      
      const deletions = [];
      
      // Delete messages first if there are conversations
      if (conversationIds.length > 0) {
        deletions.push(
          supabase.from('mentor_messages').delete().in('conversation_id', conversationIds)
        );
      }
      
      deletions.push(
        supabase.from('mentor_conversations').delete().eq('user_id', user.id),
        supabase.from('bookmarks').delete().eq('user_id', user.id),
        supabase.from('ai_insights').delete().eq('user_id', user.id),
        supabase.from('insight_comparisons').delete().eq('user_id', user.id),
        supabase.from('socratic_sessions').delete().eq('user_id', user.id),
        supabase.from('user_preferences').delete().eq('user_id', user.id),
        supabase.from('assessments').delete().eq('user_id', user.id)
      );

      await Promise.all(deletions);
      toast.success('All your data has been deleted successfully');
    } catch (error) {
      logger.error('Failed to delete user data', {
        component: 'DataManagement',
        action: 'deleteUserData'
      }, error as Error);
      toast.error('Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch all user data
      const [
        assessments,
        preferences,
        insights,
        conversations,
        bookmarks,
        socraticSessions
      ] = await Promise.all([
        supabase.from('assessments').select('*').eq('user_id', user.id),
        supabase.from('user_preferences').select('*').eq('user_id', user.id),
        supabase.from('ai_insights').select('*').eq('user_id', user.id),
        supabase.from('mentor_conversations').select('*').eq('user_id', user.id),
        supabase.from('bookmarks').select('*').eq('user_id', user.id),
        supabase.from('socratic_sessions').select('*').eq('user_id', user.id)
      ]);

      const userData = {
        user_id: user.id,
        email: user.email,
        exported_at: new Date().toISOString(),
        assessments: assessments.data || [],
        preferences: preferences.data || [],
        insights: insights.data || [],
        conversations: conversations.data || [],
        bookmarks: bookmarks.data || [],
        socratic_sessions: socraticSessions.data || []
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tps-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      logger.error('Failed to export user data', {
        component: 'DataManagement',
        action: 'exportData'
      }, error as Error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Management
        </CardTitle>
        <CardDescription>
          Manage your personal data and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete All Data'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Assessment results and responses</li>
                    <li>AI insights and personality analysis</li>
                    <li>Mentor conversation history</li>
                    <li>Bookmarks and saved content</li>
                    <li>User preferences and settings</li>
                    <li>Socratic clarification sessions</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Export Data:</strong> Download all your personal data in JSON format for your records.</p>
          <p><strong>Delete Data:</strong> Permanently remove all your data from our servers. This action cannot be reversed.</p>
        </div>
      </CardContent>
    </Card>
  );
};