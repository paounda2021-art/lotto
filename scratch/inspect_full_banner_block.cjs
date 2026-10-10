const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcJsPath, 'utf8');

const bannerStart = code.indexOf('bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20');
const bannerEnd = code.indexOf('s0=["มกราคม"');

console.log('bannerStart:', bannerStart);
console.log('bannerEnd:', bannerEnd);

console.log('Original block to replace:');
console.log(code.substring(bannerStart - 30, bannerEnd));
