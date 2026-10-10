const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const startIdx = code.indexOf('h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r');
const funcCode = code.substring(startIdx, startIdx + 8000);

console.log('Searching for digit hit function in DayOfWeekAnalyzer JSX:');
// Search where M is defined or where renderDigitHits is called
let idx = 0;
while((idx = funcCode.indexOf('children:M(', idx + 1)) !== -1) {
  console.log('children:M at:', idx, funcCode.substring(idx - 50, idx + 80));
}

// Find definition of M inside DayOfWeekAnalyzer (before startIdx)
const beforeCode = code.substring(startIdx - 4000, startIdx);
let idxM = beforeCode.indexOf('M=');
console.log('M= definition in DayOfWeekAnalyzer:', beforeCode.substring(idxM - 20, idxM + 300));
