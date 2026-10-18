const fs = require('fs');
const path = require('path');
const maps = require('./exphuay_hanoi_maps.json');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('Original code length:', code.length);

// 1. Prepare maps and helper definition
const mapsJsonStr = JSON.stringify(maps);
const helperDefinition = `
var _HN_5D_MAPS = ${mapsJsonStr};
function _getHanoi5D(m, t) {
  if (!m) return "-";
  if (t && t !== "HANOI") return m.full6D || m.full5 || m.prize5d || "-";
  if (m.full5 && m.full5 !== "-") return String(m.full5);
  if (m.prize5d && m.prize5d !== "-") return String(m.prize5d);
  if (m.full6D && m.full6D !== "-") return String(m.full6D);
  const d = m.date;
  if (!d) return "-";
  const s = m.session || "";
  if (s === "HANOI_SPECIAL" || (m.id && m.id.includes("SPECIAL"))) {
    return _HN_5D_MAPS.spcMap[d] || (m.top3 ? "00" + m.top3 : "-");
  }
  if (s === "HANOI_VIP" || (m.id && m.id.includes("VIP"))) {
    return _HN_5D_MAPS.vipMap[d] || (m.top3 ? "00" + m.top3 : "-");
  }
  return _HN_5D_MAPS.regMap[d] || (m.top3 ? "00" + m.top3 : "-");
}
window._getHanoi5D = _getHanoi5D;
`;

// Insert helper at the very beginning of the bundle (before modulepreload IIFE)
if (!code.includes('var _HN_5D_MAPS')) {
  code = helperDefinition + ';' + code;
  console.log('1. Helper _getHanoi5D prepended to bundle!');
} else {
  console.log('1. Helper _getHanoi5D already present!');
}

// 2. Table Header
const oldHeader = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT")&&n.jsx("th",{className:"py-3 px-4 text-center",children:"รางวัลเต็ม 6 หลัก"})';
const newHeader = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT"||t==="HANOI")&&n.jsx("th",{className:"py-3 px-4 text-center font-bold text-amber-300",children:t==="HANOI"?"รางวัลเต็ม 5 ตัว":"รางวัลเต็ม 6 หลัก"})';
if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log('2. Table Header patched successfully!');
} else if (code.includes(newHeader)) {
  console.log('2. Table Header already patched!');
} else {
  console.warn('2. Table Header marker not found!');
}

// 3. Table Cell: render _getHanoi5D(m, t)
const cellSearch1 = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT"||t==="HANOI")&&n.jsx("td",{className:"py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono",children:_(m.full5||m.prize5d||m.full6D||"-")})';
const cellSearch2 = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT")&&n.jsx("td",{className:"py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono",children:_(m.full6D||"-")})';
const newCell = '(t==="LAOS"||t==="GSB"||t==="GOVERNMENT"||t==="HANOI")&&n.jsx("td",{className:"py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono",children:_(_getHanoi5D(m,t))})';

if (code.includes(cellSearch1)) {
  code = code.replace(cellSearch1, newCell);
  console.log('3. Table Cell updated from cellSearch1 to use _getHanoi5D(m,t)!');
} else if (code.includes(cellSearch2)) {
  code = code.replace(cellSearch2, newCell);
  console.log('3. Table Cell updated from cellSearch2 to use _getHanoi5D(m,t)!');
} else if (code.includes(newCell)) {
  console.log('3. Table Cell already using _getHanoi5D(m,t)!');
} else {
  console.warn('3. Table Cell marker not found!');
}

// 4. Search Filter
const oldSearch1 = 'return m.dateFormatted.includes(E)||m.top3.includes(E)||m.bottom2.includes(E)||(m.full6D&&m.full6D.includes(E))||(m.full5&&m.full5.includes(E))||(m.prize5d&&m.prize5d.includes(E))';
const oldSearch2 = 'return m.dateFormatted.includes(E)||m.top3.includes(E)||m.bottom2.includes(E)||m.full6D&&m.full6D.includes(E)';
const newSearch = 'const _f5=_getHanoi5D(m,t);return m.dateFormatted.includes(E)||m.top3.includes(E)||m.bottom2.includes(E)||(m.full6D&&m.full6D.includes(E))||(_f5!=="-"&&_f5.includes(E))';

if (code.includes(oldSearch1)) {
  code = code.replace(oldSearch1, newSearch);
  console.log('4. Search filter updated from oldSearch1!');
} else if (code.includes(oldSearch2)) {
  code = code.replace(oldSearch2, newSearch);
  console.log('4. Search filter updated from oldSearch2!');
} else if (code.includes(newSearch)) {
  console.log('4. Search filter already updated!');
} else {
  console.warn('4. Search filter marker not found!');
}

// 5. Enrich Jr(e) so that any loaded record gets full5 and prize5d
const oldJr = 'const Jr=e=>{if(e.dateFormatted){const t={"ม.ค.":"01","ก.พ.":"02","มี.ค.":"03","เม.ย.":"04","พ.ค.":"05","มิ.ย.":"06","ก.ค.":"07","ส.ค.":"08","ก.ย.":"09","ต.ค.":"10","พ.ย.":"11","ธ.ค.":"12"},o=e.dateFormatted.trim().split(/\\s+/);if(o.length>=3){const a=parseInt(o[0],10),i=t[o[1]]||"01",r=parseInt(o[2],10),d=r>2500?r-543:r;if(!isNaN(a)&&!isNaN(d)){const l=String(a).padStart(2,"0"),s=`${d}-${i}-${l}`;if(e.date!==s)return{...e,date:s}}}}return e}';
const newJr = 'const Jr=e=>{let res=e;if(e.dateFormatted){const t={"ม.ค.":"01","ก.พ.":"02","มี.ค.":"03","เม.ย.":"04","พ.ค.":"05","มิ.ย.":"06","ก.ค.":"07","ส.ค.":"08","ก.ย.":"09","ต.ค.":"10","พ.ย.":"11","ธ.ค.":"12"},o=e.dateFormatted.trim().split(/\\s+/);if(o.length>=3){const a=parseInt(o[0],10),i=t[o[1]]||"01",r=parseInt(o[2],10),d=r>2500?r-543:r;if(!isNaN(a)&&!isNaN(d)){const l=String(a).padStart(2,"0"),s=`${d}-${i}-${l}`;if(e.date!==s)res={...e,date:s}}}}const v=_getHanoi5D(res,"HANOI");if(v!=="-"&&(!res.full5||!res.prize5d)){res={...res,full5:v,prize5d:v}}return res}';

if (code.includes(oldJr)) {
  code = code.replace(oldJr, newJr);
  console.log('5. Jr function enriched to automatically attach full5 and prize5d!');
} else if (code.includes(newJr)) {
  console.log('5. Jr function already enriched!');
} else {
  console.warn('5. Jr function marker not found!');
}

// 6. Auto-fetch merge logic: merge full5 and prize5d even if top3/bottom2 already match!
const oldAutoMerge = 'To>=0?(Qt[To].top3!==Et.top3||Qt[To].bottom2!==Et.bottom2)&&(Qt[To]={...Qt[To],...Et},dr++):(Qt.unshift(Et),dr++)';
const newAutoMerge = 'To>=0?(Qt[To].top3!==Et.top3||Qt[To].bottom2!==Et.bottom2||(!Qt[To].full5&&Et.full5)||(!Qt[To].prize5d&&Et.prize5d)||(!Qt[To].full6D&&Et.full6D))&&(Qt[To]={...Qt[To],...Et},dr++):(Qt.unshift(Et),dr++)';

if (code.includes(oldAutoMerge)) {
  code = code.replace(oldAutoMerge, newAutoMerge);
  console.log('6. Auto-fetch merge logic patched to update when full5/prize5d is missing!');
} else if (code.includes(newAutoMerge)) {
  console.log('6. Auto-fetch merge logic already patched!');
} else {
  console.warn('6. Auto-fetch merge marker not found!');
}

// 7. Scraper N_ parser: ensure full5 and prize5d are extracted
const oldScraper = 'full6D:T.length>=6?T:void 0,top3:h,top2:O,bottom2:g';
const newScraper = 'full6D:T.length>=6?T:void 0,full5:T.length>=5?T.slice(-5):(T.length===4?"0"+T:void 0),prize5d:T.length>=5?T.slice(-5):(T.length===4?"0"+T:void 0),top3:h,top2:O,bottom2:g';

if (code.includes(oldScraper)) {
  code = code.replace(oldScraper, newScraper);
  console.log('7. Scraper N_ parser patched!');
} else if (code.includes(newScraper)) {
  console.log('7. Scraper N_ parser already patched!');
} else {
  console.warn('7. Scraper N_ marker not found!');
}

// Write to downloaded_target_worker and dist
fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('All patches written successfully to downloaded_target_worker and dist!');
