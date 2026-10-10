const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets');
const cleanPath = path.join(dir, 'index-DBh-DStv.js');
const targetPath = path.join(dir, 'index-CN-5_2d9.js');

// Restore clean base file
fs.copyFileSync(cleanPath, targetPath);
console.log('Restored clean JS file from index-DBh-DStv.js');

let code = fs.readFileSync(targetPath, 'utf8');

// 1. Allowed session arrays in useEffect validator
code = code.replace('"STOCKS_VIP_ALL_3"]', '"STOCKS_VIP_ALL_3","STOCKS_COMBINED_MORNING"]');
code = code.replace('"STOCKS_ALL_3","MORNING","AFTERNOON","BOTH"]', '"STOCKS_ALL_3","STOCKS_COMBINED_MORNING","MORNING","AFTERNOON","BOTH"]');
console.log('1. Allowed session arrays in useEffect patched');

// 2 & 3 Button insertions
const targetNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})})';
const nIdx = code.indexOf(targetNormal);
if (nIdx !== -1) {
  const replaceNormal = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้นปกติ (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวม 12 รอบหุ้น ➔ คัดเล่นรอบเช้า"})})';
  code = code.slice(0, nIdx) + replaceNormal + code.slice(nIdx + targetNormal.length);
  console.log('2. Normal stock button patched');
}

const targetVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})})';
const vIdx = code.indexOf(targetVip);
if (vIdx !== -1) {
  const replaceVip = 'children:n.jsx("span",{children:"⭐ รวมทุกหุ้น VIP (6 รอบ)"})}),n.jsx("button",{onClick:()=>r("STOCKS_COMBINED_MORNING"),className:`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${i==="STOCKS_COMBINED_MORNING"?"bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-glow-gold font-black":"text-yellow-300 hover:text-white"}`,children:n.jsx("span",{children:"☀️ รวม 12 รอบหุ้น ➔ คัดเล่นรอบเช้า"})})';
  code = code.slice(0, vIdx) + replaceVip + code.slice(vIdx + targetVip.length);
  console.log('3. VIP stock button patched');
}

// 4. Title replacements in render components
code = code.replace(/A==="STOCKS_VIP_ALL_3"\?"💎⭐ รวมทุกหุ้น VIP \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ วิเคราะห์รวม 12 รอบหุ้น (ปกติ 6 + VIP 6) ➔ คัดเล่นรอบเช้า":A==="STOCKS_VIP_ALL_3"?"💎⭐ รวมทุกหุ้น VIP (6 รอบ)":');
code = code.replace(/A==="STOCKS_ALL_3"\?"⭐ รวมทุกหุ้นปกติ \(6 รอบ\)":/g, 'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ วิเคราะห์รวม 12 รอบหุ้น (ปกติ 6 + VIP 6) ➔ คัดเล่นรอบเช้า":A==="STOCKS_ALL_3"?"⭐ รวมทุกหุ้นปกติ (6 รอบ)":');
console.log('4. Titles patched');

// 5. Title text string formatting inside function My
const myTarget = ':t==="STOCKS_ALL_3"?';
const myIdx = code.indexOf(myTarget);
if (myIdx !== -1) {
  const myPatch = ':t==="STOCKS_COMBINED_MORNING"?`${r} (วิเคราะห์รวมหุ้นปกติ + VIP รอบเช้า 6 หุ้น)`:t==="STOCKS_ALL_3"?';
  code = code.slice(0, myIdx) + myPatch + code.slice(myIdx + myTarget.length);
  console.log('5. Title string in function My patched');
}

// 6. Descriptive note patch inside function Ni
const noteTarget = 't==="STOCKS_ALL_3"?l="วิเคราะห์รวมสถิติ 3 หุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง รวม 6 รอบ): สแกนหาตัวเลขเด่นรูดประจำวันยึดตลาดหุ้นเอเชีย":';
const noteIdx = code.indexOf(noteTarget);
if (noteIdx !== -1) {
  const notePatch = 't==="STOCKS_COMBINED_MORNING"?l="สถิติเปรียบเทียบรวม 12 รอบหุ้น (ปกติ 6 + VIP 6 ย้อนหลัง 3 เดือน 639 งวด) ➔ เด่นหลัก 1, เด่นรอง 3, TOP6 คู่เน้น (39, 14, 18, 06, 19, 34) และ 3 ตัวตรง 4 ชุด (160, 164, 475, 139) ที่เข้ารอบเช้ามากที่สุด เล่นได้ทั้งหุ้นปกติและ VIP":';
  code = code.slice(0, noteIdx) + notePatch + code.slice(noteIdx);
  console.log('6. Note text in function Ni patched');
}

// 7. Single Digits & Probabilities patch inside function Ni
const digitsTarget = 'I=((Zo=a[1])==null?void 0:Zo.probability)??62):o==="NIKKEI"?';
const digitsIdx = code.indexOf(digitsTarget);
if (digitsIdx !== -1) {
  const digitsPatch = 'I=((Zo=a[1])==null?void 0:Zo.probability)??62):t==="STOCKS_COMBINED_MORNING"?(s=1,O=89.5,N=3,I=85.2,c=4,u=9,p=2,T=6):o==="NIKKEI"?';
  code = code.slice(0, digitsIdx) + digitsPatch + code.slice(digitsIdx + digitsTarget.length);
  console.log('7. Digits and probabilities in function Ni patched');
}

// 8. 2D Pairs (E) & 3D Triples (K) overrides inside function Ni
const pairsTarget = 'K=["214","247","714","217"]):o==="NIKKEI"&&';
const pairsIdx = code.indexOf(pairsTarget);
if (pairsIdx !== -1) {
  const pairsPatch = 'K=["214","247","714","217"]):t==="STOCKS_COMBINED_MORNING"?(E=["39","14","18","06","19","34"],K=["160","164","475","139"]):o==="NIKKEI"&&';
  code = code.slice(0, pairsIdx) + pairsPatch + code.slice(pairsIdx + pairsTarget.length);
  console.log('8. 2D pairs (E) and 3D triples (K) in function Ni patched');
}

fs.writeFileSync(targetPath, code);
console.log('Saved patched JS file, new size:', code.length);

try {
  execSync(`node --check "${targetPath}"`);
  console.log('\n✅ SYNTAX CHECK PASSED!');
} catch (e) {
  console.error('\n❌ SYNTAX CHECK FAILED:', e.message);
}
