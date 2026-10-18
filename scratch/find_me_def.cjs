const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const search = ',me=';
let idx = code.indexOf(search);
while (idx !== -1) {
  console.log('Found ,me= at:', idx);
  console.log(code.slice(idx - 50, idx + 200));
  idx = code.indexOf(search, idx + 1);
}
