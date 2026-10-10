const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

console.log('Searching for top2 or bottom2 string matching across entire file:');
let pos = 0;
while((pos = code.indexOf('.includes(', pos + 1)) !== -1) {
  const snippet = code.substring(pos - 100, pos + 150);
  if (snippet.includes('top2') || snippet.includes('bottom2') || snippet.includes('บน') || snippet.includes('ล่าง')) {
    console.log('Match at pos:', pos, '\n', snippet, '\n---');
  }
}
