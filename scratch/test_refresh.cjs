const fs = require('fs');
const path = require('path');

const wranglerDir = 'C:\\Users\\FMO-3\\AppData\\Local\\npm-cache\\_npx\\32026684e21afda6\\node_modules\\wrangler';
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) search(full);
    else if (f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.mjs')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('dash.cloudflare.com/oauth2/token') || content.includes('/oauth2/token') || content.includes('refreshToken')) {
        console.log('Found in:', full);
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('dash.cloudflare.com/oauth2') || lines[i].includes('client_id')) {
            console.log(`  Line ${i}:`, lines[i].slice(0, 300));
          }
        }
      }
    }
  }
}
search(wranglerDir);
