const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const idx = code.indexOf('async function l_');
console.log('l_ search index:', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 50, idx + 1000));
}
