const fs = require('fs');

function removeLaosCard1(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const laosIdx = content.indexOf('if (isLaos) {');
  if (laosIdx === -1) {
    console.error(`'if (isLaos) {' not found in ${filePath}`);
    return false;
  }
  const laosCard1Idx = content.indexOf('const card1 =', laosIdx);
  const laosCard2Marker = content.indexOf('// LAOS DRAW-BY-DRAW WIN4 CARD', laosIdx);

  if (laosCard1Idx === -1 || laosCard2Marker === -1 || laosCard1Idx >= laosCard2Marker) {
    console.error(`Markers not valid in ${filePath}: laosCard1Idx=${laosCard1Idx}, laosCard2Marker=${laosCard2Marker}`);
    return false;
  }

  const before = content.slice(0, laosCard1Idx);
  const after = content.slice(laosCard2Marker);
  const replacement = 'const card1 = null;\n\n    ';

  content = before + replacement + after;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully removed Laos card1 in ${filePath}`);
  return true;
}

removeLaosCard1('downloaded_target_worker/assets/index-CN-5_2d9.js');
removeLaosCard1('scratch/apply_win4_card_patch.cjs');
if (fs.existsSync('scratch/index_patched.js')) {
  removeLaosCard1('scratch/index_patched.js');
}
