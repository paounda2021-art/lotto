const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Search for getStockHitsForPair or pair hit detection function in index-CN-5_2d9.js
let p = 0;
while ((p = code.indexOf('bottom2===', p)) !== -1) {
  console.log(`--- Pair check match at ${p} ---`);
  console.log(code.slice(Math.max(0, p - 100), Math.min(code.length, p + 250)));
  console.log('\n');
  p += 10;
}
