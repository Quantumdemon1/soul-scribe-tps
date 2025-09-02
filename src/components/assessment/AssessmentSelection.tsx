import React, { useState } from 'react';
import { PersonalityTest } from './PersonalityTest';
import { AssessmentVariations } from '../../utils/assessmentVariations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Zap, Star, User, LogOut, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AssessmentSelection: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const assessmentOptions = AssessmentVariations.getAssessmentOptions();
  const { user, signOut } = useAuth();

  if (selectedAssessment) {
    return <PersonalityTest assessmentType={selectedAssessment} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-start mb-6">
            <div></div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/history'}>
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {user.email}
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => window.location.href = '/auth'}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Triadic Personality System Assessment
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Choose the assessment format that works best for you. All versions provide valuable insights 
            into your personality across multiple established frameworks.
          </p>
        </div>

        {/* Assessment Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {assessmentOptions.map((option) => (
            <Card 
              key={option.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                option.id === 'full' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedAssessment(option.id)}
            >
              {option.id === 'full' && (
                <div className="absolute top-4 right-4">
                  <Badge variant="default" className="bg-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {option.id === 'full' && <Target className="w-12 h-12 text-primary" />}
                  {option.id === 'quick' && <Clock className="w-12 h-12 text-primary" />}
                  {option.id === 'mini' && <Zap className="w-12 h-12 text-primary" />}
                </div>
                <CardTitle className="text-2xl mb-2">{option.name}</CardTitle>
                <p className="text-muted-foreground">{option.description}</p>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{option.estimatedTime}</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {option.questionCount} Questions
                  </div>
                  <Badge variant="outline">{option.accuracy} Accuracy</Badge>
                </div>
                
                <Button 
                  className="w-full"
                  variant={option.id === 'full' ? 'default' : 'outline'}
                >
                  Start {option.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="bg-muted/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">What You'll Discover</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">36 Personality Traits</h3>
              <p className="text-sm text-muted-foreground">Comprehensive analysis across all major personality dimensions</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Frameworks</h3>
              <p className="text-sm text-muted-foreground">MBTI, Enneagram, Big Five, and D&D alignment correlations</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">Detailed personality dashboard with insights and recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">Career recommendations and personal development guidance</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are the shorter assessments?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All assessments use the same sophisticated scoring algorithm. The quick assessment covers all personality domains 
                  with high accuracy, while the mini assessment provides a reliable snapshot for initial exploration.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What makes TPS different?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  TPS integrates multiple personality frameworks into one assessment, providing correlations with MBTI, Enneagram, 
                  Big Five, and more. This gives you a comprehensive view of your personality from multiple perspectives.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I retake the assessment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! You can retake any assessment at any time. We recommend waiting at least a few weeks between assessments 
                  for the most meaningful results, as personality can evolve with life experiences.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data private?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your assessment data is stored locally in your browser and only shared if you explicitly choose to export or 
                  share your results. We respect your privacy and give you full control over your data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSelection;