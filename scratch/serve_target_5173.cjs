const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'dist');
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
      let targetUrl = parsed.searchParams.get('url');
      if (!targetUrl) {
        const rawIdx = req.url.indexOf('url=');
        if (rawIdx !== -1) {
          try {
            targetUrl = decodeURIComponent(req.url.slice(rawIdx + 4));
          } catch(e) {
            targetUrl = req.url.slice(rawIdx + 4);
          }
        }
      }
      if (!targetUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Missing target url parameter' }));
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const proxyRes = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://exphuay.com/',
            'Accept': 'application/json, text/plain, */*'
          }
        });
        clearTimeout(timeout);
        const text = await proxyRes.text();
        res.writeHead(proxyRes.status || 200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(text);
      } catch (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: err.message || 'Proxy fetch failed' }));
      }
      return;
    }

    // Handle LINE API (/api/line)
    if (req.url.startsWith('/api/line')) {
      const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const lineConfigPath = path.join(KV_DIR, 'line_bot_config.json');

      if (parsed.pathname === '/api/line/config' && req.method === 'GET') {
        let config = { channelAccessToken: '', targetId: 'U3a7529a26c7c9a1a06d4cd374349a33c', enabled: true };
        if (fs.existsSync(lineConfigPath)) {
          try { config = JSON.parse(fs.readFileSync(lineConfigPath, 'utf8')); } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config }));
        return;
      }

      if (parsed.pathname === '/api/line/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            fs.writeFileSync(lineConfigPath, body, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'LINE Bot config saved' }));
          } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }
      if (parsed.pathname === '/api/line/webhook' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const events = data.events || [];
            for (const ev of events) {
              const groupId = ev.source && ev.source.groupId;
              if (groupId) {
                let cfg = { channelAccessToken: '', targetId: groupId, enabled: true };
                if (fs.existsSync(lineConfigPath)) {
                  try { cfg = JSON.parse(fs.readFileSync(lineConfigPath, 'utf8')); } catch(e) {}
                }
                cfg.targetId = groupId;
                cfg.lastDetectedGroupId = groupId;
                fs.writeFileSync(lineConfigPath, JSON.stringify(cfg, null, 2), 'utf8');

                const userMsg = (ev.message && ev.message.text ? ev.message.text.trim() : '');
                const isAskingId = userMsg === 'รหัสกลุ่ม' || userMsg === '#groupid' || userMsg === '/id' || userMsg === 'idกลุ่ม';

                if (isAskingId && cfg.channelAccessToken && ev.replyToken) {
                  await fetch('https://api.line.me/v2/bot/message/reply', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${cfg.channelAccessToken}`
                    },
                    body: JSON.stringify({
                      replyToken: ev.replyToken,
                      messages: [{ type: 'text', text: `รหัสกลุ่มนี้คือ:\n${groupId}\n\n(ระบบบันทึกรหัสกลุ่มนี้เรียบร้อยแล้วครับ)` }]
                    })
                  }).catch(() => {});
                }
              }
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
          } catch(e) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
          }
        });
        return;
      }

      if (parsed.pathname === '/api/line/send' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            let { message, to, token } = data;
            if (!token && fs.existsSync(lineConfigPath)) {
              try {
                const cfg = JSON.parse(fs.readFileSync(lineConfigPath, 'utf8'));
                token = cfg.channelAccessToken;
                if (!to) to = cfg.targetId;
              } catch(e) {}
            }
            if (!to) to = 'U3a7529a26c7c9a1a06d4cd374349a33c';
            if (!token) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'กรุณาระบุ Channel Access Token ในการตั้งค่า LINE ก่อนส่งข้อความ' }));
              return;
            }
            if (!message) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'ข้อความว่างเปล่า' }));
              return;
            }

            const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                to,
                messages: [{ type: 'text', text: message }]
              })
            });
            const lineJson = await lineRes.json().catch(() => ({}));
            if (!lineRes.ok) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, status: lineRes.status, error: lineJson.message || lineRes.statusText, details: lineJson }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'ส่งแจ้งเตือนเข้า LINE สำเร็จแล้ว!', to }));
          } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
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
