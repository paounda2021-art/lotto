const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

console.log('Start slice:', JSON.stringify(content.slice(769078, 769078 + 35)));
console.log('End slice:', JSON.stringify(content.slice(805144, 805144 + 10)));
