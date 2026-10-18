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

const days = [
  { code: 'Tue', name: 'วันอังคาร (วันนี้ 13 ต.ค.)' },
  { code: 'Wed', name: 'วันพุธ' },
  { code: 'Thu', name: 'วันพฤหัสบดี' },
  { code: 'Fri', name: 'วันศุกร์' },
  { code: 'Mon', name: 'วันจันทร์' }
];

console.log('=== สรุปเลขชุดเต็ม เด่นหลัก (ยืน 1) + เด่นรอง (ตามประกบ) ครบ 5 วันทำการ ===\n');

// 1. หุ้นปกติ เช้า: การ์ด นิเคอิ เช้า
const nM = getDraws('lotto_data_nikkei_morning.json');
console.log('1. หุ้นปกติ รอบเช้า (การ์ด นิเคอิ เช้า: เด่นหลักเข้า 65.5% ชนะเด่นรอง)');
days.forEach(d => {
  const r = Ey(nM, d.code);
  console.log(`   ${d.name.padEnd(25)}: 👑เด่นหลัก=${r.d0} | 🥈เด่นรอง=${r.d1} | เจาะ Top 6: ${r.pairs}`);
});

// 2. หุ้นปกติ บ่าย: การ์ด ฮั่งเส็ง บ่าย (เด่นหลักเข้า 73.8% ชนะเด่นรองขาดลอย)
const hA = getDraws('lotto_data_hangseng_afternoon.json');
console.log('\n2. หุ้นปกติ รอบบ่าย (การ์ด ฮั่งเส็ง บ่าย: 👑เด่นหลักเข้าสูงถึง 73.8% หลุดแค่ 26%)');
days.forEach(d => {
  const r = Ey(hA, d.code);
  console.log(`   ${d.name.padEnd(25)}: 👑เด่นหลัก=${r.d0} | 🥈เด่นรอง=${r.d1} | เจาะ Top 6: ${r.pairs}`);
});

// 2b. หุ้นปกติ บ่าย: การ์ด จีน บ่าย (ยอดนิยม)
const cA = getDraws('lotto_data_china_afternoon.json');
console.log('\n2b. หุ้นปกติ รอบบ่าย (การ์ด จีน บ่าย: ยอดนิยม วิ่งคู่เข้า 91.8%)');
days.forEach(d => {
  const r = Ey(cA, d.code);
  console.log(`   ${d.name.padEnd(25)}: 👑เด่นหลัก=${r.d0} | 🥈เด่นรอง=${r.d1} | เจาะ Top 6: ${r.pairs}`);
});

// 3. หุ้น VIP เช้า: การ์ด จีน VIP เช้า
const cVipM = getDraws('lotto_data_china_vip_morning.json');
console.log('\n3. หุ้น VIP รอบเช้า (การ์ด จีน VIP เช้า: วิ่งคู่เข้า 90.3%)');
days.forEach(d => {
  const r = Ey(cVipM, d.code);
  console.log(`   ${d.name.padEnd(25)}: 👑เด่นหลัก=${r.d0} | 🥈เด่นรอง=${r.d1} | เจาะ Top 6: ${r.pairs}`);
});

// 4. หุ้น VIP บ่าย: การ์ด จีน VIP บ่าย
const cVipA = getDraws('lotto_data_china_vip_afternoon.json');
console.log('\n4. หุ้น VIP รอบบ่าย (การ์ด จีน VIP บ่าย: วิ่งคู่เข้า 93.5%)');
days.forEach(d => {
  const r = Ey(cVipA, d.code);
  console.log(`   ${d.name.padEnd(25)}: 👑เด่นหลัก=${r.d0} | 🥈เด่นรอง=${r.d1} | เจาะ Top 6: ${r.pairs}`);
});
