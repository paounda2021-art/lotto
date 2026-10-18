const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const search = '<qy';
const search2 = 'qy,';
const search3 = 'n.jsx(qy';
const search4 = 'n.jsxs(qy';

console.log('n.jsx(qy:', code.indexOf(search3));
console.log('n.jsxs(qy:', code.indexOf(search4));

const idx = code.indexOf('n.jsx(qy');
if (idx !== -1) {
  console.log(code.slice(idx - 100, idx + 300));
}
