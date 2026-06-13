// supabase/functions/kite-proxy/index.ts
// Universal Kite API proxy — forwards any Kite REST call from the browser
// keeping the access_token server-side optional (or passed in header)
//
// Usage from client:
//   fetch('https://your-project.supabase.co/functions/v1/kite-proxy/portfolio/holdings', {
//     headers: { 'x-kite-token': 'api_key:access_token' }
//   })

const KITE_BASE = 'https://api.kite.trade'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kite-token, x-kite-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Strip the function path prefix: /functions/v1/kite-proxy/...path...
    const kitePath = url.pathname.replace(/^.*\/kite-proxy/, '')
    const kiteUrl = `${KITE_BASE}${kitePath}${url.search}`

    const kiteToken = req.headers.get('x-kite-token')
    const apiKey = Deno.env.get('KITE_API_KEY')

    const headers: Record<string, string> = {
      'X-Kite-Version': '3',
      'Content-Type': req.headers.get('content-type') || 'application/json',
    }

    if (kiteToken) {
      headers['Authorization'] = `token ${kiteToken}`
    } else if (apiKey) {
      // Server-side only calls using stored session
      headers['Authorization'] = `token ${apiKey}:${Deno.env.get('KITE_ACCESS_TOKEN') ?? ''}`
    }

    const body = req.method !== 'GET' ? await req.text() : undefined

    const kiteRes = await fetch(kiteUrl, {
      method: req.method,
      headers,
      body,
    })

    const data = await kiteRes.text()

    return new Response(data, {
      status: kiteRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': kiteRes.headers.get('content-type') || 'application/json',
      },
    })

  } catch (err) {
    console.error('kite-proxy error:', err)
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
