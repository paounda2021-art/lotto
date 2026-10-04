export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API Route for Lotto KV Sync (/api/draws)
    if (url.pathname.startsWith('/api/draws')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      if (!env.LOTTO_KV) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'LOTTO_KV binding not configured on Cloudflare'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            status: 200
          }
        );
      }

      // GET /api/draws
      if (request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (key) {
          const data = await env.LOTTO_KV.get(key, 'text');
          return new Response(
            JSON.stringify({ success: true, key, data: data ? JSON.parse(data) : null }),
            {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }

        const keys = [
          'lotto_data_nikkei',
          'lotto_data_laos',
          'lotto_data_dowjones',
          'lotto_data_hanoi_special',
          'lotto_data_hanoi',
          'lotto_data_hanoi_vip',
          'lotto_data_gsb',
          'lotto_data_gov'
        ];

        const result = {};
        for (const k of keys) {
          const val = await env.LOTTO_KV.get(k, 'text');
          if (val) {
            try {
              result[k] = JSON.parse(val);
            } catch (e) {
              result[k] = null;
            }
          }
        }

        return new Response(
          JSON.stringify({ success: true, datasets: result }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // POST /api/draws
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { key, data } = body;
          if (!key || !data) {
            return new Response(
              JSON.stringify({ success: false, message: 'Missing key or data' }),
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                status: 400
              }
            );
          }
          await env.LOTTO_KV.put(key, JSON.stringify(data));
          return new Response(
            JSON.stringify({ success: true, message: `Saved ${key} to Cloudflare KV` }),
            {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              status: 500
            }
          );
        }
      }
    }

    // 2. API Proxy Route (/api/proxy)
    if (url.pathname.startsWith('/api/proxy')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*'
          }
        });
      }

      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing target url parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
          }
        });
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': '*'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Proxy fetch failed' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 3. Default: Fallback to static assets (HTML / CSS / JS)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
