const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'downloaded_target_worker');
const KV_DIR = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data');

if (!fs.existsSync(KV_DIR)) {
  fs.mkdirSync(KV_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function createServerHandler() {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Handle KV API (/api/draws)
    if (req.url.startsWith('/api/draws')) {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      
      if (req.method === 'GET') {
        const key = parsed.searchParams.get('key');
        if (key) {
          const kvPath = path.join(KV_DIR, `${key}.json`);
          if (fs.existsSync(kvPath)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, key, data: JSON.parse(fs.readFileSync(kvPath, 'utf8')) }));
            return;
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, key, data: null }));
            return;
          }
        }

        // Return all datasets
        const files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
        const datasets = {};
        for (const f of files) {
          const k = f.replace('.json', '');
          try {
            datasets[k] = JSON.parse(fs.readFileSync(path.join(KV_DIR, f), 'utf8'));
          } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, datasets }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { key, data } = JSON.parse(body);
            if (key && data) {
              const kvPath = path.join(KV_DIR, `${key}.json`);
              fs.writeFileSync(kvPath, JSON.stringify(data, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: `Saved ${key}` }));
              return;
            }
          } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
            return;
          }
        });
        return;
      }
    }

    // Handle Proxy API (/api/proxy)
    if (req.url.startsWith('/api/proxy')) {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const targetUrl = parsed.searchParams.get('url');
      if (targetUrl) {
        try {
          const proxyRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Referer': 'https://exphuay.com/',
              'Accept': 'application/json, text/plain, */*'
            }
          });
          const text = await proxyRes.text();
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(text);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
    }

    // Serve static files
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(PUBLIC_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  };
}

const PORT = 5173;
const server = http.createServer(createServerHandler());
server.listen(PORT, () => {
  console.log(`Local target worker server running on http://localhost:${PORT}/`);
});
