const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

const p = code.indexOf('winningNumbers:');
console.log('winningNumbers at:', p);
let pos = p;
while (pos !== -1) {
  console.log(code.slice(pos - 300, pos + 200));
  console.log('===');
  pos = code.indexOf('winningNumbers:', pos + 1);
}
