const fs = require('fs');
const path = require('path');

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

const dir = 'downloaded_target_worker/kv_data';
const stocks = {
  nk_m: { name: 'นิเคอิ (เช้า)', file: 'lotto_data_nikkei_morning.json' },
  cn_m: { name: 'จีน (เช้า)', file: 'lotto_data_china_morning.json' },
  hs_m: { name: 'ฮั่งเส็ง (เช้า)', file: 'lotto_data_hangseng_morning.json' },
  nk_a: { name: 'นิเคอิ (บ่าย)', file: 'lotto_data_nikkei_afternoon.json' },
  cn_a: { name: 'จีน (บ่าย)', file: 'lotto_data_china_afternoon.json' },
  hs_a: { name: 'ฮั่งเส็ง (บ่าย)', file: 'lotto_data_hangseng_afternoon.json' },
  nk_vip_m: { name: 'นิเคอิ VIP (เช้า)', file: 'lotto_data_nikkei_vip_morning.json' },
  cn_vip_m: { name: 'จีน VIP (เช้า)', file: 'lotto_data_china_vip_morning.json' },
  hs_vip_m: { name: 'ฮั่งเส็ง VIP (เช้า)', file: 'lotto_data_hangseng_vip_morning.json' },
  nk_vip_a: { name: 'นิเคอิ VIP (บ่าย)', file: 'lotto_data_nikkei_vip_afternoon.json' },
  cn_vip_a: { name: 'จีน VIP (บ่าย)', file: 'lotto_data_china_vip_afternoon.json' },
  hs_vip_a: { name: 'ฮั่งเส็ง VIP (บ่าย)', file: 'lotto_data_hangseng_vip_afternoon.json' },
};

const data = {};
for (const [k, info] of Object.entries(stocks)) {
  data[k] = JSON.parse(fs.readFileSync(path.join(dir, info.file), 'utf8'));
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const results = {};
days.forEach(day => {
  results[day] = {};
  console.log('\n====================================');
  console.log('DAY:', day);
  console.log('====================================');
  for (const [k, info] of Object.entries(stocks)) {
    const res = Ey(data[k], day);
    if (res.total === 0) continue;
    const d0 = res.topDigits[0]?.digit;
    const d1 = res.topDigits[1]?.digit;
    const d2 = res.topDigits[2]?.digit;
    const pairs = res.topPairs.slice(0, 8).map(p => p.pair);
    results[day][k] = {
      name: info.name,
      total: res.total,
      d0,
      d1,
      d2,
      topDigits: res.topDigits,
      topPairs: pairs
    };
    console.log(`${info.name.padEnd(20)} (N=${String(res.total).padStart(2)}): เด่น ${d0} - ${d1} (รอง ${d2}) | เจาะ: ${pairs.slice(0, 6).join(' ')}`);
  }
});

fs.writeFileSync('scratch/all_stocks_ey_results.json', JSON.stringify(results, null, 2));
