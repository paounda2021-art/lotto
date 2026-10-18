const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const targetIdx = js.indexOf('const isStocks = (o==="NIKKEI"');
console.log('Found isStocks at:', targetIdx);
console.log('Surrounding code (prior 300 chars):');
console.log(js.substring(targetIdx - 300, targetIdx));
