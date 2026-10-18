const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const idx = 829300;
console.log(code.slice(idx - 600, idx));
