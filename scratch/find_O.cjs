const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos = js.indexOf('sp=O.find');
console.log('pos sp=O.find:', pos);
// Find where O is assigned before pos
console.log('1000 chars before:', js.slice(pos - 1000, pos));
