const fs = require('fs');
const path = require('path');

const cleanPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-DBh-DStv.js');
const code = fs.readFileSync(cleanPath, 'utf8');

const target = ':o==="NIKKEI"?';
let idx = 0;
while ((idx = code.indexOf(target, idx + 1)) !== -1) {
  console.log('Match at', idx, ':\n', code.substring(idx - 100, idx + 150), '\n---');
}
