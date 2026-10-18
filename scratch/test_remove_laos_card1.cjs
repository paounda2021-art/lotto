const fs = require('fs');

const patchFile = 'scratch/apply_win4_card_patch.cjs';
let code = fs.readFileSync(patchFile, 'utf8');

// Find card1 definition in isLaos
const markerStart = 'const card1 = (!winData || !winData.digits || winData.digits.length < 2) ? null : n.jsxs("div", {';
const markerEnd = '// LAOS DRAW-BY-DRAW WIN4 CARD';

const sIdx = code.indexOf(markerStart);
const eIdx = code.indexOf(markerEnd);

console.log('card1 in patch script:', { sIdx, eIdx });
if (sIdx !== -1 && eIdx !== -1) {
  console.log('Previewing code to be removed (first 200 chars):');
  console.log(code.slice(sIdx, sIdx + 200));
}

// Also check index-CN-5_2d9.js
const bundleFile = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let bundleCode = fs.readFileSync(bundleFile, 'utf8');
const bsIdx = bundleCode.indexOf(markerStart);
const beIdx = bundleCode.indexOf(markerEnd);
console.log('card1 in bundle:', { bsIdx, beIdx });
