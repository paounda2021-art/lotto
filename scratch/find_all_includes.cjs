const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

let pos = 0;
while ((pos = code.indexOf('.includes(k)', pos)) !== -1) {
  console.log(`--- Match at ${pos} ---`);
  console.log(code.slice(Math.max(0, pos - 150), Math.min(code.length, pos + 150)));
  console.log('\n');
  pos += 12;
}
