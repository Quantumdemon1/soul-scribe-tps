-- Create mentor_conversations table
CREATE TABLE public.mentor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_messages table
CREATE TABLE public.mentor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for mentor_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.mentor_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.mentor_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.mentor_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.mentor_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for mentor_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.mentor_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.mentor_conversations 
    WHERE id = mentor_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.mentor_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mentor_conversations 
    WHERE id = mentor_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_mentor_conversations_updated_at
BEFORE UPDATE ON public.mentor_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();