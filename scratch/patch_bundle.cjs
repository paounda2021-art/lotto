const fs = require('fs');

const bundlePath = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let content = fs.readFileSync(bundlePath, 'utf8');

const copyTextPos = content.indexOf('children:"คัดลอกแนวทาง"', 700000);
if (copyTextPos === -1) {
  console.error('Could not find copy text in bundle');
  process.exit(1);
}

const realBtnStart = content.lastIndexOf('n.jsx("button"', copyTextPos);
const btnEnd = content.indexOf(']})', copyTextPos) + 3;

if (realBtnStart === -1 || btnEnd === -1) {
  console.error('Could not find button boundaries');
  process.exit(1);
}

console.log('Found copy button at:', realBtnStart, 'to', btnEnd);
const originalCopyButton = content.substring(realBtnStart, btnEnd);

// Check if already patched
if (content.includes('btn-export-prediction-jsx')) {
  console.log('Already patched!');
  process.exit(0);
}

// Download button JSX element:
// n.jsxs("button", {
//   id: "btn-export-prediction-jsx",
//   onClick: () => { typeof window.openExportPredictionModal === 'function' && window.openExportPredictionModal(); },
//   className: "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black border border-emerald-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald mr-2",
//   children: [
//     n.jsxs("svg", {xmlns:"http://www.w3.org/2000/svg", width:"16", height:"16", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5", strokeLinecap:"round", strokeLinejoin:"round", className:"w-4 h-4 text-black", children:[
//       n.jsx("path", {d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),
//       n.jsx("polyline", {points:"7 10 12 15 17 10"}),
//       n.jsx("line", {x1:"12", y1:"15", x2:"12", y2:"3"})
//     ]}),
//     n.jsx("span", {children: "📥 ดาวน์โหลด Excel / CSV"})
//   ]
// })

const downloadBtnJsx = 'n.jsxs("button",{id:"btn-export-prediction-jsx",onClick:()=>{typeof window.openExportPredictionModal==="function"&&window.openExportPredictionModal()},className:"px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black border border-emerald-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald",children:[n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-4 h-4 text-black",children:[n.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),n.jsx("polyline",{points:"7 10 12 15 17 10"}),n.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),n.jsx("span",{children:"📥 ดาวน์โหลด Excel / CSV"})]})';

const replacement = 'n.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[' + downloadBtnJsx + ',' + originalCopyButton + ']})';

const newContent = content.substring(0, realBtnStart) + replacement + content.substring(btnEnd);
fs.writeFileSync(bundlePath, newContent, 'utf8');
console.log('Successfully patched index-CN-5_2d9.js!');
