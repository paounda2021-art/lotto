fetch('http://localhost:5173/assets/index-CN-5_2d9.js')
  .then(r => r.text())
  .then(t => {
    console.log('Clean const chain around h and draws:O exists on local server:', t.includes('h=W.useMemo(()=>Ey(T,r),[T,r]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)'));
    console.log('Safe useEffect after M exists on local server:', t.includes('children:"❌ ไม่เข้า"})}};W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]);'));
  })
  .catch(e => console.error(e));
