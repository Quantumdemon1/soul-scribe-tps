import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Users, Lock, CheckCircle, Clock } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  required_assessment_type: string;
  required_personality_types: string[] | null;
  required_integral_levels: string[] | null;
  min_verification_level: string;
  is_active: boolean;
}

interface ForumMembership {
  id: string;
  forum_category_id: string;
  role: string;
  joined_at: string;
}

export const ForumAccess: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [memberships, setMemberships] = useState<ForumMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchForumData();
    }
  }, [user]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Fetch forum categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch user memberships
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('forum_memberships')
        .select('*')
        .eq('user_id', user!.id);

      if (membershipsError) throw membershipsError;

      setCategories(categoriesData || []);
      setMemberships(membershipsData || []);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const joinForum = async (categoryId: string) => {
    if (!user) return;

    try {
      setJoining(categoryId);
      
      const { error } = await supabase
        .from('forum_memberships')
        .insert({
          user_id: user.id,
          forum_category_id: categoryId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Successfully joined the forum!',
      });

      fetchForumData(); // Refresh memberships
    } catch (error) {
      console.error('Error joining forum:', error);
      toast({
        title: 'Error',
        description: 'Failed to join forum',
        variant: 'destructive',
      });
    } finally {
      setJoining(null);
    }
  };

  const isUserMember = (categoryId: string) => {
    return memberships.some(m => m.forum_category_id === categoryId);
  };

  const getRequirementsBadge = (category: ForumCategory) => {
    const requirements = [];
    
    if (category.required_assessment_type !== 'any') {
      requirements.push(category.required_assessment_type);
    }
    
    if (category.required_personality_types?.length) {
      requirements.push(`MBTI: ${category.required_personality_types.join(', ')}`);
    }
    
    if (category.required_integral_levels?.length) {
      requirements.push(`Integral: ${category.required_integral_levels.join(', ')}`);
    }
    
    if (category.min_verification_level !== 'basic') {
      requirements.push(`${category.min_verification_level} verification`);
    }

    return requirements;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Forum Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Join personality-based forums to connect with others who share similar traits and interests.
            Some forums require specific assessment completion or verification levels.
          </p>

          <div className="grid gap-4">
            {categories.map((category) => {
              const isMember = isUserMember(category.id);
              const requirements = getRequirementsBadge(category);
              
              return (
                <Card key={category.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          {isMember && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Member
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.description}
                        </p>

                        {requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs text-muted-foreground mr-2">Requirements:</span>
                            {requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {isMember ? (
                          <Button variant="outline" disabled>
                            <Users className="w-4 h-4 mr-2" />
                            Joined
                          </Button>
                        ) : (
                          <Button
                            onClick={() => joinForum(category.id)}
                            disabled={joining === category.id}
                            variant="default"
                          >
                            {joining === category.id ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Join Forum
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No forums available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};