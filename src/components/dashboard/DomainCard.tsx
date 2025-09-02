import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TPSScores } from '../../types/tps.types';

interface DomainCardProps {
  triad: string;
  dominantTrait: string;
  scores: TPSScores;
}

const traitDescriptions: Record<string, { description: string; behaviors: string[]; implications: string }> = {
  'External': {
    description: 'Focuses on the outer world, action, and engagement with external reality.',
    behaviors: ['Takes initiative in social situations', 'Prefers action over contemplation', 'Draws energy from external activities'],
    implications: 'Likely to be assertive, outgoing, and comfortable taking charge in various situations.'
  },
  'Internal': {
    description: 'Focuses on inner thoughts, feelings, and personal reflection.',
    behaviors: ['Prefers deep thinking and introspection', 'Values personal space and quiet time', 'Processes information internally before acting'],
    implications: 'Likely to be thoughtful, contemplative, and comfortable working independently.'
  },
  'Interpersonal': {
    description: 'Prioritizes relationships, social connections, and understanding others.',
    behaviors: ['Shows empathy and concern for others', 'Seeks harmony in relationships', 'Values collaboration and teamwork'],
    implications: 'Likely to be supportive, diplomatic, and skilled at understanding different perspectives.'
  },
  'Processing': {
    description: 'Focuses on how information is analyzed, organized, and understood.',
    behaviors: ['Enjoys analyzing complex problems', 'Seeks systematic approaches', 'Values logic and structured thinking'],
    implications: 'Likely to be analytical, detail-oriented, and comfortable with abstract concepts.'
  },
  'Direct': {
    description: 'Communicates clearly and straightforwardly without ambiguity.',
    behaviors: ['States opinions clearly and directly', 'Prefers honest, straightforward communication', 'Values efficiency in conversation'],
    implications: 'Likely to be seen as honest, reliable, and no-nonsense in communication style.'
  },
  'Mixed Communication': {
    description: 'Adapts communication style based on context and audience.',
    behaviors: ['Adjusts tone and approach to different situations', 'Considers multiple perspectives before speaking', 'Uses varied communication strategies'],
    implications: 'Likely to be diplomatic, flexible, and skilled at reading social situations.'
  },
  'Passive': {
    description: 'Prefers to listen, observe, and respond rather than initiate.',
    behaviors: ['Listens more than speaks', 'Considers others\' input carefully', 'Avoids confrontational communication'],
    implications: 'Likely to be patient, thoughtful, and skilled at creating safe spaces for others to express themselves.'
  },
  'Stoic': {
    description: 'Maintains emotional stability and composure under pressure.',
    behaviors: ['Remains calm in stressful situations', 'Controls emotional expressions', 'Focuses on practical solutions'],
    implications: 'Likely to be reliable under pressure, level-headed, and good at crisis management.'
  },
  'Turbulent': {
    description: 'Experiences and expresses emotions intensely and variably.',
    behaviors: ['Shows emotional responses openly', 'Experiences mood variations', 'Values emotional authenticity'],
    implications: 'Likely to be passionate, expressive, and deeply connected to personal values and feelings.'
  },
  'Responsive': {
    description: 'Adapts emotional responses based on situations and others\' needs.',
    behaviors: ['Matches emotional energy to context', 'Shows appropriate emotional responses', 'Balances emotional expression with situational needs'],
    implications: 'Likely to be emotionally intelligent, adaptable, and skilled at managing different social dynamics.'
  }
};

export const DomainCard: React.FC<DomainCardProps> = ({
  triad,
  dominantTrait,
  scores
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const traitInfo = traitDescriptions[dominantTrait] || traitDescriptions[triad];
  const relatedTraits = Object.keys(scores).filter(trait => 
    trait !== dominantTrait && scores[trait] > 5
  ).slice(0, 3);
  
  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md" onClick={() => setExpanded(!expanded)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{triad}</span>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-medium">{dominantTrait}</Badge>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Primary Trait Score</span>
              </div>
              <div className="bg-accent/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{dominantTrait}</span>
                  <Badge variant="outline" className="font-mono">
                    {scores[dominantTrait]?.toFixed(1) || 'N/A'}/10
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(scores[dominantTrait] || 0) * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {traitInfo && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-primary">Understanding Your Trait</h4>
                <p className="text-sm text-muted-foreground mb-3">{traitInfo.description}</p>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Typical Behaviors</h5>
                  <ul className="text-sm space-y-1">
                    {traitInfo.behaviors.map((behavior, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{behavior}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                  <h5 className="font-medium text-xs uppercase tracking-wide text-primary mb-1">What This Means</h5>
                  <p className="text-sm">{traitInfo.implications}</p>
                </div>
              </div>
            )}

            {relatedTraits.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-primary">Other Notable Traits</h4>
                <div className="space-y-2">
                  {relatedTraits.map(trait => (
                    <div key={trait} className="flex justify-between items-center py-1">
                      <span className="text-sm">{trait}</span>
                      <Badge variant="secondary" className="text-xs">
                        {scores[trait]?.toFixed(1)}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};