const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('Comparing bundle features with src/...');
console.log('Bundle contains "laosStarData"?', bundle.includes('LAOS_STAR'));
console.log('Bundle contains "NIKKEI_MORNING"?', bundle.includes('NIKKEI_MORNING'));
console.log('Bundle contains "CHINA_AFTERNOON"?', bundle.includes('CHINA_AFTERNOON'));
console.log('Bundle contains "HANGSENG_VIP"?', bundle.includes('HANGSENG_VIP'));
