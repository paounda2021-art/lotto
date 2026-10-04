interface Env {
  LOTTO_KV?: any;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!env.LOTTO_KV) {
    return new Response(
      JSON.stringify({ success: false, message: 'LOTTO_KV binding not configured on Cloudflare' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  if (key) {
    const data = await env.LOTTO_KV.get(key, 'text');
    return new Response(
      JSON.stringify({ success: true, key, data: data ? JSON.parse(data) : null }),
      { headers: { 'Content-Type': 'application/json' } }
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

  const result: Record<string, any> = {};
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
    { headers: { 'Content-Type': 'application/json' } }
  );
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  if (!env.LOTTO_KV) {
    return new Response(
      JSON.stringify({ success: false, message: 'LOTTO_KV binding not configured on Cloudflare' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  try {
    const body = await request.json();
    const { key, data } = body as { key: string; data: any };

    if (!key || !data) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing key or data' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    await env.LOTTO_KV.put(key, JSON.stringify(data));
    return new Response(
      JSON.stringify({ success: true, message: `Saved ${key} to Cloudflare KV` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};
