const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const regex = /["'][A-Z_0-9]*VIP[A-Z_0-9]*["']/g;
let m, set = new Set();
while ((m = regex.exec(js)) !== null) {
  if (m[0].includes('STOCK')) set.add(m[0]);
}
console.log('Stock VIP occurrences:', Array.from(set));

// Check where STOCKS_VIP or STOCK_VIP is used with lotteryType
const pos = js.indexOf('o==="NIKKEI"||o==="STOCKS_VIP"');
console.log('found condition at:', pos);
if (pos !== -1) {
  console.log('slice around condition:', js.slice(pos - 300, pos + 300));
}
