import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { provider, model, messages, system, max_tokens, max_completion_tokens, temperature } = body;

    console.log(`Processing ${provider} request with model: ${model}`);

    let apiResponse;
    
    if (provider === 'openai') {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const requestBody: any = {
        model,
        messages,
      };

      // Use max_completion_tokens for newer models, max_tokens for legacy models
      if (max_completion_tokens) {
        requestBody.max_completion_tokens = max_completion_tokens;
      } else if (max_tokens) {
        requestBody.max_tokens = max_tokens;
      }

      // Only add temperature for models that support it
      if (temperature !== undefined && !model.startsWith('gpt-5') && !model.startsWith('o3') && !model.startsWith('o4')) {
        requestBody.temperature = temperature;
      }

      apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } else if (provider === 'anthropic') {
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicApiKey) {
        throw new Error('Anthropic API key not configured');
      }

      const requestBody: any = {
        model,
        messages,
        max_tokens: max_tokens || 4000,
      };

      if (system) {
        requestBody.system = system;
      }

      if (temperature !== undefined) {
        requestBody.temperature = temperature;
      }

      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      throw new Error('Invalid provider');
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`${provider} API error:`, errorText);
      throw new Error(`${provider} API returned ${apiResponse.status}: ${errorText}`);
    }

    const data = await apiResponse.json();
    console.log(`${provider} response received successfully`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LLM proxy error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});