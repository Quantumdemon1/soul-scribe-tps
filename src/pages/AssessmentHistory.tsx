import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAssessments } from '@/hooks/useAssessments';
import { useAuth } from '@/hooks/useAuth';
import { PersonalityDashboard } from '@/components/dashboard/PersonalityDashboard';
import { AssessmentComparison } from '@/components/analytics/AssessmentComparison';
import { ArrowLeft, Calendar, Trash2, Eye, History, User, TrendingUp, LogIn, Download, GitCompare } from 'lucide-react';
import { format } from 'date-fns';
import { PDFReportGenerator } from '@/utils/pdfGenerator';

const AssessmentHistory: React.FC = () => {
  const { assessments, loading, deleteAssessment } = useAssessments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to sign in to view your assessment history.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedProfile(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <PersonalityDashboard profile={selectedProfile} />
        </div>
      </div>
    );
  }

  const getVariantDetails = (variant: string) => {
    switch (variant) {
      case 'full':
        return { name: 'Complete Assessment', color: 'default', questions: 108 };
      case 'quick':
        return { name: 'Quick Assessment', color: 'secondary', questions: 36 };
      case 'mini':
        return { name: 'Mini Assessment', color: 'outline', questions: 12 };
      default:
        return { name: 'Assessment', color: 'outline', questions: 108 };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {user.email}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <History className="w-12 h-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Assessment History</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Review your personality development journey and compare results over time
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your assessment history...</p>
          </div>
        ) : assessments.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Assessments Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Take your first personality assessment to start tracking your development.
              </p>
              <Button onClick={() => navigate('/')}>
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                    {assessments.filter(a => a.variant === 'full').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Complete Assessments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {assessments.length > 0 ? format(new Date(assessments[0].created_at), 'MMM yyyy') : '-'}
                  </div>
                  <p className="text-sm text-muted-foreground">Latest Assessment</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Assessment History
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4" />
                  Compare Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4 mt-6">
                {assessments.map((assessment) => {
                const variantDetails = getVariantDetails(assessment.variant);
                return (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <History className="w-6 h-6 text-primary" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{variantDetails.name}</h3>
                              <Badge variant={variantDetails.color as any}>
                                {variantDetails.questions} Questions
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(assessment.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                              </div>
                              {assessment.profile.mappings && (
                                <div>
                                  MBTI: {assessment.profile.mappings.mbti} | 
                                  Enneagram: {assessment.profile.mappings.enneagram}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProfile(assessment.profile)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Results
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => PDFReportGenerator.generatePDFReport(assessment.profile)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this assessment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteAssessment(assessment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <AssessmentComparison assessments={assessments} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory;