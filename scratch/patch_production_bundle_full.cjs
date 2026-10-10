const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const srcCssPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-Cip8XUMO.css');

let code = fs.readFileSync(srcJsPath, 'utf8');

// 1. Initial Malay Data
const malayJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'malay_data.json'), 'utf8'));
const malayMinStr = JSON.stringify(malayJson);

if (!code.includes('malayData_init=')) {
  code = code.replace('}],e0=[', `}],malayData_init=${malayMinStr},e0=[`);
}

// 2. Tab button for MALAY
const laosStarBtnStr = 'n.jsx("button",{onClick:()=>t("LAOS_STAR"),className:`px-3 py-1 rounded-lg text-xs font-bold transition-all ${e==="LAOS_STAR"?"bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-glow-gold font-extrabold":"text-gray-400 hover:text-white"}`,children:"⭐ ลาวสตาร์"})';
const malayBtnStr = ',n.jsx("button",{onClick:()=>t("MALAY"),className:`px-3 py-1 rounded-lg text-xs font-bold transition-all ${e==="MALAY"?"bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-extrabold":"text-gray-400 hover:text-white"}`,children:"🇲🇾 หวยมาเลย์"})';

if (!code.includes('children:"🇲🇾 หวยมาเลย์"')) {
  code = code.replace(laosStarBtnStr, laosStarBtnStr + malayBtnStr);
}

// 3. Header Subtitle
const laosStarSubStr = 'e==="LAOS_STAR"?"วิเคราะห์สถิติหวยลาวสตาร์ย้อนหลัง (ออกทุกวัน รอบ 15:45 น.)":';
const malaySubStr = 'e==="LAOS_STAR"?"วิเคราะห์สถิติหวยลาวสตาร์ย้อนหลัง (ออกทุกวัน รอบ 15:45 น.)":e==="MALAY"?"วิเคราะห์สถิติหวยมาเลย์ (Magnum 4D) ย้อนหลัง (รอบ 18:30 น.)":';
if (!code.includes('วิเคราะห์สถิติหวยมาเลย์')) {
  code = code.replace(laosStarSubStr, malaySubStr);
}

// 4. Session banner
const laosStarBanner = 'e==="LAOS_STAR"&&n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5",children:[n.jsx(zo,{className:"w-3.5 h-3.5 text-amber-400"}),n.jsx("span",{children:"รอบ 15:45 น. (ออกทุกวัน หวยลาวสตาร์)"})]})';
const malayBanner = ',e==="MALAY"&&n.jsxs("div",{className:"bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5",children:[n.jsx(zo,{className:"w-3.5 h-3.5 text-blue-400"}),n.jsx("span",{children:"รอบ 18:30 น. (ออกทุกวันพุธ, เสาร์, อาทิตย์ - หวยมาเลย์)"})]})';
if (!code.includes('รอบ 18:30 น. (ออกทุกวันพุธ, เสาร์, อาทิตย์ - หวยมาเลย์)')) {
  code = code.replace(laosStarBanner, laosStarBanner + malayBanner);
}

// 5. History table title
const laosStarTableTitle = 't==="LAOS_STAR"?"⭐ หวยลาวสตาร์ (ออกทุกวัน รอบ 15:45 น.)":';
const malayTableTitle = 't==="LAOS_STAR"?"⭐ หวยลาวสตาร์ (ออกทุกวัน รอบ 15:45 น.)":t==="MALAY"?"🇲🇾 หวยมาเลย์ (Magnum 4D รอบ 18:30 น.)":';
if (!code.includes('🇲🇾 หวยมาเลย์ (Magnum 4D รอบ 18:30 น.)')) {
  code = code.replace(laosStarTableTitle, malayTableTitle);
}

// 6. History table subtitle
const laosStarTableSub = 't==="LAOS_STAR"?"แสดงผลหวยลาวสตาร์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ออกทุกวัน รอบ 15:45 น.":';
const malayTableSub = 't==="LAOS_STAR"?"แสดงผลหวยลาวสตาร์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ออกทุกวัน รอบ 15:45 น.":t==="MALAY"?"แสดงผลหวยมาเลย์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง (Magnum 4D) ย้อนหลัง":';
if (!code.includes('แสดงผลหวยมาเลย์')) {
  code = code.replace(laosStarTableSub, malayTableSub);
}

// 7. History table badge
const laosStarBadge = 't==="LAOS_STAR"?"⭐ ลาวสตาร์ (15:45)":';
const malayBadge = 't==="LAOS_STAR"?"⭐ ลาวสตาร์ (15:45)":t==="MALAY"?"🇲🇾 หวยมาเลย์ (18:30)":';
if (!code.includes('🇲🇾 หวยมาเลย์ (18:30)')) {
  code = code.replace(laosStarBadge, malayBadge);
}

// 8. State initialization for malayData
if (!code.includes('[ml,setMl]')) {
  code = code.replace(
    '[Y,q]=W.useState(()=>Se("lotto_data_laos_star",e0)),',
    '[Y,q]=W.useState(()=>Se("lotto_data_laos_star",e0)),[ml,setMl]=W.useState(()=>Se("lotto_data_malay",malayData_init)),'
  );
}

// 9. activeDataset switch
const activeDataLaosStar = 'e==="LAOS_STAR"?Y:';
const activeDataMalay = 'e==="LAOS_STAR"?Y:e==="MALAY"?ml:';
if (!code.includes('e==="MALAY"?ml:')) {
  code = code.replace(activeDataLaosStar, activeDataMalay);
}

// 10. handleResetData
const resetLaosStar = 'e==="LAOS_STAR"?(localStorage.removeItem("lotto_data_laos_star"),q(e0)):';
const resetMalay = 'e==="LAOS_STAR"?(localStorage.removeItem("lotto_data_laos_star"),q(e0)):e==="MALAY"?(localStorage.removeItem("lotto_data_malay"),setMl(malayData_init)):';
if (!code.includes('localStorage.removeItem("lotto_data_malay")')) {
  code = code.replace(resetLaosStar, resetMalay);
}

// 11. nameMap in auto fetch
const nameMapLaosStar = 'LAOS_STAR:"ลาวสตาร์",';
const nameMapMalay = 'LAOS_STAR:"ลาวสตาร์",MALAY:"หวยมาเลย์",';
if (!code.includes('MALAY:"หวยมาเลย์",')) {
  code = code.replace(nameMapLaosStar, nameMapMalay);
}

// 12. Icon helper for prediction card
const iconLaosStar = 'e==="LAOS_STAR"?"⭐":';
const iconMalay = 'e==="LAOS_STAR"?"⭐":e==="MALAY"?"🇲🇾":';
if (!code.includes('e==="MALAY"?"🇲🇾":')) {
  code = code.replace(iconLaosStar, iconMalay);
}

// 13. Auto sync updater call in auto-fetch
const syncLaosStarCall = 'const sr=_e(Y,"LAOS_STAR_DAY","LAOS_STAR");sr.updatedCount>0&&(q(sr.list),B+=sr.updatedCount);';
const syncMalayCall = 'const sr_m=_e(ml,"MALAY_EVENING","MALAY");sr_m.updatedCount>0&&(setMl(sr_m.list),B+=sr_m.updatedCount);';
if (code.includes(syncLaosStarCall) && !code.includes('sr_m=')) {
  code = code.replace(syncLaosStarCall, syncLaosStarCall + syncMalayCall);
}

// 14. getNextTargetDayCode calculation for MALAY (w2 function)
const w2Target = 'if(t==="NIKKEI"||t==="DOWJONES"){for(o.setDate(o.getDate()+1);o.getDay()===0||o.getDay()===6;)o.setDate(o.getDate()+1);return o}';
const w2Replacement = 'if(t==="NIKKEI"||t==="DOWJONES"){for(o.setDate(o.getDate()+1);o.getDay()===0||o.getDay()===6;)o.setDate(o.getDate()+1);return o}if(t==="MALAY"){for(o.setDate(o.getDate()+1);![0,3,6].includes(o.getDay());)o.setDate(o.getDate()+1);return o}';
if (!code.includes('t==="MALAY"')) {
  code = code.replace(w2Target, w2Replacement);
}

// 15. getNextTargetDayCode fallback day (Yy function)
const fallbackTarget = 'const o=t==="NIKKEI"?"Mon":"Sat";';
const fallbackReplacement = 'const o=t==="NIKKEI"?"Mon":t==="MALAY"?"Wed":"Sat";';
if (code.includes(fallbackTarget)) {
  code = code.replace(fallbackTarget, fallbackReplacement);
}

// 16. Filter Malay draw days in DayOfWeekAnalyzer (daysList F)
const daysListTarget = 'F=o==="NIKKEI"||o==="LAOS"||o==="DOWJONES"?[{code:"Mon",label:"วันจันทร์",color:"from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 hover:border-yellow-400"},{code:"Tue",label:"วันอังคาร",color:"from-pink-500/20 to-rose-400/20 text-pink-300 border-pink-500/40 hover:border-pink-400"},{code:"Wed",label:"วันพุธ",color:"from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"},{code:"Thu",label:"วันพฤหัสบดี",color:"from-orange-500/20 to-amber-600/20 text-orange-300 border-orange-500/40 hover:border-orange-400"},{code:"Fri",label:"วันศุกร์",color:"from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400"},{code:"ALL",label:"รวมทุกวัน",color:"from-gray-700/40 to-gray-800/40 text-gray-200 border-gray-600/50 hover:border-gray-400"}]';
const daysListReplacement = 'F=o==="NIKKEI"||o==="LAOS"||o==="DOWJONES"?[{code:"Mon",label:"วันจันทร์",color:"from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 hover:border-yellow-400"},{code:"Tue",label:"วันอังคาร",color:"from-pink-500/20 to-rose-400/20 text-pink-300 border-pink-500/40 hover:border-pink-400"},{code:"Wed",label:"วันพุธ",color:"from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"},{code:"Thu",label:"วันพฤหัสบดี",color:"from-orange-500/20 to-amber-600/20 text-orange-300 border-orange-500/40 hover:border-orange-400"},{code:"Fri",label:"วันศุกร์",color:"from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400"},{code:"ALL",label:"รวมทุกวัน",color:"from-gray-700/40 to-gray-800/40 text-gray-200 border-gray-600/50 hover:border-gray-400"}]:o==="MALAY"?[{code:"Wed",label:"วันพุธ",color:"from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"},{code:"Sat",label:"วันเสาร์",color:"from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400"},{code:"Sun",label:"วันอาทิตย์",color:"from-red-500/20 to-rose-500/20 text-red-300 border-red-500/40 hover:border-red-400"},{code:"ALL",label:"รวมทุกวัน",color:"from-gray-700/40 to-gray-800/40 text-gray-200 border-gray-600/50 hover:border-gray-400"}]';

if (code.includes(daysListTarget)) {
  code = code.replace(daysListTarget, daysListReplacement);
}

// 17. Add Copy Guide button in DayOfWeekAnalyzer
const scanBadgeTarget = 'n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs shrink-0 self-start sm:self-auto",children:["จำนวนงวดที่สแกน: ",n.jsx("span",{className:"text-white font-black text-sm",children:h.totalDrawsOnDay})," งวด (",h.dayName,")"]})';

const copyBtnReplacement = `n.jsxs("div",{className:"flex items-center gap-2 shrink-0 self-start sm:self-auto",children:[n.jsxs("button",{onClick:()=>{
  const m = o==="HANOI"?{l:"หวยฮานอย",s:"รวม 3 ฮานอย (พิเศษ / ปกติ / VIP)"}:o==="MALAY"?{l:"หวยมาเลย์",s:"มาเลย์ Magnum 4D (ออกรางวัล 18:30)"}:o==="LAOS"?{l:"หวยลาวพัฒนา",s:"ลาวพัฒนา"}:o==="LAOS_STAR"?{l:"หวยลาวสตาร์",s:"ลาวสตาร์ (15:45)"}:o==="NIKKEI"?{l:"หุ้นนิเคอิ",s:"รวมหุ้นนิเคอิ"}:{l:"หวยยอดนิยม",s:"สรุปผลสถิติ"};
  const dName = h.dayName || r;
  const fDate = E ? vy(E) : "";
  const mb = (s)=>String(s).replace(/[0-9]/g, c=>({'0':'𝟘','1':'𝟙','2':'𝟚','3':'𝟛','4':'𝟜','5':'𝟝','6':'𝟞','7':'𝟟','8':'𝟠','9':'𝟡'}[c]||c));
  const d1 = h.topSingleDigits && h.topSingleDigits[0] ? mb(h.topSingleDigits[0].digit) : "-";
  const d2 = h.topSingleDigits && h.topSingleDigits[1] ? mb(h.topSingleDigits[1].digit) : "-";
  const pStr = h.top2DPairs ? h.top2DPairs.slice(0,6).map(p=>mb(p.pair)).join(" , ") : "";
  const txt = \`📊 [แนวทางสถิติเลขรายวัน - \${m.l}]
🏷️ รอบ: \${m.s}
🗓️ สถิติประจำ: วัน\${dName} (งวด \${fDate})
--------------------------
🔥 ฟันเด่น วิ่ง-รูด 19 ประตู (วัน\${dName}):
⭐ เด่นหลัก : \${d1} 
✨ เด่นรอง: \${d2} 

💎 TOP 6 เลข 2 ตัว บน-ล่าง เน้น (วัน\${dName}):
🎯 ชุดเน้น 6 คู่
 \${pStr}

----------------------------
🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289\`;
  navigator.clipboard.writeText(txt);
  alert("คัดลอกแนวทางเรียบร้อยแล้ว!");
},className:"px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-black border border-amber-200 hover:brightness-110 active:scale-95 shadow-glow-gold",children:[n.jsx("span",{children:"📋 คัดลอกแนวทาง"})]}),n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs",children:["จำนวนงวดที่สแกน: ",n.jsx("span",{className:"text-white font-black text-sm",children:h.totalDrawsOnDay})," งวด (",h.dayName,")"]})]})`;

if (code.includes(scanBadgeTarget)) {
  code = code.replace(scanBadgeTarget, copyBtnReplacement);
}

// 18. Combine TOP 6 Pairs into เด่นหลัก/เด่นรอง banner and remove 1-digit frequency card & bottom history list preview
const bannerTarget = `n.jsxs("div",{className:"flex items-center gap-3 bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl shrink-0",children:[n.jsxs("div",{className:"text-center px-3 border-r border-gray-700 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นหลัก (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-amber-400",children:(G=h.topSingleDigits[0])==null?void 0:G.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((H=h.topSingleDigits[0])==null?void 0:H.digit)})]}),n.jsxs("div",{className:"text-center px-3 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นรอง (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-cyan-400",children:(I=h.topSingleDigits[1])==null?void 0:I.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((c=h.topSingleDigits[1])==null?void 0:c.digit)})]})]})]}),n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",children:[n.jsxs("div",{className:"bg-gradient-to-br from-amber-950/40 via-nikkei-dark to-yellow-950/40 border border-amber-500/40 rounded-xl p-4 shadow-sm",children:[n.jsxs("div",{className:"flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2",children:[n.jsxs("span",{className:"text-xs font-bold text-amber-300 flex items-center gap-1.5",children:[n.jsx(vN,{className:"w-4 h-4 text-amber-400 animate-bounce"}),"🔥 สถิติเลข 1 ตัว ออกบ่อยสูงสุด (วัน",h.dayName,")"]}),n.jsx("span",{className:"text-[10px] text-amber-200 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded",children:"TOP 5 ตัวเด่น"})]}),n.jsx("div",{className:"flex items-center justify-between gap-2",children:h.topSingleDigits.map((b,C)=>n.jsxs("div",{className:"flex flex-col items-center gap-1",children:[n.jsx("div",{className:\`w-11 h-11 rounded-xl font-black text-2xl flex items-center justify-center shadow-md border \${C===0?"bg-gradient-to-tr from-amber-400 to-yellow-200 text-black border-yellow-100 shadow-glow-gold scale-110":C===1?"bg-gradient-to-tr from-cyan-400 to-teal-200 text-black border-cyan-100":"bg-nikkei-card text-gray-200 border-nikkei-border"}\`,children:b.digit}),n.jsxs("span",{className:"text-[11px] font-extrabold text-amber-300",children:[b.count," ครั้ง"]}),n.jsxs("span",{className:"text-[9px] text-gray-400",children:["(",b.percent,"%)"]})]},b.digit))})]}),n.jsxs("div",{className:"bg-gradient-to-br from-cyan-950/40 via-nikkei-dark to-teal-950/40 border border-cyan-500/40 rounded-xl p-4 shadow-sm",children:[n.jsxs("div",{className:"flex items-center justify-between mb-3 border-b border-cyan-500/30 pb-2",children:[n.jsxs("span",{className:"text-xs font-bold text-cyan-300 flex items-center gap-1.5",children:[n.jsx($d,{className:"w-4 h-4 text-cyan-400"}),"🔥 สถิติเลข 2 ตัว (บน-ล่าง) ออกซ้ำบ่อยสูงสุด (วัน",h.dayName,")"]}),n.jsx("span",{className:"text-[10px] text-cyan-200 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded",children:"TOP 6 คู่เน้น"})]}),n.jsx("div",{className:"grid grid-cols-3 sm:grid-cols-6 gap-2",children:h.top2DPairs.map(b=>{const C=o==="HANOI"?Xy(b.pair,O):Zy(b.pair,O),R=o==="HANOI"?_:m;return n.jsxs("div",{className:"bg-nikkei-dark border border-cyan-500/30 rounded-xl p-2 text-center flex flex-col items-center justify-between min-h-[72px]",children:[n.jsxs("div",{children:[n.jsx("span",{className:"text-base font-black text-cyan-300 font-mono tracking-wider block",children:b.pair}),n.jsxs("span",{className:"text-[10px] font-bold text-gray-400 block",children:["ออก ",b.count," ครั้ง"]})]}),n.jsx("div",{className:"mt-1 flex flex-wrap items-center justify-center gap-0.5",children:g||O.length===0||l==="NEXT"?n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"}):C.length>0?C.map(L=>n.jsxs("span",{className:\`text-[8px] font-black px-1 py-0.5 rounded border flex items-center justify-center gap-0.5 \${L.badgeColor}\`,children:["✓ ",L.shortLabel," ",n.jsxs("span",{className:"text-white font-bold",children:["[",L.position,"]"]})]},L.session)):R?n.jsx("span",{className:"text-[9px] text-red-400/70 font-semibold",children:"❌ ไม่เข้า"}):n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"})})]},b.pair)})})]})]}),n.jsxs("div",{className:"bg-nikkei-dark/80 border border-nikkei-border rounded-xl p-3.5 text-xs space-y-2",children:[n.jsx("div",{className:"flex items-center justify-between font-bold text-gray-300",children:n.jsxs("span",{className:"flex items-center gap-1.5",children:[n.jsx(jd,{className:"w-4 h-4 text-amber-400"}),"ตารางผลการออกรางวัลจริงย้อนหลังเฉพาะวัน",h.dayName," (รวม ",h.totalDrawsOnDay," งวด):"]})}),n.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[h.matchingDraws.slice(0,10).map(b=>n.jsxs("span",{className:"bg-nikkei-card border border-nikkei-border/80 px-2.5 py-1 rounded-lg text-gray-300 inline-flex items-center gap-1",children:[n.jsxs("strong",{className:"text-gray-400",children:[b.dateFormatted,":"]})," บน ",n.jsx("strong",{className:"text-amber-300",children:b.top3})," | ล่าง ",n.jsx("strong",{className:"text-cyan-300",children:b.bottom2})]},b.id)),h.matchingDraws.length>10&&n.jsxs("span",{className:"text-gray-500 font-semibold px-2",children:["...และอีก ",h.matchingDraws.length-10," งวด"]})]})]})`;

// FIX: Removed trailing semicolon at the end of bannerReplacement expression!
const bannerReplacement = `n.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1",children:[n.jsxs("div",{className:"lg:col-span-4 flex items-center justify-around bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl",children:[n.jsxs("div",{className:"text-center px-3 border-r border-gray-700 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นหลัก (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-amber-400",children:(G=h.topSingleDigits[0])==null?void 0:G.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((H=h.topSingleDigits[0])==null?void 0:H.digit)})]}),n.jsxs("div",{className:"text-center px-3 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นรอง (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-cyan-400",children:(I=h.topSingleDigits[1])==null?void 0:I.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((c=h.topSingleDigits[1])==null?void 0:c.digit)})]})]}),n.jsxs("div",{className:"lg:col-span-8 bg-nikkei-dark/90 border border-cyan-500/40 p-3 rounded-2xl flex flex-col justify-between",children:[n.jsxs("div",{className:"flex items-center justify-between mb-2",children:[n.jsxs("span",{className:"text-xs font-bold text-cyan-300 flex items-center gap-1.5",children:[n.jsx($d,{className:"w-4 h-4 text-cyan-400"}),"🔥 สถิติเลข 2 ตัว (บน-ล่าง) ออกซ้ำบ่อยสูงสุด (วัน",h.dayName,")"]}),n.jsx("span",{className:"text-[9px] text-cyan-200 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded",children:"TOP 6 คู่เน้น"})]}),n.jsx("div",{className:"grid grid-cols-3 sm:grid-cols-6 gap-2",children:h.top2DPairs.slice(0,6).map(b=>{const C=o==="HANOI"?Xy(b.pair,O):Zy(b.pair,O),R=o==="HANOI"?_:m;return n.jsxs("div",{className:"bg-nikkei-card border border-cyan-500/30 rounded-xl p-1.5 text-center flex flex-col items-center justify-between min-h-[64px]",children:[n.jsxs("div",{children:[n.jsx("span",{className:"text-base font-black text-cyan-300 font-mono tracking-wider block",children:b.pair}),n.jsxs("span",{className:"text-[9px] font-bold text-gray-400 block",children:["ออก ",b.count," ครั้ง"]})]}),n.jsx("div",{className:"mt-1 flex flex-wrap items-center justify-center gap-0.5",children:g||O.length===0||l==="NEXT"?n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"}):C.length>0?C.map(L=>n.jsxs("span",{className:\`text-[8px] font-black px-1 py-0.5 rounded border flex items-center justify-center gap-0.5 \${L.badgeColor}\`,children:["✓ ",L.shortLabel," ",n.jsxs("span",{className:"text-white font-bold",children:["[",L.position,"]"]})]},L.session)):R?n.jsx("span",{className:"text-[9px] text-red-400/70 font-semibold",children:"❌ ไม่เข้า"}):n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"})})]},b.pair)})})]})]})]}`;

if (code.includes(bannerTarget)) {
  code = code.replace(bannerTarget, bannerReplacement);
}

// Check JavaScript syntax validity before writing to files
try {
  new vm.Script(code);
  console.log('✅ JavaScript syntax verification passed cleanly!');
} catch (syntaxErr) {
  console.error('❌ Syntax error in patched code:', syntaxErr);
  process.exit(1);
}

// Generate index.html content with absolute path asset links
const htmlContent = `<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SystemLucky289 - ระบบวิเคราะห์และคำนวณสถิติหวยหุ้นและหวยออนไลน์</title>
    <meta name="description" content="SystemLucky289 - ระบบวิเคราะห์และคำนวณสถิติทำนายคาดการณ์ตัวเลขงวดถัดไป" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/assets/index-CN-5_2d9.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-Cip8XUMO.css">
  </head>
  <body class="bg-[#140b04] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/60 via-[#180e05] to-[#100803] text-amber-50 font-sans antialiased min-h-screen selection:bg-amber-400 selection:text-black">
    <div id="root"></div>
  </body>
</html>`;

// Out directories
const outDirs = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'cloudflare_download_faae1b0f'),
  path.join(__dirname, '..', 'cloudflare_latest_download'),
  path.join(__dirname, '..', 'public')
];

for (const dir of outDirs) {
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  // Write JS files under both asset names to avoid any 404
  fs.writeFileSync(path.join(assetsDir, 'index-CN-5_2d9.js'), code, 'utf8');
  fs.writeFileSync(path.join(assetsDir, 'index-DrChOO4P.js'), code, 'utf8');

  // Write CSS files under both asset names to avoid any 404
  fs.copyFileSync(srcCssPath, path.join(assetsDir, 'index-Cip8XUMO.css'));
  fs.copyFileSync(srcCssPath, path.join(assetsDir, 'index-CF9Ii_kx.css'));

  // Write HTML file
  fs.writeFileSync(path.join(dir, 'index.html'), htmlContent, 'utf8');

  console.log('Successfully written complete assets & html to:', dir);
}
