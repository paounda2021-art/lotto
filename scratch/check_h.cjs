const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const search = 'b=H.find(L=>L.session==="HANOI_VIP")';
const idx = code.indexOf(search);
console.log('Idx:', idx);
if (idx !== -1) {
  console.log(code.slice(idx - 600, idx + 200));
}
