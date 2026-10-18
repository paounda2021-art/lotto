const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const regex = /(?:t|o|e|lotteryType)\s*={2,3}\s*["']LAOS["']/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log(m.index, code.substring(Math.max(0, m.index - 50), Math.min(code.length, m.index + 120)));
}
