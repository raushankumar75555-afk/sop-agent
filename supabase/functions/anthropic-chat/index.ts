// ============================================
// SOP Agent Pro - Supabase Edge Function
// Secure Anthropic API Proxy
// Model: claude-haiku-4-5-20251001 (cost-optimised)
// ============================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter: max 20 requests per key per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { key, messages, sop_context, ping, model } = await req.json();

    // Health check ping
    if (ping) {
      return new Response(JSON.stringify({ pong: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!key || !messages) {
      return new Response(JSON.stringify({ error: 'Missing key or messages' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    if (!checkRateLimit(key)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 20 requests per minute.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Validate key
    const { data: keyData, error: keyError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check tool status
    const { data: settings } = await supabase
      .from('settings')
      .select('tool_active, sop_lockdown')
      .single();

    if (!settings?.tool_active && keyData.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Tool is temporarily suspended' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Anthropic API key — from env only, never from DB (security)
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Model selection: owner can request Sonnet, everyone else gets Haiku (cost-optimised)
    const selectedModel = (keyData.role === 'owner' && model === 'sonnet')
      ? 'claude-sonnet-4-5'
      : 'claude-haiku-4-5-20251001';

    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 2048,
        system: sop_context || 'You are SOP Agent Pro, an AI assistant for Australian insurance brokerages.',
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    // Log to history (async, don't wait)
    const lastMessage = messages[messages.length - 1];
    supabase.from('history').insert({
      license_key: key,
      role: keyData.role,
      label: keyData.label,
      question: lastMessage?.content || '',
      answer: data.content?.[0]?.text || 'No response',
    }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
