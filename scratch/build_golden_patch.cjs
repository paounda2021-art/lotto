const fs = require('fs');

const clean = fs.readFileSync('scratch/clean_bundle.js', 'utf8');

// 1. In winData calculation: compute winning2D and winning3D
const targetReturn = 'return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups};';
console.log('clean contains targetReturn:', clean.includes(targetReturn));

const winningSetsCalc = `const winning2D=new Set,winning3D=new Set,tDate=O&&O[0]?O[0].date:null,allDForDay=(O||[]).slice();if(tDate&&a){a.forEach(d=>{if((d.date===tDate||(d.dateFormatted&&O[0]?.dateFormatted&&d.dateFormatted===O[0].dateFormatted))&&!allDForDay.some(x=>x.session===d.session)){allDForDay.push(d);}});}allDForDay.forEach(dr=>{if(dr&&dr.top3&&dr.top3.trim()!==""){winning3D.add(dr.top3);winning3D.add(dr.top3.split("").sort().join(""));}const t2=dr.top2||(dr.top3&&dr.top3.length>=2?dr.top3.slice(-2):"");if(t2)winning2D.add(t2);if(dr.bottom2)winning2D.add(dr.bottom2);});return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups,winning2D,winning3D};`;

let content = clean.replace(targetReturn, winningSetsCalc);

// 2. In 2D pairs map:
const target2D = 'n.jsx("div",{className:"flex flex-wrap gap-1.5",children:winData.pairs2D.map(p=>n.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black font-mono text-xs sm:text-sm tracking-wider hover:bg-amber-500/30 transition-colors",children:p},p))})';
console.log('clean contains target2D:', clean.includes(target2D));

const replacement2D = 'n.jsx("div",{className:"flex flex-wrap gap-1.5",children:winData.pairs2D.map(p=>{const isHit=winData.winning2D&&winData.winning2D.has(p);return n.jsx("span",{key:p,className:"px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all "+(isHit?"bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse":"bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"),children:p});})})';

content = content.replace(target2D, replacement2D);

// Also add 2D hit count badge in header
const target2DHeader = '["⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (",winData.pairs2D.length," ชุด):"]';
const replacement2DHeader = '["⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (",winData.pairs2D.length," ชุด):",(()=>{const hitCount=winData.pairs2D.filter(p=>winData.winning2D&&winData.winning2D.has(p)).length;return hitCount>0?n.jsxs("span",{className:"bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",children:["✓ เข้าเป้า ",hitCount," ชุด"]}):null;})()]';
content = content.replace(target2DHeader, replacement2DHeader);

// 3. In 3D triples map:
const target3D = 'n.jsx("div",{className:"flex flex-wrap gap-1.5",children:winData.triples3D.map(t=>n.jsx("span",{className:"px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black font-mono text-xs sm:text-sm tracking-wider hover:bg-cyan-500/30 transition-colors",children:t},t))})';
console.log('clean contains target3D:', clean.includes(target3D));

const replacement3D = 'n.jsx("div",{className:"flex flex-wrap gap-1.5",children:winData.triples3D.map(t=>{const isHit=winData.winning3D&&(winData.winning3D.has(t)||winData.winning3D.has(t.split("").sort().join("")));return n.jsx("span",{key:t,className:"px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all "+(isHit?"bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse":"bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"),children:t});})})';

content = content.replace(target3D, replacement3D);

// Also add 3D hit count badge in header
const target3DHeader = '["⚡ ชุดเลขวิน 3 ตัวตรง (",winData.triples3D.length," ชุด / 24 โต๊ด):"]';
const replacement3DHeader = '["⚡ ชุดเลขวิน 3 ตัวตรง (",winData.triples3D.length," ชุด / 24 โต๊ด):",(()=>{const hitCount=winData.triples3D.filter(t=>winData.winning3D&&(winData.winning3D.has(t)||winData.winning3D.has(t.split("").sort().join("")))).length;return hitCount>0?n.jsxs("span",{className:"bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",children:["✓ เข้าเป้า ",hitCount," ชุด"]}):null;})()]';
content = content.replace(target3DHeader, replacement3DHeader);

fs.writeFileSync('scratch/test_golden_bundle.js', content, 'utf8');
console.log('Written scratch/test_golden_bundle.js');
