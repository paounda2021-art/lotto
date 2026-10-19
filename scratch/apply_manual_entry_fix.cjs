const fs = require('fs');

const bundleFiles = [
  'dist/assets/index-CN-5_2d9.js',
  'downloaded_target_worker/assets/index-CN-5_2d9.js'
];

bundleFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. T1: Reject non-numeric draws in N_ (e.g. "งดออกผล", "รอผล")
  const t1 = 'p=d_[i.getUTCDay()],T=String(e.lottosNumber).trim(),h=T.length>=3?T.slice(-3):T.padStart(3,"0"),O=h.slice(-2),g=String(e.lottosUnder).trim().padStart(2,"0");return';
  const r1 = 'p=d_[i.getUTCDay()],T=String(e.lottosNumber).trim(),g=String(e.lottosUnder).trim();if(!/^\\d+$/.test(T)||!/^\\d+$/.test(g))return null;const h=T.length>=3?T.slice(-3):T.padStart(3,"0"),O=h.slice(-2);return';

  if (content.includes(t1)) {
    content = content.replace(t1, r1);
    console.log(`[${file}] Patched T1: Auto-fetch non-digit validation`);
  } else {
    console.warn(`[${file}] T1 NOT found`);
  }

  // 2. T2: Protect isManual entries in auto-fetch merge (_e)
  const t2 = 'for(const Et of B2){const To=Qt.findIndex(zN=>zN.date===Et.date);To>=0?(Qt[To].top3!==Et.top3||Qt[To].bottom2!==Et.bottom2||(!Qt[To].full5&&Et.full5)||(!Qt[To].prize5d&&Et.prize5d)||(!Qt[To].full6D&&Et.full6D))&&(Qt[To]={...Qt[To],...Et},dr++):(Qt.unshift(Et),dr++)}';
  const r2 = 'for(const Et of B2){const To=Qt.findIndex(zN=>zN.date===Et.date);To>=0?(!Qt[To].isManual&&(Qt[To].top3!==Et.top3||Qt[To].bottom2!==Et.bottom2||(!Qt[To].full5&&Et.full5)||(!Qt[To].prize5d&&Et.prize5d)||(!Qt[To].full6D&&Et.full6D))&&(Qt[To]={...Qt[To],...Et},dr++)):(Qt.unshift(Et),dr++)}';

  if (content.includes(t2)) {
    content = content.replace(t2, r2);
    console.log(`[${file}] Patched T2: isManual protection from auto-sync overwrite`);
  } else {
    console.warn(`[${file}] T2 NOT found`);
  }

  // 3. T3: Replace/overwrite same date+session in manual add (Lo) and set isManual: true
  const t3 = 'Lo=K=>{const x=K.session?K.session.toLowerCase():K.lotteryType.toLowerCase(),P={...K,id:`${x}_${Date.now()}`},$=B=>[...B].sort((_e,ut)=>(ut.date||"").localeCompare(_e.date||""));';
  const r3 = 'Lo=K=>{const x=K.session?K.session.toLowerCase():K.lotteryType.toLowerCase(),P={...K,id:`${x}_${Date.now()}`,isManual:!0},$=B=>[P,...B.filter(it=>!(it.date===P.date&&(it.session===P.session||(!it.session&&!P.session))))].sort((_e,ut)=>(ut.date||"").localeCompare(_e.date||""));';

  if (content.includes(t3)) {
    content = content.replace(t3, r3);
    console.log(`[${file}] Patched T3: Manual entry replacement & isManual flag`);
  } else {
    console.warn(`[${file}] T3 NOT found`);
  }

  // 4. T4: Filter out any corrupted 'กผล' / 'งดออกผล' from localStorage on load (Se)
  const t4 = 'const i=localStorage.getItem(e);if(i){const r=JSON.parse(i);if(Array.isArray(r)&&r.length>0)return r.map(Jr)}';
  const r4 = 'const i=localStorage.getItem(e);if(i){let r=JSON.parse(i);if(Array.isArray(r)&&r.length>0){r=r.filter(it=>it&&it.top3!=="กผล"&&it.bottom2!=="งดออกผล");return r.map(Jr)}}';

  if (content.includes(t4)) {
    content = content.replace(t4, r4);
    console.log(`[${file}] Patched T4: Clean localStorage corrupted data on load`);
  } else {
    console.warn(`[${file}] T4 NOT found`);
  }

  // 5. T5: Add manual entry button to Navbar next to Auto-Sync
  const t5 = 'children:[n.jsx(Py,{className:"w-3.5 h-3.5 text-emerald-400 animate-spin-slow"}),n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]})';
  const r5 = 'children:[n.jsx(Py,{className:"w-3.5 h-3.5 text-emerald-400 animate-spin-slow"}),n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]}),n.jsxs("button",{onClick:()=>(typeof window.__OPEN_ADD_DRAW_MODAL__==="function"?window.__OPEN_ADD_DRAW_MODAL__():window.dispatchEvent(new CustomEvent("open-add-draw-modal"))),title:"บันทึกผลรางวัลด้วยตนเอง (กรณีเว็บยังไม่มีผลดึงออโต้)",className:"bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-glow-gold cursor-pointer",children:[n.jsx("span",{style:{fontSize:"13px"}},children:"✍️"),n.jsx("span",{children:"บันทึกผลด้วยมือ"})]})';

  if (content.includes(t5)) {
    content = content.replace(t5, r5);
    console.log(`[${file}] Patched T5: Added manual entry button to Navbar`);
  } else {
    console.warn(`[${file}] T5 NOT found`);
  }

  // 6. T6: Initial KV sync & register global window.__OPEN_ADD_DRAW_MODAL__
  const t6 = 'W.useEffect(()=>{ka(!0)},[]);';
  const r6 = 'W.useEffect(()=>{window.__OPEN_ADD_DRAW_MODAL__=()=>{Ut(null),le(!0)};window.addEventListener("open-add-draw-modal",window.__OPEN_ADD_DRAW_MODAL__);try{fetch("/api/draws").then(R=>R.json()).then(R=>{if(R&&R.success&&R.datasets){const S=R.datasets;if(S.lotto_data_nikkei_morning&&Array.isArray(S.lotto_data_nikkei_morning)){const C=S.lotto_data_nikkei_morning.filter(I=>I&&I.top3!=="กผล"&&I.bottom2!=="งดออกผล");C.length>0&&a(C)}S.lotto_data_nikkei_afternoon&&Array.isArray(S.lotto_data_nikkei_afternoon)&&r(S.lotto_data_nikkei_afternoon),S.lotto_data_china_morning&&Array.isArray(S.lotto_data_china_morning)&&l(S.lotto_data_china_morning),S.lotto_data_china_afternoon&&Array.isArray(S.lotto_data_china_afternoon)&&N(S.lotto_data_china_afternoon),S.lotto_data_hangseng_morning&&Array.isArray(S.lotto_data_hangseng_morning)&&u(S.lotto_data_hangseng_morning),S.lotto_data_hangseng_afternoon&&Array.isArray(S.lotto_data_hangseng_afternoon)&&T(S.lotto_data_hangseng_afternoon),S.lotto_data_nikkei_vip_morning&&Array.isArray(S.lotto_data_nikkei_vip_morning)&&O(S.lotto_data_nikkei_vip_morning),S.lotto_data_nikkei_vip_afternoon&&Array.isArray(S.lotto_data_nikkei_vip_afternoon)&&f(S.lotto_data_nikkei_vip_afternoon),S.lotto_data_china_vip_morning&&Array.isArray(S.lotto_data_china_vip_morning)&&m(S.lotto_data_china_vip_morning),S.lotto_data_china_vip_afternoon&&Array.isArray(S.lotto_data_china_vip_afternoon)&&V(S.lotto_data_china_vip_afternoon),S.lotto_data_hangseng_vip_morning&&Array.isArray(S.lotto_data_hangseng_vip_morning)&&F(S.lotto_data_hangseng_vip_morning),S.lotto_data_hangseng_vip_afternoon&&Array.isArray(S.lotto_data_hangseng_vip_afternoon)&&v(S.lotto_data_hangseng_vip_afternoon),S.lotto_data_laos&&Array.isArray(S.lotto_data_laos)&&z(S.lotto_data_laos),S.lotto_data_hanoi_special&&Array.isArray(S.lotto_data_hanoi_special)&&Q(S.lotto_data_hanoi_special),S.lotto_data_hanoi&&Array.isArray(S.lotto_data_hanoi)&&H(S.lotto_data_hanoi),S.lotto_data_hanoi_vip&&Array.isArray(S.lotto_data_hanoi_vip)&&c(S.lotto_data_hanoi_vip)}}).catch(()=>{})}catch{}ka(!0);return()=>window.removeEventListener("open-add-draw-modal",window.__OPEN_ADD_DRAW_MODAL__)},[]);';

  if (content.includes(t6)) {
    content = content.replace(t6, r6);
    console.log(`[${file}] Patched T6: KV initial sync & global modal open handler`);
  } else {
    console.warn(`[${file}] T6 NOT found`);
  }

  // 7. Label update for "+ เพิ่มผลใหม่"
  if (content.includes('children:"+ เพิ่มผลใหม่"')) {
    content = content.replace('children:"+ เพิ่มผลใหม่"', 'children:"+ ✍️ บันทึกผลด้วยมือ"');
    console.log(`[${file}] Patched Button label: "+ ✍️ บันทึกผลด้วยมือ"`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`[${file}] Successfully written! Size: ${content.length}`);
});
