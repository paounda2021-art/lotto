const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find where o is declared or passed in this component
const posVip = js.indexOf('vipSess');
console.log('500 chars before vipSess:', js.slice(posVip - 500, posVip));
