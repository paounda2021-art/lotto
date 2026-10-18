const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
const distFile = path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js');

let code = fs.readFileSync(targetFile, 'utf8');

const gridMarker = 'className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 relative z-10",';
const gIdx = code.indexOf(gridMarker);
const chIdx = code.indexOf('children: [', gIdx);
const childrenStart = chIdx + 'children: ['.length;

function findMatchingEnd(str, startIdx) {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '(' || ch === '{' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const box1Start = code.indexOf('n.jsxs("div", {', childrenStart);
const box1Paren = code.indexOf('(', box1Start);
const box1End = findMatchingEnd(code, box1Paren);
const box1Code = code.substring(box1Start, box1End + 1);

const commaIdx = code.indexOf(',', box1End);
const box2Start = code.indexOf('n.jsxs("div", {', commaIdx);
const box2Paren = code.indexOf('(', box2Start);
const box2End = findMatchingEnd(code, box2Paren);
const box2Code = code.substring(box2Start, box2End + 1);

if (!box1Code.includes('hanoiPurpleDrillPairs') || !box2Code.includes('hanoiPurplePairs2D')) {
  console.error('Validation error before swap!');
  process.exit(1);
}

// Check what sits between box1 and box2
const middle = code.substring(box1End + 1, box2Start);
console.log('Middle separator:', JSON.stringify(middle));

// Construct new code: [before box1] + [box2] + [middle] + [box1] + [after box2]
const swappedCode = code.substring(0, box1Start) + box2Code + middle + box1Code + code.substring(box2End + 1);

fs.writeFileSync(targetFile, swappedCode, 'utf8');
fs.writeFileSync(distFile, swappedCode, 'utf8');
console.log('Swap executed successfully in downloaded_target_worker and dist!');
