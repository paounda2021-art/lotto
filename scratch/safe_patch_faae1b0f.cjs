const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original JS size:', code.length);

// 1. Memo insertion for combinedMorningData
const targetMemo = 'vt=W.useMemo(';
const memoIdx = code.indexOf(targetMemo);
if (memoIdx !== -1) {
  const patchMemo = `combinedMorningData=W.useMemo(()=>[...o,...d,...y,...h,..._,...S].sort((P,$)=>($.date?new Date($.date).getTime():0)-(P.date?new Date(P.date).getTime():0)),[o,d,y,h,_,S]),`;
  code = code.slice(0, memoIdx) + patchMemo + code.slice(memoIdx);
  console.log('1. Memo inserted successfully');
} else {
  console.error('ERROR 1');
}

// 2. re dataset selection patch
const targetRe = 'k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?';
const reIdx = code.indexOf(targetRe);
if (reIdx !== -1) {
  const patchRe = 'k==="STOCKS_COMBINED_MORNING"?combinedMorningData:k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?k==="STOCKS_COMBINED_MORNING"?combinedMorningData:';
  code = code.slice(0, reIdx) + patchRe + code.slice(reIdx + targetRe.length);
  console.log('2. Re dataset selection patched successfully');
} else {
  console.error('ERROR 2');
}

// 3. Normal stocks button strip
const targetNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})})';
const nIdx = code.indexOf(targetNormal);
if (nIdx !== -1) {
  const replaceNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวมหุ้นปกติ + VIP เช้า (6 รอบ)"})})';
  code = code.slice(0, nIdx) + replaceNormal + code.slice(nIdx + targetNormal.length);
  console.log('3. Normal stock button patched successfully');
} else {
  console.error('ERROR 3');
}

// 4. VIP stocks button strip
const targetVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})})';
const vIdx = code.indexOf(targetVip);
if (vIdx !== -1) {
  const replaceVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวมหุ้นปกติ + VIP เช้า (6 รอบ)"})})';
  code = code.slice(0, vIdx) + replaceVip + code.slice(vIdx + targetVip.length);
  console.log('4. VIP stock button patched successfully');
} else {
  console.error('ERROR 4');
}

// 5. Title strings
code = code.replace(/A==="STOCKS_VIP_ALL_3"\?"💎⭐ รวมทุกหุ้น VIP \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ รวมหุ้นปกติ + VIP รอบเช้า (6 หุ้น)":A==="STOCKS_VIP_ALL_3"?"💎⭐ รวมทุกหุ้น VIP (6 รอบ)":');
code = code.replace(/A==="STOCKS_ALL_3"\?"⭐ รวมทุกหุ้นปกติ \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ รวมหุ้นปกติ + VIP รอบเช้า (6 หุ้น)":A==="STOCKS_ALL_3"?"⭐ รวมทุกหุ้นปกติ (6 รอบ)":');
console.log('5. Title strings patched successfully');

// Write back file
fs.writeFileSync(jsPath, code);
console.log('Saved patched JS file, new size:', code.length);

// Verify JS syntax with node --check
try {
  execSync(`node --check "${jsPath}"`);
  console.log('\n✅ SYNTAX CHECK PASSED! No syntax errors found in patched JS file.');
} catch (e) {
  console.error('\n❌ SYNTAX CHECK FAILED:', e.message);
}
