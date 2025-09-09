import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
interface HeroSectionProps {
  onStartAssessment: () => void;
}
export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAssessment
}) => {
  return <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{
    background: 'var(--hero-bg)'
  }}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
      
      <div className="container relative z-10 text-center px-4 max-w-4xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
            <Brain className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Discover Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-primary">
            True Self
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Unlock profound insights into your personality with our scientifically-backed assessment. 
          Understanding yourself is the first step to personal growth and meaningful connections.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" onClick={onStartAssessment}>
            Start Your Assessment
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Link to="/mentor">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold rounded-xl border-primary/30 hover:bg-primary/10 transition-all duration-300">
              Preview AI Coach
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>15-minute assessment • Instant results</p>
        </div>
      </div>
    </section>;
};