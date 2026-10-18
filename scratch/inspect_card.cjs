const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const targetStr = 'if(o!=="HANOI")return null;';
const idx = content.indexOf(targetStr);
console.log('Index of targetStr:', idx);
if (idx !== -1) {
  console.log('Before:');
  console.log(content.slice(Math.max(0, idx - 400), idx));
  console.log('After:');
  console.log(content.slice(idx, idx + 400));
}
