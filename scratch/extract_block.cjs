const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const startIdx = code.indexOf('if(o!=="HANOI")return null;');
const endIdx = code.indexOf(',s0=["มกราคม"', startIdx);

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx);

const block = code.slice(startIdx, endIdx);
console.log('Length:', block.length);

// Save to scratch for easy reading
fs.writeFileSync('scratch/win_data_block.js', block, 'utf8');
console.log('Saved to scratch/win_data_block.js');
