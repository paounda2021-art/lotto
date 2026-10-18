const fs = require('fs');
const c = fs.readFileSync('scratch/index_patched.js', 'utf8');

const idx = c.indexOf('STOCKS_VIP');
console.log('STOCKS_VIP first index:', idx);
if (idx !== -1) {
  console.log(c.substring(idx - 200, idx + 400));
}
