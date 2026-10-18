const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const idx = code.indexOf('WIN4_LAOS_MAP');
if (idx !== -1) {
  console.log('Snippet around WIN4_LAOS_MAP:');
  console.log(code.substring(idx, idx + 200));
} else {
  console.log('WIN4_LAOS_MAP not found!');
}
