const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const regex = /o===["'][A-Z_]+["']/g;
let m, set = new Set();
while ((m = regex.exec(js)) !== null) {
  set.add(m[0]);
}
console.log('All o=== checks in bundle:', Array.from(set));

// Specifically in the DayOfWeekAnalyzer component
const posStart = js.indexOf('regSess=');
const slice = js.slice(posStart - 4000, posStart + 6000);
console.log('Checks in DayOfWeekAnalyzer:');
const re = /o===["'][A-Z_]+["']/g;
while ((m = re.exec(slice)) !== null) {
  console.log(' ', m[0]);
}
