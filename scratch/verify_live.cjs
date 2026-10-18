fetch('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js')
  .then(r => r.text())
  .then(t => {
    console.log('Live Cloudflare Workers has Laos w2 fix:', t.includes('t==="NIKKEI"||t==="DOWJONES"||t==="LAOS"'));
    console.log('Live Cloudflare Workers has Laos Yy fix:', t.includes('t==="NIKKEI"||t==="LAOS"||t==="DOWJONES"'));
  })
  .catch(e => console.error(e));
