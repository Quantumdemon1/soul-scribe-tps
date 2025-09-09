import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Mail, Shield, Globe, Users, Lock, CheckCircle, Star, Crown } from 'lucide-react';
import { useProfile, UserProfile } from '@/hooks/useProfile';

interface ProfileEditorProps {
  onSave?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave }) => {
  const { profile, privacySettings, loading, saving, updateProfile, updatePrivacySettings, validateUsername } = useProfile();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [privacyData, setPrivacyData] = useState<any>({});
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (privacySettings) {
      setPrivacyData(privacySettings);
    }
  }, [privacySettings]);

  const handleUsernameChange = async (username: string) => {
    setFormData({ ...formData, username });
    setUsernameError(null);

    if (username && username !== profile?.username) {
      setUsernameChecking(true);
      const isValid = await validateUsername(username);
      setUsernameChecking(false);
      
      if (!isValid) {
        setUsernameError('Username is not available or invalid (3-30 chars, alphanumeric + underscore only)');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (usernameError) return;
    
    const success = await updateProfile(formData);
    if (success && onSave) {
      onSave();
    }
  };

  const handleSavePrivacy = async () => {
    const success = await updatePrivacySettings(privacyData);
    if (success && onSave) {
      onSave();
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'expert': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getVerificationLabel = (level: string) => {
    switch (level) {
      case 'verified': return 'Verified';
      case 'expert': return 'Expert';
      default: return 'Basic';
    }
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
      {/* Basic Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
            <Badge variant="outline" className="ml-auto flex items-center gap-1">
              {getVerificationIcon(profile?.verification_level || 'basic')}
              {getVerificationLabel(profile?.verification_level || 'basic')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Choose a unique username"
                />
                {usernameChecking && (
                  <LoadingSpinner size="sm" className="absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {usernameError && (
                <Alert variant="destructive">
                  <AlertDescription>{usernameError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your display name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date || ''}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving || !!usernameError}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Visibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={formData.profile_visibility || 'public'}
              onValueChange={(value) => setFormData({ ...formData, profile_visibility: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public - Anyone can view
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Connections Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private - Only you
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Personality Results Visibility</Label>
            <Select
              value={formData.personality_visibility || 'public'}
              onValueChange={(value) => setFormData({ ...formData, personality_visibility: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public - Anyone can view
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Connections Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private - Only you
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Visibility Settings
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Communication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Assessment Results</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your test results</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.show_assessment_results || false}
                onChange={(e) => setPrivacyData({ ...privacyData, show_assessment_results: e.target.checked })}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Forum Mentions</Label>
                <p className="text-sm text-muted-foreground">Let others mention you in forum discussions</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.allow_forum_mentions || false}
                onChange={(e) => setPrivacyData({ ...privacyData, allow_forum_mentions: e.target.checked })}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Direct Messages</Label>
                <p className="text-sm text-muted-foreground">Enable direct messaging from other users</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.allow_direct_messages || false}
                onChange={(e) => setPrivacyData({ ...privacyData, allow_direct_messages: e.target.checked })}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Display when you're online to others</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.show_online_status || false}
                onChange={(e) => setPrivacyData({ ...privacyData, show_online_status: e.target.checked })}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Personality Matching</Label>
                <p className="text-sm text-muted-foreground">Enable finding compatible personality matches</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.allow_personality_matching || false}
                onChange={(e) => setPrivacyData({ ...privacyData, allow_personality_matching: e.target.checked })}
                className="toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Data Sharing Consent</Label>
                <p className="text-sm text-muted-foreground">Allow anonymous data for research purposes</p>
              </div>
              <input
                type="checkbox"
                checked={privacyData.data_sharing_consent || false}
                onChange={(e) => setPrivacyData({ ...privacyData, data_sharing_consent: e.target.checked })}
                className="toggle"
              />
            </div>
          </div>

          <Button onClick={handleSavePrivacy} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};