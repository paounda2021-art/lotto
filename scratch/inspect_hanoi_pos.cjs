const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const idx = c.indexOf('if(o!=="HANOI")return null;');
console.log('Found if(o!=="HANOI"):', idx);
if (idx !== -1) {
  console.log('--- 300 chars before ---');
  console.log(c.substring(idx - 300, idx));
  console.log('--- 500 chars after ---');
  console.log(c.substring(idx, idx + 500));
}
