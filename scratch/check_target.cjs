const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const s0Pos = content.indexOf('s0=["มกราคม"', 760000);
const tail = content.substring(s0Pos - 80, s0Pos);
console.log('tail:', JSON.stringify(tail));

// Let's verify what comes right before s0Pos - 8:
console.log(content.substring(s0Pos - 12, s0Pos));
