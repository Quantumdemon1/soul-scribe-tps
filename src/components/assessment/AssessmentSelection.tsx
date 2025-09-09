import React, { useState, useEffect } from 'react';
import { PersonalityTest } from './PersonalityTest';
import { AssessmentResults } from './AssessmentResults';
import { AssessmentVariations } from '../../utils/assessmentVariations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Zap, Star, User, LogOut, History, LogIn, Brain, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTestSession } from '@/hooks/useTestSession';
import { Header } from '@/components/layout/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AssessmentSelection: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [completedProfile, setCompletedProfile] = useState<any>(null);
  const [resumingSession, setResumingSession] = useState(false);
  const assessmentOptions = AssessmentVariations.getAssessmentOptions();
  const { user, signOut } = useAuth();
  const { resumeSession } = useTestSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle session resume from URL
  useEffect(() => {
    const resumeToken = searchParams.get('resume');
    if (resumeToken && user && !resumingSession) {
      setResumingSession(true);
      resumeSession(resumeToken).then((session) => {
        if (session) {
          setSelectedAssessment(session.test_type);
          toast({
            title: "Session Resumed",
            description: `Resuming ${session.test_name} from page ${session.current_page + 1}.`
          });
        }
        setResumingSession(false);
      });
    }
  }, [searchParams, user, resumeSession, resumingSession]);

  const handleStartAssessment = (assessmentType: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to take an assessment and save your progress.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    setSelectedAssessment(assessmentType);
  };

  // Render conditionally based on state, but keep all hooks at the top
  if (completedProfile) {
    return (
      <AssessmentResults 
        profile={completedProfile}
        onSave={(profile) => {
          // Profile saved successfully
          setCompletedProfile(null);
          setSelectedAssessment(null);
        }}
      />
    );
  }

  if (selectedAssessment) {
    return (
      <PersonalityTest 
        assessmentType={selectedAssessment} 
        onComplete={(profile) => setCompletedProfile(profile)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with auth controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-muted-foreground">
            Psyforge
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Psyforge Personality Assessment
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Choose the assessment format that works best for you. All versions provide valuable insights 
              into your personality across multiple established frameworks.
            </p>
          </div>

        {/* Integral Assessment Card */}
        <div className="mb-12">
          <Card 
            className="relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20"
            onClick={() => navigate('/integral')}
          >
            <div className="absolute top-4 right-4">
              <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary text-white">
                <Brain className="w-3 h-3 mr-1" />
                New: Cognitive Development
              </Badge>
            </div>
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Integral Level Assessment</CardTitle>
              <p className="text-muted-foreground">
                Discover your cognitive development level through Integral Theory and Spiral Dynamics
              </p>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">15-20 minutes</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  Separate Assessment
                </div>
                <Badge variant="outline">AI-Enhanced Clarification</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Two-stage assessment with AI-guided Socratic questions</p>
                <p>• Discover your Integral Level (Red, Amber, Orange, Green, Teal, Turquoise)</p>
                <p>• Optional integration with existing personality profile</p>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                Discover Your Integral Level
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {assessmentOptions.map((option) => (
            <Card 
              key={option.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                option.id === 'full' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleStartAssessment(option.id)}
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
                  onClick={() => handleStartAssessment(option.id)}
                >
                  {!user ? (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Sign In to Start
                    </>
                  ) : (
                    <>Start {option.name}</>
                  )}
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
                <CardTitle className="text-lg">What makes Psyforge different?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Psyforge integrates multiple personality frameworks into one assessment, providing correlations with MBTI, Enneagram, 
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
    </div>
  );
};

export default AssessmentSelection;