-- Create enhanced user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  birth_date DATE,
  personality_visibility TEXT DEFAULT 'public' CHECK (personality_visibility IN ('public', 'connections', 'private')),
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections', 'private')),
  verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_assessment_results BOOLEAN DEFAULT true,
  allow_forum_mentions BOOLEAN DEFAULT true,
  allow_direct_messages BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  allow_personality_matching BOOLEAN DEFAULT true,
  data_sharing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user connections table for social features
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_type TEXT DEFAULT 'follow' CHECK (connection_type IN ('follow', 'mutual', 'blocked')),
  personality_compatibility_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create forum categories table
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  required_assessment_type TEXT CHECK (required_assessment_type IN ('personality', 'integral', 'any')),
  required_personality_types TEXT[],
  required_integral_levels TEXT[],
  min_verification_level TEXT DEFAULT 'basic' CHECK (min_verification_level IN ('basic', 'verified', 'expert')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum membership table
CREATE TABLE public.forum_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  forum_category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, forum_category_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('connection_request', 'forum_mention', 'assessment_complete', 'personality_match', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view public profiles" ON public.profiles
FOR SELECT USING (
  profile_visibility = 'public' OR 
  user_id = auth.uid() OR
  (profile_visibility = 'connections' AND EXISTS (
    SELECT 1 FROM public.user_connections 
    WHERE (follower_id = auth.uid() AND following_id = user_id) OR
          (follower_id = user_id AND following_id = auth.uid())
  ))
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for privacy settings
CREATE POLICY "Users can manage their own privacy settings" ON public.privacy_settings
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user connections
CREATE POLICY "Users can view their own connections" ON public.user_connections
FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create connections" ON public.user_connections
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can manage their own connections" ON public.user_connections
FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for forum categories
CREATE POLICY "Anyone can view active forum categories" ON public.forum_categories
FOR SELECT USING (is_active = true);

-- RLS Policies for forum memberships
CREATE POLICY "Users can view forum memberships" ON public.forum_memberships
FOR SELECT USING (true);

CREATE POLICY "Users can join forums" ON public.forum_memberships
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their forum memberships" ON public.forum_memberships
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for username validation
CREATE OR REPLACE FUNCTION public.validate_username(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check length (3-30 characters)
  IF LENGTH(username_input) < 3 OR LENGTH(username_input) > 30 THEN
    RETURN FALSE;
  END IF;
  
  -- Check format (alphanumeric and underscores only)
  IF username_input !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check availability
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = username_input) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX idx_forum_memberships_user ON public.forum_memberships(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read);

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, required_assessment_type) VALUES
('General Discussion', 'Open discussions for all users', 'any'),
('Personality Types', 'Discussions specific to personality frameworks', 'personality'),
('Integral Development', 'Advanced discussions on integral theory and development', 'integral'),
('Career & Professional', 'Career advice and professional development', 'any'),
('Relationships & Social', 'Discussions about relationships and social dynamics', 'personality');

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();