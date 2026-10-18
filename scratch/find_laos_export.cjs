const fs = require('fs');
const content = fs.readFileSync('src/data/nikkeiData.ts', 'utf8');
const search = '"LAOS_STAR"';
let idx = content.indexOf(search);
if (idx !== -1) {
  const expIdx = content.lastIndexOf('export const', idx);
  console.log('Export:', content.slice(expIdx, content.indexOf('=', expIdx)).trim(), 'at idx:', idx);
  const startExp = content.indexOf('=', expIdx) + 1;
  const endExp = content.indexOf('export const', expIdx + 1);
  console.log('Next export at:', endExp);
} else {
  console.log('No LAOS_STAR found!');
}
