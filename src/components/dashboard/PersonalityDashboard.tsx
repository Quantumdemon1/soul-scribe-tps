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
import { MobileDashboardTabs } from './MobileDashboardTabs';
import { MobileHeroSection } from './MobileHeroSection';
import { MobileDashboardControls } from './MobileDashboardControls';
import { MobileFrameworkCards } from './MobileFrameworkCards';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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
          title: 'My Psyforge Personality Profile',
          text: `I just completed the Psyforge personality assessment! My MBTI type is ${profile.mappings.mbti} and my Enneagram type is ${profile.mappings.enneagram}.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `I just completed the Psyforge personality assessment! My MBTI type is ${profile.mappings.mbti} and my Enneagram type is ${profile.mappings.enneagram}.`;
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
      <MobileHeroSection
        profile={profile}
        onExportJSON={handleExportJSON}
        onGeneratePDF={handleGeneratePDF}
        onShare={handleShare}
        onRetakeTest={handleRetakeTest}
        onOpenRefinement={() => setIsRefinementOpen(true)}
      />

      {/* Main Content */}
      <div className={isMobile ? "" : "max-w-7xl mx-auto px-6 py-8"}>
        {isMobile ? (
          <MobileDashboardControls profile={profile} currentSection={activeTab} />
        ) : (
          <DashboardControls profile={profile} currentSection={activeTab} />
        )}
        
        <MobileDashboardTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          onTabLoad={handleTabLoad}
        >

          <LazyTabs.Content value="overview" className={isMobile ? "space-y-4" : "space-y-8"} eager={true}>
            {/* Framework Mappings */}
            <MobileFrameworkCards profile={profile} />

            {/* Personality Matches */}
            {profile.mappings.personalityMatches && profile.mappings.personalityMatches.length > 0 && (
              <PersonalityMatches matches={profile.mappings.personalityMatches} />
            )}

            {/* Trait Visualization */}
            {!isMobile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Trait Distribution Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart data={profile.traitScores} />
                </CardContent>
              </Card>
            ) : (
              <Card className="mx-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trait Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <RadarChart data={profile.traitScores} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Domain Details */}
            <div className={isMobile ? "space-y-4 mx-4" : "grid gap-6"}>
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
        </MobileDashboardTabs>
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