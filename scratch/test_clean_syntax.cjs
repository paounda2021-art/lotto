const fs = require('fs');

let code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

// Find broken snippet
const broken = 'h=W.useMemo(()=>Ey(T,r),[T,r]);W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)';
const clean = 'h=W.useMemo(()=>Ey(T,r),[T,r]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)';

console.log('Includes broken snippet:', code.includes(broken));
if (code.includes(broken)) {
  code = code.replace(broken, clean);
}

const targetAfterM = 'children:"❌ ไม่เข้า"})}};';
const replAfterM = 'children:"❌ ไม่เข้า"})}};W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]);';

console.log('Includes targetAfterM:', code.includes(targetAfterM));
if (code.includes(targetAfterM)) {
  code = code.replace(targetAfterM, replAfterM);
}

fs.writeFileSync('scratch/test_fixed_syntax.js', code, 'utf8');
const { execSync } = require('child_process');
execSync('node --check scratch/test_fixed_syntax.js');
console.log('Syntax check passed!');
