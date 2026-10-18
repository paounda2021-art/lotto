const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const gridMarker = 'className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 relative z-10",';
const gIdx = code.indexOf(gridMarker);

const chIdx = code.indexOf('children: [', gIdx);
const childrenStart = chIdx + 'children: ['.length;

// Helper to find the end of a JS call or expression matching parentheses/braces
function findMatchingEnd(str, startIdx) {
  // startIdx points to the '(' of n.jsxs("div", { ... })
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\') {
      escape = true;
      continue;
    }

    if (inString) {
      if (ch === stringChar) {
        inString = false;
      }
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
      if (depth === 0) {
        return i; // index of closing token
      }
    }
  }
  return -1;
}

// Find Box 1
const box1Start = code.indexOf('n.jsxs("div", {', childrenStart);
const box1Paren = code.indexOf('(', box1Start);
const box1End = findMatchingEnd(code, box1Paren); // index of closing ')' of n.jsxs(...)

console.log('box1 range:', box1Start, 'to', box1End + 1);
const box1Code = code.substring(box1Start, box1End + 1);

// Find comma after box1
const commaIdx = code.indexOf(',', box1End);
// Find Box 2
const box2Start = code.indexOf('n.jsxs("div", {', commaIdx);
const box2Paren = code.indexOf('(', box2Start);
const box2End = findMatchingEnd(code, box2Paren); // index of closing ')' of n.jsxs(...)

console.log('box2 range:', box2Start, 'to', box2End + 1);
const box2Code = code.substring(box2Start, box2End + 1);

console.log('\n--- Box 1 starts with: ---');
console.log(box1Code.substring(0, 150));
console.log('--- Box 1 ends with: ---');
console.log(box1Code.substring(box1Code.length - 150));

console.log('\n--- Box 2 starts with: ---');
console.log(box2Code.substring(0, 150));
console.log('--- Box 2 ends with: ---');
console.log(box2Code.substring(box2Code.length - 150));

console.log('\nBox 1 includes "ชุดเจาะเน้น":', box1Code.includes('ชุดเจาะเน้น'));
console.log('Box 1 includes "hanoiPurpleDrillPairs":', box1Code.includes('hanoiPurpleDrillPairs'));
console.log('Box 2 includes "ชุดวิน 4 ตัว":', box2Code.includes('ชุดวิน 4 ตัว'));
console.log('Box 2 includes "hanoiPurplePairs2D":', box2Code.includes('hanoiPurplePairs2D'));
