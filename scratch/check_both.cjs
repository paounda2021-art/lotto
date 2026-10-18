const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const isStocksIdx = code.indexOf('const isStocks = (o==="NIKKEI"');
const startIdx = code.lastIndexOf('((()=>{', isStocksIdx);
const endMarker = '})())]})},s0=["มกราคม"';
const mIdx = code.indexOf(endMarker, startIdx);
console.log('Stocks IIFE start:', startIdx, 'mIdx:', mIdx);

const lyIdx = code.indexOf('MM Management');
console.log('Ly MM Management found at:', lyIdx);
