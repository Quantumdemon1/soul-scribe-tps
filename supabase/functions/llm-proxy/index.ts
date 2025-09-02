import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, messages, max_completion_tokens, max_tokens, temperature, system } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    let response;
    
    if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages,
          max_completion_tokens: max_completion_tokens || 2000,
        }),
      });
    } else if (provider === 'anthropic') {
      if (!ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
      }
      
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-haiku-20240307',
          system,
          messages,
          max_tokens: max_tokens || 2000,
          temperature: temperature || 0.7,
        }),
      });
    } else {
      throw new Error('Invalid provider. Use "openai" or "anthropic"');
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`${provider} API error:`, errorData);
      throw new Error(`${provider} API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`${provider} API response:`, data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in llm-proxy function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});