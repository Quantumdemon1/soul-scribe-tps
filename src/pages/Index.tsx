import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import AssessmentSelection from "../components/assessment/AssessmentSelection";
import { FrameworkCorrelations } from '@/components/dashboard/FrameworkCorrelations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, History, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const { assessments, loading } = useAssessments();
  const navigate = useNavigate();

  // Show assessment selection for non-logged in users or those without assessments
  if (!user || loading || !assessments || assessments.length === 0) {
    return <AssessmentSelection />;
  }

  // Get the most recent assessment profile
  const latestAssessment = assessments[0];
  const profile = latestAssessment?.profile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-muted-foreground">
            Psyforge - Overview
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
              <History className="w-4 h-4 mr-2" />
              View All Assessments
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Your Personality Overview
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Explore your personality across multiple established frameworks and discover insights 
              from your most recent assessment.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {assessments.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {profile?.mappings?.mbti || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">MBTI Type</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {profile?.mappings?.enneagram || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Enneagram Type</p>
              </CardContent>
            </Card>
          </div>

          {/* Framework Correlations */}
          {profile && (
            <div className="mb-12">
              <FrameworkCorrelations profile={profile} />
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-muted/50">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Ready for Another Assessment?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Track your personality development over time by taking another assessment. 
                  Compare your results and see how you've grown.
                </p>
                <Button size="lg" onClick={() => window.location.reload()}>
                  Take New Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
