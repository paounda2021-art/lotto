const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Table Header
const oldHeader = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT")&&n.jsx("th",{className:"py-3 px-4 text-center",children:"รางวัลเต็ม 6 หลัก"})';
const newHeader = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT"||t==="HANOI")&&n.jsx("th",{className:"py-3 px-4 text-center font-bold text-amber-300",children:t==="HANOI"?"รางวัลเต็ม 5 ตัว":"รางวัลเต็ม 6 หลัก"})';

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log('1. Table Header patched successfully!');
} else {
  console.warn('1. Table Header marker not found (already patched?)');
}

// 2. Table Cell
const oldCell = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT")&&n.jsx("td",{className:"py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono",children:_(m.full6D||"-")})';
const newCell = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT"||t==="HANOI")&&n.jsx("td",{className:"py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono",children:_(m.full5||m.prize5d||m.full6D||"-")})';

if (code.includes(oldCell)) {
  code = code.replace(oldCell, newCell);
  console.log('2. Table Cell patched successfully!');
} else {
  console.warn('2. Table Cell marker not found (already patched?)');
}

// 3. Search Filter
const oldSearch = 'return m.dateFormatted.includes(E)||m.top3.includes(E)||m.bottom2.includes(E)||m.full6D&&m.full6D.includes(E)';
const newSearch = 'return m.dateFormatted.includes(E)||m.top3.includes(E)||m.bottom2.includes(E)||(m.full6D&&m.full6D.includes(E))||(m.full5&&m.full5.includes(E))||(m.prize5d&&m.prize5d.includes(E))';

if (code.includes(oldSearch)) {
  code = code.replace(oldSearch, newSearch);
  console.log('3. Search Filter patched successfully!');
} else {
  console.warn('3. Search Filter marker not found');
}

// 4. Scraper Auto-fetcher parser N_
const oldScraper = 'full6D:T.length>=6?T:void 0,top3:h,top2:O,bottom2:g';
const newScraper = 'full6D:T.length>=6?T:void 0,full5:T.length>=5?T.slice(-5):(T.length===4?"0"+T:void 0),prize5d:T.length>=5?T.slice(-5):(T.length===4?"0"+T:void 0),top3:h,top2:O,bottom2:g';

if (code.includes(oldScraper)) {
  code = code.replace(oldScraper, newScraper);
  console.log('4. Scraper N_ patched successfully!');
} else {
  console.warn('4. Scraper N_ marker not found');
}

// 5. Add / Edit Modal - add 5-digit input field for Hanoi
const oldModalHanoi = ':t==="HANOI"?n.jsxs("div",{children:[n.jsx("label",{className:"block text-gray-300 font-semibold mb-1",children:"เลือกรอบการออกรางวัลฮานอย:"}),n.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[n.jsx("button",{type:"button",onClick:()=>s("HANOI_SPECIAL"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_SPECIAL"?"bg-amber-400 text-black shadow-glow-gold font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🟠 พิเศษ (17:30)"}),n.jsx("button",{type:"button",onClick:()=>s("HANOI_EVENING"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_EVENING"?"bg-emerald-400 text-black shadow-glow-emerald font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🔴 ปกติ (18:30)"}),n.jsx("button",{type:"button",onClick:()=>s("HANOI_VIP"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_VIP"?"bg-purple-400 text-white shadow-glow-purple font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🟣 VIP (19:30)"})]})]}):';

const newModalHanoi = ':t==="HANOI"?n.jsxs("div",{className:"space-y-3",children:[n.jsxs("div",{children:[n.jsx("label",{className:"block text-gray-300 font-semibold mb-1",children:"เลือกรอบการออกรางวัลฮานอย:"}),n.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[n.jsx("button",{type:"button",onClick:()=>s("HANOI_SPECIAL"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_SPECIAL"?"bg-amber-400 text-black shadow-glow-gold font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🟠 พิเศษ (17:30)"}),n.jsx("button",{type:"button",onClick:()=>s("HANOI_EVENING"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_EVENING"?"bg-emerald-400 text-black shadow-glow-emerald font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🔴 ปกติ (18:30)"}),n.jsx("button",{type:"button",onClick:()=>s("HANOI_VIP"),className:`py-2 rounded-xl font-bold text-[11px] transition-all ${l==="HANOI_VIP"?"bg-purple-400 text-white shadow-glow-purple font-extrabold":"bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white"}`,children:"🟣 VIP (19:30)"})]})]}),n.jsxs("div",{children:[n.jsx("label",{className:"block text-purple-300 font-semibold mb-1",children:"เลขรางวัล 5 ตัว (ถ้ามี):"}),n.jsx("input",{type:"text",maxLength:5,placeholder:"67291",value:f,onChange:U=>_(U.target.value),className:"w-full bg-nikkei-dark border border-purple-500/50 rounded-xl px-3 py-2 text-purple-300 font-bold text-center text-lg focus:outline-none focus:border-purple-400"})]})]}):';

if (code.includes(oldModalHanoi)) {
  code = code.replace(oldModalHanoi, newModalHanoi);
  console.log('5. Modal Hanoi 5D input patched successfully!');
} else {
  console.warn('5. Modal Hanoi 5D input marker not found');
}

// 6. Modal save full5 / prize5d
const oldModalSave = 'full6D:f||a.full6D,top3:m,top2:m.slice(1),bottom2:V}';
const newModalSave = 'full6D:f||a.full6D,full5:f||(a&&(a.full5||a.prize5d))||void 0,prize5d:f||(a&&(a.prize5d||a.full5))||void 0,top3:m,top2:m.slice(1),bottom2:V}';

if (code.includes(oldModalSave)) {
  code = code.replace(oldModalSave, newModalSave);
  console.log('6. Modal save full5/prize5d patched successfully!');
} else {
  console.warn('6. Modal save marker not found');
}

// Also check useEffect initialization when editing:
const oldUseEffect = '_(a.full6D||"")';
const newUseEffect = '_(a.full6D||a.full5||a.prize5d||"")';
if (code.includes(oldUseEffect)) {
  code = code.replace(oldUseEffect, newUseEffect);
  console.log('7. UseEffect initialization patched successfully!');
}

fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('Successfully written to downloaded_target_worker and dist!');
