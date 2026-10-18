const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const start = 769085;
const sub = c.substring(start, start + 12000);

// Find where this block ends
// Look for the end of the IIFE: )())
let count = 0;
let endIdx = -1;
for (let i = start; i < start + 12000; i++) {
  if (c.slice(i, i + 6) === ')())})') {
    endIdx = i;
    break;
  }
}
console.log('End index candidate:', endIdx);
if (endIdx !== -1) {
  console.log(c.substring(endIdx - 100, endIdx + 200));
}
