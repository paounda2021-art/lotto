const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const nkA = allVip['lotto_data_nikkei_vip_afternoon'];
const cnA = allVip['lotto_data_china_vip_afternoon'];
const hsA = allVip['lotto_data_hangseng_vip_afternoon'];

console.log('=== REAL AFTERNOON DRAWS (10-16 Oct 2026) ===');
const dates = ['2026-10-16', '2026-10-15', '2026-10-14', '2026-10-13', '2026-10-12', '2026-10-11', '2026-10-10'];

dates.forEach(dt => {
  const dNk = nkA.find(d => d.date === dt);
  const dCn = cnA.find(d => d.date === dt);
  const dHs = hsA.find(d => d.date === dt);
  console.log(`\nDate: ${dt} (${dNk?.dayOfWeek} / ${dNk?.dayNameThai})`);
  console.log(`  [Step 1 13:00] Nikkei VIP A  : บน ${dNk?.top3} (2ตัว: ${dNk?.top2}) | ล่าง: ${dNk?.bottom2}`);
  console.log(`  [Step 2 14:00] China VIP A   : บน ${dCn?.top3} (2ตัว: ${dCn?.top2}) | ล่าง: ${dCn?.bottom2}`);
  console.log(`  [Step 3 15:30] HangSeng VIP A: บน ${dHs?.top3} (2ตัว: ${dHs?.top2}) | ล่าง: ${dHs?.bottom2}`);
});

// Now let's see what the cards predicted for each day!
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

console.log('\n=== ตรวจสอบย้อนหลังแต่ละวัน ว่าการ์ดไหนให้เลขอะไร และผลจริงเข้าไหม ===');

const cardsToTest = [
  { name: 'นิเคอิ VIP (บ่าย)', dataset: nkA },
  { name: 'จีน VIP (บ่าย)', dataset: cnA },
  { name: 'ฮั่งเส็ง VIP (บ่าย)', dataset: hsA }
];

dates.forEach(dt => {
  const dNk = nkA.find(d => d.date === dt);
  const dCn = cnA.find(d => d.date === dt);
  const dHs = hsA.find(d => d.date === dt);
  const day = dNk?.dayOfWeek;

  console.log(`\n------------------------------------------------------------`);
  console.log(`วันที่: ${dt} (${day})`);
  console.log(`ผลจริง: NK=${dNk?.top2}/${dNk?.bottom2} | CN=${dCn?.top2}/${dCn?.bottom2} | HS=${dHs?.top2}/${dHs?.bottom2}`);

  cardsToTest.forEach(c => {
    // What did this card predict for this day?
    const past = c.dataset.filter(d => d.date < dt);
    const res = Ey(past, day);
    const run = [res[0].digit, res[1].digit];

    const s1 = (dNk?.top2 || '') + (dNk?.bottom2 || '');
    const s2 = (dCn?.top2 || '') + (dCn?.bottom2 || '');
    const s3 = (dHs?.top2 || '') + (dHs?.bottom2 || '');

    const h1 = run.some(d => s1.includes(String(d)));
    const h2 = run.some(d => s2.includes(String(d)));
    const h3 = run.some(d => s3.includes(String(d)));

    const status = h1 ? '✅ สเต็ป 1 (นิเคอิ) เข้า' : (h2 ? '✅ สเต็ป 2 (จีน) เข้า' : (h3 ? '✅ สเต็ป 3 (ฮั่งเส็ง) เข้า' : '❌ หลุดทั้ง 3 สเต็ป!'));
    console.log(`  - การ์ด [${c.name}] เด่น: [${run.join(' - ')}] -> ${status} (เฉพาะหวยตัวเองเข้าไหม: ${c.name.includes('นิเคอิ') ? (h1?'เข้า':'❌หลุด') : c.name.includes('จีน') ? (h2?'เข้า':'❌หลุด') : (h3?'เข้า':'❌หลุด')})`);
  });
});
