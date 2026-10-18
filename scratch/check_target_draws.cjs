const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Search for getTargetDayDraws in the bundle
const pos = js.indexOf('getTargetDayDraws');
console.log('pos getTargetDayDraws:', pos);
if (pos !== -1) {
  console.log('around getTargetDayDraws:', js.slice(pos - 100, pos + 400));
}
