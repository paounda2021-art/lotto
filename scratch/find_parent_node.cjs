const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcJsPath, 'utf8');

const startStr = 'n.jsxs("div",{className:"flex items-center gap-3 bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl shrink-0"';
const startIdx = code.indexOf(startStr);

console.log('Code 300 chars before startIdx:');
console.log(code.substring(startIdx - 300, startIdx + 100));
