const fs = require('fs');

const bundle = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const laosIdx = bundle.indexOf('if (isLaos) {');
const marker = bundle.indexOf('dItem.label', laosIdx);
console.log(bundle.slice(marker - 400, marker + 100));
