const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

let idx = 0;
while ((idx = js.indexOf('lotto_selected_type', idx)) !== -1) {
  console.log('Found lotto_selected_type at', idx);
  console.log(js.slice(Math.max(0, idx - 100), idx + 200));
  idx += 20;
}
