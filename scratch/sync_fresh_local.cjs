const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'live_worker_download');
const htmlContent = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

const targets = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'cloudflare_latest_download')
];

for (const targetDir of targets) {
  fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf8');
  
  const files = fs.readdirSync(path.join(srcDir, 'assets'));
  for (const f of files) {
    fs.copyFileSync(
      path.join(srcDir, 'assets', f),
      path.join(targetDir, 'assets', f)
    );
  }
}

// Update root index.html to match
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), htmlContent, 'utf8');

console.log('✅ Synchronized live Cloudflare Worker version 100% to local machine!');
