const fs = require('fs');

let content = fs.readFileSync('src/data/nikkeiData.ts', 'utf8');

const search = 'export const INITIAL_LAOS_STAR_DATA: DrawResult[] = [';
const idx = content.indexOf(search);
if (idx !== -1) {
  content = content.slice(0, idx) + 'export const INITIAL_LAOS_STAR_DATA: any[] = [];\n';
  fs.writeFileSync('src/data/nikkeiData.ts', content, 'utf8');
  console.log('Successfully replaced INITIAL_LAOS_STAR_DATA with empty array!');
} else {
  console.log('Not found');
}
