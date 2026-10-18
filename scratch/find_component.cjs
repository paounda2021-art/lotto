const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const f = 832836;
console.log(content.slice(Math.max(0, f - 1500), f));
