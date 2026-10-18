const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');
console.log('has win4-chip-default:', js.includes('win4-chip-default'));
console.log('has win4-chip-hit:', js.includes('win4-chip-hit'));
console.log('has #000000:', js.includes('#000000'));
console.log('has #ffffff:', js.includes('#ffffff'));

const css = fs.readFileSync('dist/assets/index-Cip8XUMO.css', 'utf8');
console.log('css has win4-chip-default:', css.includes('.win4-chip-default'));
console.log('css has win4-chip-hit:', css.includes('.win4-chip-hit'));
