const fs = require('fs');
const c = fs.readFileSync('scratch/index_patched.js', 'utf8');

const regex = /id:"([^"]+)",label:"([^"]+)"/g;
let m;
const res = [];
while ((m = regex.exec(c)) !== null) {
  res.push({ id: m[1], label: m[2] });
}
console.log('Lottery types found:', res);
