const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Search for the if-else chain in the bundle
const pos1 = js.indexOf('🏆 ผลออกจริง 6 รอบหุ้น:');
console.log('pos1 (6 รอบหุ้น):', pos1);
if (pos1 !== -1) {
  console.log('code before pos1:', js.slice(pos1 - 300, pos1));
  console.log('code after pos1 (up to 500 chars):', js.slice(pos1, pos1 + 500));
}

const pos2 = js.indexOf('🏆 ผลออกจริง (');
console.log('pos2 (ผลออกจริง (x รอบ)):', pos2);
if (pos2 !== -1) {
  console.log('code before pos2:', js.slice(pos2 - 300, pos2));
}
