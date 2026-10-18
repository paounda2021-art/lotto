const fs = require('fs');

const bundlePath = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let content = fs.readFileSync(bundlePath, 'utf8');

// 1. Target the data prep and stats computation:
const oldPrep = 'let all3D=allD.filter(d=>["HANOI_SPECIAL","HANOI_EVENING","HANOI_VIP"].includes(d.session));if(all3D.length===0)all3D=allD;const vipStats=Ey(vipD,r),all3Stats=Ey(all3D,r);const v0=vipStats.topSingleDigits&&vipStats.topSingleDigits[0]?vipStats.topSingleDigits[0].digit:null,v1=vipStats.topSingleDigits&&vipStats.topSingleDigits[1]?vipStats.topSingleDigits[1].digit:null;const a0=all3Stats.topSingleDigits&&all3Stats.topSingleDigits[0]?all3Stats.topSingleDigits[0].digit:null,a1=all3Stats.topSingleDigits&&all3Stats.topSingleDigits[1]?all3Stats.topSingleDigits[1].digit:null;const raw4=[v0,v1,a0,a1],';

console.log('Found oldPrep:', content.includes(oldPrep));

const newPrep = 'let specialD=allD.filter(d=>d.session==="HANOI_SPECIAL");if(specialD.length===0){try{const raw=typeof localStorage!=="undefined"?localStorage.getItem("lotto_data_hanoi_special"):null;if(raw)specialD=JSON.parse(raw);if(l==="VERIFY"&&N&&N.date)specialD=specialD.filter(d=>d.date!==N.date);}catch(err){}}let all3D=allD.filter(d=>["HANOI_SPECIAL","HANOI_EVENING","HANOI_VIP"].includes(d.session));if(all3D.length===0)all3D=allD;const vipStats=Ey(vipD,r),specialStats=Ey(specialD,r),all3Stats=Ey(all3D,r);const denVip=vipStats.topSingleDigits&&vipStats.topSingleDigits[0]?vipStats.topSingleDigits[0].digit:null;const denPhi=specialStats.topSingleDigits&&specialStats.topSingleDigits[0]?specialStats.topSingleDigits[0].digit:null;const denRuam=all3Stats.topSingleDigits&&all3Stats.topSingleDigits[0]?all3Stats.topSingleDigits[0].digit:null;const rongRuam=all3Stats.topSingleDigits&&all3Stats.topSingleDigits[1]?all3Stats.topSingleDigits[1].digit:null;const raw4=[denVip,denPhi,denRuam,rongRuam],';

content = content.replace(oldPrep, newPrep);

// 2. Return statement:
const oldReturn = 'return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups,winning2D,winning3D};';
console.log('Found oldReturn:', content.includes(oldReturn));
const newReturn = 'return{denVip,denPhi,denRuam,rongRuam,digits,pairs2D,triples3D,replacedDups,winning2D,winning3D};';
content = content.replace(oldReturn, newReturn);

// 3. Badges in UI:
const oldBadges = 'n.jsxs("span",{className:"bg-purple-500/20 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",children:["🟣 นอย VIP: เด่นหลัก ",n.jsx("strong",{className:"text-amber-300 font-black",children:winData.v0!==null?winData.v0:"-"})," / เด่นรอง ",n.jsx("strong",{className:"text-cyan-300 font-black",children:winData.v1!==null?winData.v1:"-"})]}),n.jsxs("span",{className:"bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",children:["🌐 รวม 3 นอย: เด่นหลัก ",n.jsx("strong",{className:"text-amber-300 font-black",children:winData.a0!==null?winData.a0:"-"})," / เด่นรอง ",n.jsx("strong",{className:"text-cyan-300 font-black",children:winData.a1!==null?winData.a1:"-"})]})';
console.log('Found oldBadges:', content.includes(oldBadges));

const newBadges = 'n.jsxs("span",{className:"bg-purple-500/20 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",children:["🟣 เด่น VIP: ",n.jsx("strong",{className:"text-amber-300 font-black",children:winData.denVip!==null?winData.denVip:"-"})]}),n.jsxs("span",{className:"bg-orange-500/20 text-orange-200 border border-orange-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",children:["🟠 เด่นพิเศษ: ",n.jsx("strong",{className:"text-amber-300 font-black",children:winData.denPhi!==null?winData.denPhi:"-"})]}),n.jsxs("span",{className:"bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",children:["🌐 รวม 3 นอย: เด่นรวม ",n.jsx("strong",{className:"text-amber-300 font-black",children:winData.denRuam!==null?winData.denRuam:"-"})," / รองรวม ",n.jsx("strong",{className:"text-cyan-300 font-black",children:winData.rongRuam!==null?winData.rongRuam:"-"})]})';

content = content.replace(oldBadges, newBadges);

// 4. Subtext:
const oldSubtext = 'เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติ (คัดจากเด่น นอย VIP + รวม 3 นอย)';
console.log('Found oldSubtext:', content.includes(oldSubtext));
const newSubtext = 'เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติ (คัดจาก เด่นวี + เด่นพิ + เด่นรวม + รองรวม)';
content = content.replace(oldSubtext, newSubtext);

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully patched downloaded_target_worker/assets/index-CN-5_2d9.js');

fs.writeFileSync('dist/assets/index-CN-5_2d9.js', content, 'utf8');
console.log('Successfully synced to dist/assets/index-CN-5_2d9.js');
