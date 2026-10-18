const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const qyPos = code.indexOf('qy=');
let idx = qyPos;
while ((idx = code.indexOf('"Mon"', idx)) !== -1) {
  console.log('Found Mon at', idx);
  console.log(code.substring(idx - 50, idx + 250));
  console.log('---');
  idx += 5;
  if (idx > qyPos + 8000) break;
}
