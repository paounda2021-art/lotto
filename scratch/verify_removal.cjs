const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

console.log('Has DOWJONES onClick tab button:', js.includes('onClick:()=>t("DOWJONES")'));
console.log('Has MALAY onClick tab button:', js.includes('onClick:()=>t("MALAY")'));
