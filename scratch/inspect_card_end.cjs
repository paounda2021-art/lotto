const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const tableEndIdx = code.indexOf('ตารางผลการออกรางวัลจริงย้อนหลังเฉพาะวัน');
const nextSection = '},s0=["มกราคม"';
const nextIdx = code.indexOf(nextSection);

console.log('tableEndIdx:', tableEndIdx);
console.log('nextIdx:', nextIdx);
console.log('Code between tableEndIdx and nextIdx:', code.substring(tableEndIdx, nextIdx));
