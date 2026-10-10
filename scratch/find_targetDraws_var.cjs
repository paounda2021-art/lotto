const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const startIdx = code.indexOf('h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r');
const funcCode = code.substring(startIdx, startIdx + 8000);

console.log('Function calls inside DayOfWeekAnalyzer JSX:');
let idx = 0;
while((idx = funcCode.indexOf('Zy(', idx + 1)) !== -1) {
  console.log('Zy call at:', idx, funcCode.substring(idx - 30, idx + 60));
}
let idx2 = 0;
while((idx2 = funcCode.indexOf('Xy(', idx2 + 1)) !== -1) {
  console.log('Xy call at:', idx2, funcCode.substring(idx2 - 30, idx2 + 60));
}
