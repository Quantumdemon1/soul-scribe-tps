import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Security configuration
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['*'];
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_REQUEST_SIZE = 50000; // 50KB
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // Max requests per minute per user

// Dynamic CORS headers based on request origin
function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin = ALLOWED_ORIGINS.includes('*') || 
    (origin && ALLOWED_ORIGINS.includes(origin)) ? 
    (origin || '*') : 'null';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

// Rate limiting check
async function checkRateLimit(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - (Date.now() % RATE_LIMIT_WINDOW));
  
  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', 'llm-proxy')
      .eq('window_start', windowStart.toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Rate limit check error:', error.message);
      return false;
    }
    
    const currentCount = data?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }
    
    // Update or insert rate limit record
    await supabase
      .from('rate_limits')
      .upsert({
        user_id: userId,
        endpoint: 'llm-proxy',
        window_start: windowStart.toISOString(),
        request_count: currentCount + 1
      });
    
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return false; // Fail closed
  }
}

// Input validation
function validateRequest(body: any): string | null {
  if (!body.provider || !['openai', 'anthropic'].includes(body.provider)) {
    return 'Invalid provider. Must be "openai" or "anthropic"';
  }
  
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return 'Messages array is required and must not be empty';
  }
  
  if (body.messages.length > 50) {
    return 'Too many messages. Maximum 50 messages allowed';
  }
  
  const totalMessageLength = body.messages.reduce((acc: number, msg: any) => 
    acc + (msg.content || '').length, 0);
  
  if (totalMessageLength > 100000) {
    return 'Total message content too long. Maximum 100,000 characters allowed';
  }
  
  if (body.max_completion_tokens && (body.max_completion_tokens < 1 || body.max_completion_tokens > 4000)) {
    return 'max_completion_tokens must be between 1 and 4000';
  }
  
  if (body.max_tokens && (body.max_tokens < 1 || body.max_tokens > 4000)) {
    return 'max_tokens must be between 1 and 4000';
  }
  
  if (body.temperature && (body.temperature < 0 || body.temperature > 2)) {
    return 'temperature must be between 0 and 2';
  }
  
  return null;
}

// Sanitize sensitive data from logs
function sanitizeForLog(data: any): any {
  if (typeof data === 'string') {
    return data.replace(/Bearer [a-zA-Z0-9\-._~+/]+=*|sk-[a-zA-Z0-9]+/g, '[REDACTED]');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    if (sanitized.messages) {
      sanitized.messages = `[${sanitized.messages.length} messages]`;
    }
    return sanitized;
  }
  return data;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get user from JWT (authentication is required)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Authentication error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limiting
    const rateLimitPassed = await checkRateLimit(user.id);
    if (!rateLimitPassed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body with size limit
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const validationError = validateRequest(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { provider, model, messages, max_completion_tokens, max_tokens, temperature, system } = body;
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    let response;
    
    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      if (provider === 'openai') {
        if (!OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        
        // Determine if newer model that requires max_completion_tokens
        const isNewerModel = model && (
          model.includes('gpt-5') || 
          model.includes('gpt-4.1') || 
          model.includes('o3') || 
          model.includes('o4')
        );
        
        const requestBody: any = {
          model: model || 'gpt-4o-mini',
          messages,
        };
        
        // Use appropriate token parameter based on model
        if (isNewerModel) {
          requestBody.max_completion_tokens = max_completion_tokens || 2000;
          // Don't include temperature for newer models
        } else {
          requestBody.max_tokens = max_tokens || max_completion_tokens || 2000;
          if (temperature !== undefined) {
            requestBody.temperature = temperature;
          }
        }
        
        console.log('OpenAI request:', sanitizeForLog(requestBody));
        
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } else if (provider === 'anthropic') {
        if (!ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        
        const requestBody = {
          model: model || 'claude-3-haiku-20240307',
          system,
          messages,
          max_tokens: max_tokens || 2000,
          temperature: temperature || 0.7,
        };
        
        console.log('Anthropic request:', sanitizeForLog(requestBody));
        
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } else {
        throw new Error('Invalid provider. Use "openai" or "anthropic"');
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${provider} API error (${response.status}):`, sanitizeForLog(errorData));
      throw new Error(`${provider} API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`${provider} API success:`, sanitizeForLog({ 
      model: data.model,
      usage: data.usage,
      response_length: JSON.stringify(data).length 
    }));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error.name === 'AbortError' ? 'Request timeout' : 
      (error.message || 'Unknown error');
    
    console.error('LLM proxy error:', sanitizeForLog({
      error: errorMessage,
      userId: user?.id,
      provider,
      model
    }));
    
    const statusCode = error.name === 'AbortError' ? 408 : 
      errorMessage.includes('Rate limit') ? 429 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});