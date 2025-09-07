import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrameworkCorrelations } from '@/components/dashboard/FrameworkCorrelations';
import { PersonalityDashboard } from '@/components/dashboard/PersonalityDashboard';
import { ProfileMigration } from './ProfileMigration';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { Brain, Download, Save, Share2, FileText, LoaderIcon } from 'lucide-react';
import { PDFReportGenerator } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentResultsProps {
  profile: PersonalityProfile;
  onSave?: (profile: PersonalityProfile) => void;
  showSaveButton?: boolean;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ 
  profile, 
  onSave, 
  showSaveButton = true 
}) => {
  const [enhancedProfile, setEnhancedProfile] = useState<PersonalityProfile>(profile);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleProfileMigration = (updatedProfile: PersonalityProfile) => {
    setEnhancedProfile(updatedProfile);
  };

  useEffect(() => {
    generateFrameworkInsights();
  }, [profile]);

  const generateFrameworkInsights = async () => {
    if (profile.frameworkInsights) {
      setEnhancedProfile(profile);
      return;
    }

    setGeneratingInsights(true);
    try {
      const insightsService = new FrameworkInsightsService();
      const insights = await insightsService.generateFrameworkInsights(profile, profile.traitScores, user?.id);
      
      const updatedProfile = {
        ...profile,
        frameworkInsights: insights,
        timestamp: new Date().toISOString()
      };
      
      setEnhancedProfile(updatedProfile);
      
      // Persist the enhanced profile
      await persistEnhancedProfile(updatedProfile);
      
      toast({
        title: "Framework Insights Generated",
        description: "Your personalized framework explanations are ready to explore."
      });
    } catch (error) {
      console.error('Error generating framework insights:', error);
      toast({
        title: "Insights Generation Failed", 
        description: "Using basic results. Framework insights will be generated later.",
        variant: "destructive"
      });
      setEnhancedProfile(profile);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const persistEnhancedProfile = async (updatedProfile: PersonalityProfile) => {
    try {
      if (user) {
        // For authenticated users: update the latest assessment in Supabase
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (assessments && assessments.length > 0) {
          await supabase
            .from('assessments')
            .update({ profile: updatedProfile as any })
            .eq('id', assessments[0].id);
        }
      } else {
        // For guests: update localStorage
        localStorage.setItem('tps-profile', JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Error persisting enhanced profile:', error);
      // Don't throw - this shouldn't block the UI
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(enhancedProfile);
      toast({
        title: "Results Saved",
        description: "Your personality assessment has been saved to your history."
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await PDFReportGenerator.generatePDFReport(enhancedProfile);
      toast({
        title: "PDF Generated",
        description: "Your personality report has been downloaded."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My TPS Personality Assessment Results',
          text: `I just completed a comprehensive personality assessment! My MBTI type is ${enhancedProfile.mappings.mbti} and my Enneagram type is ${enhancedProfile.mappings.enneagram}.`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I just completed a comprehensive personality assessment! My MBTI type is ${enhancedProfile.mappings.mbti} and my Enneagram type is ${enhancedProfile.mappings.enneagram}. Check it out at ${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Share text has been copied to your clipboard."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Migration Component */}
      <ProfileMigration 
        profile={profile} 
        onProfileUpdated={handleProfileMigration} 
      />
      
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
                <p className="text-muted-foreground">
                  Your comprehensive personality profile is ready to explore
                </p>
              </div>
            </div>
            {generatingInsights && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderIcon className="w-4 h-4 animate-spin" />
                Generating Insights...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {showSaveButton && (
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Results
              </Button>
            )}
            <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Personality Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">MBTI Type</div>
              <div className="text-2xl font-bold text-primary">{enhancedProfile.mappings.mbti}</div>
              {enhancedProfile.frameworkInsights?.mbti && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Enhanced Analysis Available
                </Badge>
              )}
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Enneagram</div>
              <div className="text-2xl font-bold text-primary">
                Type {enhancedProfile.mappings.enneagramDetails.type}w{enhancedProfile.mappings.enneagramDetails.wing}
              </div>
              <div className="text-xs text-muted-foreground">
                Tritype: {enhancedProfile.mappings.enneagramDetails.tritype}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Alignment</div>
              <div className="text-lg font-bold text-primary">{enhancedProfile.mappings.dndAlignment}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {enhancedProfile.mappings.hollandCode} • {enhancedProfile.mappings.socionics}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Results */}
      <Tabs defaultValue="correlations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="correlations">Framework Correlations</TabsTrigger>
          <TabsTrigger value="dashboard">Complete Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="mt-6">
          <FrameworkCorrelations profile={enhancedProfile} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <PersonalityDashboard profile={enhancedProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};