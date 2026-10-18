const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const pos = js.indexOf('regSess=');
console.log('500 chars before regSess:', js.slice(pos - 500, pos));
