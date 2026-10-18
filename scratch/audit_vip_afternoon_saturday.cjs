const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const nkA = allVip['lotto_data_nikkei_vip_afternoon'];
const cnA = allVip['lotto_data_china_vip_afternoon'];
const hsA = allVip['lotto_data_hangseng_vip_afternoon'];

const nkM = allVip['lotto_data_nikkei_vip_morning'];
const cnM = allVip['lotto_data_china_vip_morning'];
const hsM = allVip['lotto_data_hangseng_vip_morning'];

// All Saturday dates
const satDates = Array.from(new Set(nkA.filter(d => d.dayOfWeek === 'Sat').map(d => d.date))).sort();

console.log(`Total Saturday dates to audit: ${satDates.length} days\n`);

function Ey(draws, dayFilter) {
  const filtered = draws.filter(d => dayFilter === 'ALL' || d.dayOfWeek === dayFilter);
  const total = filtered.length;
  const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const pairCounts = {};
  filtered.forEach(d => {
    const s = (d.top3 || '') + (d.bottom2 || '');
    s.split('').forEach(ch => {
      const n = parseInt(ch, 10);
      if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
    });
    if (d.top2) pairCounts[d.top2] = (pairCounts[d.top2] || 0) + 1;
    if (d.bottom2) pairCounts[d.bottom2] = (pairCounts[d.bottom2] || 0) + 1;
  });
  const sortedDigits = Object.entries(digitCounts).map(([dig, count]) => ({
    digit: parseInt(dig, 10), count, pct: (count / (total * 5) * 100).toFixed(1)
  })).sort((a,b) => b.count - a.count);
  const sortedPairs = Object.entries(pairCounts).map(([pair, count]) => ({ pair, count }))
    .sort((a,b) => b.count - a.count).slice(0, 8);
  return { sortedDigits, sortedPairs };
}

// Candidates to test for afternoon chase
const candidates = [
  { name: 'นิเคอิ VIP (บ่าย)', dataset: nkA },
  { name: 'จีน VIP (บ่าย)', dataset: cnA },
  { name: 'ฮั่งเส็ง VIP (บ่าย)', dataset: hsA },
  { name: 'รวมสถิติ VIP บ่าย (3 หวย)', dataset: [...nkA, ...cnA, ...hsA] },
  { name: 'จีน VIP (เช้า)', dataset: cnM },
  { name: 'นิเคอิ VIP (เช้า)', dataset: nkM },
  { name: 'ฮั่งเส็ง VIP (เช้า)', dataset: hsM }
];

candidates.forEach(cand => {
  let s1Hits = 0;
  let s2Hits = 0;
  let s3Hits = 0;
  let totalWins = 0;
  let misses = 0;
  const missedDates = [];

  satDates.forEach(dt => {
    // Genuine Walk-forward: only use draws strictly before dt!
    const pastDraws = cand.dataset.filter(d => d.date < dt);
    if (pastDraws.length < 5) return; // skip warm-up

    const res = Ey(pastDraws, 'Sat');
    const runDigits = [res.sortedDigits[0].digit, res.sortedDigits[1].digit];

    const d1 = nkA.find(d => d.date === dt);
    const d2 = cnA.find(d => d.date === dt);
    const d3 = hsA.find(d => d.date === dt);

    const s1 = (d1?.top2 || '') + (d1?.bottom2 || '');
    const s2 = (d2?.top2 || '') + (d2?.bottom2 || '');
    const s3 = (d3?.top2 || '') + (d3?.bottom2 || '');

    const h1 = runDigits.some(dig => s1.includes(String(dig)));
    const h2 = runDigits.some(dig => s2.includes(String(dig)));
    const h3 = runDigits.some(dig => s3.includes(String(dig)));

    if (h1) {
      s1Hits++;
      totalWins++;
    } else if (h2) {
      s2Hits++;
      totalWins++;
    } else if (h3) {
      s3Hits++;
      totalWins++;
    } else {
      misses++;
      missedDates.push({ date: dt, digits: runDigits, s1, s2, s3 });
    }
  });

  const auditedTotal = satDates.length - 1; // excluding first warm-up
  const winRate = (totalWins / auditedTotal * 100).toFixed(1);
  const s1Rate = (s1Hits / auditedTotal * 100).toFixed(1);

  console.log(`======================================================`);
  console.log(`[การ์ด] ${cand.name}`);
  console.log(`  - ตรวจสอบทั้งหมด: ${auditedTotal} วันเสาร์`);
  console.log(`  - สเต็ป 1 (นิเคอิ VIP บ่าย): เข้า ${s1Hits} วัน (${s1Rate}%)`);
  console.log(`  - สเต็ป 2 (จีน VIP บ่าย): เข้า ${s2Hits} วัน`);
  console.log(`  - สเต็ป 3 (ฮั่งเส็ง VIP บ่าย): เข้า ${s3Hits} วัน`);
  console.log(`  - รวมชนะ (Win Rate): ${totalWins}/${auditedTotal} (${winRate}%)`);
  console.log(`  - หลุด (Misses): ${misses} วัน ${misses === 0 ? '👑 ไม่หลุดเลย 100% ไร้พ่าย!' : '❌ หลุด: ' + JSON.stringify(missedDates)}`);
});
