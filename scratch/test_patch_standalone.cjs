const vm = require('vm');
const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcJsPath, 'utf8');

const scanBadgeTarget = 'n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs shrink-0 self-start sm:self-auto",children:["จำนวนงวดที่สแกน: ",n.jsx("span",{className:"text-white font-black text-sm",children:h.totalDrawsOnDay})," งวด (",h.dayName,")"]})';

const copyBtnReplacement = 'n.jsxs("div",{className:"flex items-center gap-2 shrink-0 self-start sm:self-auto",children:[n.jsxs("button",{onClick:()=>{' +
  'const m = o==="HANOI"?{l:"หวยฮานอย",s:"รวม 3 ฮานอย (พิเศษ / ปกติ / VIP)"}:o==="MALAY"?{l:"หวยมาเลย์",s:"มาเลย์ Magnum 4D (ออกรางวัล 18:30)"}:o==="LAOS"?{l:"หวยลาวพัฒนา",s:"ลาวพัฒนา"}:o==="LAOS_STAR"?{l:"หวยลาวสตาร์",s:"ลาวสตาร์ (15:45)"}:o==="NIKKEI"?{l:"หุ้นนิเคอิ",s:"รวมหุ้นนิเคอิ"}:{l:"หวยยอดนิยม",s:"สรุปผลสถิติ"};' +
  'const dName = h.dayName || r;' +
  'const fDate = E ? vy(E) : "";' +
  'const mb = (s)=>String(s).replace(/[0-9]/g, c=>({"0":"𝟘","1":"𝟙","2":"𝟚","3":"𝟛","4":"𝟜","5":"𝟝","6":"𝟞","7":"𝟟","8":"𝟠","9":"𝟡"}[c]||c));' +
  'const d1 = h.topSingleDigits && h.topSingleDigits[0] ? mb(h.topSingleDigits[0].digit) : "-";' +
  'const d2 = h.topSingleDigits && h.topSingleDigits[1] ? mb(h.topSingleDigits[1].digit) : "-";' +
  'const pStr = h.top2DPairs ? h.top2DPairs.slice(0,6).map(p=>mb(p.pair)).join(" , ") : "";' +
  'const txt = "📊 [แนวทางสถิติเลขรายวัน - " + m.l + "]\\n" +' +
  '"🏷️ รอบ: " + m.s + "\\n" +' +
  '"🗓️ สถิติประจำ: วัน" + dName + " (งวด " + fDate + ")\\n" +' +
  '"--------------------------\\n" +' +
  '"🔥 ฟันเด่น วิ่ง-รูด 19 ประตู (วัน" + dName + "):\\n" +' +
  '"⭐ เด่นหลัก : " + d1 + " \\n" +' +
  '"✨ เด่นรอง: " + d2 + " \\n\\n" +' +
  '"💎 TOP 6 เลข 2 ตัว บน-ล่าง เน้น (วัน" + dName + "):\\n" +' +
  '"🎯 ชุดเน้น 6 คู่\\n" +' +
  '" " + pStr + "\\n\\n" +' +
  '"----------------------------\\n" +' +
  '"🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289";' +
  'navigator.clipboard.writeText(txt);' +
  'alert("คัดลอกแนวทางเรียบร้อยแล้ว!");' +
'},className:"px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-black border border-amber-200 hover:brightness-110 active:scale-95 shadow-glow-gold",children:[n.jsx("span",{children:"📋 คัดลอกแนวทาง"})]}),n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs",children:["จำนวนงวดที่สแกน: ",n.jsx("span",{className:"text-white font-black text-sm",children:h.totalDrawsOnDay})," งวด (",h.dayName,")"]})]})';

const leftSideDiv = 'n.jsxs("div",{className:"flex items-center gap-3",children:[n.jsx("div",{className:"w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-2xl shadow-glow-gold shrink-0",children:n.jsx(jd,{className:"w-7 h-7 text-black"})}),n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider",children:l==="VERIFY"&&E?"🎯 สรุปผลสถิติที่ใช้ทำนายงวด "+vy(E):"🎯 สรุปฟันธงเลขเด่นรูดประจำวัน"+h.dayName}),o==="HANOI"&&n.jsx("span",{className:"bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded",children:"วิเคราะห์รวม 3 รอบฮานอย (17:30 / 18:30 / 19:30)"})]}),n.jsxs("h4",{className:"text-base font-extrabold text-white mt-1",children:["ฟันเด่นวิ่ง-รูด 19 ประตู: ",n.jsx("span",{className:"text-amber-300 text-xl font-black",children:(A=h.topSingleDigits[0])==null?void 0:A.digit})," และ ",n.jsx("span",{className:"text-cyan-300 text-xl font-black",children:(z=h.topSingleDigits[1])==null?void 0:z.digit})]}),n.jsxs("p",{className:"text-xs text-gray-300 mt-0.5",children:["จากสถิติสแกน ",h.totalDrawsOnDay," งวด (วัน",h.dayName,") เลข ",n.jsx("span",{className:"text-amber-400 font-bold",children:(Y=h.topSingleDigits[0])==null?void 0:Y.digit})," ออกบ่อยสุด ",(q=h.topSingleDigits[0])==null?void 0:q.count," ครั้ง (",(U=h.topSingleDigits[0])==null?void 0:U.percent,"%) และ เลข ",n.jsx("span",{className:"text-cyan-400 font-bold",children:(J=h.topSingleDigits[1])==null?void 0:J.digit})," ออก ",(j=h.topSingleDigits[1])==null?void 0:j.count," ครั้ง (",(Q=h.topSingleDigits[1])==null?void 0:Q.percent,"%)"]}),o==="NIKKEI"&&(S.length>0?n.jsxs("div",{className:"mt-2 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-2 shadow-sm",children:[n.jsxs("span",{className:"text-rose-400 font-extrabold flex items-center gap-1",children:["📌 ตลาดปิดทำการงวดถัดไป (",vy(E),"):"]}),S.map(b=>n.jsxs("span",{className:"bg-rose-500/25 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1",children:["🔴 ",b.shortClosedLabel," ",b.holidayName?("("+b.holidayName+")") : ""]},b.key))]}):n.jsx("div",{className:"mt-2 text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-2",children:n.jsxs("span",{className:"text-emerald-400 font-extrabold flex items-center gap-1",children:["🟢 ตลาดเปิดทำการทุกหุ้น (",vy(E),": นิเคอิ, จีน, ฮั่งเส็ง)"]})}))]})]})';

const leftColsDiv = 'n.jsxs("div",{className:"lg:col-span-4 flex items-center justify-around bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl",children:[n.jsxs("div",{className:"text-center px-3 border-r border-gray-700 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นหลัก (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-amber-400",children:(G=h.topSingleDigits[0])==null?void 0:G.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((H=h.topSingleDigits[0])==null?void 0:H.digit)})]}),n.jsxs("div",{className:"text-center px-3 flex flex-col items-center",children:[n.jsx("span",{className:"text-[10px] text-gray-400 block font-bold",children:"เด่นรอง (รูด 19)"}),n.jsx("span",{className:"text-3xl font-black text-cyan-400",children:(I=h.topSingleDigits[1])==null?void 0:I.digit}),n.jsx("div",{className:"mt-1 flex flex-col items-center justify-center gap-1",children:M((c=h.topSingleDigits[1])==null?void 0:c.digit)})]})]})';

const rightColsDiv = 'n.jsxs("div",{className:"lg:col-span-8 bg-nikkei-dark/90 border border-cyan-500/40 p-3 rounded-2xl flex flex-col justify-between",children:[n.jsxs("div",{className:"flex items-center justify-between mb-2",children:[n.jsxs("span",{className:"text-xs font-bold text-cyan-300 flex items-center gap-1.5",children:[n.jsx($d,{className:"w-4 h-4 text-cyan-400"}),"🔥 สถิติเลข 2 ตัว (บน-ล่าง) ออกซ้ำบ่อยสูงสุด (วัน",h.dayName,")"]}),n.jsx("span",{className:"text-[9px] text-cyan-200 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded",children:"TOP 6 คู่เน้น"})]}),n.jsx("div",{className:"grid grid-cols-3 sm:grid-cols-6 gap-2",children:h.top2DPairs.slice(0,6).map(b=>{const C=o==="HANOI"?Xy(b.pair,O):Zy(b.pair,O),R=o==="HANOI"?_:m;return n.jsxs("div",{className:"bg-nikkei-card border border-cyan-500/30 rounded-xl p-1.5 text-center flex flex-col items-center justify-between min-h-[64px]",children:[n.jsxs("div",{children:[n.jsx("span",{className:"text-base font-black text-cyan-300 font-mono tracking-wider block",children:b.pair}),n.jsxs("span",{className:"text-[9px] font-bold text-gray-400 block",children:["ออก ",b.count," ครั้ง"]})]}),n.jsx("div",{className:"mt-1 flex flex-wrap items-center justify-center gap-0.5",children:g||O.length===0||l==="NEXT"?n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"}):C.length>0?C.map(L=>n.jsxs("span",{className:"text-[8px] font-black px-1 py-0.5 rounded border flex items-center justify-center gap-0.5 "+L.badgeColor,children:["✓ ",L.shortLabel," ",n.jsxs("span",{className:"text-white font-bold",children:["[",L.position,"]"]})]},L.session)):R?n.jsx("span",{className:"text-[9px] text-red-400/70 font-semibold",children:"❌ ไม่เข้า"}):n.jsx("span",{className:"text-[9px] text-amber-400/80 font-bold",children:"⏳ รอผล"})})]},b.pair)})})]})';

const topDiv = 'n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-3",children:[' + leftSideDiv + ',' + copyBtnReplacement + ']})';
const gridDiv = 'n.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1",children:[' + leftColsDiv + ',' + rightColsDiv + ']})';

const replacementBlock = 'h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border-2 border-amber-400 rounded-xl p-4 shadow-glow-gold space-y-4",children:[' + topDiv + ',' + gridDiv + ']})';

const bannerStartStr = 'h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20';
const bannerEndStr = '},s0=["มกราคม"';

const startIdx = code.indexOf(bannerStartStr);
const endIdx = code.indexOf(bannerEndStr);

code = code.substring(0, startIdx) + replacementBlock + ']})' + code.substring(endIdx);

try {
  new vm.Script(code);
  console.log('🎉🎉🎉 SUCCESS! vm.Script compiled full patched code PERFECTLY WITH ZERO SYNTAX ERRORS!');
} catch (syntaxErr) {
  console.error('❌ Syntax error in patched code:', syntaxErr);
}
