const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

let p = 0;
while ((p = code.indexOf('3 ตัว', p)) !== -1) {
  console.log(`--- Match at ${p} ---`);
  console.log(code.slice(Math.max(0, p - 100), Math.min(code.length, p + 200)));
  console.log('\n');
  p += 5;
}
