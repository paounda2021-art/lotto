const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const start = content.indexOf('if (isHanoi) {');
console.log(content.slice(start, start + 1200));
