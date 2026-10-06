const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

const targetStr = '(r.includes(o)||d.includes(o))';
const idx = code.indexOf(targetStr);
console.log('Found target at:', idx);
if (idx !== -1) {
  console.log(code.slice(idx - 150, idx + 250));
}

// Also check all occurrences of targetStr
let pos = 0;
while ((pos = code.indexOf(targetStr, pos)) !== -1) {
  console.log('Occurrence at:', pos);
  console.log(code.slice(pos - 100, pos + 150));
  pos += targetStr.length;
}
