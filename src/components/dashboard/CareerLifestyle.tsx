import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonalityInsightGenerator } from '../../utils/personalityInsights';
import { Briefcase, Building, Users, Home, Star, MapPin } from 'lucide-react';

interface CareerLifestyleProps {
  profile: PersonalityProfile;
}

export const CareerLifestyle: React.FC<CareerLifestyleProps> = ({ profile }) => {
  const careerRecommendations = PersonalityInsightGenerator.generateCareerRecommendations(profile);
  const insights = PersonalityInsightGenerator.generateCoreInsights(profile);

  // Generate lifestyle recommendations based on personality
  const lifestyleRecommendations = generateLifestyleRecommendations(profile);

  return (
    <div className="space-y-6">
      {/* Career Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Career Recommendations
        </h3>
        
        {careerRecommendations.map((career, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{career.field}</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Top Match
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Recommended Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {career.roles.map((role, roleIndex) => (
                    <Badge key={roleIndex} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Why This Fits You</h4>
                <p className="text-foreground/80 text-sm">{career.reason}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Ideal Work Environment
                </h4>
                <p className="text-foreground/70 text-sm">{career.workEnvironment}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lifestyle Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Lifestyle Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lifestyleRecommendations.map((lifestyle, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <lifestyle.icon className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-foreground">{lifestyle.category}</h4>
                </div>
                <div className="space-y-2">
                  {lifestyle.recommendations.map((rec, recIndex) => (
                    <div key={recIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work-Life Balance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Work-Life Balance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getWorkLifeBalanceTips(profile).map((tip, index) => (
              <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                <h4 className="font-medium text-foreground mb-2">{tip.title}</h4>
                <p className="text-foreground/70 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Networking & Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Professional Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground mb-2">Networking Approach</h4>
              <p className="text-foreground/80 text-sm">{getNetworkingAdvice(profile)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Learning Style</h4>
              <p className="text-foreground/80 text-sm">{getLearningStyleAdvice(profile)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Leadership Potential</h4>
              <p className="text-foreground/80 text-sm">{getLeadershipAdvice(profile)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function generateLifestyleRecommendations(profile: PersonalityProfile) {
  const { domainScores, traitScores } = profile;
  
  return [
    {
      category: "Social Life",
      icon: Users,
      recommendations: traitScores['Communal Navigate'] > 6 ? [
        "Join professional networking groups",
        "Organize social gatherings and events",
        "Participate in team sports or group activities"
      ] : [
        "Focus on deep, meaningful relationships",
        "Enjoy quiet gatherings with close friends",
        "Engage in solo hobbies that interest you"
      ]
    },
    {
      category: "Living Environment",
      icon: MapPin,
      recommendations: traitScores['Structured'] > 6 ? [
        "Maintain an organized, clutter-free space",
        "Create dedicated areas for work and relaxation",
        "Use planners and organizational systems"
      ] : [
        "Embrace a more flexible living arrangement",
        "Allow for spontaneous changes to your space",
        "Focus on comfort over strict organization"
      ]
    },
    {
      category: "Recreation",
      icon: Star,
      recommendations: domainScores.Processing > 6 ? [
        "Engage in intellectually stimulating hobbies",
        "Try strategy games or puzzle-solving activities",
        "Read books on topics that challenge you"
      ] : [
        "Focus on hands-on, creative activities",
        "Enjoy outdoor sports and physical activities",
        "Pursue arts, music, or crafting hobbies"
      ]
    }
  ];
}

function getWorkLifeBalanceTips(profile: PersonalityProfile) {
  const tips = [];
  
  if (profile.traitScores['Self-Mastery'] > 6) {
    tips.push({
      title: "Maintain Boundaries",
      description: "Your self-discipline is a strength. Use it to set clear work-life boundaries and stick to them."
    });
  }
  
  if (profile.domainScores.External > 6) {
    tips.push({
      title: "Structure Your Downtime",
      description: "Apply your organizational skills to planning relaxation and personal time as intentionally as you plan work."
    });
  }
  
  if (profile.traitScores['Dynamic'] > 6) {
    tips.push({
      title: "Embrace Variety",
      description: "Build variety into both your work and personal life to keep yourself energized and engaged."
    });
  }
  
  return tips.length > 0 ? tips : [
    {
      title: "Find Your Rhythm",
      description: "Experiment with different work-life balance approaches to find what works best for your personality."
    }
  ];
}

function getNetworkingAdvice(profile: PersonalityProfile): string {
  if (profile.traitScores['Assertive'] > 6) {
    return "Your assertive nature makes you well-suited for direct networking. Don't hesitate to reach out to potential mentors or collaborators.";
  } else if (profile.traitScores['Diplomatic'] > 6) {
    return "Your diplomatic skills are perfect for building long-term professional relationships. Focus on being genuinely helpful to others.";
  }
  return "Focus on authentic connections rather than transactional networking. Build relationships gradually through shared interests.";
}

function getLearningStyleAdvice(profile: PersonalityProfile): string {
  if (profile.traitScores['Analytical'] > 6) {
    return "You learn best through structured, logical approaches. Seek out detailed courses and systematic learning programs.";
  } else if (profile.traitScores['Intuitive'] > 6) {
    return "You thrive with experiential learning and big-picture concepts. Look for hands-on workshops and mentorship opportunities.";
  }
  return "You benefit from a mix of learning styles. Try combining formal education with practical experience.";
}

function getLeadershipAdvice(profile: PersonalityProfile): string {
  if (profile.domainScores.External > 7) {
    return "You have strong natural leadership potential. Consider taking on project management or team leadership roles.";
  } else if (profile.domainScores.Interpersonal > 7) {
    return "Your people skills make you ideal for collaborative leadership. Focus on servant leadership and team empowerment.";
  }
  return "Leadership comes in many forms. Consider thought leadership or leading by example in your areas of expertise.";
}