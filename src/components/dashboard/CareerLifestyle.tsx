import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FrameworkInsightsService } from '../../services/frameworkInsightsService';
import { Briefcase, Building, Users, Home, Star, MapPin, ChevronDown, ChevronRight, TrendingUp, Heart, Shield, Zap } from 'lucide-react';

interface CareerLifestyleProps {
  profile: PersonalityProfile;
}

export const CareerLifestyle: React.FC<CareerLifestyleProps> = ({ profile }) => {
  const { data, loading, errors, generateSection, refreshSection, getLastGenerated } = useDashboard();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    career: true,
    workEnv: false,
    lifestyle: false,
    wellness: false,
  });

  const careerLifestyle = data.careerLifestyle;
  const isLoading = loading.careerLifestyle;
  const error = errors.careerLifestyle;

  const careerPathways = careerLifestyle?.pathways;
  const workEnvironment = careerLifestyle?.workEnvironment;
  const lifestyleRecs = careerLifestyle?.lifestyle;

  useEffect(() => {
    if (!careerLifestyle && !isLoading) {
      generateSection('careerLifestyle', profile);
    }
  }, [profile]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Generating personalized career and lifestyle insights...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Pathways */}
      <Collapsible open={openSections.career} onOpenChange={() => toggleSection('career')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Career Pathways
                </span>
                {openSections.career ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-6">
                {careerPathways?.careerFields?.map((career: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{career.field}</span>
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Recommended
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Recommended Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.roles?.map((role: string, roleIndex: number) => (
                            <Badge key={roleIndex} variant="secondary">{role}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Why This Fits You</h4>
                        <p className="text-foreground/80 text-sm">{career.reasoning}</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary" />
                          Ideal Work Environment
                        </h4>
                        <p className="text-muted-foreground text-sm">{career.workEnvironment}</p>
                      </div>

                      {career.growthPath && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Growth Path
                          </h4>
                          <p className="text-muted-foreground text-sm">{career.growthPath}</p>
                        </div>
                      )}

                      {career.satisfactionFactors && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Key Satisfaction Factors</h4>
                          <div className="space-y-1">
                            {career.satisfactionFactors.map((factor: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-sm text-foreground/70">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {careerPathways?.overallGuidance && (
                  <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardHeader>
                      <CardTitle className="text-base">General Career Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Leadership Style</h4>
                        <p className="text-sm text-foreground/80">{careerPathways.overallGuidance.leadershipStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Team Dynamics</h4>
                        <p className="text-sm text-foreground/80">{careerPathways.overallGuidance.teamDynamics}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Decision Making</h4>
                        <p className="text-sm text-foreground/80">{careerPathways.overallGuidance.decisionMaking}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Work Environment Preferences */}
      <Collapsible open={openSections.workEnv} onOpenChange={() => toggleSection('workEnv')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Work Environment Preferences
                </span>
                {openSections.workEnv ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid gap-4">
                {workEnvironment?.physicalWorkspace && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Physical Workspace
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Optimal Conditions</h4>
                        <p className="text-sm text-foreground/80">{workEnvironment.physicalWorkspace.optimalConditions}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h4 className="font-medium text-foreground mb-1 text-sm">Preferences</h4>
                          <div className="space-y-1">
                            {workEnvironment.physicalWorkspace.preferences?.map((pref: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                <span className="text-xs text-foreground/70">{pref}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-1 text-sm">Avoid</h4>
                          <div className="space-y-1">
                            {workEnvironment.physicalWorkspace.needsToAvoid?.map((avoid: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1">
                                <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                <span className="text-xs text-foreground/70">{avoid}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {workEnvironment?.teamCollaboration && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Collaboration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Working Style</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.teamCollaboration.workingStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Communication Needs</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.teamCollaboration.communicationNeeds}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Conflict Resolution</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.teamCollaboration.conflictResolution}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {workEnvironment?.managementStyle && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Management Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Autonomy Needs</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.managementStyle.autonomyNeeds}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Feedback Preferences</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.managementStyle.feedbackPreferences}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Support Needs</h4>
                        <p className="text-xs text-foreground/80">{workEnvironment.managementStyle.supportNeeds}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Lifestyle Recommendations */}
      <Collapsible open={openSections.lifestyle} onOpenChange={() => toggleSection('lifestyle')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Lifestyle Recommendations
                </span>
                {openSections.lifestyle ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid gap-4">
                {lifestyleRecs?.socialLife && (
                  <Card className="border-l-4 border-l-pink-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Social Life
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Social Needs</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.socialLife.socialNeeds}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Relationship Style</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.socialLife.relationshipStyle}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Networking Approach</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.socialLife.networkingApproach}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lifestyleRecs?.livingEnvironment && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Living Environment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Home Environment</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.livingEnvironment.homeEnvironment}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Organization Style</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.livingEnvironment.organizationStyle}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lifestyleRecs?.recreation && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Recreation & Hobbies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Recreation Style</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.recreation.recreationStyle}</p>
                      </div>
                      {lifestyleRecs.recreation.hobbies && (
                        <div>
                          <h4 className="font-medium text-foreground mb-1 text-sm">Recommended Hobbies</h4>
                          <div className="flex flex-wrap gap-1">
                            {lifestyleRecs.recreation.hobbies.map((hobby: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Health & Wellness */}
      <Collapsible open={openSections.wellness} onOpenChange={() => toggleSection('wellness')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Health & Work-Life Balance
                </span>
                {openSections.wellness ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid gap-4">
                {lifestyleRecs?.workLifeBalance && (
                  <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Work-Life Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Balance Strategy</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.workLifeBalance.balanceStrategy}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Boundary Management</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.workLifeBalance.boundaryManagement}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Energy Management</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.workLifeBalance.energyManagement}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lifestyleRecs?.healthWellness && (
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Health & Wellness
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Exercise Preferences</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.healthWellness.exercisePreferences}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Stress Management</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.healthWellness.stressManagement}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Sleep Optimization</h4>
                        <p className="text-xs text-foreground/80">{lifestyleRecs.healthWellness.sleepOptimization}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {workEnvironment?.stressFactors && (
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Workplace Stress Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Stress Triggers</h4>
                        <div className="flex flex-wrap gap-1">
                          {workEnvironment.stressFactors.triggers?.map((trigger: string, idx: number) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1 text-sm">Mitigation Strategies</h4>
                        <div className="space-y-1">
                          {workEnvironment.stressFactors.mitigationStrategies?.map((strategy: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-1">
                              <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              <span className="text-xs text-foreground/70">{strategy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};