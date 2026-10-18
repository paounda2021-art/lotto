const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const target1 = 'p=b=>{d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';
console.log('Target 1 index:', code.indexOf(target1));

const target2 = 'h=W.useMemo(()=>Ey(T,r),[T,r])';
console.log('Target 2 index:', code.indexOf(target2));

const target3 = 'W.useEffect(()=>{d(i),s("NEXT")},[i])';
console.log('Target 3 index:', code.indexOf(target3));
