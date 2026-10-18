const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const idx1 = code.indexOf('setMmCapital');
const idx2 = code.indexOf('setMmCapital', idx1 + 1);
console.log('idx1:', idx1, 'idx2:', idx2);
console.log(code.substring(idx2 - 100, idx2 + 300));
