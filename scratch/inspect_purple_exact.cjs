const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const start = content.indexOf('HANOI 100% 6-PRIZE WIN4 CARD');
const end = content.indexOf('const card3 =', start);
console.log(content.slice(start, end));
