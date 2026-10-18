const fs = require('fs');

const clean = fs.readFileSync('scratch/clean_bundle.js', 'utf8');
const search = 'if(!winData||!winData.digits';
const start = clean.indexOf(search);
const end = clean.indexOf(',s0=["มกราคม"');

console.log('--- Entire winData UI return ---');
console.log(clean.slice(start, end));
