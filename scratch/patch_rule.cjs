const fs = require('fs');

const bundlePath = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let content = fs.readFileSync(bundlePath, 'utf8');

const targetOld = 'let digits=Array.from(new Set([v0,v1,a0,a1].filter(x=>x!==null&&x!==undefined)));if(all3Stats.topSingleDigits){for(const item of all3Stats.topSingleDigits){if(!digits.includes(item.digit))digits.push(item.digit);if(digits.length>=4)break;}}if(vipStats.topSingleDigits&&digits.length<4){for(const item of vipStats.topSingleDigits){if(!digits.includes(item.digit))digits.push(item.digit);if(digits.length>=4)break;}}digits=digits.slice(0,4).sort((x,y)=>x-y);';

const pos = content.indexOf(targetOld);
if (pos === -1) {
  console.error('Target old logic not found');
  process.exit(1);
}

const replacementNew = 'const raw4=[v0,v1,a0,a1],cands=[0,1,2,3,4,5,6,7,8,9],currSet=new Set(raw4.filter(x=>x!==null&&x!==undefined)),seen=new Set,resolved=[],replacedDups=[];for(let i=0;i<raw4.length;i++){const val=raw4[i];if(val===null||val===undefined)continue;if(!seen.has(val)){seen.add(val);resolved.push(val);}else{for(const c of cands){if(!currSet.has(c)){resolved.push(c);currSet.add(c);replacedDups.push({original:val,replacement:c});break;}}}}const digits=resolved.slice(0,4).sort((x,y)=>x-y);';

content = content.replace(targetOld, replacementNew);

// Also add replacedDups to return
content = content.replace('return{v0,v1,a0,a1,digits,pairs2D,triples3D};', 'return{v0,v1,a0,a1,digits,pairs2D,triples3D,replacedDups};');

// And add pill in UI if replacedDups
const pillTarget = 'children:["🗓️ ประจำ: วัน",h.dayName]})]}),';
const pillPos = content.indexOf(pillTarget);
if (pillPos !== -1) {
  const pillInsert = 'winData.replacedDups&&winData.replacedDups.length>0?n.jsxs("span",{className:"bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1",children:["⚡ ชนเลข ",winData.replacedDups.map(d=>d.original+" ➔ แทนด้วย "+d.replacement).join(", ")]}):null,';
  content = content.replace(pillTarget, pillTarget + pillInsert);
}

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully updated downloaded_target_worker/assets/index-CN-5_2d9.js');

fs.writeFileSync('dist/assets/index-CN-5_2d9.js', content, 'utf8');
console.log('Successfully synced to dist/assets/index-CN-5_2d9.js');
