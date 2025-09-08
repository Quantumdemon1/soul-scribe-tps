import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AssessmentValidationProps {
  integralDetail: IntegralDetail;
  className?: string;
}

export const AssessmentValidation: React.FC<AssessmentValidationProps> = ({
  integralDetail,
  className
}) => {
  const metadata = (integralDetail as any).assessmentMetadata;
  
  const getValidationStatus = () => {
    if (metadata?.errorFallback) return 'error';
    if (metadata?.fallbackUsed) return 'warning';
    if (metadata?.consistencyCheck?.preliminaryMatchesSocratic === false) return 'inconsistent';
    return 'validated';
  };

  const status = getValidationStatus();
  
  const getStatusIcon = () => {
    switch (status) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'inconsistent': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'error':
        return {
          title: 'Assessment Error',
          description: 'An error occurred during assessment. Results are based on initial responses only.',
          variant: 'destructive' as const
        };
      case 'warning':
        return {
          title: 'Partial Analysis',
          description: 'Socratic analysis was incomplete. Results combine initial assessment with reduced confidence.',
          variant: 'secondary' as const
        };
      case 'inconsistent':
        return {
          title: 'Mixed Indicators',
          description: 'Your initial and clarification responses showed different patterns. Final result weighs both assessments.',
          variant: 'outline' as const
        };
      default:
        return {
          title: 'Assessment Validated',
          description: 'Both initial and clarification responses align consistently with your final level.',
          variant: 'outline' as const
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          Assessment Quality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant={statusInfo.variant} className="mb-2">
            {statusInfo.title}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {statusInfo.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Confidence Level</span>
            <span>{Math.round(integralDetail.confidence)}%</span>
          </div>
          <Progress value={integralDetail.confidence} className="h-2" />
        </div>

        {metadata?.weightingUsed && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Assessment Weighting:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Initial:</span>
                <span>{Math.round(metadata.weightingUsed.initial * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Socratic:</span>
                <span>{Math.round(metadata.weightingUsed.socratic * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {metadata?.socraticAnalysis && (
          <div>
            <p className="text-xs font-medium mb-1">Analysis Summary:</p>
            <p className="text-xs text-muted-foreground italic">
              "{metadata.socraticAnalysis}"
            </p>
          </div>
        )}

        {metadata?.consistencyCheck?.conflictAreas?.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-1">Areas of Inconsistency:</p>
            <div className="flex flex-wrap gap-1">
              {metadata.consistencyCheck.conflictAreas.map((area: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};