import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, Target, Users, Lightbulb, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Assessments: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-purple-600 bg-clip-text text-transparent">
            Discover Your True Self
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock deep insights into your personality, cognitive development, and potential with our comprehensive assessment suite.
          </p>
        </div>

        {/* Assessment Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Personality Tests Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center">
                  <Users className="mr-3 h-6 w-6 text-primary" />
                  Personality Tests
                </CardTitle>
                <Badge variant="secondary">Multiple Frameworks</Badge>
              </div>
              <CardDescription className="text-base">
                Comprehensive personality analysis using proven psychological frameworks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">MBTI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Big Five</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Enneagram</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Socionics</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into your personality traits, behavioral patterns, and interpersonal dynamics across multiple validated frameworks.
              </p>
              <Link to="/">
                <Button className="w-full mt-4">
                  Take Personality Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Integral Levels Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center">
                  <Target className="mr-3 h-6 w-6 text-primary" />
                  Integral Levels
                </CardTitle>
                <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-purple-600/10">
                  Advanced
                </Badge>
              </div>
              <CardDescription className="text-base">
                Discover your developmental stage and cognitive complexity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cognitive Development Stage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Reality Perception Triad</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Spiral Dynamics Integration</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore your level of consciousness, cognitive complexity, and developmental potential through the lens of Integral Theory and Spiral Dynamics.
              </p>
              <Link to="/integral">
                <Button className="w-full mt-4" variant="outline">
                  Explore Integral Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">What You'll Gain</CardTitle>
            <CardDescription className="text-center">
              Our assessments provide actionable insights for personal and professional growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Self-Awareness</h3>
                <p className="text-sm text-muted-foreground">
                  Deep understanding of your personality patterns and cognitive style
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Growth Direction</h3>
                <p className="text-sm text-muted-foreground">
                  Clear pathways for personal development and skill enhancement
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Better Relationships</h3>
                <p className="text-sm text-muted-foreground">
                  Improved communication and understanding in personal and professional relationships
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-muted-foreground mb-6">
            Start with either assessment - both provide valuable insights that complement each other.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                Start Personality Test
              </Button>
            </Link>
            <Link to="/integral">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Integral Levels
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;