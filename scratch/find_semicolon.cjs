const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

const startIdx = code.indexOf('{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)');
const retIdx = code.indexOf('return n.jsxs("div",{className:"bg-nikkei-card', startIdx);
console.log('Return statement at:', retIdx);
console.log('Preceding 150 chars:');
console.log(code.substring(retIdx - 150, retIdx));
