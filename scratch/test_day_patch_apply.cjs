const fs = require('fs');
const { execSync } = require('child_process');

let code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const t3 = 'W.useEffect(()=>{d(i),s("NEXT")},[i]),';
const r3 = 'W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=i;localStorage.setItem("lotto_selected_day",i)}catch(err){}d(i),s("NEXT")},[i]),';

const tu = 'u=b=>{s(b),b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';
const ru = 'u=b=>{s(b);const tg=b==="NEXT"?i:(b==="VERIFY"&&N!=null&&N.dayOfWeek?N.dayOfWeek:r);try{window.__CURRENT_ACTIVE_DAY__=tg;localStorage.setItem("lotto_selected_day",tg)}catch(err){}b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';

const tp = 'p=b=>{d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';
const rp = 'p=b=>{try{window.__CURRENT_ACTIVE_DAY__=b;localStorage.setItem("lotto_selected_day",b)}catch(err){}d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';

const th = 'h=W.useMemo(()=>Ey(T,r),[T,r])';
const rh = 'h=W.useMemo(()=>Ey(T,r),[T,r]);W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h])';

console.log('Includes t3:', code.includes(t3));
console.log('Includes tu:', code.includes(tu));
console.log('Includes tp:', code.includes(tp));
console.log('Includes th:', code.includes(th));

if (code.includes(t3)) code = code.replace(t3, r3);
if (code.includes(tu)) code = code.replace(tu, ru);
if (code.includes(tp)) code = code.replace(tp, rp);
if (code.includes(th)) code = code.replace(th, rh);

fs.writeFileSync('scratch/test_index_patched_out.js', code, 'utf8');
execSync('node --check scratch/test_index_patched_out.js');
console.log('test_index_patched_out.js passed node --check with 0 errors!');
