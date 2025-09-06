import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataStatusIndicator } from '@/components/ui/data-status-indicator';
import { useDashboard, DashboardData } from '@/contexts/DashboardContext';
import { PersonalityProfile } from '@/types/tps.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings, Download, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface MobileDashboardControlsProps {
  profile: PersonalityProfile;
  currentSection: string;
}

export const MobileDashboardControls: React.FC<MobileDashboardControlsProps> = ({ 
  profile, 
  currentSection 
}) => {
  const isMobile = useIsMobile();
  const { data, loading, errors, clearCache, getLastGenerated } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);

  const handleExportSection = () => {
    const sectionData = data[currentSection as keyof typeof data];
    if (sectionData) {
      const dataStr = JSON.stringify(sectionData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileName = `personality-${currentSection}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    }
  };

  const handleShareSection = async () => {
    const sectionData = data[currentSection as keyof typeof data];
    if (sectionData && navigator.share) {
      try {
        await navigator.share({
          title: `My ${currentSection} insights`,
          text: `Check out my personality insights from the ${currentSection} section!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const currentSectionData = data[currentSection as keyof typeof data];
  const isLoading = loading[currentSection] || false;
  const error = errors[currentSection] || null;
  const lastGenerated = getLastGenerated(currentSection as keyof DashboardData);
  const loadedSections = Object.keys(data).filter(key => data[key as keyof typeof data]).length;

  if (!isMobile) {
    // Desktop version - return original component structure
    return (
      <div className="mb-6 bg-card border rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Dashboard Controls</h3>
            <div className="flex items-center gap-2">
              <DataStatusIndicator
                isLoading={isLoading}
                hasData={!!currentSectionData}
                error={error}
                lastGenerated={lastGenerated}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportSection} disabled={!currentSectionData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareSection} disabled={!currentSectionData}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={clearCache}>
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Section: <Badge variant="outline">{currentSection}</Badge></span>
              {lastGenerated && (
                <span>Updated: {lastGenerated}</span>
              )}
            </div>
            <Badge variant={loadedSections > 2 ? 'default' : 'secondary'}>
              {loadedSections}/5 sections loaded
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Mobile optimized version
  return (
    <div className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Compact header with status */}
        <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentSection}
            </Badge>
            <DataStatusIndicator
              isLoading={isLoading}
              hasData={!!currentSectionData}
              error={error}
              lastGenerated={lastGenerated}
            />
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <Settings className="w-4 h-4" />
              {isOpen ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Collapsible controls */}
        <CollapsibleContent>
          <div className="mt-2 p-4 bg-card border rounded-lg space-y-3">
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportSection} 
                disabled={!currentSectionData}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareSection} 
                disabled={!currentSectionData}
                className="justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Status info */}
            <div className="text-xs text-muted-foreground space-y-1">
              {lastGenerated && (
                <div>Last updated: {lastGenerated}</div>
              )}
              <div className="flex items-center justify-between">
                <span>Cache status:</span>
                <Badge variant={loadedSections > 2 ? 'default' : 'secondary'} className="text-xs">
                  {loadedSections}/5 loaded
                </Badge>
              </div>
            </div>

            {/* Danger zone */}
            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCache}
                className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                Clear All Cache
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};