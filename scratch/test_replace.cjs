const fs = require('fs');

const file = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let js = fs.readFileSync(file, 'utf8');

// Target 1
const t1_full = `sList.map((s,idx)=>{const draw=O.find(d=>d.session===s.k||(s.a&&s.a.includes(d.session)));return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:s.l})}),draw&&draw.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:draw.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:draw.top2||draw.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:draw.bottom2})]})]}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

console.log('t1_full match:', js.includes(t1_full));

// Target 2
const t2_full = `;return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:sessLabel})}),d&&d.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:d.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:d.top2||d.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:d.bottom2})]})]}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

console.log('t2_full match:', js.includes(t2_full));
