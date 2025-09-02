import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PersonalityProfile } from '@/types/tps.types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus, GitCompare, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { PDFReportGenerator } from '@/utils/pdfGenerator';

interface Assessment {
  id: string;
  profile: PersonalityProfile;
  created_at: string;
  variant: string;
}

interface AssessmentComparisonProps {
  assessments: Assessment[];
}

export const AssessmentComparison: React.FC<AssessmentComparisonProps> = ({ assessments }) => {
  const [primaryId, setPrimaryId] = useState<string>('');
  const [secondaryId, setSecondaryId] = useState<string>('');

  const primaryAssessment = assessments.find(a => a.id === primaryId);
  const secondaryAssessment = assessments.find(a => a.id === secondaryId);

  const formatAssessmentLabel = (assessment: Assessment) => {
    return `${format(new Date(assessment.created_at), 'MMM d, yyyy')} (${assessment.variant})`;
  };

  const calculateChange = (primary: number, secondary: number): { value: number; direction: 'up' | 'down' | 'same' } => {
    const diff = primary - secondary;
    return {
      value: Math.abs(diff),
      direction: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'same'
    };
  };

  const getDomainComparisonData = () => {
    if (!primaryAssessment || !secondaryAssessment) return [];
    
    return Object.keys(primaryAssessment.profile.domainScores).map(domain => ({
      domain,
      primary: primaryAssessment.profile.domainScores[domain as keyof typeof primaryAssessment.profile.domainScores],
      secondary: secondaryAssessment.profile.domainScores[domain as keyof typeof secondaryAssessment.profile.domainScores]
    }));
  };

  const getRadarData = () => {
    if (!primaryAssessment || !secondaryAssessment) return [];
    
    return Object.entries(primaryAssessment.profile.domainScores).map(([domain, primaryScore]) => ({
      domain: domain.charAt(0).toUpperCase() + domain.slice(1),
      primary: primaryScore * 10,
      secondary: secondaryAssessment.profile.domainScores[domain as keyof typeof secondaryAssessment.profile.domainScores] * 10
    }));
  };

  const renderChangeIndicator = (change: ReturnType<typeof calculateChange>) => {
    const Icon = change.direction === 'up' ? TrendingUp : change.direction === 'down' ? TrendingDown : Minus;
    const colorClass = change.direction === 'up' ? 'text-success' : change.direction === 'down' ? 'text-warning' : 'text-muted-foreground';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {change.direction === 'same' ? 'No change' : `${change.value.toFixed(1)} point${change.value !== 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  const exportComparison = async () => {
    if (!primaryAssessment || !secondaryAssessment) return;
    
    const comparisonData = {
      primary: primaryAssessment.profile,
      secondary: secondaryAssessment.profile,
      primaryDate: primaryAssessment.created_at,
      secondaryDate: secondaryAssessment.created_at,
      changes: getDomainComparisonData().map(data => ({
        domain: data.domain,
        change: calculateChange(data.primary * 10, data.secondary * 10)
      }))
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Assessment Comparison Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .change-indicator { display: flex; align-items: center; gap: 5px; }
        .improvement { color: #10b981; }
        .decline { color: #f59e0b; }
        .no-change { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Assessment Comparison Report</h1>
        <p>Primary: ${format(new Date(comparisonData.primaryDate), 'MMMM d, yyyy')}</p>
        <p>Secondary: ${format(new Date(comparisonData.secondaryDate), 'MMMM d, yyyy')}</p>
    </div>
    
    <h2>Domain Score Changes</h2>
    ${comparisonData.changes.map(change => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">
            <strong>${change.domain}:</strong>
            <span class="change-indicator ${change.change.direction === 'up' ? 'improvement' : change.change.direction === 'down' ? 'decline' : 'no-change'}">
                ${change.change.direction === 'up' ? '↗' : change.change.direction === 'down' ? '↘' : '→'} 
                ${change.change.direction === 'same' ? 'No change' : `${change.change.value.toFixed(1)} points`}
            </span>
        </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assessment-Comparison-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (assessments.length < 2) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Need More Assessments</h3>
          <p className="text-muted-foreground">
            Take at least 2 assessments to compare your progress over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Assessment (Latest)</label>
              <Select value={primaryId} onValueChange={setPrimaryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {formatAssessmentLabel(assessment)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Compare With</label>
              <Select value={secondaryId} onValueChange={setSecondaryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select comparison assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.filter(a => a.id !== primaryId).map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {formatAssessmentLabel(assessment)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {primaryAssessment && secondaryAssessment && (
            <Button onClick={exportComparison} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Comparison Report
            </Button>
          )}
        </CardContent>
      </Card>

      {primaryAssessment && secondaryAssessment && (
        <>
          {/* Domain Score Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Score Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {getDomainComparisonData().map(data => {
                  const change = calculateChange(data.primary * 10, data.secondary * 10);
                  return (
                    <div key={data.domain} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{data.domain}</h4>
                        {renderChangeIndicator(change)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Latest:</span>
                          <Badge variant="default">{(data.primary * 10).toFixed(1)}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Previous:</span>
                          <Badge variant="outline">{(data.secondary * 10).toFixed(1)}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDomainComparisonData()}>
                    <XAxis dataKey="domain" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => (value * 10).toFixed(1)} />
                    <Bar dataKey="primary" fill="hsl(var(--primary))" name="Latest" />
                    <Bar dataKey="secondary" fill="hsl(var(--muted))" name="Previous" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Profile Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar 
                      name="Latest" 
                      dataKey="primary" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                    <Radar 
                      name="Previous" 
                      dataKey="secondary" 
                      stroke="hsl(var(--muted-foreground))" 
                      fill="hsl(var(--muted-foreground))" 
                      fillOpacity={0.1}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Personality Type Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Type Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">MBTI Type</h4>
                  <div className="space-y-2">
                    <Badge variant="default" className="block">
                      {primaryAssessment.profile.mappings.mbti}
                    </Badge>
                    <div className="text-sm text-muted-foreground">from</div>
                    <Badge variant="outline" className="block">
                      {secondaryAssessment.profile.mappings.mbti}
                    </Badge>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Enneagram</h4>
                  <div className="space-y-2">
                    <Badge variant="default" className="block">
                      {primaryAssessment.profile.mappings.enneagram}
                    </Badge>
                    <div className="text-sm text-muted-foreground">from</div>
                    <Badge variant="outline" className="block">
                      {secondaryAssessment.profile.mappings.enneagram}
                    </Badge>
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">D&D Alignment</h4>
                  <div className="space-y-2">
                    <Badge variant="default" className="block">
                      {primaryAssessment.profile.mappings.dndAlignment}
                    </Badge>
                    <div className="text-sm text-muted-foreground">from</div>
                    <Badge variant="outline" className="block">
                      {secondaryAssessment.profile.mappings.dndAlignment}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};