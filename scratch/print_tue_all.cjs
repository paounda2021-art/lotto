const fs = require('fs');
const path = require('path');
function getDraws(f) { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8')); }
function Ey(e, t) {
  const o = e.filter(N => t === 'ALL' || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    const y = '' + (N.top3 || '') + (N.bottom2 || '');
    y.split('').forEach(p => { const f = parseInt(p, 10); if (!isNaN(f)) i[f] = (i[f] || 0) + 1; });
    if (N.top2 && /^[0-9]{2}$/.test(N.top2)) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2 && /^[0-9]{2}$/.test(N.bottom2)) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });
  const d = Object.entries(i).map(([N, y]) => ({ digit: parseInt(N, 10), count: y })).sort((N, y) => y.count - N.count).slice(0, 5);
  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return { d0: d[0].digit, d1: d[1].digit, pairs: l.map(x => x.pair).join(' ') };
}

const list = [
  { group: 'หุ้นปกติ เช้า', f: 'lotto_data_nikkei_morning.json', name: 'นิเคอิ (เช้า)' },
  { group: 'หุ้นปกติ เช้า', f: 'lotto_data_china_morning.json', name: 'จีน (เช้า)' },
  { group: 'หุ้นปกติ เช้า', f: 'lotto_data_hangseng_morning.json', name: 'ฮั่งเส็ง (เช้า) [แนะนำ 🥇 เข้า 95.6%]' },
  { group: 'หุ้นปกติ บ่าย', f: 'lotto_data_nikkei_afternoon.json', name: 'นิเคอิ (บ่าย)' },
  { group: 'หุ้นปกติ บ่าย', f: 'lotto_data_china_afternoon.json', name: 'จีน (บ่าย) [แนะนำ 🥇 ยอดนิยม]' },
  { group: 'หุ้นปกติ บ่าย', f: 'lotto_data_hangseng_afternoon.json', name: 'ฮั่งเส็ง (บ่าย) [เด่นหลักแรง 73.6%]' },
  { group: 'หุ้น VIP เช้า', f: 'lotto_data_nikkei_vip_morning.json', name: 'นิเคอิ VIP (เช้า) [หลุดน้อยสุด 7.8%]' },
  { group: 'หุ้น VIP เช้า', f: 'lotto_data_china_vip_morning.json', name: 'จีน VIP (เช้า)' },
  { group: 'หุ้น VIP เช้า', f: 'lotto_data_hangseng_vip_morning.json', name: 'ฮั่งเส็ง VIP (เช้า) [เจาะแตกบ่อย 33.3%]' },
  { group: 'หุ้น VIP บ่าย', f: 'lotto_data_nikkei_vip_afternoon.json', name: 'นิเคอิ VIP (บ่าย)' },
  { group: 'หุ้น VIP บ่าย', f: 'lotto_data_china_vip_afternoon.json', name: 'จีน VIP (บ่าย)' },
  { group: 'หุ้น VIP บ่าย', f: 'lotto_data_hangseng_vip_afternoon.json', name: 'ฮั่งเส็ง VIP (บ่าย) [แม่นสุด 97.7%]' }
];

console.log('=== สรุปเลขประจำวันอังคาร (วันนี้ 13 ต.ค.) ทุกการ์ด ===\n');
list.forEach(item => {
  const d = getDraws(item.f);
  const r = Ey(d, 'Tue');
  console.log(`[${item.group}] ${item.name.padEnd(45)}: เด่นหลัก=${r.d0} | เด่นรอง=${r.d1} | Top6: ${r.pairs}`);
});
