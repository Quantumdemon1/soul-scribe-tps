import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataStatusIndicator } from '@/components/ui/data-status-indicator';
import { useDashboard, DashboardData } from '@/contexts/DashboardContext';
import { PersonalityProfile } from '@/types/tps.types';
import { Settings, Save, Download, Share2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { logger } from '@/utils/structuredLogging';

interface DashboardControlsProps {
  profile: PersonalityProfile;
  currentSection: string;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({ 
  profile, 
  currentSection 
}) => {
  const { data, loading, errors, clearCache, getLastGenerated } = useDashboard();
  const [isSaving, setIsSaving] = useState(false);

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
        logger.error('Failed to share dashboard content', {
          component: 'DashboardControls',
          action: 'share'
        }, error as Error);
      }
    }
  };

  const currentSectionData = data[currentSection as keyof typeof data];
  const isLoading = loading[currentSection] || false;
  const error = errors[currentSection] || null;
  const lastGenerated = getLastGenerated(currentSection as keyof DashboardData);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Dashboard Controls</CardTitle>
          <div className="flex items-center gap-2">
            <DataStatusIndicator
              isLoading={isLoading}
              hasData={!!currentSectionData}
              error={error}
              lastGenerated={lastGenerated}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportSection} disabled={!currentSectionData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareSection} disabled={!currentSectionData}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Section
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearCache} className="text-destructive">
                  Clear All Cache
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Current section: <Badge variant="outline">{currentSection}</Badge></span>
            {lastGenerated && (
              <span>Last updated: {lastGenerated}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Cache status:</span>
            <Badge variant={Object.keys(data).filter(key => data[key as keyof typeof data]).length > 2 ? 'default' : 'secondary'}>
              {Object.keys(data).filter(key => data[key as keyof typeof data]).length}/5 sections loaded
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};