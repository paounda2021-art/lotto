const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

console.log('--- 704200 to 704350 ---');
console.log(code.substring(704200, 704350));

console.log('\n--- 705000 to 705150 ---');
console.log(code.substring(705000, 705150));
