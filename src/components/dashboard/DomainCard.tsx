import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TPSScores } from '../../types/tps.types';

interface DomainCardProps {
  triad: string;
  dominantTrait: string;
  scores: TPSScores;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  triad,
  dominantTrait,
  scores
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{triad}</span>
          <div className="flex items-center gap-2">
            <Badge variant="default">{dominantTrait}</Badge>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Score: {scores[dominantTrait]?.toFixed(1) || 'N/A'}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};