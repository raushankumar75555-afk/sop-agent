// ============================================
// SOP Agent Pro - Supabase Edge Function
// Model: DeepSeek V3 via OpenRouter (FREE)
// ============================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rateLimitMap = new Map();

function checkRateLimit(key) {
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
    const { key, messages, sop_context, ping } = await req.json();

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

    if (!checkRateLimit(key)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 20 requests per minute.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

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

    const { data: settings } = await supabase
      .from('settings')
      .select('tool_active, sop_lockdown')
      .single();

    if (!settings?.tool_active && keyData.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Tool is temporarily suspended by Owner' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = sop_context || `You are SOP Agent Pro, an intelligent assistant built specifically for Australian Property & Casualty (P&C) insurance brokerages. You help brokers and staff with SOPs, compliance (APRA, ASIC, Insurance Brokers Code of Practice), claims handling, policy renewals, and insurer portals. Insurers you know: AAMI, Allianz, CGU, QBE, Suncorp, Vero, Chubb, Zurich, Hollard, WFI, GIO, NRMA, RACQ. Use Australian English. Be professional, clear, and concise.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://sop-agent-xi.vercel.app',
        'X-Title': 'SOP Agent Pro',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `AI API error: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No response received';

    const formattedResponse = {
      content: [{ type: 'text', text: answer }],
      model: 'deepseek-v3-free',
      role: 'assistant',
    };

    const lastMessage = messages[messages.length - 1];
    supabase.from('history').insert({
      key: key,
      question: lastMessage?.content || '',
      answer: answer,
    }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
