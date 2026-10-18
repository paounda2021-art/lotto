const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos1 = js.indexOf('🏆 ผลออกจริง 6 รอบหุ้น:');
console.log('pos1:', pos1);
console.log('code from pos1-600 to pos1+100:', js.slice(pos1 - 600, pos1 + 100));
