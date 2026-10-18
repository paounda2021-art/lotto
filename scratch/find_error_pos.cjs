const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Let's find where the syntax error is by binary searching or testing snippets around the patch
const patchIdx = code.indexOf('🎯 ตรวจสอบผลการเข้าเป้า');
console.log('patchIdx:', patchIdx);

// Look around patchIdx
const start = Math.max(0, patchIdx - 1000);
const end = Math.min(code.length, patchIdx + 3000);
const snippet = code.slice(start, end);

// Let's look at optional chaining like O[0]?.dateFormatted
// Does the environment support ?. in that spot or is there a syntax error around ?
console.log('Snippet around patch:');
console.log(code.slice(patchIdx - 200, patchIdx + 500));
