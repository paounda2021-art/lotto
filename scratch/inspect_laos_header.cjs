const fs = require('fs');

const bundle = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
const idx = bundle.indexOf('(หวยลาวพัฒนา)');
console.log(bundle.slice(idx - 500, idx + 200));
