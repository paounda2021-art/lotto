const fs = require('fs');
['dist/assets/index-CN-5_2d9.js', 'downloaded_target_worker/assets/index-CN-5_2d9.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const t1 = 'p=d_[i.getUTCDay()],T=String(e.lottosNumber).trim(),h=T.length>=3?T.slice(-3):T.padStart(3,"0"),O=h.slice(-2),g=String(e.lottosUnder).trim().padStart(2,"0");return';
  const t2 = 'for(const Et of B2){const To=Qt.findIndex(zN=>zN.date===Et.date);To>=0?(Qt[To].top3!==Et.top3||Qt[To].bottom2!==Et.bottom2||(!Qt[To].full5&&Et.full5)||(!Qt[To].prize5d&&Et.prize5d)||(!Qt[To].full6D&&Et.full6D))&&(Qt[To]={...Qt[To],...Et},dr++):(Qt.unshift(Et),dr++)}';
  const t3 = 'Lo=K=>{const x=K.session?K.session.toLowerCase():K.lotteryType.toLowerCase(),P={...K,id:`${x}_${Date.now()}`},$=B=>[...B].sort((_e,ut)=>(ut.date||"").localeCompare(_e.date||""));';
  const t4 = 'const i=localStorage.getItem(e);if(i){const r=JSON.parse(i);if(Array.isArray(r)&&r.length>0)return r.map(Jr)}';
  const t5 = 'children:[n.jsx(Py,{className:"w-3.5 h-3.5 text-emerald-400 animate-spin-slow"}),n.jsx("span",{children:"🔄 ดึงผลรางวัลด่วน (Auto-Sync)"})]})';
  const t6 = 'W.useEffect(()=>{ka(!0)},[]);';

  console.log('--- ' + file + ' ---');
  console.log('T1:', content.includes(t1));
  console.log('T2:', content.includes(t2));
  console.log('T3:', content.includes(t3));
  console.log('T4:', content.includes(t4));
  console.log('T5:', content.includes(t5));
  console.log('T6:', content.includes(t6));
});
