const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

function Ey(draws, dayFilter) {
  const filtered = draws.filter(d => dayFilter === 'ALL' || d.dayOfWeek === dayFilter);
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
    .sort((a,b) => b.count - a.count).slice(0, 10);

  return { total, topDigits: sortedDigits, topPairs: sortedPairs };
}

console.log('=== สถิติการ์ด VIP สำหรับวันเสาร์ (SATURDAY) ===\n');

const cards = [
  { key: 'lotto_data_nikkei_vip_morning', name: 'นิเคอิ VIP (เช้า)' },
  { key: 'lotto_data_china_vip_morning', name: 'จีน VIP (เช้า)' },
  { key: 'lotto_data_hangseng_vip_morning', name: 'ฮั่งเส็ง VIP (เช้า)' },
  { key: 'lotto_data_nikkei_vip_afternoon', name: 'นิเคอิ VIP (บ่าย)' },
  { key: 'lotto_data_china_vip_afternoon', name: 'จีน VIP (บ่าย)' },
  { key: 'lotto_data_hangseng_vip_afternoon', name: 'ฮั่งเส็ง VIP (บ่าย)' },
];

cards.forEach(c => {
  const statsSat = Ey(allVip[c.key], 'Sat');
  const d0 = statsSat.topDigits[0];
  const d1 = statsSat.topDigits[1];
  const d2 = statsSat.topDigits[2];
  const topPairsStr = statsSat.topPairs.slice(0, 6).map(p => p.pair).join(' ');
  console.log(`[Card] ${c.name} (ตรวจ ${statsSat.total} วันเสาร์):`);
  console.log(`   - เด่น 1 (ฟัน): ${d0.digit} (มา ${d0.count} ครั้ง, ${d0.pct}%)`);
  console.log(`   - เด่น 2 (รอง): ${d1.digit} (มา ${d1.count} ครั้ง, ${d1.pct}%)`);
  console.log(`   - เด่น 3 (เสริม): ${d2.digit} (มา ${d2.count} ครั้ง, ${d2.pct}%)`);
  console.log(`   - ชุดเจาะ Top 6: ${topPairsStr}`);
  console.log('');
});

// Now simulate the Chase for Saturday
function simulateChaseSat(clusterName, stepKeys) {
  console.log(`\n======================================================`);
  console.log(`SIMULATING SATURDAY CHASE: ${clusterName}`);
  console.log(`Steps: ${stepKeys.map(k => cards.find(c => c.key === k)?.name).join(' -> ')}`);
  console.log(`======================================================`);

  stepKeys.forEach(candidateKey => {
    const candidateName = cards.find(c => c.key === candidateKey)?.name;
    const model = Ey(allVip[candidateKey], 'Sat');
    const runDigits = [model.topDigits[0].digit, model.topDigits[1].digit];
    const top6 = model.topPairs.slice(0, 6).map(p => p.pair);

    // Filter all Saturdays
    const satDates = Array.from(new Set(allVip[candidateKey].filter(d => d.dayOfWeek === 'Sat').map(d => d.date))).sort();

    let s1Hits = 0;
    let s2Hits = 0;
    let s3Hits = 0;
    let totalWins = 0;
    let misses = 0;

    satDates.forEach(dt => {
      const d1 = allVip[stepKeys[0]].find(x => x.date === dt);
      const d2 = allVip[stepKeys[1]].find(x => x.date === dt);
      const d3 = allVip[stepKeys[2]].find(x => x.date === dt);

      function hit(d) {
        if (!d) return false;
        const s = (d.top2 || '') + (d.bottom2 || '');
        return runDigits.some(dig => s.includes(String(dig)));
      }

      if (hit(d1)) {
        s1Hits++;
        totalWins++;
      } else if (hit(d2)) {
        s2Hits++;
        totalWins++;
      } else if (hit(d3)) {
        s3Hits++;
        totalWins++;
      } else {
        misses++;
      }
    });

    const total = satDates.length;
    const winRate = (totalWins / total * 100).toFixed(1);
    const s1Rate = (s1Hits / total * 100).toFixed(1);

    console.log(`Using Master Card: [${candidateName}] | Run: [${runDigits.join(' - ')}] (เน้น ${runDigits[0]})`);
    console.log(`  -> Total Saturdays: ${total} วัน`);
    console.log(`  -> เข้าสเต็ป 1 (นิเคอิ VIP): ${s1Hits} วัน (${s1Rate}%)`);
    console.log(`  -> เข้าสเต็ป 2 (จีน VIP): ${s2Hits} วัน`);
    console.log(`  -> เข้าสเต็ป 3 (ฮั่งเส็ง VIP): ${s3Hits} วัน`);
    console.log(`  -> รวมเข้าเป้า (Win Rate): ${totalWins}/${total} (${winRate}%) | หลุด: ${misses} วัน`);
    console.log(`  -> ชุดเจาะ Top 6: ${top6.join(' ')}`);
    console.log('------------------------------------------------------');
  });
}

simulateChaseSat('หุ้น VIP รอบเช้า (เสาร์)', [
  'lotto_data_nikkei_vip_morning',
  'lotto_data_china_vip_morning',
  'lotto_data_hangseng_vip_morning'
]);

simulateChaseSat('หุ้น VIP รอบบ่าย (เสาร์)', [
  'lotto_data_nikkei_vip_afternoon',
  'lotto_data_china_vip_afternoon',
  'lotto_data_hangseng_vip_afternoon'
]);
