const fs = require('fs');

const bundleFile = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let bundleCode = fs.readFileSync(bundleFile, 'utf8');

const laosIdx = bundleCode.indexOf('if (isLaos) {');
console.log('if (isLaos) { index:', laosIdx);

// Search for card1 after laosIdx
const laosCard1Idx = bundleCode.indexOf('const card1 =', laosIdx);
console.log('laosCard1Idx:', laosCard1Idx);

const laosCard2Marker = bundleCode.indexOf('// LAOS DRAW-BY-DRAW WIN4 CARD', laosIdx);
console.log('laosCard2Marker:', laosCard2Marker);

console.log('--- Code snippet from laosCard1Idx to laosCard2Marker ---');
console.log('Snippet length:', laosCard2Marker - laosCard1Idx);
console.log('Starts with:', bundleCode.slice(laosCard1Idx, laosCard1Idx + 150));
console.log('Ends with:', bundleCode.slice(laosCard2Marker - 50, laosCard2Marker));
