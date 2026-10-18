const fs = require('fs');
const allVip = JSON.parse(fs.readFileSync('scratch/live_vip_data.json', 'utf8'));

const cnM = allVip['lotto_data_china_vip_morning'];
const nkM = allVip['lotto_data_nikkei_vip_morning'];
const hsM = allVip['lotto_data_hangseng_vip_morning'];

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

console.log('=== จีน VIP (เช้า) สำหรับวันเสาร์ ===');
const cnSat = Ey(cnM, 'Sat');
console.log('Top Digits:', cnSat.sortedDigits.slice(0, 5));
console.log('Top Pairs:', cnSat.sortedPairs.map(p => p.pair).join(' '));

console.log('\n=== ฟอร์มสด จีน VIP (เช้า) ล่าสุด (ทุกวันในสัปดาห์นี้) ===');
const recentDays = ['2026-10-16', '2026-10-15', '2026-10-14', '2026-10-13', '2026-10-12', '2026-10-11'];
recentDays.forEach(dt => {
  const dNk = nkM.find(d => d.date === dt);
  const dCn = cnM.find(d => d.date === dt);
  const dHs = hsM.find(d => d.date === dt);
  const day = dNk.dayOfWeek;

  const past = cnM.filter(d => d.date < dt);
  const res = Ey(past, day);
  const digits = [res.sortedDigits[0].digit, res.sortedDigits[1].digit];

  const s1 = (dNk.top2 || '') + (dNk.bottom2 || '');
  const s2 = (dCn.top2 || '') + (dCn.bottom2 || '');
  const s3 = (dHs.top2 || '') + (dHs.bottom2 || '');

  const h1 = digits.some(d => s1.includes(String(d)));
  const h2 = digits.some(d => s2.includes(String(d)));
  const h3 = digits.some(d => s3.includes(String(d)));

  const hitStr = h1 ? '✅ สเต็ป 1 แตกทันที!' : (h2 ? '✅ สเต็ป 2 แตก' : (h3 ? '✅ สเต็ป 3 แตก' : '❌ หลุดทั้ง 3 สเต็ป'));
  console.log(dt + ' (' + day + ') | จีน VIP เด่น: [' + digits.join(' - ') + '] | ผลล่า: ' + hitStr + ' (NK: ' + dNk.top2 + '/' + dNk.bottom2 + ')');
});
