import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuditTrailService } from '@/services/auditTrailService';
import { ScoringOverrides } from '@/services/scoringConfigService';
import { AlertTriangle, Users, TrendingUp, Clock, Shield } from 'lucide-react';

interface ImpactAssessmentProps {
  proposedChanges: ScoringOverrides;
  currentConfig: ScoringOverrides | null;
  onApprove: () => void;
  onReject: () => void;
}

export const ImpactAssessment: React.FC<ImpactAssessmentProps> = ({
  proposedChanges,
  currentConfig,
  onApprove,
  onReject
}) => {
  const [assessment, setAssessment] = useState<{
    estimatedAffectedUsers: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
  } | null>(null);
  const [changesSummary, setChangesSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeImpact = async () => {
      setLoading(true);
      
      const impact = await AuditTrailService.getImpactAssessment(proposedChanges);
      const summary = AuditTrailService.generateChangesSummary(currentConfig, proposedChanges);
      
      setAssessment(impact);
      setChangesSummary(summary);
      setLoading(false);
    };

    analyzeImpact();
  }, [proposedChanges, currentConfig]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analyzing Impact...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to analyze impact. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Impact Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Risk Level:</span>
            <Badge variant={getRiskColor(assessment.riskLevel)} className="flex items-center gap-1">
              {getRiskIcon(assessment.riskLevel)}
              {assessment.riskLevel.toUpperCase()}
            </Badge>
          </div>

          {/* Estimated Impact */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Estimated Affected Users:</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-mono">{assessment.estimatedAffectedUsers.toLocaleString()}</span>
            </div>
          </div>

          {/* Risk Factors */}
          {assessment.riskFactors.length > 0 && (
            <div>
              <span className="font-medium mb-2 block">Risk Factors:</span>
              <ul className="space-y-1">
                {assessment.riskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 mt-0.5 text-destructive flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Changes Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Proposed Changes ({changesSummary.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {changesSummary.length === 0 ? (
            <p className="text-muted-foreground">No changes detected.</p>
          ) : (
            <ul className="space-y-1">
              {changesSummary.map((change, idx) => (
                <li key={idx} className="text-sm font-mono bg-muted p-2 rounded">
                  {change}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Safety Warnings */}
      {assessment.riskLevel === 'high' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Risk Changes Detected:</strong> These changes may significantly impact user assessments. 
            Consider testing on a subset of users first or implementing gradually.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onReject}>
          Cancel Changes
        </Button>
        <Button 
          onClick={onApprove}
          variant={assessment.riskLevel === 'high' ? 'destructive' : 'default'}
        >
          {assessment.riskLevel === 'high' ? 'Apply High-Risk Changes' : 'Apply Changes'}
        </Button>
      </div>
    </div>
  );
};