const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos1 = js.indexOf('🏆 ผลออกจริง 6 รอบหุ้น:');
console.log('1500 chars before pos1:', js.slice(pos1 - 1500, pos1));

const pos2 = js.indexOf('🏆 ผลออกจริง (');
console.log('1000 chars before pos2:', js.slice(pos2 - 1000, pos2));
