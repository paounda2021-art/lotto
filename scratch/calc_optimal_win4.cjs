const fs = require('fs');
const path = require('path');
const dir = 'downloaded_target_worker/kv_data';

const datasets = {
  regMorning: [
    { key: 'nk_m', name: 'นิเคอิ (เช้า)', file: 'lotto_data_nikkei_morning.json' },
    { key: 'cn_m', name: 'จีน (เช้า)', file: 'lotto_data_china_morning.json' },
    { key: 'hs_m', name: 'ฮั่งเส็ง (เช้า)', file: 'lotto_data_hangseng_morning.json' },
  ],
  regAfternoon: [
    { key: 'nk_a', name: 'นิเคอิ (บ่าย)', file: 'lotto_data_nikkei_afternoon.json' },
    { key: 'cn_a', name: 'จีน (บ่าย)', file: 'lotto_data_china_afternoon.json' },
    { key: 'hs_a', name: 'ฮั่งเส็ง (บ่าย)', file: 'lotto_data_hangseng_afternoon.json' },
  ],
  vipMorning: [
    { key: 'nk_vip_m', name: 'นิเคอิ VIP (เช้า)', file: 'lotto_data_nikkei_vip_morning.json' },
    { key: 'cn_vip_m', name: 'จีน VIP (เช้า)', file: 'lotto_data_china_vip_morning.json' },
    { key: 'hs_vip_m', name: 'ฮั่งเส็ง VIP (เช้า)', file: 'lotto_data_hangseng_vip_morning.json' },
  ],
  vipAfternoon: [
    { key: 'nk_vip_a', name: 'นิเคอิ VIP (บ่าย)', file: 'lotto_data_nikkei_vip_afternoon.json' },
    { key: 'cn_vip_a', name: 'จีน VIP (บ่าย)', file: 'lotto_data_china_vip_afternoon.json' },
    { key: 'hs_vip_a', name: 'ฮั่งเส็ง VIP (บ่าย)', file: 'lotto_data_hangseng_vip_afternoon.json' },
  ]
};

const allData = {};
for (const [sessKey, items] of Object.entries(datasets)) {
  allData[sessKey] = {};
  for (const item of items) {
    allData[sessKey][item.key] = JSON.parse(fs.readFileSync(path.join(dir, item.file), 'utf8'));
  }
}

function Ey(draws, dayFilter) {
  const filtered = (draws || []).filter(d => dayFilter === 'ALL' || d.dayOfWeek === dayFilter);
  const total = filtered.length;
  const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  filtered.forEach(d => {
    const allDigits = (d.top3 || '') + (d.bottom2 || '');
    allDigits.split('').forEach(ch => {
      const n = parseInt(ch, 10);
      if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
    });
  });
  const sortedDigits = Object.entries(digitCounts).map(([dig, count]) => {
    const digit = parseInt(dig, 10);
    const pct = total > 0 ? (count / (total * 5) * 100).toFixed(1) : 0;
    return { digit, count, pct };
  }).sort((a,b) => b.count - a.count);
  return { total, topDigits: sortedDigits };
}

function getWinPairsFromDigits(digits) {
  const pairs = new Set();
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      pairs.add(String(digits[i]) + String(digits[j]));
    }
  }
  return pairs;
}

function evaluateSession(sessKey, dayCode, digits) {
  const items = datasets[sessKey];
  const winSet = getWinPairsFromDigits(digits);
  
  // Find dates that have all 3 lotteries
  const d0List = allData[sessKey][items[0].key].filter(d => d.dayOfWeek === dayCode);
  const dates = d0List.map(d => d.date);

  let hits = 0;
  let misses = 0;
  let s1Hits = 0, s2Hits = 0, s3Hits = 0;

  dates.forEach(dt => {
    const d1 = allData[sessKey][items[0].key].find(x => x.date === dt);
    const d2 = allData[sessKey][items[1].key].find(x => x.date === dt);
    const d3 = allData[sessKey][items[2].key].find(x => x.date === dt);

    function hit(d) {
      if (!d) return false;
      return winSet.has(d.top2) || winSet.has(d.bottom2);
    }

    if (hit(d1)) {
      hits++; s1Hits++;
    } else if (hit(d2)) {
      hits++; s2Hits++;
    } else if (hit(d3)) {
      hits++; s3Hits++;
    } else {
      misses++;
    }
  });

  const total = dates.length;
  const winRate = total > 0 ? (hits / total * 100).toFixed(1) : 0;
  return { total, hits, misses, winRate, s1Hits, s2Hits, s3Hits };
}

// Find optimal 4 digits for each session & day
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const optimalResults = {};

days.forEach(day => {
  optimalResults[day] = {};
  ['regMorning', 'regAfternoon', 'vipMorning', 'vipAfternoon'].forEach(sessKey => {
    if ((day === 'Sat' || day === 'Sun') && sessKey.startsWith('reg')) {
      optimalResults[day][sessKey] = null;
      return;
    }

    const items = datasets[sessKey];

    // Candidate Strategy 1: Top 2 digits of Step 1 + Top 2 digits of Step 2
    const st1 = Ey(allData[sessKey][items[0].key], day);
    const st2 = Ey(allData[sessKey][items[1].key], day);
    const st3 = Ey(allData[sessKey][items[2].key], day);

    // Candidates from lead/sub-lead:
    // Pool: st1.d0, st1.d1, st2.d0, st2.d1, st3.d0, st3.d1
    const leadPool = [
      st1.topDigits[0]?.digit, st1.topDigits[1]?.digit,
      st2.topDigits[0]?.digit, st2.topDigits[1]?.digit,
      st3.topDigits[0]?.digit, st3.topDigits[1]?.digit
    ].filter(x => x !== undefined);

    // Also brute-force all 210 combinations to find the highest hit rate
    let bestComb = null;
    let maxHits = -1;
    const all10 = [0,1,2,3,4,5,6,7,8,9];
    for (let i = 0; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        for (let k = j + 1; k < 10; k++) {
          for (let l = k + 1; l < 10; l++) {
            const comb = [all10[i], all10[j], all10[k], all10[l]];
            const res = evaluateSession(sessKey, day, comb);
            // Tie-break preferring digits in leadPool
            const leadScore = comb.filter(d => leadPool.includes(d)).length;
            if (res.hits > maxHits || (res.hits === maxHits && leadScore > (bestComb ? bestComb.leadScore : -1))) {
              maxHits = res.hits;
              bestComb = { comb, res, leadScore };
            }
          }
        }
      }
    }

    optimalResults[day][sessKey] = {
      comb: bestComb.comb,
      digitsStr: bestComb.comb.join(' - '),
      res: bestComb.res
    };
  });
});

console.log(JSON.stringify(optimalResults, null, 2));
fs.writeFileSync('scratch/optimal_win4_all_days.json', JSON.stringify(optimalResults, null, 2));
