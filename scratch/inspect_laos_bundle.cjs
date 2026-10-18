const fs = require('fs');

const bundlePath = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
const content = fs.readFileSync(bundlePath, 'utf8');

const sIdx = content.indexOf('if (isLaos) {');
console.log('sIdx:', sIdx);

const endIdx = content.indexOf('if (!card1 && !card2) return null;', sIdx);
console.log('endIdx:', endIdx);
console.log(content.slice(endIdx, endIdx + 300));
