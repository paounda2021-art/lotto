const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
console.log('Downloaded target has color:#000000:', code.includes('color:"#000000"'));
const idx = code.indexOf('mmCapital');
console.log(code.substring(idx + 100, idx + 400));
