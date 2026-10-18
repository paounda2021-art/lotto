const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/export_modal.js', 'utf8');

const p = code.indexOf('getDrawsForLottery');
console.log(code.substring(p, p + 1200));
