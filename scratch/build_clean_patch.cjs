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
  code = code.replace('}],e0=[', '}],malayData_init=' + malayMinStr + ',e0=[');
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

// 17. Safe Property Selectors
const d0_digit = 'h.topSingleDigits&&h.topSingleDigits[0]?h.topSingleDigits[0].digit:""';
const d1_digit = 'h.topSingleDigits&&h.topSingleDigits[1]?h.topSingleDigits[1].digit:""';
const d0_count = 'h.topSingleDigits&&h.topSingleDigits[0]?h.topSingleDigits[0].count:0';
const d1_count = 'h.topSingleDigits&&h.topSingleDigits[1]?h.topSingleDigits[1].count:0';
const d0_pct = 'h.topSingleDigits&&h.topSingleDigits[0]?(h.topSingleDigits[0].percent??h.topSingleDigits[0].percentage??80):80';
const d1_pct = 'h.topSingleDigits&&h.topSingleDigits[1]?(h.topSingleDigits[1].percent??h.topSingleDigits[1].percentage??66.7):66.7';

const awardSvg = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-7 h-7 text-black",children:[n.jsx("circle",{cx:"12",cy:"8",r:"6"}),n.jsx("path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"})]})';
const copySvg = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-4 h-4 text-black",children:[n.jsx("rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}),n.jsx("path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"})]})';
const zapSvgAmber = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-4 h-4 text-amber-400 shrink-0",children:[n.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"})]})';
const zapSvgCyan = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeconst topDiv = '((getHeaderBadgeTextStr)=>{return n.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-3",children:[n.jsxs("div",{className:"flex items-center gap-3",children:[n.jsx("div",{className:"w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black text-2xl shadow-glow-gold shrink-0",children:' + awardSvg + '}),n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[n.jsx("span",{className:"bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-1",children:l==="VERIFY"&&E?"🎯 สรุปผลสถิติที่ใช้ทำนายงวด "+(typeof E==="string"?E:String(E||"")):"🎯 สรุปฟันธงเลขเด่นรูดประจำวัน"+h.dayName}),getHeaderBadgeTextStr?n.jsx("span",{className:"bg-emerald-500 text-black text-xs font-black px-2.5 py-0.5 rounded-md",children:getHeaderBadgeTextStr}):null]}),n.jsxs("h4",{className:"text-xl sm:text-2xl font-black text-white mt-1",children:["ฟันเด่นวิ่ง-รูด 19 ประตู: ",n.jsx("span",{className:"text-amber-400",children:' + d0_digit + '})," และ ",n.jsx("span",{className:"text-cyan-400",children:' + d1_digit + '})]}),n.jsxs("p",{className:"text-xs text-gray-300 mt-0.5",children:["จากสถิติสแกน ",h.totalDrawsOnDay," งวด (วัน",h.dayName,") เลข ",n.jsx("strong",{className:"text-amber-300",children:' + d0_digit + '})," ออกบ่อยสุด ",' + d0_count + '," ครั้ง (",' + d0_pct + ',"%) และ เลข ",n.jsx("strong",{className:"text-cyan-300",children:' + d1_digit + '})," ออก ",' + d1_count + '," ครั้ง (",' + d1_pct + ',"%)"]})]})]}),n.jsx("button",{onClick:(e)=>{const t=e.currentTarget;if(navigator.clipboard){const d0=h.topSingleDigits&&h.topSingleDigits[0]?h.topSingleDigits[0].digit:"-",d1=h.topSingleDigits&&h.topSingleDigits[1]?h.topSingleDigits[1].digit:"-";const getH=(digit)=>{if(digit===undefined||digit===null)return{isHit:false,text:""};if(g||O.length===0||l==="NEXT")return{isHit:false,text:"⏳ รอผล"};const dStr=String(digit);const res=o==="HANOI"?Uy(dStr,O):Qy(dStr,O);if(res&&res.length>0)return{isHit:true,text:res.map(x=>"✓ "+x.shortLabel+" ["+x.winningNumbers+"]").join(String.fromCharCode(10))};const rec=o==="HANOI"?_:m;return{isHit:false,text:rec?"❌ ไม่เข้า":"⏳ รอผล"}};const getPairH=()=>{if(g||O.length===0||l==="NEXT")return{isHit:false,text:"ผล ⏳ รอผล"};const top6=h.top2DPairs?h.top2DPairs.slice(0,6):[];const hits=[];top6.forEach(item=>{const pStr=String(item.pair);const ph=o==="HANOI"?Xy(pStr,O):Zy(pStr,O);ph.forEach(x=>{const posText=(x.position.includes(pStr)||x.position.includes(pStr.split("").reverse().join("")))?x.position:(x.position+" "+pStr);hits.push("✓ "+x.shortLabel+" ["+posText+"]")})});if(hits.length>0)return{isHit:true,text:Array.from(new Set(hits)).join(String.fromCharCode(10))};const rec=o==="HANOI"?_:m;return{isHit:false,text:rec?"ผล ❌ ไม่เข้า":"ผล ⏳ รอผล"}};const info0=getH(d0),info1=getH(d1),pairInfo=getPairH();const d0Str=info0.isHit?"⭐ เด่นหลัก: "+d0+String.fromCharCode(10)+info0.text:"⭐ เด่นหลัก: "+d0+" ผล "+info0.text;const d1Str=info1.isHit?"✨ เด่นรอง: "+d1+String.fromCharCode(10)+info1.text:"✨ เด่นรอง: "+d1+" ผล "+info1.text;const pairStr=String.fromCharCode(10)+pairInfo.text;const pr=h.top2DPairs?h.top2DPairs.slice(0,6).map(x=>x.pair).join(" , "):"";const activeSess=sS||(typeof localStorage!=="undefined"?localStorage.getItem("lotto_selected_session")||"":"");const getSetInfoStr=t=>{if(t==="HANOI"){if(activeSess==="HANOI_SPECIAL")return"พิเศษ (17:30)";if(activeSess==="HANOI_EVENING")return"ปกติ (18:30)";if(activeSess==="HANOI_VIP")return"VIP (19:30)";return"รวม 3 ฮานอย"}if(t==="STOCKS_VIP"||t==="STOCK_VIP"){if(activeSess==="NIKKEI_VIP_BOTH")return"นิเคอิ VIP (เช้า-บ่าย)";if(activeSess==="NIKKEI_VIP_MORNING")return"นิเคอิ VIP เช้า 08:30";if(activeSess==="NIKKEI_VIP_AFTERNOON")return"นิเคอิ VIP บ่าย 12:00";if(activeSess==="CHINA_VIP_BOTH")return"จีน VIP (เช้า-บ่าย)";if(activeSess==="CHINA_VIP_MORNING")return"จีน VIP เช้า 09:30";if(activeSess==="CHINA_VIP_AFTERNOON")return"จีน VIP บ่าย 13:00";if(activeSess==="HANGSENG_VIP_BOTH")return"ฮั่งเส็ง VIP (เช้า-บ่าย)";if(activeSess==="HANGSENG_VIP_MORNING")return"ฮั่งเส็ง VIP เช้า 10:55";if(activeSess==="HANGSENG_VIP_AFTERNOON")return"ฮั่งเส็ง VIP บ่าย 14:55";if(activeSess==="STOCKS_VIP_ALL_3")return"รวมทุกหุ้น VIP (6 รอบ)";if(activeSess.includes("AFTERNOON"))return"บ่าย 12:00";if(activeSess.includes("MORNING"))return"เช้า 08:30";return"รวมทุกหุ้น VIP (6 รอบ)"}if(t==="NIKKEI"){if(activeSess==="NIKKEI_BOTH"||activeSess==="BOTH")return"นิเคอิ (เช้า-บ่าย)";if(activeSess==="NIKKEI_MORNING"||activeSess==="MORNING")return"นิเคอิ เช้า 09:30";if(activeSess==="NIKKEI_AFTERNOON"||activeSess==="AFTERNOON")return"นิเคอิ บ่าย 13:00";if(activeSess==="CHINA_BOTH")return"จีน (เช้า-บ่าย)";if(activeSess==="CHINA_MORNING")return"จีน เช้า 10:35";if(activeSess==="CHINA_AFTERNOON")return"จีน บ่าย 14:00";if(activeSess==="HANGSENG_BOTH")return"ฮั่งเส็ง (เช้า-บ่าย)";if(activeSess==="HANGSENG_MORNING")return"ฮั่งเส็ง เช้า 11:00";if(activeSess==="HANGSENG_AFTERNOON")return"ฮั่งเส็ง บ่าย 15:00";if(activeSess==="STOCKS_ALL_3")return"รวม 6 รอบหุ้น (เช้า / บ่าย)";if(activeSess.includes("AFTERNOON"))return"บ่าย 13:00";if(activeSess.includes("MORNING"))return"เช้า 09:30";return"รวม 6 รอบหุ้น (เช้า / บ่าย)"}if(t==="MALAY")return"รอบเย็น 18:30 น.";if(t==="LAOS")return"รอบ 20:30 น.";if(t==="LAOS_STAR")return"รอบ 15:45 น.";if(t==="DOWJONES")return"ดาวโจนส์";return"-"};const setInfoVal=getSetInfoStr(o);const lm=o==="HANOI"?{name:"หวยฮานอย (ปกติ)",sess:"รวม 3 ฮานอย (17:30 / 18:30 / 19:30)"}:o==="MALAY"?{name:"หวยมาเลย์ (Magnum 4D)",sess:"รอบเย็น 18:30 น."}:o==="LAOS"?{name:"หวยลาวพัฒนา",sess:"รอบ 20:30 น. (จันทร์ - ศุกร์)"}:o==="LAOS_STAR"?{name:"หวยลาวสตาร์",sess:"รอบ 15:45 น."}:(o==="NIKKEI")?{name:"หุ้นนิเคอิ-จีน-ฮั่งเส็ง (ปกติ)",sess:"รวม 6 รอบหุ้น (เช้า / บ่าย)"}:(o==="STOCKS_VIP"||o==="STOCK_VIP")?{name:"หุ้น VIP",sess:"รวมหุ้น VIP"}:o==="DOWJONES"?{name:"ดาวโจนส์",sess:"ดาวโจนส์ VIP / Star"}:{name:"LOTTO289",sess:"สรุปผลสถิติ"};const lines=["📊 [แนวทางสถิติเลขรายวัน]","🎯 หวย: "+lm.name,"📌 รอบ: "+lm.sess,"🗓️ สถิติประจำ: วัน"+h.dayName,"🏷️ ชุดเลข: "+setInfoVal,"--------------------------","🔥 ฟันเด่น วิ่ง-รูด 19 ประตู:",d0Str,"",d1Str,"","💎 TOP 6 เลข 2 ตัว เน้น:"," "+pr+pairStr,"----------------------------","🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289"].join(String.fromCharCode(10));navigator.clipboard.writeText(lines);try{RN({particleCount:50,spread:60,origin:{y:0.7}})}catch(err){}if(t){const oldText=t.innerText;const oldClass=t.className;t.className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-emerald-500 text-black border border-emerald-300 scale-105 shadow-glow-emerald";t.innerText="✓ คัดลอกแนวทางแล้ว!";setTimeout(()=>{t.innerText=oldText;t.className=oldClass},2000)}}},className:"px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border border-amber-200 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-gold",children:[' + copySvg + ',n.jsx("span",{children:"คัดลอกแนวทาง"})]})]})})(((t, sS_val)=>{const activeSess=sS_val||(typeof localStorage!=="undefined"?localStorage.getItem("lotto_selected_session")||"":"");if(t==="HANOI"){if(activeSess==="HANOI_SPECIAL")return"วิเคราะห์รอบ พิเศษ (17:30)";if(activeSess==="HANOI_EVENING")return"วิเคราะห์รอบ ปกติ (18:30)";if(activeSess==="HANOI_VIP")return"วิเคราะห์รอบ VIP (19:30)";return"วิเคราะห์รวม 3 รอบฮานอย (17:30 / 18:30 / 19:30)"}if(t==="STOCKS_VIP"||t==="STOCK_VIP"){if(activeSess==="NIKKEI_VIP_BOTH")return"วิเคราะห์รอบ นิเคอิ VIP (เช้า-บ่าย)";if(activeSess==="NIKKEI_VIP_MORNING")return"วิเคราะห์รอบ นิเคอิ VIP เช้า 08:30";if(activeSess==="NIKKEI_VIP_AFTERNOON")return"วิเคราะห์รอบ นิเคอิ VIP บ่าย 12:00";if(activeSess==="CHINA_VIP_BOTH")return"วิเคราะห์รอบ จีน VIP (เช้า-บ่าย)";if(activeSess==="CHINA_VIP_MORNING")return"วิเคราะห์รอบ จีน VIP เช้า 09:30";if(activeSess==="CHINA_VIP_AFTERNOON")return"วิเคราะห์รอบ จีน VIP บ่าย 13:00";if(activeSess==="HANGSENG_VIP_BOTH")return"วิเคราะห์รอบ ฮั่งเส็ง VIP (เช้า-บ่าย)";if(activeSess==="HANGSENG_VIP_MORNING")return"วิเคราะห์รอบ ฮั่งเส็ง VIP เช้า 10:55";if(activeSess==="HANGSENG_VIP_AFTERNOON")return"วิเคราะห์รอบ ฮั่งเส็ง VIP บ่าย 14:55";if(activeSess==="STOCKS_VIP_ALL_3")return"วิเคราะห์รวมหุ้น VIP (6 รอบ)";if(activeSess.includes("AFTERNOON"))return"วิเคราะห์รอบ บ่าย 12:00";if(activeSess.includes("MORNING"))return"วิเคราะห์รอบ เช้า 08:30";return"วิเคราะห์รวมหุ้น VIP (6 รอบ)"}if(t==="NIKKEI"){if(activeSess==="NIKKEI_BOTH"||activeSess==="BOTH")return"วิเคราะห์รอบ นิเคอิ (เช้า-บ่าย)";if(activeSess==="NIKKEI_MORNING"||activeSess==="MORNING")return"วิเคราะห์รอบ นิเคอิ เช้า 09:30";if(activeSess==="NIKKEI_AFTERNOON"||activeSess==="AFTERNOON")return"วิเคราะห์รอบ นิเคอิ บ่าย 13:00";if(activeSess==="CHINA_BOTH")return"วิเคราะห์รอบ จีน (เช้า-บ่าย)";if(activeSess==="CHINA_MORNING")return"วิเคราะห์รอบ จีน เช้า 10:35";if(activeSess==="CHINA_AFTERNOON")return"วิเคราะห์รอบ จีน บ่าย 14:00";if(activeSess==="HANGSENG_BOTH")return"วิเคราะห์รอบ ฮั่งเส็ง (เช้า-บ่าย)";if(activeSess==="HANGSENG_MORNING")return"วิเคราะห์รอบ ฮั่งเส็ง เช้า 11:00";if(activeSess==="HANGSENG_AFTERNOON")return"วิเคราะห์รอบ ฮั่งเส็ง บ่าย 15:00";if(activeSess==="STOCKS_ALL_3")return"วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)";if(activeSess.includes("AFTERNOON"))return"วิเคราะห์รอบ บ่าย 13:00";if(activeSess.includes("MORNING"))return"วิเคราะห์รอบ เช้า 09:30";return"วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)"}if(t==="MALAY")return"วิเคราะห์รอบ มาเลย์ (18:30)";if(t==="LAOS")return"วิเคราะห์รอบ ลาวพัฒนา (20:30)";if(t==="LAOS_STAR")return"วิเคราะห์รอบ ลาวสตาร์ (15:45)";if(t==="DOWJONES")return"วิเคราะห์รอบ ดาวโจนส์ (04:00)";return""})(o, sS))';�ทางแล้ว!";setTimeout(()=>{t.innerText=oldText;t.className=oldClass},2000)}}},className:"px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border border-amber-200 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-gold",children:[' + copySvg + ',n.jsx("span",{children:"คัดลอกแนวทาง"})]})]})})(((t, sS_val)=>{const activeSess=sS_val||(typeof localStorage!=="undefined"?localStorage.getItem("lotto_selected_session")||"":"");if(t==="HANOI"){if(activeSess==="HANOI_SPECIAL")return"วิเคราะห์รอบ พิเศษ (17:30)";if(activeSess==="HANOI_EVENING")return"วิเคราะห์รอบ ปกติ (18:30)";if(activeSess==="HANOI_VIP")return"วิเคราะห์รอบ VIP (19:30)";return"วิเคราะห์รวม 3 รอบฮานอย (17:30 / 18:30 / 19:30)"}if(t==="STOCKS_VIP"||t==="STOCK_VIP"){if(activeSess==="NIKKEI_VIP_BOTH")return"วิเคราะห์รอบ นิเคอิ VIP (เช้า-บ่าย)";if(activeSess==="NIKKEI_VIP_MORNING")return"วิเคราะห์รอบ นิเคอิ VIP เช้า 08:30";if(activeSess==="NIKKEI_VIP_AFTERNOON")return"วิเคราะห์รอบ นิเคอิ VIP บ่าย 12:00";if(activeSess==="CHINA_VIP_BOTH")return"วิเคราะห์รอบ จีน VIP (เช้า-บ่าย)";if(activeSess==="CHINA_VIP_MORNING")return"วิเคราะห์รอบ จีน VIP เช้า 08:30";if(activeSess==="CHINA_VIP_AFTERNOON")return"วิเคราะห์รอบ จีน VIP บ่าย 12:00";if(activeSess==="HANGSENG_VIP_BOTH")return"วิเคราะห์รอบ ฮั่งเส็ง VIP (เช้า-บ่าย)";if(activeSess==="HANGSENG_VIP_MORNING")return"วิเคราะห์รอบ ฮั่งเส็ง VIP เช้า 08:30";if(activeSess==="HANGSENG_VIP_AFTERNOON")return"วิเคราะห์รอบ ฮั่งเส็ง VIP บ่าย 12:00";if(activeSess==="STOCKS_VIP_ALL_3")return"วิเคราะห์รวมหุ้น VIP (6 รอบ)";if(activeSess.includes("AFTERNOON"))return"วิเคราะห์รอบ บ่าย 12:00";if(activeSess.includes("MORNING"))return"วิเคราะห์รอบ เช้า 08:30";return"วิเคราะห์รวมหุ้น VIP (6 รอบ)"}if(t==="NIKKEI"){if(activeSess==="NIKKEI_BOTH"||activeSess==="BOTH")return"วิเคราะห์รอบ นิเคอิ (เช้า-บ่าย)";if(activeSess==="NIKKEI_MORNING"||activeSess==="MORNING")return"วิเคราะห์รอบ นิเคอิ เช้า 09:30";if(activeSess==="NIKKEI_AFTERNOON"||activeSess==="AFTERNOON")return"วิเคราะห์รอบ นิเคอิ บ่าย 13:00";if(activeSess==="CHINA_BOTH")return"วิเคราะห์รอบ จีน (เช้า-บ่าย)";if(activeSess==="CHINA_MORNING")return"วิเคราะห์รอบ จีน เช้า 09:30";if(activeSess==="CHINA_AFTERNOON")return"วิเคราะห์รอบ จีน บ่าย 13:00";if(activeSess==="HANGSENG_BOTH")return"วิเคราะห์รอบ ฮั่งเส็ง (เช้า-บ่าย)";if(activeSess==="HANGSENG_MORNING")return"วิเคราะห์รอบ ฮั่งเส็ง เช้า 09:30";if(activeSess==="HANGSENG_AFTERNOON")return"วิเคราะห์รอบ ฮั่งเส็ง บ่าย 13:00";if(activeSess==="STOCKS_ALL_3")return"วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)";if(activeSess.includes("AFTERNOON"))return"วิเคราะห์รอบ บ่าย 13:00";if(activeSess.includes("MORNING"))return"วิเคราะห์รอบ เช้า 09:30";return"วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)"}if(t==="MALAY")return"วิเคราะห์รอบ มาเลย์ (18:30)";if(t==="LAOS")return"วิเคราะห์รอบ ลาวพัฒนา (20:30)";if(t==="LAOS_STAR")return"วิเคราะห์รอบ ลาวสตาร์ (15:45)";if(t==="DOWJONES")return"วิเคราะห์รอบ ดาวโจนส์ (04:00)";return""})(o, sS))';

const card1Header = 'n.jsxs("div",{className:"flex items-center justify-between border-b border-amber-500/20 pb-1.5",children:[n.jsxs("span",{className:"text-xs font-extrabold text-amber-300 flex items-center gap-1.5",children:[n.jsx("span",{className:"bg-amber-400 text-black font-black text-[10px] px-1.5 py-0.5 rounded",children:"1"}),"🎯 ฟันเด่น วิ่ง-รูด 19 ประตู"]}),n.jsx("span",{className:"text-[9px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded",children:"เด่น - รอง"})]})';

const card1Inner1 = 'n.jsxs("div",{className:"bg-nikkei-card/90 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-1.5 relative shadow-sm",children:[' +
  'n.jsxs("div",{className:"w-full flex items-center justify-between gap-0.5",children:[n.jsx("span",{className:"text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate",children:"🔥 เด่นหลัก"}),n.jsxs("span",{className:"text-[9px] font-black text-amber-300 shrink-0",children:[' + d0_pct + ',"%"]})]}),' +
  'n.jsx("div",{className:"inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-black font-black text-5xl sm:text-6xl shadow-glow-gold transform hover:scale-110 transition-transform duration-300 select-none shrink-0 my-1",children:' + d0_digit + '}),' +
  'n.jsxs("span",{className:"text-[10px] text-gray-300 font-bold",children:["โอกาส ",n.jsx("strong",{className:"text-amber-300 font-black",children:(' + d0_pct + ')+"%"})]}),' +
  'n.jsx("div",{className:"w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-amber-500/20",children:n.jsx("div",{className:"bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500",style:{width:Math.min(100,Math.max(10,' + d0_pct + '))+"%"}})}),' +
  'n.jsx("div",{className:"mt-0.5",children:M(' + d0_digit + ')})' +
']})';

const card1Inner2 = 'n.jsxs("div",{className:"bg-nikkei-card/90 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-1.5 relative shadow-sm",children:[' +
  'n.jsxs("div",{className:"w-full flex items-center justify-between gap-0.5",children:[n.jsx("span",{className:"text-[10px] font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate",children:"★ เลขรอง"}),n.jsxs("span",{className:"text-[9px] font-black text-cyan-300 shrink-0",children:[' + d1_pct + ',"%"]})]}),' +
  'n.jsx("div",{className:"inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-200 text-black font-black text-5xl sm:text-6xl shadow-glow-cyan transform hover:scale-110 transition-transform duration-300 select-none shrink-0 my-1",children:' + d1_digit + '}),' +
  'n.jsxs("span",{className:"text-[10px] text-gray-300 font-bold",children:["โอกาส ",n.jsx("strong",{className:"text-cyan-300 font-black",children:(' + d1_pct + ')+"%"})]}),' +
  'n.jsx("div",{className:"w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-cyan-500/20",children:n.jsx("div",{className:"bg-gradient-to-r from-cyan-500 to-teal-300 h-full rounded-full transition-all duration-500",style:{width:Math.min(100,Math.max(10,' + d1_pct + '))+"%"}})}),' +
  'n.jsx("div",{className:"mt-0.5",children:M(' + d1_digit + ')})' +
']})';

const card1Body = 'n.jsxs("div",{className:"grid grid-cols-2 gap-2 my-auto py-0.5",children:[' + card1Inner1 + ',' + card1Inner2 + ']})';
const card1Footer = 'n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1",children:[' + zapSvgAmber + ',n.jsxs("span",{className:"truncate",children:["รูดประจำวัน",h.dayName," เน้น ",' + d0_digit + '," - ",' + d1_digit + ']})]})';
const card1Box = 'n.jsxs("div",{className:"bg-nikkei-dark/90 border border-amber-500/40 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5",children:[' + card1Header + ',' + card1Body + ',' + card1Footer + ']})';

const card2Header = 'n.jsxs("div",{className:"flex items-center justify-between border-b border-cyan-500/20 pb-1.5",children:[n.jsxs("span",{className:"text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 truncate",children:[' + zapSvgCyan + ',"✨ ชุดเจาะ 2 ตัว (เน้นประจำวัน",h.dayName,")"]}),n.jsx("span",{className:"text-[9px] text-cyan-300 font-extrabold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded shrink-0",children:"เน้น 6 ชุด"})]})';
const top6Grid = 'n.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 gap-1.5 my-auto py-0.5",children:h.top2DPairs.slice(0,6).map((b,idx)=>{const isM=idx<3,C=o==="HANOI"?Xy(String(b.pair),O):Zy(String(b.pair),O),R=o==="HANOI"?_:m;return n.jsxs("div",{className:"border rounded-xl p-1.5 text-center flex flex-col items-center justify-between min-h-[68px] transition-all duration-300 "+(isM?"bg-amber-500/10 border-amber-500/40 hover:border-amber-400":"bg-cyan-500/10 border-cyan-500/40 hover:border-cyan-400"),children:[n.jsxs("div",{className:"w-full",children:[n.jsx("span",{className:"text-[8px] font-extrabold block text-center "+(isM?"text-amber-400":"text-cyan-300"),children:isM?"★ เด่น":"✨ รอง"}),n.jsx("span",{className:"text-base font-black font-mono tracking-wider block my-0.5 "+(isM?"text-amber-300":"text-cyan-300"),children:b.pair}),n.jsxs("span",{className:"text-[8px] font-bold text-gray-400 block",children:["ออก ",b.count," ครั้ง"]})]}),n.jsx("div",{className:"mt-0.5 flex flex-wrap items-center justify-center gap-0.5 w-full",children:g||O.length===0||l==="NEXT"?n.jsx("span",{className:"text-[8px] text-amber-400/80 font-bold",children:"⏳ รอผล"}):C.length>0?C.map(L=>n.jsxs("span",{className:"text-[8px] font-black px-1 py-0.5 rounded border flex items-center justify-center gap-0.5 "+L.badgeColor,children:["✓ ",L.shortLabel," ",n.jsxs("span",{className:"text-white font-bold",children:["[",L.position,"]"]})]},L.session)):R?n.jsx("span",{className:"text-[8px] text-red-400/70 font-semibold",children:"❌ ไม่เข้า"}):n.jsx("span",{className:"text-[8px] text-amber-400/80 font-bold",children:"⏳ รอผล"})})]},b.pair)})})';
const card2Footer = 'n.jsxs("div",{className:"bg-cyan-500/10 border border-cyan-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-cyan-300 truncate",children:["⚡ สแกนสถิติออกซ้ำ 2 ตัวประจำวัน",h.dayName," (3 เด่นหลัก / 3 เด่นรอง)"]})';
const card2Box = 'n.jsxs("div",{className:"bg-nikkei-dark/90 border border-cyan-500/40 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5",children:[' + card2Header + ',' + top6Grid + ',' + card2Footer + ']})';

const trophySvg = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-3.5 h-3.5 text-amber-400 shrink-0",children:[n.jsx("path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6"}),n.jsx("path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18"}),n.jsx("path",{d:"M4 22h16"}),n.jsx("path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"}),n.jsx("path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"}),n.jsx("path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2z"})]})';
const trophyEmeraldSvg = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-3.5 h-3.5 text-emerald-400 shrink-0",children:[n.jsx("path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6"}),n.jsx("path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18"}),n.jsx("path",{d:"M4 22h16"}),n.jsx("path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"}),n.jsx("path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"}),n.jsx("path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2z"})]})';
const xCircleSvg = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"w-3.5 h-3.5 text-red-400 shrink-0",children:[n.jsx("circle",{cx:"12",cy:"12",r:"10"}),n.jsx("path",{d:"m15 9-6 6"}),n.jsx("path",{d:"m9 9 6 6"})]})';
const checkSvgEmerald = 'n.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",className:"w-3.5 h-3.5 text-emerald-400 shrink-0",children:[n.jsx("path",{d:"M20 6 9 17l-5-5"})]})';

const card3Header = 'n.jsxs("div",{className:"flex items-center justify-between border-b border-amber-500/20 pb-1.5 mb-2",children:[n.jsxs("span",{className:"text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5",children:[' + trophySvg + ',"เปรียบเทียบผล"]}),n.jsx("span",{className:"text-[10px] text-amber-300 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20",children:(typeof E==="string"&&E?E:h.dayName)})]})';

const card3CalcBox = 'n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5",children:[n.jsxs("span",{className:"text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider mb-1 flex items-center justify-between",children:[n.jsx("span",{children:"🔮 ผลตามที่คำนวณไว้:"}),n.jsx("span",{className:"text-[9px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded",children:"สูตรคำนวณ"})]}),n.jsxs("div",{className:"text-xs text-gray-200 space-y-0.5 font-medium",children:[n.jsxs("div",{className:"flex justify-between",children:[n.jsx("span",{className:"text-gray-400",children:"เด่นหลัก (รูด):"}),n.jsx("strong",{className:"text-amber-300 font-bold",children:' + d0_digit + '})]}),n.jsxs("div",{className:"flex justify-between",children:[n.jsx("span",{className:"text-gray-400",children:"เลขรอง:"}),n.jsx("strong",{className:"text-cyan-300 font-bold",children:' + d1_digit + '})]}),n.jsxs("div",{className:"flex justify-between",children:[n.jsx("span",{className:"text-gray-400",children:"2 ตัวเน้น:"}),n.jsx("strong",{className:"text-amber-300 font-bold",children:h.top2DPairs.slice(0,3).map(p=>p.pair).join(", ")})]}),n.jsxs("div",{className:"flex justify-between",children:[n.jsx("span",{className:"text-gray-400",children:"3 ตัวเน้น:"}),n.jsx("strong",{className:"text-cyan-300 font-bold",children:(h.top2DPairs[0]&&h.top2DPairs[1]?(' + d0_digit + ')+""+h.top2DPairs[0].pair+", "+(' + d1_digit + ')+""+h.top2DPairs[1].pair:"-")})]})]})]})';

const card3ActualBox = '((()=>{' +
  'const regSess=[' +
    '{k:"NIKKEI_MORNING",a:["MORNING"],l:"☀️ นิเคอิ เช้า"},' +
    '{k:"CHINA_MORNING",a:[],l:"🧧 จีน เช้า"},' +
    '{k:"HANGSENG_MORNING",a:[],l:"🐉 ฮั่งเส็ง เช้า"},' +
    '{k:"NIKKEI_AFTERNOON",a:["AFTERNOON"],l:"🌤️ นิเคอิ บ่าย"},' +
    '{k:"CHINA_AFTERNOON",a:[],l:"🏮 จีน บ่าย"},' +
    '{k:"HANGSENG_AFTERNOON",a:[],l:"🏛️ ฮั่งเส็ง บ่าย"}' +
  '];' +
  'const vipSess=[' +
    '{k:"NIKKEI_VIP_MORNING",a:[],l:"💎 นิเคอิ VIP เช้า"},' +
    '{k:"CHINA_VIP_MORNING",a:[],l:"🏮 จีน VIP เช้า"},' +
    '{k:"HANGSENG_VIP_MORNING",a:[],l:"🏛️ ฮั่งเส็ง VIP เช้า"},' +
    '{k:"NIKKEI_VIP_AFTERNOON",a:[],l:"💎 นิเคอิ VIP บ่าย"},' +
    '{k:"CHINA_VIP_AFTERNOON",a:[],l:"🏮 จีน VIP บ่าย"},' +
    '{k:"HANGSENG_VIP_AFTERNOON",a:[],l:"🏛️ ฮั่งเส็ง VIP บ่าย"}' +
  '];' +
  'if(o==="HANOI"){' +
    'const sp=O.find(d=>d.session==="HANOI_SPECIAL"),ev=O.find(d=>d.session==="HANOI_EVENING"),vp=O.find(d=>d.session==="HANOI_VIP");' +
    'const list=[{l:"🟠 ฮานอยพิเศษ (17:30)",d:sp},{l:"🔴 ฮานอยปกติ (18:30)",d:ev},{l:"🟣 ฮานอย VIP (19:30)",d:vp}];' +
    'return n.jsxs("div",{className:"bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1",children:[' +
      'n.jsxs("span",{className:"text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between",children:[n.jsxs("span",{className:"flex items-center gap-1",children:[' + trophyEmeraldSvg + ',"🏆 ผลออกจริง 3 ฮานอย:"]}),n.jsx("span",{className:"text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse",children:"3 รอบ"})]}),' +
      'list.map((item,idx)=>n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[' +
        'n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:item.l})}),' +
        'item.d&&item.d.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[' +
          'n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:item.d.top3})]}),' +
          'n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:item.d.top2||item.d.top3.slice(1)})]}),' +
          'n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:item.d.bottom2})]})' +
        ']}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})' +
      ']},idx))' +
    ']});' +
  '}else if(o==="NIKKEI"||o==="STOCKS_VIP"){' +
    'const sList=o==="STOCKS_VIP"?vipSess:regSess;' +
    'return n.jsxs("div",{className:"bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar",children:[' +
      'n.jsxs("span",{className:"text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between mb-1",children:[n.jsxs("span",{className:"flex items-center gap-1.5",children:[' + trophyEmeraldSvg + ',"🏆 ผลออกจริง 6 รอบหุ้น:"]}),n.jsx("span",{className:"text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse",children:"6 รอบ"})]}),' +
      'sList.map((s,idx)=>{' +
        'const draw=O.find(d=>d.session===s.k||(s.a&&s.a.includes(d.session)));' +
        'return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[' +
          'n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:s.l})}),' +
          'draw&&draw.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[' +
            'n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:draw.top3})]}),' +
            'n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:draw.top2||draw.top3.slice(1)})]}),' +
            'n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:draw.bottom2})]})' +
          ']}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})' +
        ']},idx);' +
      '})' +
    ']});' +
  '}else if(O.length>1){' +
    'const sorted=[...O].sort((a,b)=>((W[a.session]||99)-(W[b.session]||99)));' +
    'return n.jsxs("div",{className:"bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar",children:[' +
      'n.jsxs("span",{className:"text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between mb-1",children:[n.jsxs("span",{className:"flex items-center gap-1.5",children:[' + trophyEmeraldSvg + ',"🏆 ผลออกจริง (",sorted.length," รอบ):"]}),n.jsx("span",{className:"text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse",children:[sorted.length," รอบ"]})]}),' +
      'sorted.map((d,idx)=>{' +
        'const sessLabel=((s)=>{' +
          'const m={' +
            '"HANGSENG_VIP_AFTERNOON":"🐉 ฮั่งเส็ง VIP บ่าย",' +
            '"CHINA_VIP_AFTERNOON":"🏮 จีน VIP บ่าย",' +
            '"NIKKEI_VIP_AFTERNOON":"💎 นิเคอิ VIP บ่าย",' +
            '"HANGSENG_VIP_MORNING":"🏛️ ฮั่งเส็ง VIP เช้า",' +
            '"CHINA_VIP_MORNING":"🏮 จีน VIP เช้า",' +
            '"NIKKEI_VIP_MORNING":"💎 นิเคอิ VIP เช้า",' +
            '"HANGSENG_MORNING":"🐉 ฮั่งเส็ง เช้า",' +
            '"HANGSENG_AFTERNOON":"🏛️ ฮั่งเส็ง บ่าย",' +
            '"CHINA_MORNING":"🧧 จีน เช้า",' +
            '"CHINA_AFTERNOON":"🏮 จีน บ่าย",' +
            '"NIKKEI_MORNING":"☀️ นิเคอิ เช้า",' +
            '"MORNING":"☀️ นิเคอิ เช้า",' +
            '"NIKKEI_AFTERNOON":"🌤️ นิเคอิ บ่าย",' +
            '"AFTERNOON":"🌤️ นิเคอิ บ่าย"' +
          '};' +
          'if(m[s]) return m[s];' +
          'return String(s||"").replace(/HANGSENG/g,"ฮั่งเส็ง").replace(/CHINA/g,"จีน").replace(/NIKKEI/g,"นิเคอิ").replace(/MORNING/g,"เช้า").replace(/AFTERNOON/g,"บ่าย").replace(/_/g," ");' +
        '})(d.session);' +
        'return n.jsxs("div",{className:"bg-black/50 p-1 rounded-lg border border-emerald-500/30",children:[' +
          'n.jsx("div",{className:"flex justify-between items-center mb-0.5",children:n.jsx("span",{className:"text-[10px] font-bold text-amber-300",children:sessLabel})}),' +
          'd&&d.top3?n.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[' +
            'n.jsxs("span",{className:"text-gray-300",children:["3 บน: ",n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:d.top3})]}),' +
            'n.jsxs("span",{className:"text-gray-300",children:["2 บน: ",n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:d.top2||d.top3.slice(1)})]}),' +
            'n.jsxs("span",{className:"text-gray-300",children:["2 ล่าง: ",n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:d.bottom2})]})' +
          ']}):n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})' +
        ']},idx);' +
      '})' +
    ']});' +
  '}else{' +
    'const lat=O[0];' +
    'return n.jsxs("div",{className:"bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2.5 shadow-glow-emerald space-y-1",children:[' +
      'n.jsxs("span",{className:"text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between",children:[n.jsxs("span",{className:"flex items-center gap-1.5",children:[' + trophyEmeraldSvg + ',"🏆 ผลออกจริง:"]}),n.jsx("span",{className:"text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse",children:"ผลรางวัล"})]}),' +
      'lat&&lat.top3?n.jsxs("div",{className:"space-y-1",children:[' +
        'n.jsxs("div",{className:"flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30",children:[n.jsx("span",{className:"text-[10px] text-gray-300 font-extrabold",children:"3 ตัวบน:"}),n.jsx("strong",{className:"text-yellow-300 text-base font-black font-mono tracking-wider",children:lat.top3})]}),' +
        'n.jsxs("div",{className:"flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30",children:[n.jsx("span",{className:"text-[10px] text-gray-300 font-extrabold",children:"2 ตัวบน:"}),n.jsx("strong",{className:"text-amber-300 text-base font-black font-mono tracking-wider",children:lat.top2||lat.top3.slice(1)})]}),' +
        'n.jsxs("div",{className:"flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30",children:[n.jsx("span",{className:"text-[10px] text-gray-300 font-extrabold",children:"2 ตัวล่าง:"}),n.jsx("strong",{className:"text-cyan-300 text-base font-black font-mono tracking-wider",children:lat.bottom2})]})' +
      ']}):n.jsx("div",{className:"bg-black/50 p-2 rounded-lg text-center",children:n.jsx("span",{className:"text-[10px] text-amber-300/80 font-semibold italic",children:"⏳ รอประกาศผล"})})' +
    ']});' +
  '}' +
'})())';

const card3StatusFooter = '((()=>{' +
  'if(g||O.length===0||l==="NEXT") return n.jsx("span",{className:"bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 inline-flex items-center gap-1",children:"⏳ รอประกาศผล"});' +
  'const res0=o==="HANOI"?Uy(String(' + d0_digit + '),O):Qy(String(' + d0_digit + '),O);' +
  'const res1=o==="HANOI"?Uy(String(' + d1_digit + '),O):Qy(String(' + d1_digit + '),O);' +
  'const isHit=(res0&&res0.length>0)||(res1&&res1.length>0);' +
  'const rec=o==="HANOI"?_:m;' +
  'if(isHit) return n.jsxs("span",{className:"bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/40 inline-flex items-center gap-1 shadow-glow-emerald",children:[' + checkSvgEmerald + ',"✓ เข้าเป้าตามสูตร"]});' +
  'if(rec) return n.jsxs("span",{className:"bg-red-500/20 text-red-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-red-500/40 inline-flex items-center gap-1",children:[' + xCircleSvg + ',"❌ ไม่เข้าเป้า"]});' +
  'return n.jsx("span",{className:"bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 inline-flex items-center gap-1",children:"⏳ รอประกาศผล"});' +
'})())';

const card3Box = 'n.jsxs("div",{className:"bg-nikkei-dark/90 border border-amber-500/50 hover:border-amber-400 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-glow-gold",children:[n.jsxs("div",{className:"space-y-2",children:[' + card3Header + ',' + card3ActualBox + ']}),n.jsx("div",{className:"pt-2 border-t border-gray-800 text-center flex items-center justify-center",children:' + card3StatusFooter + '})]})';

const threeSideBySideCards = 'n.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch",children:[' + card1Box + ',' + card2Box + ',' + card3Box + ']})';

const replacementBlock = 'h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border-2 border-amber-400 rounded-2xl p-5 shadow-glow-gold space-y-4",children:[' + topDiv + ',' + threeSideBySideCards + ']})';

const bannerStartStr = 'h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r';
const startIdx = code.indexOf(bannerStartStr);
const endIdx = code.indexOf(',s0=["มกราคม"', startIdx);

console.log('startIdx:', startIdx);
console.log('endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacementBlock + ']})}' + code.substring(endIdx);
  console.log('Successfully replaced DayOfWeekAnalyzer block with clean safe code!');
} else {
  console.error('Could not find start/end indices!');
  process.exit(1);
}

// Verify JavaScript syntax before writing
try {
  new vm.Script(code);
  console.log('🎉🎉🎉 SUCCESS! vm.Script compiled patched code PERFECTLY WITH ZERO SYNTAX ERRORS!');
} catch (syntaxErr) {
  console.error('❌ Syntax error message:', syntaxErr.message);
  process.exit(1);
}

// Generate index.html content
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

  fs.writeFileSync(path.join(assetsDir, 'index-CN-5_2d9.js'), code, 'utf8');
  fs.writeFileSync(path.join(assetsDir, 'index-DrChOO4P.js'), code, 'utf8');

  fs.copyFileSync(srcCssPath, path.join(assetsDir, 'index-Cip8XUMO.css'));
  fs.copyFileSync(srcCssPath, path.join(assetsDir, 'index-CF9Ii_kx.css'));

  fs.writeFileSync(path.join(dir, 'index.html'), htmlContent, 'utf8');

  console.log('Successfully written complete assets & html to:', dir);
}
