import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { PersonalityDisplay } from '@/components/profile/PersonalityDisplay';
import { useProfile } from '@/hooks/useProfile';
import { useAssessments } from '@/hooks/useAssessments';
import { User, Mail, Lock, Save, ArrowLeft, Settings, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/seo/SEO';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { assessments } = useAssessments();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get latest personality profile and integral assessment
  const latestPersonalityAssessment = assessments?.find(a => a.variant === 'full');
  const latestIntegralAssessment = assessments?.find(a => a.variant === 'integral');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
      } else {
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEO 
        title={`${profile?.display_name || user.email}'s Profile`}
        description="Manage your profile, view personality results, and customize privacy settings"
        canonicalPath="/profile"
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {profile?.display_name ? `${profile.display_name}'s Profile` : 'Your Profile'}
            </h1>
          </div>

          <Tabs defaultValue="personality" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Personality
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personality" className="space-y-6">
              <PersonalityDisplay
                personalityProfile={latestPersonalityAssessment?.profile}
                integralLevel={latestIntegralAssessment?.profile}
                isOwner={true}
                visibilityLevel={profile?.personality_visibility || 'public'}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileEditor />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              {/* Account Information */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        value={user.email || ''}
                        disabled
                        className="pl-10 bg-muted/50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input
                      value={user.id}
                      disabled
                      className="bg-muted/50 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input
                      value={new Date(user.created_at).toLocaleDateString()}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Password Update */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Update Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password (min 6 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="confirm-new-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating password...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;