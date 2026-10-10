const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcJsPath, 'utf8');

const startIdx = code.indexOf('bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl shrink-0');
const endIdx = code.indexOf('...และอีก ');

console.log('Snippet from startIdx-20 to endIdx+100:');
console.log(code.substring(startIdx - 50, endIdx + 100));
