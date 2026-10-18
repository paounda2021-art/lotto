const fs = require('fs');

fetch('https://lotto289.paounda2021.workers.dev/api/draws')
  .then(r => r.json())
  .then(d => {
    const ds = d.datasets;
    const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');
    const vm = require('vm');
    
    const targetDate = '2026-10-16';
    // O has all 6 draws of Friday 16 Oct
    const O = [
      ds['lotto_data_nikkei_morning'].find(x => x.date === targetDate),
      ds['lotto_data_china_morning'].find(x => x.date === targetDate),
      ds['lotto_data_hangseng_morning'].find(x => x.date === targetDate),
      ds['lotto_data_nikkei_afternoon'].find(x => x.date === targetDate),
      ds['lotto_data_china_afternoon'].find(x => x.date === targetDate),
      ds['lotto_data_hangseng_afternoon'].find(x => x.date === targetDate)
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
    
    console.log('=== REGULAR MORNING ===');
    const mRes = vm.runInContext("getWinningSetsHelper('Fri', 'reg', 'Morning')", ctx);
    for (const [k, v] of mRes.win2DRounds.entries()) {
      console.log('Morning 2D', k, '->', Array.from(v));
    }
    
    console.log('=== REGULAR AFTERNOON ===');
    const aRes = vm.runInContext("getWinningSetsHelper('Fri', 'reg', 'Afternoon')", ctx);
    for (const [k, v] of aRes.win2DRounds.entries()) {
      console.log('Afternoon 2D', k, '->', Array.from(v));
    }
  });
