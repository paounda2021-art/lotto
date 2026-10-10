const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Search for where session buttons are rendered in top bar
let p = 0;
while ((p = code.indexOf('⭐ รวมทุกหุ้น VIP (6 รอบ)', p)) !== -1) {
  console.log(`--- Session Button Match at ${p} ---`);
  console.log(code.slice(p - 200, p + 250));
  p += 10;
}

// Search for where session buttons for normal stock are rendered
p = 0;
while ((p = code.indexOf('⭐ รวมทุกหุ้นปกติ (6 รอบ)', p)) !== -1) {
  console.log(`--- Normal Stock Button Match at ${p} ---`);
  console.log(code.slice(p - 200, p + 250));
  p += 10;
}
