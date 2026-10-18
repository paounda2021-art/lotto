const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const startStr = '((()=>{if(o!=="HANOI")return null;';
const startIdx = c.indexOf(startStr);

const endStr = 'children:t});})})]})]})]});})())';
const endIdx = c.indexOf(endStr, startIdx);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);
if (startIdx !== -1 && endIdx !== -1) {
  const fullChunk = c.substring(startIdx, endIdx + endStr.length);
  fs.writeFileSync('scratch/current_iife.js', fullChunk, 'utf8');
  console.log('Extracted fullChunk length:', fullChunk.length);
}
