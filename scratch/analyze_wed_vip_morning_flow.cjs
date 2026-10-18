const fs = require('fs');
const path = require('path');

function getDraws(f) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8'))
    .filter(x => /^\d{2}$/.test(x.top2) && /^\d{2}$/.test(x.bottom2));
}

const nkvm = getDraws('lotto_data_nikkei_vip_morning.json');
const chvm = getDraws('lotto_data_china_vip_morning.json');
const hsvm = getDraws('lotto_data_hangseng_vip_morning.json');

// Align by date for Wednesdays
const dateMap = {};
nkvm.forEach(d => { if (d.dayOfWeek === 'Wed') { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].nk = d; } });
chvm.forEach(d => { if (d.dayOfWeek === 'Wed') { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].cn = d; } });
hsvm.forEach(d => { if (d.dayOfWeek === 'Wed') { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].hs = d; } });

const wedDates = Object.keys(dateMap).sort();
const totalWed = wedDates.length;

console.log('Total Wednesday VIP morning sessions:', totalWed);

// 1. Single digit frequency across China VIP + Hang Seng VIP (remaining 2 draws)
const remainingHits = Array(10).fill(0);
// 2. Single digit frequency across all 3 VIP morning draws
const allHits = Array(10).fill(0);
// 3. Digit appearance count in each stock on Wednesdays
const cnDigitCount = Array(10).fill(0);
const hsDigitCount = Array(10).fill(0);

wedDates.forEach(dt => {
  const item = dateMap[dt];
  const cn = item.cn;
  const hs = item.hs;
  const nk = item.nk;

  const cnDigits = cn ? (cn.top3 + cn.bottom2).split('').map(Number) : [];
  const hsDigits = hs ? (hs.top3 + hs.bottom2).split('').map(Number) : [];
  const nkDigits = nk ? (nk.top3 + nk.bottom2).split('').map(Number) : [];

  const remainingDigits = new Set([...cnDigits, ...hsDigits]);
  const allSessionDigits = new Set([...nkDigits, ...cnDigits, ...hsDigits]);

  for (let d = 0; d <= 9; d++) {
    if (remainingDigits.has(d)) remainingHits[d]++;
    if (allSessionDigits.has(d)) allHits[d]++;
  }

  cnDigits.forEach(d => cnDigitCount[d]++);
  hsDigits.forEach(d => hsDigitCount[d]++);
});

console.log('\n=== สถิติเลขเดี่ยวใน จีน VIP + ฮั่งเส็ง VIP (2 หวยที่เหลือ) วันพุธ 19 สัปดาห์ ===');
remainingHits.map((cnt, digit) => ({ digit, cnt, pct: ((cnt / totalWed) * 100).toFixed(1) }))
  .sort((a, b) => b.cnt - a.cnt)
  .forEach(x => {
    console.log(`เลข ${x.digit} : ออก ${x.cnt}/${totalWed} วัน (${x.pct}%) | หลุด ${totalWed - x.cnt} วัน`);
  });

console.log('\n=== สถิติเลขเดี่ยวตลอดทั้งรอบเช้า 3 หวย วันพุธ 19 สัปดาห์ ===');
allHits.map((cnt, digit) => ({ digit, cnt, pct: ((cnt / totalWed) * 100).toFixed(1) }))
  .sort((a, b) => b.cnt - a.cnt)
  .forEach(x => {
    console.log(`เลข ${x.digit} : ออก ${x.cnt}/${totalWed} วัน (${x.pct}%) | หลุด ${totalWed - x.cnt} วัน`);
  });

// 4. Test pairs of digits in Remaining (China VIP + Hang Seng VIP) to find 100% combinations (0 miss)
console.log('\n=== คู่เลขเด่น (2 ตัว) ที่เข้าใน จีน VIP + ฮั่งเส็ง VIP วันพุธ 100% (ไม่เคยหลุดเลย) ===');
const pairs = [];
for (let d1 = 0; d1 <= 9; d1++) {
  for (let d2 = d1 + 1; d2 <= 9; d2++) {
    let hits = 0;
    wedDates.forEach(dt => {
      const item = dateMap[dt];
      const cnDigits = item.cn ? (item.cn.top3 + item.cn.bottom2).split('').map(Number) : [];
      const hsDigits = item.hs ? (item.hs.top3 + item.hs.bottom2).split('').map(Number) : [];
      const set = new Set([...cnDigits, ...hsDigits]);
      if (set.has(d1) || set.has(d2)) hits++;
    });
    if (hits === totalWed) {
      pairs.push({ pair: `${d1}-${d2}`, hits, total: totalWed, pct: '100.0%' });
    }
  }
}
pairs.forEach(p => console.log(`คู่ ${p.pair} : เข้า ${p.hits}/${p.total} (${p.pct}) [ไม่เคยหลุด 0 miss]`));

// 5. Look specifically at China VIP Morning and Hang Seng VIP Morning cards for Wednesday
console.log('\n=== รายละเอียดเฉพาะหวย วันพุธ ===');
console.log('จีน VIP (เช้า):');
cnDigitCount.map((cnt, d) => ({ d, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 5)
  .forEach(x => console.log(`  เลข ${x.d}: ${x.cnt} ครั้ง`));

console.log('ฮั่งเส็ง VIP (เช้า):');
hsDigitCount.map((cnt, d) => ({ d, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 5)
  .forEach(x => console.log(`  เลข ${x.d}: ${x.cnt} ครั้ง`));
