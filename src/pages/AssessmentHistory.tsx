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
import { ArrowLeft, Calendar, Trash2, Eye, History, User, TrendingUp, LogIn, Download, GitCompare, RefreshCw, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { PDFReportGenerator } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { TPSScoring } from '@/utils/tpsScoring';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { IntegralLevelBadge } from '@/components/dashboard/IntegralLevelBadge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { logger } from '@/utils/structuredLogging';


const AssessmentHistory: React.FC = () => {
  const { assessments, loading, deleteAssessment } = useAssessments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

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
        <div className={`max-w-6xl mx-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          <Button 
            variant="outline" 
            onClick={() => setSelectedProfile(null)}
            className={`mb-6 ${isMobile ? 'w-full' : ''}`}
            size={isMobile ? 'default' : 'default'}
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

  const handleRecalculateMappings = async () => {
    if (!assessments || assessments.length === 0) return;
    setRecalcLoading(true);
    try {
      await Promise.all(
        assessments.map(async (a: any) => {
          const responses: number[] | undefined = a.responses;
          if (!responses || !Array.isArray(responses) || responses.length === 0) return null;
          const newProfile = TPSScoring.generateFullProfile(responses);
          const { error } = await supabase
            .from('assessments')
            .update({ profile: newProfile as any })
            .eq('id', a.id);
          if (error) throw error;
          return a.id;
        })
      );
      toast({ title: 'Recalculation complete', description: 'Mappings recalculated. Refresh to see updates.' });
    } catch (err: any) {
      logger.error('Assessment recalculation error', { component: 'AssessmentHistory' }, err as Error);
      toast({ title: 'Recalculation failed', description: err?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setRecalcLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-6xl mx-auto ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Header */}
        <div className={`mb-${isMobile ? '6' : '8'}`}>
          {/* Mobile Header */}
          {isMobile ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <History className="w-8 h-8 text-primary mr-2" />
                  <h1 className="text-2xl font-bold">Assessment History</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review your personality development journey
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                <User className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRecalculateMappings}
                disabled={recalcLoading}
                className="w-full"
                title="Recompute MBTI, Enneagram, Big Five, Alignment using fixed mappings"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {recalcLoading ? 'Recalculating...' : 'Recalculate mappings'}
              </Button>
            </div>
          ) : (
            /* Desktop Header */
            <>
              <div className="flex items-center justify-between mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {user.email}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRecalculateMappings}
                    disabled={recalcLoading}
                    title="Recompute MBTI, Enneagram, Big Five, Alignment using fixed mappings"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {recalcLoading ? 'Recalculating...' : 'Recalculate mappings'}
                  </Button>
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
            </>
          )}
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
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-6'} mb-${isMobile ? '6' : '8'}`}>
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary mb-2`}>
                    {assessments.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary mb-2`}>
                    {assessments.filter(a => a.variant === 'full').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Complete Assessments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                  <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary mb-2`}>
                    {assessments.filter(a => a.profile.mappings?.integralDetail?.primaryLevel).length}
                  </div>
                  <p className="text-sm text-muted-foreground">With Integral Levels</p>
                </CardContent>
              </Card>
            </div>

            {/* Integral Assessment Callout */}
            {!assessments.some(a => a.profile.mappings?.integralDetail) && (
              <Card className="mb-6 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">Unlock Integral Level Insights</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Discover your cognitive development level and consciousness stage with the Integral Assessment.
                      </p>
                      <Button size="sm" onClick={() => navigate('/integral')}>
                        Take Integral Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : ''}`}>
                <TabsTrigger value="history" className={`flex items-center gap-2 ${isMobile ? 'text-sm px-2' : ''}`}>
                  <History className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {isMobile ? 'History' : 'Assessment History'}
                </TabsTrigger>
                <TabsTrigger value="comparison" className={`flex items-center gap-2 ${isMobile ? 'text-sm px-2' : ''}`}>
                  <GitCompare className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {isMobile ? 'Compare' : 'Compare Progress'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className={`space-y-${isMobile ? '3' : '4'} mt-6`}>
                {assessments.map((assessment) => {
                const variantDetails = getVariantDetails(assessment.variant);
                const cardId = assessment.id;
                
                return isMobile ? (
                  // Mobile Assessment Card
                  <Card key={assessment.id} className="hover:shadow-sm transition-shadow">
                    <Collapsible 
                      open={expandedCards[cardId]} 
                      onOpenChange={() => toggleCard(cardId)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="p-4 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <History className="w-5 h-5 text-primary" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm truncate">{variantDetails.name}</h3>
                                  <Badge variant={variantDetails.color as any} className="text-xs px-2 py-0">
                                    {variantDetails.questions}Q
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                                </div>
                                 {assessment.profile.mappings && (
                                   <div className="text-xs text-muted-foreground mt-1 truncate">
                                     {assessment.profile.mappings.mbti} • {assessment.profile.mappings.enneagram}
                                   </div>
                                 )}
                                 {assessment.profile.mappings?.integralDetail?.primaryLevel && (
                                   <div className="mt-1">
                                     <IntegralLevelBadge 
                                       level={assessment.profile.mappings.integralDetail.primaryLevel} 
                                       size="sm" 
                                       showName={false}
                                     />
                                   </div>
                                 )}
                              </div>
                            </div>
                            
                            {expandedCards[cardId] ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4">
                          {/* Detailed info */}
                          {assessment.profile.mappings && (
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="text-xs font-medium mb-2">Personality Types</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>MBTI: {assessment.profile.mappings.mbti}</div>
                                <div>Enneagram: {assessment.profile.mappings.enneagram}</div>
                                <div>D&D: {assessment.profile.mappings.dndAlignment}</div>
                                <div>Holland: {assessment.profile.mappings.hollandCode}</div>
                              </div>
               {assessment.profile.mappings?.integralDetail?.primaryLevel && (
                                 <div className="mt-2">
                                   <div className="text-xs font-medium mb-1">Integral Level</div>
                                   <IntegralLevelBadge 
                                     level={assessment.profile.mappings.integralDetail.primaryLevel} 
                                     size="sm"
                                   />
                                   <div className="text-xs text-muted-foreground mt-1">
                                     {assessment.profile.mappings.integralDetail.primaryLevel.name}
                                   </div>
                                 </div>
                               )}
                               {assessment.profile.frameworkInsights && (
                                 <Badge variant="secondary" className="text-xs mt-2">Enhanced Insights</Badge>
                               )}
                               {assessment.profile.version && (
                                 <Badge variant="outline" className="text-xs mt-2 ml-1">v{assessment.profile.version}</Badge>
                               )}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProfile(assessment.profile)}
                              className="w-full justify-start"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Results
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await PDFReportGenerator.generatePDFReport(assessment.profile);
                                  } catch (error) {
                                    logger.error('Error generating PDF report', { component: 'AssessmentHistory' }, error as Error);
                                  }
                                }}
                                className="justify-start"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="justify-start text-destructive border-destructive/50">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
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
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ) : (
                  // Desktop Assessment Card (original)
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
                                   Enneagram: {assessment.profile.mappings.enneagram} |
                                   D&D: {assessment.profile.mappings.dndAlignment}
                                   {assessment.profile.mappings?.integralDetail?.primaryLevel && (
                                     <span className="ml-2">
                                       | <IntegralLevelBadge 
                                         level={assessment.profile.mappings.integralDetail.primaryLevel} 
                                         size="sm" 
                                         className="inline-flex"
                                       />
                                     </span>
                                   )}
                                   {assessment.profile.frameworkInsights && (
                                     <span className="ml-2 text-xs">
                                       <Badge variant="secondary" className="text-xs">Enhanced Insights</Badge>
                                     </span>
                                   )}
                                   {assessment.profile.version && (
                                     <span className="ml-2 text-xs">
                                       <Badge variant="outline" className="text-xs">v{assessment.profile.version}</Badge>
                                     </span>
                                   )}
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
                            onClick={async () => {
                              try {
                                await PDFReportGenerator.generatePDFReport(assessment.profile);
                              } catch (error) {
                                logger.error('Error generating integral PDF', { component: 'AssessmentHistory' }, error as Error);
                              }
                            }}
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