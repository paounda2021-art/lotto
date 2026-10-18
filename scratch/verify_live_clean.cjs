fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js')
  .then(r => r.text())
  .then(t => {
    console.log('Live Cloudflare Workers has clean const chain:', t.includes('h=W.useMemo(()=>Ey(T,r),[T,r]),{draws:O,isFuture:g,isAllRecorded:f}=d0(a,r,i)'));
    console.log('Live Cloudflare Workers has safe useEffect after M:', t.includes('children:"❌ ไม่เข้า"})}};W.useEffect(()=>{try{window.__CURRENT_ACTIVE_DAY__=r;window.__CURRENT_STAT_H__=h;localStorage.setItem("lotto_selected_day",r)}catch(err){}},[r,h]);'));
  })
  .catch(e => console.error(e));
