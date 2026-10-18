const fs = require('fs');

const files = [
  'downloaded_target_worker/assets/index-CN-5_2d9.js',
  'dist/assets/index-CN-5_2d9.js'
];

const t1_full = `sList.map((s,idx)=>{const draw=O.find(d=>d.session===s.k||(s.a&&s.a.includes(d.session)));return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:s.l})}),draw&&draw.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:draw.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:draw.top2||draw.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:draw.bottom2})]})]}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

const r1_full = `sList.map((s,idx)=>{const draw=O.find(d=>d.session===s.k||(s.a&&s.a.includes(d.session)));const isAft=s.k.includes('AFTERNOON')||s.l.includes('บ่าย');return n.jsxs("div",{className:isAft?"bg-purple-900/40 p-1 rounded-lg border border-purple-400/60 shadow-sm shadow-purple-950/40":"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:isAft?"text-[10px] font-bold text-purple-200":"text-[10px] font-bold text-amber-300",children:s.l})}),draw&&draw.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:draw.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:draw.top2||draw.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:draw.bottom2})]})]}):n.jsx("span",{className:isAft?"text-[10px] text-purple-300/80 font-semibold italic":"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

const t2_full = `;return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:sessLabel})}),d&&d.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:d.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:d.top2||d.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:d.bottom2})]})]}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

const r2_full = `;const isAft=(d.session&&d.session.includes('AFTERNOON'))||sessLabel.includes('บ่าย');return n.jsxs("div",{className:isAft?"bg-purple-900/40 p-1 rounded-lg border border-purple-400/60 shadow-sm shadow-purple-950/40":"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:isAft?"text-[10px] font-bold text-purple-200":"text-[10px] font-bold text-amber-300",children:sessLabel})}),d&&d.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:d.top3})]}),n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:d.top2||d.top3.slice(1)})]}),n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:d.bottom2})]})]}):n.jsx("span",{className:isAft?"text-[10px] text-purple-300/80 font-semibold italic":"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})]},idx);})`;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing file:', file);
    continue;
  }
  let js = fs.readFileSync(file, 'utf8');
  if (js.includes(t1_full) && js.includes(t2_full)) {
    js = js.replace(t1_full, r1_full).replace(t2_full, r2_full);
    fs.writeFileSync(file, js, 'utf8');
    console.log('Successfully updated:', file);
  } else {
    console.log('Targets not found in:', file, { t1: js.includes(t1_full), t2: js.includes(t2_full) });
  }
}
