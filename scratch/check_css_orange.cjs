const fs = require('fs');

const css = fs.readFileSync('downloaded_target_worker/assets/index-Cip8XUMO.css', 'utf8');

console.log('Includes text-orange-200:', css.includes('text-orange-200'));
console.log('Includes from-orange-400:', css.includes('from-orange-400'));
console.log('Includes to-amber-400:', css.includes('to-amber-400'));
console.log('Includes text-orange-300:', css.includes('text-orange-300'));
