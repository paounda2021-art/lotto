const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('i_=', idx + 1)) !== -1) {
  console.log('Match at', idx, ':\n', code.substring(idx - 20, idx + 60), '\n---');
}
