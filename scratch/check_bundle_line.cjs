const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const p1 = code.indexOf('btn-line-settings-jsx');
if (p1 !== -1) {
  console.log('p1:', code.substring(p1 - 20, p1 + 350));
}
