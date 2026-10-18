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
  const pairCounts = {};

  filtered.forEach(d => {
    const allDigits = (d.top3 || '') + (d.bottom2 || '');
    allDigits.split('').forEach(ch => {
      const n = parseInt(ch, 10);
      if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
    });
    if (d.top2 && /^[0-9]{2}$/.test(d.top2)) pairCounts[d.top2] = (pairCounts[d.top2] || 0) + 1;
    if (d.bottom2 && /^[0-9]{2}$/.test(d.bottom2)) pairCounts[d.bottom2] = (pairCounts[d.bottom2] || 0) + 1;
  });

  const sortedDigits = Object.entries(digitCounts).map(([dig, count]) => {
    const digit = parseInt(dig, 10);
    const pct = total > 0 ? (count / (total * 5) * 100).toFixed(1) : 0;
    return { digit, count, pct };
  }).sort((a,b) => b.count - a.count);

  const sortedPairs = Object.entries(pairCounts).map(([pair, count]) => ({ pair, count }))
    .sort((a,b) => b.count - a.count);

  return { total, topDigits: sortedDigits, topPairs: sortedPairs };
}

// Generate all 2D pairs (including reverse and doubles) from 4 digits
function getWinPairsFromDigits(digits) {
  const pairs = new Set();
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      pairs.add(String(digits[i]) + String(digits[j]));
    }
  }
  return pairs; // 16 items (12 reverse pairs + 4 doubles)
}

function checkWinHit(draw, winPairsSet) {
  if (!draw) return false;
  const top2 = draw.top2 || '';
  const bottom2 = draw.bottom2 || '';
  return winPairsSet.has(top2) || winPairsSet.has(bottom2);
}

// Evaluate a candidate 4 digits over all dates for a session
function evaluateSessionWin(sessKey, dayCode, digits) {
  const items = datasets[sessKey];
  const winSet = getWinPairsFromDigits(digits);
  
  // Find all dates of dayCode
  const firstDraws = allData[sessKey][items[0].key].filter(d => d.dayOfWeek === dayCode);
  const dates = firstDraws.map(d => d.date);

  let hits = 0;
  let misses = 0;
  let s1Hits = 0;
  let s2Hits = 0;
  let s3Hits = 0;

  dates.forEach(dt => {
    const d1 = allData[sessKey][items[0].key].find(x => x.date === dt);
    const d2 = allData[sessKey][items[1].key].find(x => x.date === dt);
    const d3 = allData[sessKey][items[2].key].find(x => x.date === dt);

    if (checkWinHit(d1, winSet)) {
      hits++;
      s1Hits++;
    } else if (checkWinHit(d2, winSet)) {
      hits++;
      s2Hits++;
    } else if (checkWinHit(d3, winSet)) {
      hits++;
      s3Hits++;
    } else {
      misses++;
    }
  });

  const total = dates.length;
  const winRate = total > 0 ? (hits / total * 100).toFixed(1) : 0;
  return { total, hits, misses, winRate, s1Hits, s2Hits, s3Hits };
}

// Let's test for Friday (yesterday) for all 4 distinct sessions:
console.log('========================================================================');
console.log('TESTING FRIDAY WIN 4 DIGITS (REGULAR MORNING, REGULAR AFTERNOON, VIP MORNING, VIP AFTERNOON)');
console.log('========================================================================');

['regMorning', 'regAfternoon', 'vipMorning', 'vipAfternoon'].forEach(sessKey => {
  console.log(`\n>>> SESSION: ${sessKey} (Day: Fri) <<<`);
  const items = datasets[sessKey];
  
  // Strategy 1: Pool lead/sub-lead digits from the 3 lotteries of this session!
  const lotteryStats = items.map(it => {
    const stats = Ey(allData[sessKey][it.key], 'Fri');
    return {
      name: it.name,
      d0: stats.topDigits[0]?.digit,
      d1: stats.topDigits[1]?.digit,
      d2: stats.topDigits[2]?.digit,
      topDigits: stats.topDigits
    };
  });

  lotteryStats.forEach(ls => {
    console.log(`   ${ls.name.padEnd(20)}: เด่น ${ls.d0} - ${ls.d1} (เสริม ${ls.d2})`);
  });

  // Strategy 2: Combined frequency of all 3 lotteries draws in this session
  const combinedDraws = items.flatMap(it => allData[sessKey][it.key]);
  const combinedStats = Ey(combinedDraws, 'Fri');
  const top4Combined = combinedStats.topDigits.slice(0, 4).map(x => x.digit);
  console.log(`   [Combined 3-Lotto Top 4]: ${top4Combined.join(' - ')}`);
  const evalCombined = evaluateSessionWin(sessKey, 'Fri', top4Combined);
  console.log(`   -> Hit Rate: ${evalCombined.hits}/${evalCombined.total} (${evalCombined.winRate}%) | S1: ${evalCombined.s1Hits}, S2: ${evalCombined.s2Hits}, S3: ${evalCombined.s3Hits}, Miss: ${evalCombined.misses}`);

  // Find the BEST 4-digit combination (brute-force all C(10, 4) = 210 combinations)
  let bestComb = null;
  let maxHits = -1;
  const all10 = [0,1,2,3,4,5,6,7,8,9];
  for (let i = 0; i < 10; i++) {
    for (let j = i + 1; j < 10; j++) {
      for (let k = j + 1; k < 10; k++) {
        for (let l = k + 1; l < 10; l++) {
          const comb = [all10[i], all10[j], all10[k], all10[l]];
          const res = evaluateSessionWin(sessKey, 'Fri', comb);
          if (res.hits > maxHits) {
            maxHits = res.hits;
            bestComb = { comb, res };
          }
        }
      }
    }
  }

  console.log(`   👑 [PERFECT 4 DIGITS COMBINATION]: ${bestComb.comb.join(' - ')}`);
  console.log(`   -> Max Hit Rate: ${bestComb.res.hits}/${bestComb.res.total} (${bestComb.res.winRate}%) | S1: ${bestComb.res.s1Hits}, S2: ${bestComb.res.s2Hits}, S3: ${bestComb.res.s3Hits}, Miss: ${bestComb.res.misses}`);
});
