const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const target = 'กำลังดึงผลรางวัลล่าสุดสำหรับ';
let idx = 0;
while ((idx = code.indexOf(target, idx + 1)) !== -1) {
  console.log(`Match at ${idx}:\n`, code.substring(idx - 200, idx + 800), '\n---');
}
