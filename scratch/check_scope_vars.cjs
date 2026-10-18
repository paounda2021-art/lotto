const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const qyIdx = content.indexOf('qy=({data:e,allData:t');
console.log(content.slice(qyIdx + 1100, qyIdx + 2000));
