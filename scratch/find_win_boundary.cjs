const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const search = 'winData=';
const idx = code.indexOf(search);
console.log('winData start:', idx);

const endSearch = '⚡ ชุดเลขวิน 3 ตัวตรง';
const endIdx = code.indexOf(endSearch, idx);
console.log('endSearch start:', endIdx);

if (endIdx !== -1) {
  console.log(code.slice(endIdx, endIdx + 700));
}
