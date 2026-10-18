const fs = require('fs');

const clean = fs.readFileSync('scratch/clean_bundle.js', 'utf8');

// 1. Test ONLY change 1
const targetReturn = 'return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups};';
const sessionHitsCalc = `const sConfigs=[{key:"HANOI_SPECIAL",label:"🟠 ฮานอยพิเศษ (17:30)",short:"🟠 พิเศษ"},{key:"HANOI_EVENING",label:"🔴 ฮานอยปกติ (18:30)",short:"🔴 ปกติ"},{key:"HANOI_VIP",label:"🟣 ฮานอย VIP (19:30)",short:"🟣 VIP"}];const tDate=O&&O[0]?O[0].date:null;const sessionHits=sConfigs.map(s=>{let dr=(O||[]).find(d=>d.session===s.key);if(!dr&&tDate){dr=(a||[]).find(d=>d.session===s.key&&(d.date===tDate||(d.dateFormatted&&O[0]?.dateFormatted&&d.dateFormatted===O[0].dateFormatted)));}if(!dr||!dr.top3||dr.top3.trim()===""){return{...s,hasResult:false,top3:"-",top2:"-",bottom2:"-",hits:[],isHit:false};}const top3=dr.top3||"";const top2=dr.top2||(top3.length>=2?top3.slice(-2):"");const bottom2=dr.bottom2||"";const hits=[];if(triples3D.includes(top3)){hits.push({type:"3D_DIRECT",text:"✓ 3 ตัวตรง ["+top3+"]",badgeClass:"bg-emerald-500 text-black font-black"});}else{const sortedT3=top3.split("").sort().join("");if(triples3D.some(t=>t.split("").sort().join("")===sortedT3)){hits.push({type:"3D_TOD",text:"✓ 3 ตัวโต๊ด ["+top3+"]",badgeClass:"bg-teal-500/30 text-teal-200 border border-teal-400 font-bold"});}}if(pairs2D.includes(top2)){hits.push({type:"2D_TOP",text:"✓ 2 ตัวบน ["+top2+"]",badgeClass:"bg-emerald-500 text-black font-black"});}if(pairs2D.includes(bottom2)){hits.push({type:"2D_BOTTOM",text:"✓ 2 ตัวล่าง ["+bottom2+"]",badgeClass:"bg-cyan-500 text-black font-black"});}const hitTop=digits.filter(d=>top2.includes(String(d)));const hitBottom=digits.filter(d=>bottom2.includes(String(d)));if(hitTop.length>0||hitBottom.length>0){const parts=[];if(hitTop.length>0)parts.push("บน "+hitTop.join(","));if(hitBottom.length>0)parts.push("ล่าง "+hitBottom.join(","));hits.push({type:"ROOD",text:"✓ รูดเข้า ["+parts.join(" ")+"]",badgeClass:"bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold"});}return{...s,hasResult:true,top3,top2,bottom2,hits,isHit:hits.length>0};});return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups,sessionHits};`;

const test1 = clean.replace(targetReturn, sessionHitsCalc);
fs.writeFileSync('scratch/test1.js', test1, 'utf8');

// 2. Test ONLY change 2 (with dummy container)
const targetTail = 't},t))})]})]})]});})())';
const container = 'n.jsx("div",{})';
const replacementTail = 't},t))})]})]},' + container + ']})]});})())';

const test2 = clean.replace(targetTail, replacementTail);
fs.writeFileSync('scratch/test2.js', test2, 'utf8');
