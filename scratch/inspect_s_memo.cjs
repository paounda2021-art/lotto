const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const start = 724500;
console.log(c.substring(start, start + 1500));
