import React, { useState } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { PDFReportGenerator } from '../../utils/pdfGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { RadarChart } from '../charts/RadarChart';
import { CircularProgress } from '../charts/CircularProgress';
import { DomainCard } from './DomainCard';
import { FrameworkCorrelations } from './FrameworkCorrelations';
import { CoreInsights } from './CoreInsights';
import { PersonalDevelopment } from './PersonalDevelopment';
import { AIInsightsPanel } from './AIInsightsPanel';
import { CareerLifestyle } from './CareerLifestyle';
import { RefinementModal } from './RefinementModal';
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
  Settings
} from 'lucide-react';

interface DashboardProps {
  profile: PersonalityProfile;
  onRetakeAssessment?: () => void;
}

export const PersonalityDashboard: React.FC<DashboardProps> = ({ profile: initialProfile, onRetakeAssessment }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(initialProfile);
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);

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

  return (
    <DashboardProvider profile={profile}>
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
              Deep insights into your personality across four core domains that shape how you experience and interact with the world.
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Core Insights
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Personality Types
            </TabsTrigger>
            <TabsTrigger value="development" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Development
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Career & Lifestyle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
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
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {profile.mappings.mbti}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Enneagram</h3>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {profile.mappings.enneagram}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Tritype: {profile.mappings.enneagramDetails.tritype}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Socionics</h3>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {profile.mappings.socionics}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Holland Code</h3>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {profile.mappings.hollandCode}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">D&D Alignment</h3>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {profile.mappings.dndAlignment}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-4">Big Five</h3>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personality Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {profile.mappings.personalityMatches.map((match, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{match.name}</h4>
                          <Badge variant={match.type === 'real' ? 'default' : 'secondary'}>
                            {match.type === 'real' ? 'Real' : 'Fictional'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{match.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Match:</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${match.similarity * 10}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{(match.similarity * 10).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          </TabsContent>

          <TabsContent value="insights">
            <CoreInsights profile={profile} />
          </TabsContent>

          <TabsContent value="ai-insights">
          <AIInsightsPanel profile={profile} />
          </TabsContent>

          <TabsContent value="types">
            <FrameworkCorrelations profile={profile} />
          </TabsContent>

          <TabsContent value="development">
            <PersonalDevelopment profile={profile} />
          </TabsContent>

          <TabsContent value="career">
            <CareerLifestyle profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
      
      <RefinementModal
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
      </div>
    </DashboardProvider>
  );
};