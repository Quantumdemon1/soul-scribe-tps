import React, { useState } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { PDFReportGenerator } from '../../utils/pdfGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LazyTabs } from '@/components/ui/lazy-tabs';
import { Progress } from '@/components/ui/progress';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { RadarChart } from '../charts/RadarChart';
import { CircularProgress } from '../charts/CircularProgress';
import { DomainCard } from './DomainCard';
import { FrameworkCorrelations } from './FrameworkCorrelations';
import { CoreInsights } from './CoreInsights';
import { PersonalDevelopment } from './PersonalDevelopment';
import { AIInsightsPanel } from './AIInsightsPanel';
import { CareerLifestyle } from './CareerLifestyle';
import { DashboardControls } from './DashboardControls';
import { EnhancedInsightsPanel } from './EnhancedInsightsPanel';
import { RefinementModal } from './RefinementModal';

import { InsightComparisonPanel } from './InsightComparisonPanel';
import { PersonalityMatches } from './PersonalityMatches';
import { Header } from '@/components/layout/Header';
import { 
  Brain, 
  Download, 
  Share2, 
  RotateCcw,
  User,
  Target,
  Briefcase,
  TrendingUp,
  Sparkles,
  
  GitCompare,
  Settings,
  MessageSquare
} from 'lucide-react';

interface DashboardProps {
  profile: PersonalityProfile;
  onRetakeAssessment?: () => void;
}

const DashboardContent: React.FC<{ profile: PersonalityProfile; onRetakeAssessment?: () => void }> = ({ 
  profile: initialProfile, 
  onRetakeAssessment 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(initialProfile);
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);
  const { preloadSection } = useDashboard();

  const handleExportJSON = () => {
    PDFReportGenerator.exportAsJSON(profile);
  };

  const handleGeneratePDF = async () => {
    try {
      await PDFReportGenerator.generatePDFReport(profile);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleRetakeTest = () => {
    if (onRetakeAssessment) {
      onRetakeAssessment();
    } else {
      localStorage.removeItem('tps-profile');
      window.location.reload();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My TPS Personality Profile',
          text: `I just completed the Triadic Personality System assessment! My MBTI type is ${profile.mappings.mbti} and my Enneagram type is ${profile.mappings.enneagram}.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `I just completed the Triadic Personality System assessment! My MBTI type is ${profile.mappings.mbti} and my Enneagram type is ${profile.mappings.enneagram}.`;
      navigator.clipboard.writeText(shareText);
    }
  };

  const handleTabLoad = (tabId: string) => {
    // Preload data for specific tabs
    const tabToSectionMap: Record<string, any> = {
      'insights': 'coreInsights',
      'ai-insights': 'aiInsights',
      'development': 'personalDevelopment',
      'career': 'careerLifestyle'
    };

    const section = tabToSectionMap[tabId];
    if (section) {
      preloadSection(section, profile);
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-16 h-16 mr-4" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Personality Profile</h1>
                <p className="text-xl opacity-90">Triadic Personality System Analysis</p>
              </div>
            </div>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Below are your Domain Scores, which correspond to how much you prefer viewing the world - the higher the score, the stronger your preference in that domain.
          </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(profile.domainScores).map(([domain, score]) => {
              const domainDescriptions = {
                External: "How we deal with our outside world",
                Internal: "How we deal with our inner world",
                Interpersonal: "How we deal with people",
                Processing: "How we deal with information"
              };
              
              return (
                <Card key={domain} className="bg-white/10 border-white/20 text-center">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{domain}</h3>
                    <div className="text-3xl font-bold mb-2">
                      {(score * 10).toFixed(1)}
                    </div>
                    <p className="text-sm opacity-80 mb-3">
                      {domainDescriptions[domain as keyof typeof domainDescriptions]}
                    </p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => window.location.href = '/mentor'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with AI Mentor
            </Button>
            <Button 
              onClick={handleExportJSON}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
            <Button 
              onClick={handleShare}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button 
              onClick={() => setIsRefinementOpen(true)}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Refine Results
            </Button>
            <Button 
              onClick={handleRetakeTest}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardControls profile={profile} currentSection={activeTab} />
        
        <LazyTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          onTabLoad={handleTabLoad}
          className="w-full"
          preloadNext={true}
        >
          <LazyTabs.List className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <LazyTabs.Trigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Core Insights
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="ai-insights" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="types" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Personality Types
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="development" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Development
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="career" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Career & Lifestyle
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              Comparison
            </LazyTabs.Trigger>
            <LazyTabs.Trigger value="enhanced" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Enhanced Insights
            </LazyTabs.Trigger>
          </LazyTabs.List>

          <LazyTabs.Content value="overview" className="space-y-8" eager={true}>
            {/* Framework Mappings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personality Framework Correlations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">MBTI Type</h3>
                    <p className="text-xs text-muted-foreground mb-3">Your personality preferences in how you interact, process information, make decisions, and approach life</p>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {profile.mappings.mbti}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Enneagram</h3>
                    <p className="text-xs text-muted-foreground mb-3">Your core motivation, fears, and behavioral patterns based on nine fundamental personality types</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {profile.mappings.enneagram}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Tritype: {profile.mappings.enneagramDetails.tritype}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Socionics</h3>
                    <p className="text-xs text-muted-foreground mb-3">How you process and exchange information with others, based on cognitive functions and social dynamics</p>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {profile.mappings.socionics}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Holland Code</h3>
                    <p className="text-xs text-muted-foreground mb-3">Your career interests and work environment preferences across six occupational themes</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {profile.mappings.hollandCode}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">D&D Alignment</h3>
                    <p className="text-xs text-muted-foreground mb-3">Your ethical and moral compass, measuring your approach to rules and concern for others</p>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {profile.mappings.dndAlignment}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-4">Big Five</h3>
                    <p className="text-xs text-muted-foreground mb-3">Your personality across five major dimensions that influence behavior and thinking patterns</p>
                    <div className="space-y-3">
                      {Object.entries(profile.mappings.bigFive).map(([trait, score]) => (
                        <div key={trait} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{trait}</span>
                            <span className="font-semibold">{score.toFixed(1)}</span>
                          </div>
                          <Progress value={score * 10} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personality Matches */}
            {profile.mappings.personalityMatches && profile.mappings.personalityMatches.length > 0 && (
              <PersonalityMatches matches={profile.mappings.personalityMatches} />
            )}

            {/* Trait Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Trait Distribution Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart data={profile.traitScores} />
              </CardContent>
            </Card>

            {/* Domain Details */}
            <div className="grid gap-6">
              {Object.entries(profile.dominantTraits).map(([triad, trait]) => (
                <DomainCard
                  key={triad}
                  triad={triad}
                  dominantTrait={trait}
                  scores={profile.traitScores}
                />
              ))}
            </div>
          </LazyTabs.Content>

          <LazyTabs.Content value="insights">
            <CoreInsights profile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="ai-insights">
            <AIInsightsPanel profile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="types">
            <FrameworkCorrelations profile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="development">
            <PersonalDevelopment profile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="career">
            <CareerLifestyle profile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="comparison">
            <InsightComparisonPanel currentProfile={profile} />
          </LazyTabs.Content>

          <LazyTabs.Content value="enhanced">
            <EnhancedInsightsPanel 
              mbtiDetail={profile.mappings.mbtiDetail}
              enneagramDetail={profile.mappings.enneagramDetail}
              bigFiveDetail={profile.mappings.bigFiveDetail}
              attachmentStyle={profile.mappings.attachmentStyle}
              alignmentDetail={profile.mappings.alignmentDetail}
              hollandDetail={profile.mappings.hollandDetail}
              profile={profile}
            />
          </LazyTabs.Content>
        </LazyTabs>
      </div>
      
      <RefinementModal
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
      </div>
  );
};

export const PersonalityDashboard: React.FC<DashboardProps> = (props) => {
  return (
    <DashboardProvider profile={props.profile}>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
};