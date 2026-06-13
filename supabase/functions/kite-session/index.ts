// supabase/functions/kite-session/index.ts
// Supabase Edge Function — exchanges Kite request_token for access_token
// Deployed automatically via: supabase functions deploy kite-session
//
// This runs on Deno (not Node.js). No npm required.
// The API secret is stored as a Supabase secret (never in client code).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { request_token, api_key } = await req.json()

    if (!request_token || !api_key) {
      return new Response(
        JSON.stringify({ error: 'Missing request_token or api_key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // API secret stored as Supabase secret — never exposed to browser
    const api_secret = Deno.env.get('KITE_API_SECRET')
    if (!api_secret) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured — KITE_API_SECRET not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Compute SHA256 checksum: sha256(api_key + request_token + api_secret)
    const encoder = new TextEncoder()
    const data = encoder.encode(api_key + request_token + api_secret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const checksum = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Exchange token with Kite
    const kiteRes = await fetch('https://api.kite.trade/session/token', {
      method: 'POST',
      headers: {
        'X-Kite-Version': '3',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ api_key, request_token, checksum }).toString(),
    })

    const kiteData = await kiteRes.json()

    if (!kiteRes.ok) {
      return new Response(
        JSON.stringify({ error: kiteData.message || 'Kite API error' }),
        { status: kiteRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store access_token in Supabase for the authenticated user (optional but useful)
    // So we can refresh data server-side later
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const user_id = kiteData.data.user_id
    await supabase.from('kite_sessions').upsert({
      kite_user_id: user_id,
      access_token: kiteData.data.access_token,
      user_name: kiteData.data.user_name,
      email: kiteData.data.email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    }, { onConflict: 'kite_user_id' })

    return new Response(
      JSON.stringify({
        access_token: kiteData.data.access_token,
        user: {
          user_name: kiteData.data.user_name,
          user_id: kiteData.data.user_id,
          email: kiteData.data.email,
          broker: kiteData.data.broker,
          avatar: kiteData.data.user_name?.charAt(0)?.toUpperCase(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('kite-session error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
