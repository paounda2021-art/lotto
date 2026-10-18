const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos = js.indexOf('o==="NIKKEI"||o==="STOCKS_VIP"');
console.log('pos:', pos);
console.log('3500 chars before:', js.slice(pos - 3500, pos - 1500));
