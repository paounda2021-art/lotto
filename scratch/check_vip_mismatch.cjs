const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find where "หุ้น VIP" button is rendered
const posHuanVip = js.indexOf('หุ้น VIP');
console.log('posHuanVip:', posHuanVip);
if (posHuanVip !== -1) {
  console.log('Around หุ้น VIP (300 chars):', js.slice(posHuanVip - 150, posHuanVip + 150));
}

// Find all occurrences of "STOCK_VIP" vs "STOCKS_VIP"
console.log('STOCK_VIP occurrences:');
let p = 0;
while ((p = js.indexOf('"STOCK_VIP"', p)) !== -1) {
  console.log('  "STOCK_VIP" at', p, 'context:', js.slice(p - 50, p + 80));
  p += 11;
}

console.log('STOCKS_VIP occurrences:');
p = 0;
while ((p = js.indexOf('"STOCKS_VIP"', p)) !== -1) {
  console.log('  "STOCKS_VIP" at', p, 'context:', js.slice(p - 50, p + 80));
  p += 12;
}
