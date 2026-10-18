const fs = require('fs');

let block = fs.readFileSync('scratch/win_data_block.js', 'utf8');

// 1. Add sessionHits calculation into winData return
const targetReturn = 'return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups};';
console.log('block contains targetReturn:', block.includes(targetReturn));

const sessionHitsCalc = `const sConfigs=[{key:"HANOI_SPECIAL",label:"🟠 ฮานอยพิเศษ (17:30)",short:"🟠 พิเศษ"},{key:"HANOI_EVENING",label:"🔴 ฮานอยปกติ (18:30)",short:"🔴 ปกติ"},{key:"HANOI_VIP",label:"🟣 ฮานอย VIP (19:30)",short:"🟣 VIP"}];const tDate=O&&O[0]?O[0].date:null;const sessionHits=sConfigs.map(s=>{let dr=(O||[]).find(d=>d.session===s.key);if(!dr&&tDate){dr=(a||[]).find(d=>d.session===s.key&&(d.date===tDate||(d.dateFormatted&&O[0]?.dateFormatted&&d.dateFormatted===O[0].dateFormatted)));}if(!dr||!dr.top3||dr.top3.trim()===""){return{...s,hasResult:false,top3:"-",top2:"-",bottom2:"-",hits:[],isHit:false};}const top3=dr.top3||"";const top2=dr.top2||(top3.length>=2?top3.slice(-2):"");const bottom2=dr.bottom2||"";const hits=[];if(triples3D.includes(top3)){hits.push({type:"3D_DIRECT",text:"✓ 3 ตัวตรง ["+top3+"]",badgeClass:"bg-emerald-500 text-black font-black"});}else{const sortedT3=top3.split("").sort().join("");if(triples3D.some(t=>t.split("").sort().join("")===sortedT3)){hits.push({type:"3D_TOD",text:"✓ 3 ตัวโต๊ด ["+top3+"]",badgeClass:"bg-teal-500/30 text-teal-200 border border-teal-400 font-bold"});}}if(pairs2D.includes(top2)){hits.push({type:"2D_TOP",text:"✓ 2 ตัวบน ["+top2+"]",badgeClass:"bg-emerald-500 text-black font-black"});}if(pairs2D.includes(bottom2)){hits.push({type:"2D_BOTTOM",text:"✓ 2 ตัวล่าง ["+bottom2+"]",badgeClass:"bg-cyan-500 text-black font-black"});}const hitTop=digits.filter(d=>top2.includes(String(d)));const hitBottom=digits.filter(d=>bottom2.includes(String(d)));if(hitTop.length>0||hitBottom.length>0){const parts=[];if(hitTop.length>0)parts.push("บน "+hitTop.join(","));if(hitBottom.length>0)parts.push("ล่าง "+hitBottom.join(","));hits.push({type:"ROOD",text:"✓ รูดเข้า ["+parts.join(" ")+"]",badgeClass:"bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold"});}return{...s,hasResult:true,top3,top2,bottom2,hits,isHit:hits.length>0};});return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups,sessionHits};`;

block = block.replace(targetReturn, sessionHitsCalc);

// 2. Add sessionHits UI
const targetUi = `className:"px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black font-mono text-xs sm:text-sm tracking-wider hover:bg-cyan-500/30 transition-colors",children:t},t))})]})]})]});})())`;
console.log('block contains targetUi:', block.includes(targetUi));

const sessionHitsUi = `,n.jsxs("div",{className:"bg-black/50 border border-amber-500/30 rounded-xl p-3.5 space-y-3 mt-3",children:[n.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-2",children:[n.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[n.jsx("span",{className:"text-xs font-black text-amber-300 flex items-center gap-1.5",children:"🎯 ตรวจสอบผลการเข้าเป้า (เช็คผล 3 นอย):"}),(()=>{const finished=(winData.sessionHits||[]).filter(s=>s.hasResult);const hitCount=finished.filter(s=>s.isHit).length;if(finished.length===0){return n.jsx("span",{className:"text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md border border-gray-700",children:"⏳ รอประกาศผลรางวัล"});}if(hitCount>0){return n.jsxs("span",{className:"text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-500/40 font-bold animate-pulse",children:["🔥 เข้าเป้า ",hitCount,"/",finished.length," รอบ"]});}return n.jsxs("span",{className:"text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-md border border-rose-500/40 font-bold",children:["❌ ยังไม่เข้าเป้า (",finished.length," รอบ)"]});})()]}),n.jsx("span",{className:"text-[10px] text-gray-400 font-medium",children:"เทียบผลรางวัลจริง กับชุดวิน 4 ตัว"})]}),n.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-2.5",children:(winData.sessionHits||[]).map(s=>n.jsxs("div",{className:"rounded-xl p-3 border transition-all "+(s.hasResult?(s.isHit?"bg-gradient-to-b from-emerald-950/40 to-black/60 border-emerald-500/50 shadow-sm shadow-emerald-500/10":"bg-gradient-to-b from-rose-950/20 to-black/60 border-rose-500/30"):"bg-black/30 border-gray-800"),children:[n.jsxs("div",{className:"flex items-center justify-between gap-1 mb-2",children:[n.jsx("span",{className:"font-extrabold text-xs text-white",children:s.label}),s.hasResult?(s.isHit?n.jsx("span",{className:"text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded-md",children:"✓ เข้าเป้า"}):n.jsx("span",{className:"text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-1.5 py-0.5 rounded-md",children:"❌ หลุด"})):n.jsx("span",{className:"text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded-md",children:"⏳ รอผล"})]}),n.jsx("div",{className:"bg-black/60 rounded-lg p-2 border border-white/5 mb-2 text-center",children:s.hasResult?n.jsxs("div",{className:"flex items-center justify-around text-xs",children:[n.jsxs("div",{children:[n.jsx("span",{className:"text-[10px] text-gray-400 block",children:"3 ตัวบน"}),n.jsx("span",{className:"font-mono font-black text-amber-300 text-sm",children:s.top3})]}),n.jsx("div",{className:"w-[1px] h-6 bg-gray-700"}),n.jsxs("div",{children:[n.jsx("span",{className:"text-[10px] text-gray-400 block",children:"2 ตัวบน"}),n.jsx("span",{className:"font-mono font-bold text-gray-200 text-sm",children:s.top2})]}),n.jsx("div",{className:"w-[1px] h-6 bg-gray-700"}),n.jsxs("div",{children:[n.jsx("span",{className:"text-[10px] text-gray-400 block",children:"2 ตัวล่าง"}),n.jsx("span",{className:"font-mono font-black text-cyan-300 text-sm",children:s.bottom2})]})]}):n.jsx("div",{className:"text-[11px] text-gray-400 py-1",children:"⏳ ยังไม่ออกรางวัล"})}),s.hasResult?n.jsx("div",{className:"space-y-1",children:s.hits.length>0?n.jsx("div",{className:"flex flex-wrap gap-1",children:s.hits.map((h,idx)=>n.jsx("span",{key:idx,className:"text-[10px] px-2 py-0.5 rounded-md tracking-tight "+h.badgeClass,children:h.text}))}):n.jsx("div",{className:"text-[11px] text-rose-400/80 font-medium text-center py-0.5",children:"❌ ไม่เข้าเป้าในรอบนี้"})}) :n.jsx("div",{className:"text-[10px] text-gray-500 text-center py-1",children:"รอยืนยันผลเมื่อออกรางวัล"})]},s.key))})]});})())`;

// In targetUi, it ends with: ']})]})]});})())'
// 1st ]) closes div wrap for triples3D
// 2nd ]}) closes 2-column grid
// 3rd ]}) closes winData main div!
// So we insert sessionHitsUi right before the 3rd ]})!
const targetUiWithPatch = targetUi.replace(']})]})]});})())', ']})]})]' + sessionHitsUi);
console.log('targetUi replaced correctly!');

block = block.replace(targetUi, targetUiWithPatch);

// Test parse block wrapped in function
try {
  new Function('n', 'o', 'a', 'l', 'N', 'r', 'Ey', 'h', 'O', 'g', block);
  console.log('Block parsed with new Function successfully! No syntax errors!');
} catch (e) {
  console.error('Block failed syntax check:', e.message);
  console.error(e.stack);
}
