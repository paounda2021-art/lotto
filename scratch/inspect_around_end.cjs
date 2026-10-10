const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const bannerEndStr = '},s0=["มกราคม"';
const endIdx = code.indexOf(bannerEndStr);

console.log('100 chars BEFORE endIdx:');
console.log(JSON.stringify(code.substring(endIdx - 100, endIdx)));
console.log('100 chars AFTER endIdx:');
console.log(JSON.stringify(code.substring(endIdx, endIdx + 100)));
