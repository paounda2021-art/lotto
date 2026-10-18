const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos1 = js.indexOf('🏆 ผลออกจริง 6 รอบหุ้น:');
const pos2 = js.indexOf('🏆 ผลออกจริง (');

console.log('between pos1 and pos2 (1200 chars):', js.slice(pos1 + 800, pos2));
