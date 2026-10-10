const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Find index of STOCKS_VIP_ALL_3
let pos = 0;
while ((pos = code.indexOf('STOCKS_VIP_ALL_3', pos)) !== -1) {
  console.log(`--- Match at pos ${pos} ---`);
  const snippet = code.slice(Math.max(0, pos - 150), Math.min(code.length, pos + 250));
  console.log(snippet);
  console.log('\n');
  pos += 16;
}
