const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original JS size:', code.length);

// 1. Memo insertion for combined12StockData (combining all 12 stock sessions: o, i, d, s, y, p, h, g, _, E, S, M)
const targetMemo = 'vt=W.useMemo(';
const memoIdx = code.indexOf(targetMemo);
if (memoIdx !== -1) {
  const patchMemo = `combined12StockData=W.useMemo(()=>[...o,...i,...d,...s,...y,...p,...h,...g,..._,...E,...S,...M].sort((P,$)=>{const te=P.date?new Date(P.date).getTime():0,B=($.date?new Date($.date).getTime():0)-te;if(B!==0)return B;const isM_P=P.session&&(P.session.includes("MORNING")||P.session==="MORNING")?1:0,isM_S=$.session&&($.session.includes("MORNING")||$.session==="MORNING")?1:0;return isM_S-isM_P;}),[o,i,d,s,y,p,h,g,_,E,S,M]),`;
  code = code.slice(0, memoIdx) + patchMemo + code.slice(memoIdx);
  console.log('1. Combined 12 stock sessions memo inserted successfully');
} else {
  console.error('ERROR 1');
}

// 2. re dataset selection patch for STOCKS_COMBINED_MORNING
const targetRe = 'k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?';
const reIdx = code.indexOf(targetRe);
if (reIdx !== -1) {
  const patchRe = 'k==="STOCKS_COMBINED_MORNING"?combined12StockData:k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?k==="STOCKS_COMBINED_MORNING"?combined12StockData:';
  code = code.slice(0, reIdx) + patchRe + code.slice(reIdx + targetRe.length);
  console.log('2. Re dataset selection patched for 12 sessions');
} else {
  console.error('ERROR 2');
}

// 3. Normal stocks button strip button insertion
const targetNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})})';
const nIdx = code.indexOf(targetNormal);
if (nIdx !== -1) {
  const replaceNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวม 12 รอบหุ้น ➔ คัดเล่นรอบเช้า"})})';
  code = code.slice(0, nIdx) + replaceNormal + code.slice(nIdx + targetNormal.length);
  console.log('3. Normal stock button patched with 12 sessions label');
} else {
  console.error('ERROR 3');
}

// 4. VIP stocks button strip button insertion
const targetVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})})';
const vIdx = code.indexOf(targetVip);
if (vIdx !== -1) {
  const replaceVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวม 12 รอบหุ้น ➔ คัดเล่นรอบเช้า"})})';
  code = code.slice(0, vIdx) + replaceVip + code.slice(vIdx + targetVip.length);
  console.log('4. VIP stock button patched with 12 sessions label');
} else {
  console.error('ERROR 4');
}

// 5. Title & Subtitle replacements
code = code.replace(/A==="STOCKS_VIP_ALL_3"\?"💎⭐ รวมทุกหุ้น VIP \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ วิเคราะห์รวม 12 รอบหุ้น (ปกติ 6 + VIP 6) ➔ คัดเล่นรอบเช้า":A==="STOCKS_VIP_ALL_3"?"💎⭐ รวมทุกหุ้น VIP (6 รอบ)":');
code = code.replace(/A==="STOCKS_ALL_3"\?"⭐ รวมทุกหุ้นปกติ \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ วิเคราะห์รวม 12 รอบหุ้น (ปกติ 6 + VIP 6) ➔ คัดเล่นรอบเช้า":A==="STOCKS_ALL_3"?"⭐ รวมทุกหุ้นปกติ (6 รอบ)":');

fs.writeFileSync(jsPath, code);
console.log('Saved patched 12 sessions JS file, new size:', code.length);

// Verify JS syntax with node --check
try {
  execSync(`node --check "${jsPath}"`);
  console.log('\n✅ SYNTAX CHECK PASSED! No syntax errors found in patched JS file.');
} catch (e) {
  console.error('\n❌ SYNTAX CHECK FAILED:', e.message);
}
