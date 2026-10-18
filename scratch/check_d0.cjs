const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const search = 'function d0(';
const idx = code.indexOf(search) !== -1 ? code.indexOf(search) : code.indexOf('d0=');
console.log('Idx:', idx);
if (idx !== -1) {
  console.log(code.slice(idx, idx + 600));
}
