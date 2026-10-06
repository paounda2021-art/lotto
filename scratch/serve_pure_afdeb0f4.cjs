const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4');

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
  return (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // KV API
    if (req.url.startsWith('/api/draws')) {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      
      if (req.method === 'GET') {
        const key = parsed.searchParams.get('key');
        if (key) {
          const kvPath = path.join(PUBLIC_DIR, 'kv_data', `${key}.json`);
          if (fs.existsSync(kvPath)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, key, data: JSON.parse(fs.readFileSync(kvPath, 'utf8')) }));
            return;
          }
        }
        // Return all datasets
        const kvDir = path.join(PUBLIC_DIR, 'kv_data');
        const files = fs.readdirSync(kvDir).filter(f => f.endsWith('.json'));
        const datasets = {};
        for (const f of files) {
          const k = f.replace('.json', '');
          try {
            datasets[k] = JSON.parse(fs.readFileSync(path.join(kvDir, f), 'utf8'));
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
              const kvPath = path.join(PUBLIC_DIR, 'kv_data', `${key}.json`);
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

    // Proxy API
    if (req.url.startsWith('/api/proxy')) {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const targetUrl = parsed.searchParams.get('url');
      if (targetUrl) {
        fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json, text/plain, */*'
          }
        })
        .then(r => r.text())
        .then(text => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(text);
        })
        .catch(err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
        return;
      }
    }

    // Static files
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

// Start on Port 3000
const server3000 = http.createServer(createServerHandler());
server3000.listen(3000, () => {
  console.log('Pure afdeb0f4 server running on http://localhost:3000/');
});

// Also start on Port 3001 so either port works identically
const server3001 = http.createServer(createServerHandler());
server3001.listen(3001, () => {
  console.log('Pure afdeb0f4 server running on http://localhost:3001/');
});
