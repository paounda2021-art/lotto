const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const target = 'LAOS_STAR';
let idx = 0;
while ((idx = code.indexOf(target, idx + 1)) !== -1) {
  const snippet = code.substring(Math.max(0, idx - 50), idx + 150);
  if (snippet.includes('useMemo') || snippet.includes('data') || snippet.includes('?') || snippet.includes('===')) {
    console.log(`Match at ${idx}:\n  ${snippet}\n---`);
  }
}
