const fs = require('fs');
let code = fs.readFileSync('src/data/nikkeiData.ts', 'utf8');
const search = 'laos_star_20260806';
const idx = code.indexOf(search);
console.log('Index:', idx);
if (idx !== -1) {
  const objStart = code.lastIndexOf('{', idx);
  const commaStart = code.lastIndexOf(',', objStart);
  code = code.slice(0, commaStart) + '\n];\n';
  fs.writeFileSync('src/data/nikkeiData.ts', code, 'utf8');
  console.log('Successfully trimmed nikkeiData.ts!');
}
