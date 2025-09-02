import React, { useState } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadarChart } from '../charts/RadarChart';
import { CircularProgress } from '../charts/CircularProgress';
import { DomainCard } from './DomainCard';
import { PersonalityTypes } from './PersonalityTypes';
import { CoreInsights } from './CoreInsights';
import { PersonalDevelopment } from './PersonalDevelopment';
import { CareerLifestyle } from './CareerLifestyle';
import { 
  Brain, 
  Download, 
  Share2, 
  RotateCcw,
  User,
  Target,
  Briefcase,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  profile: PersonalityProfile;
}

export const PersonalityDashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tps-personality-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRetakeTest = () => {
    localStorage.removeItem('tps-profile');
    window.location.reload();
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
    <div className="min-h-screen bg-background">
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
              Comprehensive analysis based on 108 questions across 36 personality traits, 
              organized into 12 triads and 4 core domains.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(profile.domainScores).map(([domain, score]) => {
              const colors = {
                External: 'bg-domain-external',
                Internal: 'bg-domain-internal', 
                Interpersonal: 'bg-domain-interpersonal',
                Processing: 'bg-domain-processing'
              };
              
              return (
                <Card key={domain} className="bg-white/10 border-white/20 text-center">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{domain}</h3>
                    <div className="text-3xl font-bold">
                      {(score * 10).toFixed(1)}
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-3">
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
              Export Data
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Core Insights
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">D&D Alignment</h3>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {profile.mappings.dndAlignment}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-muted-foreground mb-2">Big Five</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(profile.mappings.bigFive).map(([trait, score]) => (
                        <div key={trait} className="flex justify-between">
                          <span>{trait.charAt(0)}:</span>
                          <span className="font-semibold">{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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

          <TabsContent value="types">
            <PersonalityTypes profile={profile} />
          </TabsContent>

          <TabsContent value="development">
            <PersonalDevelopment profile={profile} />
          </TabsContent>

          <TabsContent value="career">
            <CareerLifestyle profile={profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};