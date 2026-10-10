const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const idx = code.indexOf('const s_={');
if (idx === -1) {
  const idx2 = code.indexOf('s_={');
  console.log('s_ search index:', idx2);
  console.log(code.substring(idx2 - 50, idx2 + 1000));
} else {
  console.log('const s_ index:', idx);
  console.log(code.substring(idx - 50, idx + 1000));
}
