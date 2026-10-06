import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localKvPlugin(): Plugin {
  const kvDir = path.resolve(__dirname, 'cloudflare_download_afdeb0f4/kv_data');
  return {
    name: 'local-kv-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        
        if (url.pathname.startsWith('/api/draws')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (req.method === 'GET') {
            const key = url.searchParams.get('key');
            if (key) {
              const filePath = path.join(kvDir, `${key}.json`);
              if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf8');
                res.end(JSON.stringify({ success: true, key, data: JSON.parse(raw) }));
                return;
              } else {
                res.end(JSON.stringify({ success: true, key, data: null }));
                return;
              }
            }

            // Return all datasets
            const keys = [
              'lotto_data_china_morning',
              'lotto_data_china_afternoon',
              'lotto_data_china_vip_morning',
              'lotto_data_china_vip_afternoon',
              'lotto_data_dowjones',
              'lotto_data_gov',
              'lotto_data_gsb',
              'lotto_data_hangseng_morning',
              'lotto_data_hangseng_afternoon',
              'lotto_data_hangseng_vip_morning',
              'lotto_data_hangseng_vip_afternoon',
              'lotto_data_hanoi',
              'lotto_data_hanoi_special',
              'lotto_data_hanoi_vip',
              'lotto_data_laos',
              'lotto_data_laos_star',
              'lotto_data_nikkei_morning',
              'lotto_data_nikkei_afternoon',
              'lotto_data_nikkei_vip_morning',
              'lotto_data_nikkei_vip_afternoon'
            ];
            const datasets: Record<string, any> = {};
            for (const k of keys) {
              const fPath = path.join(kvDir, `${k}.json`);
              if (fs.existsSync(fPath)) {
                try {
                  datasets[k] = JSON.parse(fs.readFileSync(fPath, 'utf8'));
                } catch (e) {
                  datasets[k] = null;
                }
              }
            }
            res.end(JSON.stringify({ success: true, datasets }));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const { key, data } = parsed;
                if (key && data) {
                  const fPath = path.join(kvDir, `${key}.json`);
                  if (!fs.existsSync(kvDir)) fs.mkdirSync(kvDir, { recursive: true });
                  fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf8');
                  res.end(JSON.stringify({ success: true, message: `Saved ${key} locally` }));
                  return;
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err?.message }));
                return;
              }
            });
            return;
          }
        }

        if (url.pathname.startsWith('/api/proxy')) {
          const targetUrl = url.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing target url' }));
            return;
          }
          try {
            const proxyRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json, text/plain, */*'
              }
            });
            const text = await proxyRes.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(text);
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e?.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localKvPlugin()],
  base: './',
  server: {
    port: 3000,
    open: false,
  },
});
