const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

const targetH = 'h=W.useMemo(()=>Ey(T,r),[T,r]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)';
console.log('Clean const chain around h and draws:O exists:', code.includes(targetH));

const afterM = 'children:"❌ ไม่เข้า"})}};W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]);';
console.log('Safe useEffect after M exists:', code.includes(afterM));

console.log('Laos w2 fix exists:', code.includes('t==="NIKKEI"||t==="DOWJONES"||t==="LAOS"'));
console.log('Laos Yy fix exists:', code.includes('t==="NIKKEI"||t==="LAOS"||t==="DOWJONES"'));
