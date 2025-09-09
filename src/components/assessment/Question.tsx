import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuestionProps {
  question: string;
  questionNumber: number;
  value: number;
  onChange: (value: number) => void;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  value,
  onChange
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="bg-assessment-card border-muted">
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <p className={`font-medium text-foreground leading-relaxed ${isMobile ? 'mb-4 text-base' : 'mb-6'}`}>
          <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-bold rounded-full mr-3 flex-shrink-0">
            {questionNumber}
          </span>
          {question}
        </p>
        
        {isMobile ? (
          // Mobile layout: vertical stack with larger touch targets
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => onChange(num)}
                  className={`h-12 w-full rounded-lg border-2 transition-all duration-200 font-semibold text-sm touch-manipulation ${
                    value === num
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-105'
                      : 'border-muted hover:border-primary/50 hover:bg-primary/10 text-muted-foreground active:bg-primary/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Desktop layout: horizontal with labels
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground font-medium min-w-fit">
              Strongly Disagree
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => onChange(num)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                    value === num
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-110'
                      : 'border-muted hover:border-primary/50 hover:bg-primary/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium min-w-fit">
              Strongly Agree
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};