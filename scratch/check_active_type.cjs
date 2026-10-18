const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const regex = /D\("([A-Z0-9_]+)"\)/g;
let m;
const list = new Set();
while ((m = regex.exec(code)) !== null) {
  list.add(m[1]);
}
console.log('Sessions passed to D():', Array.from(list));
