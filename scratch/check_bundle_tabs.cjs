const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const posBanner = js.indexOf('ขณะนี้กำลังวิเคราะห์');
console.log('posBanner:', posBanner);

// Find "หน้าหลัก" after posBanner
const posHome = js.indexOf('หน้าหลัก', posBanner);
console.log('posHome:', posHome);
if (posHome !== -1) {
  console.log('Context around หน้าหลัก:', js.slice(posHome - 200, posHome + 300));
}

// Find "qy" after posBanner
const posQy = js.indexOf('qy,', posBanner);
console.log('posQy:', posQy);
if (posQy !== -1) {
  console.log('Context around qy:', js.slice(posQy - 100, posQy + 200));
}
