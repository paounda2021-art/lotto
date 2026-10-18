const fs = require('fs');

fetch('https://lotto289.paounda2021.workers.dev/api/draws')
  .then(r => r.json())
  .then(d => {
    const ds = d.datasets;
    const WIN4_MAP = {
      Mon: { regMorning: [1, 3, 4, 5], regAfternoon: [0, 5, 6, 9], vipMorning: [1, 3, 8, 9], vipAfternoon: [0, 4, 5, 6] },
      Tue: { regMorning: [0, 3, 5, 6], regAfternoon: [0, 2, 4, 9], vipMorning: [2, 4, 8, 9], vipAfternoon: [0, 1, 4, 9] },
      Wed: { regMorning: [1, 2, 3, 8], regAfternoon: [0, 1, 7, 9], vipMorning: [0, 3, 6, 7], vipAfternoon: [0, 3, 4, 5] },
      Thu: { regMorning: [1, 3, 4, 9], regAfternoon: [1, 7, 8, 9], vipMorning: [4, 5, 7, 8], vipAfternoon: [0, 2, 4, 8] },
      Fri: { regMorning: [1, 2, 5, 7], regAfternoon: [0, 3, 4, 6], vipMorning: [0, 1, 5, 8], vipAfternoon: [0, 3, 6, 7] },
      Sat: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 2, 6], vipAfternoon: [0, 6, 8, 9] },
      Sun: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 5, 8], vipAfternoon: [1, 3, 7, 9] }
    };

    function getPairs(digits) {
      if (!digits) return [];
      const p = [];
      for (let i = 0; i < digits.length; i++) {
        for (let j = 0; j < digits.length; j++) {
          if (i !== j) p.push(String(digits[i]) + String(digits[j]));
        }
      }
      return p;
    }

    // Check dates from 2026-10-12 to 2026-10-18
    const dates = [
      { date: '2026-10-12', day: 'Mon' },
      { date: '2026-10-13', day: 'Tue' },
      { date: '2026-10-14', day: 'Wed' },
      { date: '2026-10-15', day: 'Thu' },
      { date: '2026-10-16', day: 'Fri' },
      { date: '2026-10-17', day: 'Sat' },
      { date: '2026-10-18', day: 'Sun' }
    ];

    dates.forEach(({ date, day }) => {
      console.log(`\n================== ${day} (${date}) ==================`);
      ['reg', 'vip'].forEach(cat => {
        ['Morning', 'Afternoon'].forEach(time => {
          const digits = WIN4_MAP[day][cat + time];
          if (!digits) return;
          const pairs = getPairs(digits);
          
          // Actual draws for this time
          const timeStr = time.toLowerCase();
          const draws = [];
          ['nikkei', 'china', 'hangseng'].forEach(stk => {
            const key = cat === 'vip' ? (`lotto_data_${stk}_vip_${timeStr}`) : (`lotto_data_${stk}_${timeStr}`);
            const list = ds[key] || [];
            const row = list.find(x => x.date === date);
            if (row) draws.push({ stk, top2: row.top2, bottom2: row.bottom2 });
          });
          
          const hits = [];
          draws.forEach(dr => {
            if (pairs.includes(dr.top2)) hits.push(`${dr.stk} top: ${dr.top2}`);
            if (pairs.includes(dr.bottom2)) hits.push(`${dr.stk} bot: ${dr.bottom2}`);
          });

          // ALSO check if it hits DRAWS FROM THE OTHER SESSION!
          const otherTime = time === 'Morning' ? 'Afternoon' : 'Morning';
          const otherTimeStr = otherTime.toLowerCase();
          const otherDraws = [];
          ['nikkei', 'china', 'hangseng'].forEach(stk => {
            const key = cat === 'vip' ? (`lotto_data_${stk}_vip_${otherTimeStr}`) : (`lotto_data_${stk}_${otherTimeStr}`);
            const list = ds[key] || [];
            const row = list.find(x => x.date === date);
            if (row) otherDraws.push({ stk, top2: row.top2, bottom2: row.bottom2 });
          });
          const otherHits = [];
          otherDraws.forEach(dr => {
            if (pairs.includes(dr.top2)) otherHits.push(`${dr.stk} top: ${dr.top2}`);
            if (pairs.includes(dr.bottom2)) otherHits.push(`${dr.stk} bot: ${dr.bottom2}`);
          });

          console.log(`[${cat.toUpperCase()} ${time}] digits: [${digits.join(',')}] -> Same session hits: ${hits.length} (${hits.join(', ')}) | If mixed with other session: ${otherHits.length} (${otherHits.join(', ')})`);
        });
      });
    });
  });
