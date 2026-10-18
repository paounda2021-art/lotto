const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcPath, 'utf8');

const isStocksIdx = code.indexOf('const isStocks = (o==="NIKKEI"');
console.log('isStocksIdx:', isStocksIdx);
if (isStocksIdx === -1) {
  console.error('Not found!');
  process.exit(1);
}
const startIdx = code.lastIndexOf('((()=>{', isStocksIdx);
const endMarker = '})())]})},s0=["มกราคม"';
const endIdx = code.indexOf(endMarker, startIdx);

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx, 'ends at:', endIdx + 5);
console.log('Start substring:', JSON.stringify(code.slice(startIdx, startIdx + 30)));
console.log('End substring:', JSON.stringify(code.slice(endIdx, endIdx + 15)));
