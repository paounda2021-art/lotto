const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos = js.indexOf('o==="NIKKEI"||o==="STOCKS_VIP"');
console.log('pos:', pos);
if (pos !== -1) {
  console.log('Context before and after:', js.slice(pos - 200, pos + 400));
}

// Find definitions of vipSess and regSess
const posVip = js.indexOf('vipSess');
console.log('posVip:', posVip);
if (posVip !== -1) {
  console.log('Context around vipSess:', js.slice(posVip - 100, posVip + 400));
}
