import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Lightbulb, Target, Heart, Briefcase } from 'lucide-react';
import { PersonalityProfile } from '@/types/tps.types';

interface ConversationStartersProps {
  profile: PersonalityProfile;
  onStartConversation: (topic: string, message: string) => void;
}

interface ConversationStarter {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  message: string;
  category: 'growth' | 'career' | 'relationships' | 'understanding';
}

export const ConversationStarters: React.FC<ConversationStartersProps> = ({ 
  profile, 
  onStartConversation 
}) => {
  const getPersonalizedStarters = (): ConversationStarter[] => {
    const { mappings, dominantTraits } = profile;
    const mbti = mappings.mbti;
    const enneagram = mappings.enneagram;
    
    const baseStarters: ConversationStarter[] = [
      {
        icon: Brain,
        title: "Understanding My Type",
        description: `Dive deeper into what it means to be ${mbti}`,
        message: `I'd like to understand more about my personality type (${mbti}). What are my core patterns and how do they shape my daily life?`,
        category: 'understanding'
      },
      {
        icon: Target,
        title: "Personal Growth",
        description: "Explore development opportunities tailored to your personality",
        message: `Based on my personality profile (${mbti}, Enneagram ${enneagram}), what are some specific areas I could focus on for personal growth?`,
        category: 'growth'
      },
      {
        icon: Briefcase,
        title: "Career Alignment",
        description: "Discover how your personality fits with career paths",
        message: `How can I leverage my personality strengths (${Object.values(dominantTraits).join(', ')}) in my career? What work environments would suit me best?`,
        category: 'career'
      },
      {
        icon: Heart,
        title: "Relationship Insights",
        description: "Understand your interpersonal patterns and communication style",
        message: `Can you help me understand my communication style and how I relate to others based on my ${mbti} type? How can I improve my relationships?`,
        category: 'relationships'
      }
    ];

    // Add type-specific starters based on MBTI
    if (mbti.includes('E')) {
      baseStarters.push({
        icon: MessageSquare,
        title: "Social Energy Management",
        description: "Optimize your social interactions and energy levels",
        message: "As an extravert, how can I best manage my social energy and maintain meaningful connections while avoiding burnout?",
        category: 'growth'
      });
    } else {
      baseStarters.push({
        icon: Brain,
        title: "Inner World Exploration",
        description: "Deep dive into your rich inner landscape",
        message: "As an introvert, how can I better communicate my inner thoughts and ideas to others? What are strategies for sharing my insights effectively?",
        category: 'growth'
      });
    }

    // Add Enneagram-specific starters
    const enneagramNum = parseInt(enneagram.split(' ')[1] || '1');
    switch (enneagramNum) {
      case 1:
        baseStarters.push({
          icon: Target,
          title: "Perfectionism & Standards",
          description: "Navigate your high standards constructively",
          message: "As an Enneagram Type 1, how can I maintain my high standards while being more accepting of imperfection in myself and others?",
          category: 'growth'
        });
        break;
      case 2:
        baseStarters.push({
          icon: Heart,
          title: "Helping & Self-Care",
          description: "Balance giving to others with self-care",
          message: "As a Type 2, how can I continue helping others while also taking better care of my own needs?",
          category: 'growth'
        });
        break;
      case 3:
        baseStarters.push({
          icon: Target,
          title: "Success & Authenticity",
          description: "Achieve goals while staying true to yourself",
          message: "As a Type 3, how can I pursue success and achievement while staying connected to my authentic self?",
          category: 'growth'
        });
        break;
      // Add more cases as needed
    }

    // Add integral development conversation starter if available
    if ((profile.mappings as any).integralDetail) {
      const integralLevel = (profile.mappings as any).integralDetail.primaryLevel;
      baseStarters.push({
        icon: Brain,
        title: "Integral Development", 
        description: "Explore higher levels of consciousness and development",
        message: `I'm currently at Integral Level ${integralLevel.number} (${integralLevel.color}). How can I continue growing and developing to higher levels of consciousness?`,
        category: 'growth'
      });
    }

    return baseStarters.slice(0, 6); // Limit to 6 starters
  };

  const starters = getPersonalizedStarters();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'understanding': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'growth': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'career': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'relationships': return 'bg-pink-500/10 text-pink-700 border-pink-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Conversation Starters
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized topics based on your {profile.mappings.mbti} personality type
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {starters.map((starter, index) => {
            const Icon = starter.icon;
            return (
              <Card 
                key={index}
                className="transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => onStartConversation(starter.title, starter.message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{starter.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(starter.category)}`}
                        >
                          {starter.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {starter.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Click any topic above to start a personalized conversation, 
            or ask your own question about personality, growth, careers, or relationships.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};