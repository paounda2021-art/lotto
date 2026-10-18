const fs = require('fs');

fetch('https://lotto289.paounda2021.workers.dev/api/draws')
  .then(r => r.json())
  .then(d => {
    const ds = d.datasets;
    const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
    const vm = require('vm');
    
    const targetDate = '2026-10-18';
    const O = [
      ds['lotto_data_nikkei_vip_morning'].find(x => x.date === targetDate),
      ds['lotto_data_china_vip_morning'].find(x => x.date === targetDate),
      ds['lotto_data_hangseng_vip_morning'].find(x => x.date === targetDate),
      ds['lotto_data_nikkei_vip_afternoon'].find(x => x.date === targetDate),
      ds['lotto_data_china_vip_afternoon'].find(x => x.date === targetDate),
      ds['lotto_data_hangseng_vip_afternoon'].find(x => x.date === targetDate)
    ].filter(Boolean);

    const a = O;
    
    const ctx = {
      window: {},
      console: console,
      O: O,
      a: a,
      g: false,
      localStorage: {
        getItem: (key) => ds[key] ? JSON.stringify(ds[key]) : null
      }
    };
    vm.createContext(ctx);
    
    const helperEnd = code.indexOf('window._getHitRoundText = _getHitRoundText;') + 44;
    vm.runInContext(code.substring(0, helperEnd), ctx);
    
    const pStart = code.indexOf('const getWinningSetsHelper = (dayCode, cat, time) => {');
    const pEnd = code.indexOf('const renderStockSession = (dayCode, cat, time) => {');
    vm.runInContext('var ' + code.substring(pStart + 6, pEnd), ctx);
    
    console.log('=== VIP MORNING (Sun 18 Oct) ===');
    const mRes = vm.runInContext("getWinningSetsHelper('Sun', 'vip', 'Morning')", ctx);
    for (const [k, v] of mRes.win2DRounds.entries()) {
      console.log('VIP Morning 2D', k, '->', Array.from(v));
    }
    
    console.log('=== VIP AFTERNOON (Sun 18 Oct) ===');
    const aRes = vm.runInContext("getWinningSetsHelper('Sun', 'vip', 'Afternoon')", ctx);
    for (const [k, v] of aRes.win2DRounds.entries()) {
      console.log('VIP Afternoon 2D', k, '->', Array.from(v));
    }
  });
