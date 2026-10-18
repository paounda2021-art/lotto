const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcPath, 'utf8');

const sIdx = code.indexOf('Ly=({initialDigits:e})=>{');
const nextFnIdx = code.indexOf('function Dy(', sIdx);
console.log(code.substring(sIdx, nextFnIdx));
