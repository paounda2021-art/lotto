const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

const target = 'ที่จะถึง (ฮานอย 3 นอย)';
const idx = code.indexOf(target);
const target3D = '⚡ ชุดเลขวิน 3 ตัวตรง';
const idx3D = code.indexOf(target3D, idx);
console.log('3D container div outer:');
console.log(code.substring(idx3D - 500, idx3D - 200));
