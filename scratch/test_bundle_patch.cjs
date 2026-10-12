const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcPath, 'utf8');

// 1. Line buttons patches
if (!code.includes('btn-line-settings-jsx')) {
  const target1 = 'n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]}),';
  const repl1 = 'n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]}),n.jsx("button",{id:"btn-line-settings-jsx",onClick:()=>window.openLineSettingsModal&&window.openLineSettingsModal(),title:"ตั้งค่าแจ้งเตือนผลเข้ากลุ่ม LINE",className:"btn-line-nav",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"12px",padding:"6px 14px",borderRadius:"8px",display:"inline-flex",alignItems:"center",gap:"6px",cursor:"pointer",boxShadow:"0 2px 10px rgba(6, 199, 85, 0.5)",marginLeft:"6px",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"💬 แจ้งเตือน LINE"})]}),';
  if (code.includes(target1)) code = code.replace(target1, repl1);

  const target2 = 'n.jsxs(n.Fragment,{children:[n.jsx(Ld,{className:"w-4 h-4"}),n.jsx("span",{children:"คัดลอกแนวทาง"})]})})]})]}),';
  const repl2 = 'n.jsxs(n.Fragment,{children:[n.jsx(Ld,{className:"w-4 h-4"}),n.jsx("span",{children:"คัดลอกแนวทาง"})]})}),n.jsx("button",{id:"btn-line-send-day-jsx",onClick:(e)=>window.sendCurrentResultToLine&&window.sendCurrentResultToLine(e.currentTarget),title:"ส่งผลรางวัลและเลขเด่นเข้า LINE",className:"btn-line-send",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"13px",padding:"10px 16px",borderRadius:"12px",display:"inline-flex",alignItems:"center",gap:"8px",cursor:"pointer",boxShadow:"0 4px 14px rgba(6, 199, 85, 0.5)",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"📲 ส่งผลเข้า LINE"})]})]})]}),';
  if (code.includes(target2)) code = code.replace(target2, repl2);

  const target3 = 'n.jsx("span",{children:"คัดลอกแนวทาง"})]})]})';
  const repl3 = 'n.jsx("span",{children:"คัดลอกแนวทาง"})]}),n.jsx("button",{id:"btn-line-send-result-jsx",onClick:(e)=>window.sendCurrentResultToLine&&window.sendCurrentResultToLine(e.currentTarget),title:"ส่งผลรางวัลและสรุปเลขเข้า LINE",className:"btn-line-send",style:{backgroundColor:"#06c755",color:"#ffffff",border:"1px solid #05a043",fontWeight:800,fontSize:"13px",padding:"10px 16px",borderRadius:"12px",display:"inline-flex",alignItems:"center",gap:"8px",cursor:"pointer",boxShadow:"0 4px 14px rgba(6, 199, 85, 0.5)",textShadow:"0 1px 2px rgba(0,0,0,0.2)"},children:[n.jsx("span",{style:{color:"#ffffff",fontWeight:800},children:"📲 ส่งผลเข้า LINE"})]})]})';
  if (code.includes(target3)) code = code.replace(target3, repl3);
}

// 2. Day sync patches
if (!code.includes('__CURRENT_ACTIVE_DAY__')) {
  const t3 = 'W.useEffect(()=>{d(i),s("NEXT")},[i]),';
  const r3 = 'W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=i;localStorage.setItem("lotto_selected_day",i)}catch(err){}d(i),s("NEXT")},[i]),';

  const tu = 'u=b=>{s(b),b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';
  const ru = 'u=b=>{s(b);const tg=b==="NEXT"?i:(b==="VERIFY"&&N!=null&&N.dayOfWeek?N.dayOfWeek:r);try{window.__CURRENT_ACTIVE_DAY__=tg;localStorage.setItem("lotto_selected_day",tg)}catch(err){}b==="NEXT"?d(i):b==="VERIFY"&&(N!=null&&N.dayOfWeek)&&d(N.dayOfWeek)}';

  const tp = 'p=b=>{d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';
  const rp = 'p=b=>{try{window.__CURRENT_ACTIVE_DAY__=b;localStorage.setItem("lotto_selected_day",b)}catch(err){}d(b),b===i?s("NEXT"):N!=null&&N.dayOfWeek&&b===N.dayOfWeek&&s("VERIFY")}';

  const th = 'h=W.useMemo(()=>Ey(T,r),[T,r])';
  const rh = 'h=W.useMemo(()=>Ey(T,r),[T,r]);W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h])';

  if (code.includes(t3)) code = code.replace(t3, r3);
  if (code.includes(tu)) code = code.replace(tu, ru);
  if (code.includes(tp)) code = code.replace(tp, rp);
  if (code.includes(th)) code = code.replace(th, rh);
  console.log('Applied day sync patches to index JS.');
}

fs.writeFileSync('scratch/index_patched.js', code, 'utf8');
console.log('Saved scratch/index_patched.js successfully.');
