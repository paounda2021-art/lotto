const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'downloaded_target_worker');
const distDir = path.join(__dirname, '..', 'dist');

// Copy downloaded_target_worker to dist
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

copyDir(targetDir, distDir);
console.log('1. Synced downloaded_target_worker to dist');

// Update serve_target_5173.cjs PUBLIC_DIR to downloaded_target_worker
const serveScript = path.join(__dirname, 'serve_target_5173.cjs');
let code = fs.readFileSync(serveScript, 'utf8');
code = code.replace(
  /const PUBLIC_DIR = path\.join\(__dirname, '\.\.', '[^']+'\);/,
  "const PUBLIC_DIR = path.join(__dirname, '..', 'downloaded_target_worker');"
);
fs.writeFileSync(serveScript, code, 'utf8');
console.log('2. Updated serve_target_5173.cjs to point to downloaded_target_worker');
