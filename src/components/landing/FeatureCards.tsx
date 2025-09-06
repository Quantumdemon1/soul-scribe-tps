import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, TrendingUp } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Scientific Approach",
      description: "Our assessment is grounded in established psychological frameworks and research-backed methodologies for accurate personality insights."
    },
    {
      icon: Target,
      title: "Deep Insights",
      description: "Discover detailed behavioral patterns, strengths, and growth areas across multiple personality dimensions and frameworks."
    },
    {
      icon: TrendingUp,
      title: "Personal Growth",
      description: "Receive actionable insights and personalized recommendations to enhance your self-awareness and personal development journey."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Psyforge?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the most comprehensive personality assessment platform designed for deep self-understanding
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};