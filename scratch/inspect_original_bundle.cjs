const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

const targets = ['เด่นหลัก', 'ฟันเด่นวิ่ง', 'นิเคอิ VIP เช้า', 'HANOI_SPECIAL', 'CHINA_VIP_MORNING'];
for (const t of targets) {
  let p = code.indexOf(t);
  console.log('Target ' + t + ': at ' + p);
  if (p !== -1) {
    console.log('Snippet:\n' + code.slice(Math.max(0, p - 300), p + 300) + '\n---');
  }
}
