const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const idx = content.indexOf('Yy=');
console.log(content.slice(idx - 200, idx + 600));
