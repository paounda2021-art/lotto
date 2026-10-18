const fs = require('fs');

const files = [
  'downloaded_target_worker/assets/index-CN-5_2d9.js',
  'dist/assets/index-CN-5_2d9.js'
];

const target = '}else if(o==="NIKKEI"||o==="STOCKS_VIP"){const sList=o==="STOCKS_VIP"?vipSess:regSess;';
const replacement = '}else if(o==="NIKKEI"||o==="STOCKS_VIP"||o==="STOCK_VIP"){const sList=(o==="STOCKS_VIP"||o==="STOCK_VIP")?vipSess:regSess;';

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    continue;
  }
  let js = fs.readFileSync(file, 'utf8');
  console.log(file, 'includes target:', js.includes(target));
  if (js.includes(target)) {
    js = js.replace(target, replacement);
    fs.writeFileSync(file, js, 'utf8');
    console.log('Successfully patched:', file);
  }
}
