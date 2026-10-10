const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Find function Bn or prediction generator
let p = 0;
while ((p = code.indexOf('crossSessionFlowNote', p)) !== -1) {
  console.log(`--- Match at ${p} ---`);
  console.log(code.slice(Math.max(0, p - 100), Math.min(code.length, p + 300)));
  console.log('\n');
  p += 20;
}
