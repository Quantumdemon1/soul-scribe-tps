import { supabase } from '@/integrations/supabase/client';
import { LLMService } from './llmService';
import { PersonalityProfile } from '@/types/tps.types';

export interface MentorConversation {
  id: string;
  user_id: string;
  assessment_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MentorMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export class MentorService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async createConversation(assessmentId?: string, title?: string): Promise<MentorConversation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const conversationTitle = title || `Chat ${new Date().toLocaleDateString()}`;

    const { data, error } = await supabase
      .from('mentor_conversations')
      .insert({
        user_id: user.user.id,
        assessment_id: assessmentId || null,
        title: conversationTitle
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConversations(): Promise<MentorConversation[]> {
    const { data, error } = await supabase
      .from('mentor_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversation(id: string): Promise<MentorConversation | null> {
    const { data, error } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getMessages(conversationId: string): Promise<MentorMessage[]> {
    const { data, error } = await supabase
      .from('mentor_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as MentorMessage[];
  }

  async addMessage(
    conversationId: string, 
    role: 'user' | 'assistant', 
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<MentorMessage> {
    const { data, error } = await supabase
      .from('mentor_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabase
      .from('mentor_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as MentorMessage;
  }

  async generateMentorResponse(
    conversationId: string,
    userMessage: string,
    profile: PersonalityProfile
  ): Promise<string> {
    // Get conversation history
    const messages = await this.getMessages(conversationId);
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add user message to database
    await this.addMessage(conversationId, 'user', userMessage);

    // Generate AI response
    const response = await this.llmService.generateMentorResponse(
      userMessage,
      profile,
      conversationHistory
    );

    // Add AI response to database
    await this.addMessage(conversationId, 'assistant', response, {
      profile_context: {
        mbti: profile.mappings.mbti,
        enneagram: profile.mappings.enneagram,
        dominant_traits: profile.dominantTraits
      }
    });

    return response;
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('mentor_conversations')
      .update({ title })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from('mentor_conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}