const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');
console.log('dist has color black:', code.includes('color: "#000000"'));
