const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const nkM = allVip['lotto_data_nikkei_vip_morning'];
const cnM = allVip['lotto_data_china_vip_morning'];
const hsM = allVip['lotto_data_hangseng_vip_morning'];

const nkA = allVip['lotto_data_nikkei_vip_afternoon'];
const cnA = allVip['lotto_data_china_vip_afternoon'];
const hsA = allVip['lotto_data_hangseng_vip_afternoon'];

const satDates = Array.from(new Set(nkM.filter(d => d.dayOfWeek === 'Sat').map(d => d.date))).sort();

function Ey(draws, dayFilter) {
  const filtered = draws.filter(d => dayFilter === 'ALL' || d.dayOfWeek === dayFilter);
  const total = filtered.length;
  const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  filtered.forEach(d => {
    const s = (d.top3 || '') + (d.bottom2 || '');
    s.split('').forEach(ch => {
      const n = parseInt(ch, 10);
      if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
    });
  });
  return Object.entries(digitCounts).map(([dig, count]) => ({
    digit: parseInt(dig, 10), count
  })).sort((a,b) => b.count - a.count);
}

const candidatesM = [
  { name: 'จีน VIP (เช้า)', dataset: cnM },
  { name: 'นิเคอิ VIP (เช้า)', dataset: nkM },
  { name: 'ฮั่งเส็ง VIP (เช้า)', dataset: hsM },
  { name: 'รวมสถิติ VIP เช้า (3 หวย)', dataset: [...nkM, ...cnM, ...hsM] },
  { name: 'จีน VIP (บ่าย)', dataset: cnA },
  { name: 'นิเคอิ VIP (บ่าย)', dataset: nkA },
  { name: 'ฮั่งเส็ง VIP (บ่าย)', dataset: hsA }
];

console.log('=== ตรวจสอบความแม่นยำรอบเช้าวันเสาร์ (Walk-forward 18 เสาร์) ===\n');

candidatesM.forEach(cand => {
  let s1Hits = 0;
  let s2Hits = 0;
  let s3Hits = 0;
  let totalWins = 0;
  let misses = 0;
  const missedDates = [];

  satDates.forEach(dt => {
    const pastDraws = cand.dataset.filter(d => d.date < dt);
    if (pastDraws.length < 5) return;

    const res = Ey(pastDraws, 'Sat');
    const runDigits = [res[0].digit, res[1].digit];

    const d1 = nkM.find(d => d.date === dt);
    const d2 = cnM.find(d => d.date === dt);
    const d3 = hsM.find(d => d.date === dt);

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

  const auditedTotal = satDates.length - 1;
  const winRate = (totalWins / auditedTotal * 100).toFixed(1);
  const s1Rate = (s1Hits / auditedTotal * 100).toFixed(1);

  console.log(`[การ์ด] ${cand.name}`);
  console.log(`  - ชนะ: ${totalWins}/${auditedTotal} (${winRate}%) | หลุด: ${misses} วัน`);
  console.log(`  - สเต็ป 1: ${s1Hits} วัน (${s1Rate}%) | สเต็ป 2: ${s2Hits} | สเต็ป 3: ${s3Hits}`);
  if (misses === 0) console.log(`  👑👑👑 ไร้พ่าย 100% ไม่เคยหลุดเลยแม้แต่วันเดียว!`);
  else console.log(`  ❌ วันที่หลุด: ${JSON.stringify(missedDates)}`);
  console.log('------------------------------------------------------');
});
