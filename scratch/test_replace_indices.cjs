const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const sIdx = code.indexOf('Ly=({initialDigits:e})=>{');
const nextFnIdx = code.indexOf('function Dy(', sIdx);

console.log('sIdx:', sIdx, 'nextFnIdx:', nextFnIdx);
console.log('Current Ly snippet:', code.substring(sIdx, sIdx + 200));
console.log('Current Ly end snippet:', code.substring(nextFnIdx - 100, nextFnIdx));
