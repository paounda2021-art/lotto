const fs = require('fs');
const bundle = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

// Find Yy and w2
const yyIdx = bundle.indexOf('Yy=(e,t)=>{');
console.log('Yy code:');
console.log(bundle.substring(yyIdx, yyIdx + 600));

const w2Idx = bundle.indexOf('function w2(');
console.log('\nw2 code:');
console.log(bundle.substring(w2Idx, w2Idx + 600));
