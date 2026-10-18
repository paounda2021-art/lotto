const fs = require('fs');
const c = fs.readFileSync('scratch/index_patched.js', 'utf8');

// Find how draws are passed into DayOfWeekAnalyzer
const m = c.match(/function\s+[a-zA-Z0-9_]+\s*\(\s*\{[^}]*data:[^}]*\}\)/);
console.log(m ? m[0] : 'no direct match');

// Let's inspect where regSess and vipSess are defined around index 758000
const start = 755000;
console.log(c.substring(start, start + 1200));
