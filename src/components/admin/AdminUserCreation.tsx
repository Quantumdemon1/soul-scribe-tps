import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

interface PersonalityTypes {
  mbti_type?: string;
  enneagram_type?: string;
  big_five_scores?: Record<string, number>;
  integral_level?: string;
  holland_code?: string;
  alignment?: string;
  socionics_type?: string;
  attachment_style?: string;
}

export const AdminUserCreation: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    personalityTypes: {} as PersonalityTypes
  });

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const enneagramTypes = [
    'Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5', 
    'Type 6', 'Type 7', 'Type 8', 'Type 9'
  ];

  const integralLevels = [
    'Level 1 - Red', 'Level 2 - Amber', 'Level 3 - Orange', 
    'Level 4 - Green', 'Level 5 - Teal', 'Level 6 - Turquoise'
  ];

  const alignments = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ];

  const attachmentStyles = [
    'Secure', 'Anxious-Preoccupied', 'Dismissive-Avoidant', 'Fearful-Avoidant'
  ];

  const handlePersonalityChange = (field: keyof PersonalityTypes, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTypes: {
        ...prev.personalityTypes,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedPassword('');

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          displayName: formData.displayName,
          personalityTypes: formData.personalityTypes
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setGeneratedPassword(data.temporaryPassword);
        toast({
          title: "User Created Successfully",
          description: `Account created for ${formData.email}. Temporary password generated.`
        });
        
        // Reset form
        setFormData({
          email: '',
          displayName: '',
          personalityTypes: {}
        });
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create User Account
          </CardTitle>
          <CardDescription>
            Manually create a user account with pre-configured personality types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personality Type Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure personality types for this user. All fields are optional.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mbti">MBTI Type</Label>
                  <Select onValueChange={(value) => handlePersonalityChange('mbti_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select MBTI type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mbtiTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enneagram">Enneagram Type</Label>
                  <Select onValueChange={(value) => handlePersonalityChange('enneagram_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Enneagram type" />
                    </SelectTrigger>
                    <SelectContent>
                      {enneagramTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integral">Integral Level</Label>
                  <Select onValueChange={(value) => handlePersonalityChange('integral_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Integral level" />
                    </SelectTrigger>
                    <SelectContent>
                      {integralLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alignment">D&D Alignment</Label>
                  <Select onValueChange={(value) => handlePersonalityChange('alignment', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {alignments.map(alignment => (
                        <SelectItem key={alignment} value={alignment}>{alignment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment Style</Label>
                  <Select onValueChange={(value) => handlePersonalityChange('attachment_style', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attachment style" />
                    </SelectTrigger>
                    <SelectContent>
                      {attachmentStyles.map(style => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holland">Holland Code</Label>
                  <Input
                    id="holland"
                    placeholder="e.g., SAE, RIA"
                    onChange={(e) => handlePersonalityChange('holland_code', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                'Create User Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">User Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={generatedPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this temporary password with the user. They should change it on first login.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};