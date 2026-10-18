const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const nkM = allVip['lotto_data_nikkei_vip_morning'];
const cnM = allVip['lotto_data_china_vip_morning'];
const hsM = allVip['lotto_data_hangseng_vip_morning'];

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

// Also check ALL cards on those 3 days
const allCards = [
  { key: 'lotto_data_nikkei_vip_morning', name: 'นิเคอิ VIP (เช้า)' },
  { key: 'lotto_data_china_vip_morning', name: 'จีน VIP (เช้า)' },
  { key: 'lotto_data_hangseng_vip_morning', name: 'ฮั่งเส็ง VIP (เช้า)' }
];

const checkDays = [
  { dt: '2026-10-11', day: 'Sun', name: 'วันอาทิตย์ (11 ต.ค.)' },
  { dt: '2026-10-12', day: 'Mon', name: 'วันจันทร์ (12 ต.ค.)' },
  { dt: '2026-10-14', day: 'Wed', name: 'วันพุธ (14 ต.ค.)' }
];

checkDays.forEach(cd => {
  console.log(`\n======================================================`);
  console.log(`ตรวจสอบผลจริง: ${cd.name}`);
  const d1 = nkM.find(d => d.date === cd.dt);
  const d2 = cnM.find(d => d.date === cd.dt);
  const d3 = hsM.find(d => d.date === cd.dt);

  console.log(`  [สเต็ป 1] นิเคอิ VIP เช้า: บน ${d1?.top3} (2ตัว: ${d1?.top2}) | ล่าง: ${d1?.bottom2}`);
  console.log(`  [สเต็ป 2] จีน VIP เช้า   : บน ${d2?.top3} (2ตัว: ${d2?.top2}) | ล่าง: ${d2?.bottom2}`);
  console.log(`  [สเต็ป 3] ฮั่งเส็ง VIP เช้า: บน ${d3?.top3} (2ตัว: ${d3?.top2}) | ล่าง: ${d3?.bottom2}`);

  allCards.forEach(c => {
    // Only use draws before this date for genuine walk-forward!
    const pastDraws = allVip[c.key].filter(d => d.date < cd.dt);
    const digits = Ey(pastDraws, cd.day);
    const run = [digits[0].digit, digits[1].digit];

    const s1 = (d1?.top2 || '') + (d1?.bottom2 || '');
    const s2 = (d2?.top2 || '') + (d2?.bottom2 || '');
    const s3 = (d3?.top2 || '') + (d3?.bottom2 || '');

    const hit1 = run.some(d => s1.includes(String(d)));
    const hit2 = run.some(d => s2.includes(String(d)));
    const hit3 = run.some(d => s3.includes(String(d)));

    const status = hit1 ? 'เข้าตั้งแต่สเต็ป 1 (นิเคอิ VIP)' : hit2 ? 'เข้าสเต็ป 2 (จีน VIP)' : hit3 ? 'เข้าสเต็ป 3 (ฮั่งเส็ง VIP)' : 'หลุดทั้ง 3 สเต็ป ❌';

    console.log(`  - การ์ด [${c.name}]: เด่น [${run.join(' - ')}] -> ${status}`);
  });
});
