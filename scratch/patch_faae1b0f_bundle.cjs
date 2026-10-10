const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original bundle size:', code.length);

// 1. Add combinedMorningData memo before re=W.useMemo
const targetMemo = 'vt=W.useMemo(';
const memoIdx = code.indexOf(targetMemo);
if (memoIdx !== -1) {
  const patchMemo = `combinedMorningData=W.useMemo(()=>[...o,...d,...y,...h,..._,...S].sort((P,$)=>($.date?new Date($.date).getTime():0)-(P.date?new Date(P.date).getTime():0)),[o,d,y,h,_,S]),`;
  code = code.slice(0, memoIdx) + patchMemo + code.slice(memoIdx);
  console.log('Successfully inserted combinedMorningData memo');
} else {
  console.error('Failed to find targetMemo insertion point!');
}

// 2. Add STOCKS_COMBINED_MORNING handling in re=W.useMemo
const targetRe = 'k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?';
const reIdx = code.indexOf(targetRe);
if (reIdx !== -1) {
  const patchRe = 'k==="STOCKS_COMBINED_MORNING"?combinedMorningData:k==="STOCKS_VIP_ALL_3"?vt:Jt:e==="NIKKEI"?k==="STOCKS_COMBINED_MORNING"?combinedMorningData:';
  code = code.slice(0, reIdx) + patchRe + code.slice(reIdx + targetRe.length);
  console.log('Successfully patched re dataset selection');
} else {
  console.error('Failed to find targetRe insertion point!');
}

// 3. Add STOCKS_COMBINED_MORNING button to normal stock button bar
const targetNormalBtn = `children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})})]}),`;
const nBtnIdx = code.indexOf(targetNormalBtn);
if (nBtnIdx !== -1) {
  const patchNBtn = `children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:\`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all \${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}\`,children:n.jsx("span",{children:"☀️ รวมหุ้นปกติ + VIP เช้า (6 รอบ)"})})]})),`;
  code = code.slice(0, nBtnIdx) + patchNBtn + code.slice(nBtnIdx + targetNormalBtn.length);
  console.log('Successfully added STOCKS_COMBINED_MORNING button to normal stocks bar');
} else {
  console.error('Failed to find targetNormalBtn point!');
}

// 4. Add STOCKS_COMBINED_MORNING button to VIP stock button bar
const targetVipBtn = `children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})})]}),`;
const vBtnIdx = code.indexOf(targetVipBtn);
if (vBtnIdx !== -1) {
  const patchVBtn = `children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:\`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all \${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}\`,children:n.jsx("span",{children:"☀️ รวมหุ้นปกติ + VIP เช้า (6 รอบ)"})})]})),`;
  code = code.slice(0, vBtnIdx) + patchVBtn + code.slice(vBtnIdx + targetVipBtn.length);
  console.log('Successfully added STOCKS_COMBINED_MORNING button to VIP stocks bar');
} else {
  console.error('Failed to find targetVipBtn point!');
}

// 5. Add title/subtitle text for STOCKS_COMBINED_MORNING
code = code.replace(/A==="STOCKS_VIP_ALL_3"\?"💎⭐ รวมทุกหุ้น VIP \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ รวมหุ้นปกติ + VIP รอบเช้า (6 หุ้น)":A==="STOCKS_VIP_ALL_3"?"💎⭐ รวมทุกหุ้น VIP (6 รอบ)":');
code = code.replace(/A==="STOCKS_ALL_3"\?"⭐ รวมทุกหุ้นปกติ \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ รวมหุ้นปกติ + VIP รอบเช้า (6 หุ้น)":A==="STOCKS_ALL_3"?"⭐ รวมทุกหุ้นปกติ (6 รอบ)":');

fs.writeFileSync(jsPath, code);
console.log('Patched bundle saved successfully! New size:', code.length);
