const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const box2Label = '⚡ ชุดวิน 4 ตัว บน-ล่าง';
const box2LabelIdx = code.indexOf(box2Label);
console.log(code.substring(box2LabelIdx - 600, box2LabelIdx - 100));
