const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

const p = code.indexOf('ฟันเด่นวิ่ง-รูด');
console.log(code.slice(p - 6000, p));
