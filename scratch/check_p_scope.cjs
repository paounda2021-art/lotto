const fs = require('fs');
const content = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const qyIdx = content.indexOf('qy=({data:e,allData:t');
const iifeIdx = content.indexOf('const isStocks = (o==="NIKKEI"');

// Check if 'p' is declared between qyIdx and iifeIdx and not inside any nested closed function
const chunk = content.slice(qyIdx, iifeIdx);
console.log('Does chunk declare p=?:', chunk.includes('p=b=>{'));
console.log('Does chunk declare d=?:', chunk.includes('[r,d]=W.useState'));
