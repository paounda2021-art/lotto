const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const endSearch = '⚡ ชุดเลขวิน 3 ตัวตรง';
const endIdx = code.indexOf(endSearch);

console.log(code.slice(endIdx + 400, endIdx + 900));
