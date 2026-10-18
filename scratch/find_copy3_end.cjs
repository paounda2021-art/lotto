const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const idx = c.indexOf('📋 คัดลอก 3 ตัว');
console.log('Index of คัดลอก 3 ตัว:', idx);
if (idx !== -1) {
  console.log(c.substring(idx - 100, idx + 1500));
}
