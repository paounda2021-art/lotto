const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const bannerStart = 'h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20';
console.log('bannerStart index:', code.indexOf(bannerStart));

const tableEnd = 'ตารางผลการออกรางวัลจริงย้อนหลังเฉพาะวัน';
console.log('tableEnd index:', code.indexOf(tableEnd));

const contextAfter = code.substring(code.indexOf(tableEnd) - 50, code.indexOf(tableEnd) + 500);
console.log('Context after tableEnd:', contextAfter);
