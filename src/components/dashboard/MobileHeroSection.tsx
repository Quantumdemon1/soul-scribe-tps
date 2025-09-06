import React, { useState } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Brain, 
  Download, 
  Share2, 
  RotateCcw,
  Settings,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeroSectionProps {
  profile: PersonalityProfile;
  onExportJSON: () => void;
  onGeneratePDF: () => Promise<void>;
  onShare: () => Promise<void>;
  onRetakeTest: () => void;
  onOpenRefinement: () => void;
}

export const MobileHeroSection: React.FC<MobileHeroSectionProps> = ({
  profile,
  onExportJSON,
  onGeneratePDF,
  onShare,
  onRetakeTest,
  onOpenRefinement
}) => {
  const isMobile = useIsMobile();
  const [showAllActions, setShowAllActions] = useState(false);

  if (!isMobile) {
    // Return original desktop layout
    return (
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-16 h-16 mr-4" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Personality Profile</h1>
                <p className="text-xl opacity-90">Psyforge Analysis</p>
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
              onClick={onExportJSON}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button 
              onClick={onGeneratePDF}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
            <Button 
              onClick={onShare}
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button 
              onClick={onOpenRefinement}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Refine Results
            </Button>
            <Button 
              onClick={onRetakeTest}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile optimized layout
  return (
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <Brain className="w-12 h-12 mr-3" />
            <div>
              <h1 className="text-2xl font-bold mb-1">Your Profile</h1>
              <p className="text-sm opacity-90">Psyforge Analysis</p>
            </div>
          </div>
          <p className="text-sm opacity-80 px-2">
            Your domain scores show how you prefer viewing the world
          </p>
        </div>

        {/* Domain Scores - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(profile.domainScores).map(([domain, score]) => {
            const domainDescriptions = {
              External: "Outside world",
              Internal: "Inner world", 
              Interpersonal: "People",
              Processing: "Information"
            };
            
            return (
              <Card key={domain} className="bg-white/10 border-white/20">
                <CardContent className="p-3 text-center">
                  <h3 className="font-semibold text-sm mb-1">{domain}</h3>
                  <div className="text-2xl font-bold mb-1">
                    {(score * 10).toFixed(1)}
                  </div>
                  <p className="text-xs opacity-80 mb-2">
                    {domainDescriptions[domain as keyof typeof domainDescriptions]}
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-white h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Primary Action */}
        <div className="mb-4">
          <Button 
            onClick={() => window.location.href = '/mentor'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg h-12"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat with AI Mentor
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            onClick={onShare}
            variant="secondary"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            size="sm"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button 
            onClick={onRetakeTest}
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Retake
          </Button>
        </div>

        {/* Collapsible Additional Actions */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllActions(!showAllActions)}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {showAllActions ? 'Hide' : 'More'} Actions
            {showAllActions ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>

        {/* Additional Actions - Collapsible */}
        {showAllActions && (
          <div className="mt-4 space-y-2 animate-in slide-in-from-top-2">
            <Button 
              onClick={onGeneratePDF}
              variant="secondary"
              className="w-full bg-white/10 border-white/20 hover:bg-white/20"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF Report
            </Button>
            <Button 
              onClick={onExportJSON}
              variant="secondary"
              className="w-full bg-white/10 border-white/20 hover:bg-white/20"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data (JSON)
            </Button>
            <Button 
              onClick={onOpenRefinement}
              variant="outline"
              className="w-full border-white/40 text-white hover:bg-white/10"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Refine Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};