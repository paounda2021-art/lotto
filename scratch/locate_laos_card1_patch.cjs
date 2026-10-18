const fs = require('fs');

const patchFile = 'scratch/apply_win4_card_patch.cjs';
let patchCode = fs.readFileSync(patchFile, 'utf8');

const laosIdx = patchCode.indexOf('if (isLaos) {');
console.log('if (isLaos) { in patch:', laosIdx);

const laosCard1Idx = patchCode.indexOf('const card1 =', laosIdx);
console.log('laosCard1Idx in patch:', laosCard1Idx);

const laosCard2Marker = patchCode.indexOf('// LAOS DRAW-BY-DRAW WIN4 CARD', laosIdx);
console.log('laosCard2Marker in patch:', laosCard2Marker);

console.log('Snippet length in patch:', laosCard2Marker - laosCard1Idx);
