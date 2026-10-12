const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcPath, 'utf8');

// 0. Fix any broken const chain around h and draws:O
const brokenH = 'h=W.useMemo(()=>Ey(T,r),[T,r]);W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)';
const cleanH = 'h=W.useMemo(()=>Ey(T,r),[T,r]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)';
if (code.includes(brokenH)) {
  code = code.replace(brokenH, cleanH);
  console.log('Fixed broken const chain around h and draws:O.');
}

// 1. Line buttons patches
if (!code.includes('btn-line-settings-jsx')) {
  const target1 = 'n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]}),';
  const repl1 = 'n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]}),n.jsx("button",{id:"btn-line-settings-jsx",onClick:()=>window.openLineSettingsModal&&window.openLineSettingsModal(),title:"ตั้งค่าแจ้งเตือนผลเข้ากลุ่ม LINE",className:"btn-line-nav",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"12px",padding:"6px 14px",borderRadius:"8px",display:"inline-flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 10px rgba(6, 199, 85, 0.5)",marginLeft:"6px",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"💬 แจ้งเตือน LINE"})]}),';
  if (code.includes(target1)) code = code.replace(target1, repl1);
}

// Revert card-level LINE buttons (hide per user request: "ขอซ่อนปุ่มไลน์ในการ์ดด้านล่างไว้ก่อน ให้เหลือไว้เฉพาะบนหัวเว็บ")
const repl2 = 'n.jsxs(n.Fragment,{children:[n.jsx(Ld,{className:"w-4 h-4"}),n.jsx("span",{children:"คัดลอกแนวทาง"})]})}),n.jsx("button",{id:"btn-line-send-day-jsx",onClick:(e)=>window.sendCurrentResultToLine&&window.sendCurrentResultToLine(e.currentTarget),title:"ส่งผลรางวัลและเลขเด่นเข้า LINE",className:"btn-line-send",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"13px",padding:"10px 16px",borderRadius:"12px",display:"inline-flex",alignItems:"center",gap:"8px",cursor:"pointer",boxShadow:"0 4px 14px rgba(6, 199, 85, 0.5)",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"📲 ส่งผลเข้า LINE"})]})]})]}),';
const orig2 = 'n.jsxs(n.Fragment,{children:[n.jsx(Ld,{className:"w-4 h-4"}),n.jsx("span",{children:"คัดลอกแนวทาง"})]})})]})]}),';
if (code.includes(repl2)) {
  code = code.replace(repl2, orig2);
  console.log('Reverted btn-line-send-day-jsx from DayOfWeekAnalyzer card.');
}

const repl3 = 'n.jsx("span",{children:"คัดลอกแนวทาง"})]}),n.jsx("button",{id:"btn-line-send-result-jsx",onClick:(e)=>window.sendCurrentResultToLine&&window.sendCurrentResultToLine(e.currentTarget),title:"ส่งผลรางวัลและสรุปเลขเข้า LINE",className:"btn-line-send",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"13px",padding:"10px 16px",borderRadius:"12px",display:"inline-flex",alignItems:"center",gap:"8px",cursor:"pointer",boxShadow:"0 4px 14px rgba(6, 199, 85, 0.5)",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"📲 ส่งผลเข้า LINE"})]})]})';
const orig3 = 'n.jsx("span",{children:"คัดลอกแนวทาง"})]})]})';
if (code.includes(repl3)) {
  code = code.replace(repl3, orig3);
  console.log('Reverted btn-line-send-result-jsx from PredictionCard.');
}

// 2. Day sync patches
if (!code.includes('__CURRENT_ACTIVE_DAY__')) {
  const t3 = 'W.useEffect(()=>{d(i),s("NEXT")},[i]),';
  const r3 = 'W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=i;localStorage.setItem("lotto_selected_day",i)}catch(err){}d(i),s("NEXT")},[i]),';

  const tu = 'u=b=>{s(b),b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';
  const ru = 'u=b=>{s(b);const tg=b==="NEXT"?i:(b==="VERIFY"&&N!=null&&N.dayOfWeek?N.dayOfWeek:r);try{window.__CURRENT_ACTIVE_DAY__=tg;localStorage.setItem("lotto_selected_day",tg)}catch(err){}b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';

  const tp = 'p=b=>{d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';
  const rp = 'p=b=>{try{window.__CURRENT_ACTIVE_DAY__=b;localStorage.setItem("lotto_selected_day",b)}catch(err){}d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';

  if (code.includes(t3)) code = code.replace(t3, r3);
  if (code.includes(tu)) code = code.replace(tu, ru);
  if (code.includes(tp)) code = code.replace(tp, rp);
  console.log('Applied day sync handlers to index JS.');
}

// Safely add useEffect for current day and h after M declaration ends (so const chain is never broken)
if (!code.includes('window.__CURRENT_STAT_H__=h')) {
  const targetAfterM = 'children:"❌ ไม่เข้า"})}};';
  const replAfterM = 'children:"❌ ไม่เข้า"})}};W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]);';
  if (code.includes(targetAfterM)) {
    code = code.replace(targetAfterM, replAfterM);
    console.log('Placed __CURRENT_STAT_H__ effect safely after M statement.');
  }
}

// 3. Laos next draw weekend skip patch
const targetW2 = ';if(t==="LAOS")return o.setDate(o.getDate()+1),o;if(t==="NIKKEI"||t==="DOWJONES"){for(o.setDate(o.getDate()+1);o.getDay()===0||o.getDay()===6;)o.setDate(o.getDate()+1);return o}';
const replW2 = ';if(t==="NIKKEI"||t==="DOWJONES"||t==="LAOS"){for(o.setDate(o.getDate()+1);o.getDay()===0||o.getDay()===6;)o.setDate(o.getDate()+1);return o}';

if (code.includes(targetW2)) {
  code = code.replace(targetW2, replW2);
  console.log('Applied Laos w2 weekend skip patch.');
}

const targetYy = 'Yy=(e,t)=>{const o=t==="NIKKEI"?"Mon":t==="MALAY"?"Wed":"Sat";';
const replYy = 'Yy=(e,t)=>{const o=t==="NIKKEI"||t==="LAOS"||t==="DOWJONES"?"Mon":t==="MALAY"?"Wed":"Sat";';

if (code.includes(targetYy)) {
  code = code.replace(targetYy, replYy);
  console.log('Applied Laos Yy next day fallback patch.');
}

fs.writeFileSync('scratch/index_patched.js', code, 'utf8');
console.log('Saved scratch/index_patched.js successfully.');
