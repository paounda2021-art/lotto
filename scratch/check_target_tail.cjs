const fs = require('fs');

const clean = fs.readFileSync('scratch/clean_bundle.js', 'utf8');
const targetTail = 't},t))})]})]})]});})())';
const pos = clean.indexOf(targetTail);
console.log('pos:', pos);
console.log('--- Context around targetTail (before 120 chars) ---');
console.log(clean.slice(pos - 120, pos));
console.log('--- TargetTail itself ---');
console.log(clean.slice(pos, pos + targetTail.length));
console.log('--- After targetTail (60 chars) ---');
console.log(clean.slice(pos + targetTail.length, pos + targetTail.length + 60));
