const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const nkA = allVip['lotto_data_nikkei_vip_afternoon'];
const cnA = allVip['lotto_data_china_vip_afternoon'];
const hsA = allVip['lotto_data_hangseng_vip_afternoon'];

// All dates sorted chronologically
const allDates = Array.from(new Set(nkA.map(d => d.date))).sort();
console.log('Total VIP Afternoon dates in history:', allDates.length);

// Saturday dates
const satDates = Array.from(new Set(nkA.filter(d => d.dayOfWeek === 'Sat').map(d => d.date))).sort();
console.log('Total Saturday dates:', satDates.length);

// Recent 14 dates (last 2 weeks)
const recent14 = allDates.slice(-14);

// Function to check win for a 3-step afternoon session
function testChase(digits, dt) {
  const d1 = nkA.find(d => d.date === dt);
  const d2 = cnA.find(d => d.date === dt);
  const d3 = hsA.find(d => d.date === dt);
  const s1 = (d1?.top2 || '') + (d1?.bottom2 || '');
  const s2 = (d2?.top2 || '') + (d2?.bottom2 || '');
  const s3 = (d3?.top2 || '') + (d3?.bottom2 || '');
  if (digits.some(d => s1.includes(String(d)))) return 1;
  if (digits.some(d => s2.includes(String(d)))) return 2;
  if (digits.some(d => s3.includes(String(d)))) return 3;
  return 0; // miss
}

// Search all pairs of digits (0-9) to see which 2 digits hit Saturday 100% AND hit recent 14 days
console.log('\n=== ค้นหาคู่เลข 2 ตัว (เด่น-รอง) ที่ไม่หลุดวันเสาร์เลยแม้แต่วันเดียว (0 Misses) ===');
const digitPairs = [];
for (let i = 0; i <= 9; i++) {
  for (let j = i + 1; j <= 9; j++) {
    digitPairs.push([i, j]);
  }
}

const sat100Pairs = [];
digitPairs.forEach(([d1, d2]) => {
  let satWins = 0, satMisses = 0, s1Wins = 0;
  satDates.forEach(dt => {
    const res = testChase([d1, d2], dt);
    if (res > 0) {
      satWins++;
      if (res === 1) s1Wins++;
    } else {
      satMisses++;
    }
  });

  // Also check recent 14 days (all days)
  let recWins = 0;
  recent14.forEach(dt => {
    if (testChase([d1, d2], dt) > 0) recWins++;
  });

  if (satMisses === 0) {
    sat100Pairs.push({
      pair: `${d1} - ${d2}`,
      satWinRate: (satWins / satDates.length * 100).toFixed(1),
      satS1Rate: (s1Wins / satDates.length * 100).toFixed(1),
      s1Count: s1Wins,
      recent14Wins: `${recWins}/14`,
      recWinsNum: recWins
    });
  }
});

// Sort by: 1) recent 14 wins, 2) s1Count
sat100Pairs.sort((a,b) => (b.recWinsNum - a.recWinsNum) || (b.s1Count - a.s1Count));
console.log(`พบทั้งหมด ${sat100Pairs.length} คู่เลข ที่ไม่เคยหลุดวันเสาร์เลย 100% เต็ม (19/19 วัน):`);
sat100Pairs.forEach(p => {
  console.log(`  คู่รูด [${p.pair}] -> เสาร์ชนะ ${p.satWinRate}% | สเต็ป 1 แตก ${p.satS1Rate}% (${p.s1Count}/19) | 14 วันล่าสุดเข้า ${p.recent14Wins}`);
});
