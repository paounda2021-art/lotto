const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find where navigation tabs are mapped / created
const idx = js.indexOf('STOCK_VIP:"หุ้น VIP"');
console.log('STOCK_VIP tab mapping at', idx);
console.log(js.slice(idx - 200, idx + 600));
