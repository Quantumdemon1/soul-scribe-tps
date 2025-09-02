import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <Card className="bg-assessment-card border-muted">
      <CardContent className="p-6">
        <p className="font-medium mb-6 text-foreground leading-relaxed">
          <span className="text-primary font-bold">{questionNumber}.</span> {question}
        </p>
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
      </CardContent>
    </Card>
  );
};