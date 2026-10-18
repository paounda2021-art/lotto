const fs = require('fs');
const path = require('path');

function getDraws(f) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8'));
}

function Ey(e, t) {
  const o = e.filter(N => t === 'ALL' || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    const y = '' + (N.top3 || '') + (N.bottom2 || '');
    y.split('').forEach(p => {
      const f = parseInt(p, 10);
      if (!isNaN(f)) i[f] = (i[f] || 0) + 1;
    });
    if (N.top2 && /^[0-9]{2}$/.test(N.top2)) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2 && /^[0-9]{2}$/.test(N.bottom2)) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });

  const d = Object.entries(i).map(([N, y]) => {
    const p = parseInt(N, 10);
    const f = a > 0 ? Math.round(y / (a * 5) * 1000) / 10 : 0;
    return { digit: p, count: y, percent: f };
  }).sort((N, y) => y.count - N.count).slice(0, 5);

  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return { d0: d[0].digit, d1: d[1].digit, pairs: l.map(x => x.pair).join(' ') };
}

const days = [
  { code: 'Tue', name: 'วันอังคาร (วันนี้ 13 ต.ค.)' },
  { code: 'Wed', name: 'วันพุธ' },
  { code: 'Thu', name: 'วันพฤหัสบดี' },
  { code: 'Fri', name: 'วันศุกร์' },
  { code: 'Mon', name: 'วันจันทร์' },
  { code: 'ALL', name: 'ทุกวันทำการ (ALL)' }
];

const cards = [
  { 
    cluster: '1. หุ้นปกติ รอบเช้า (นิเคอิ ➡️ จีน ➡️ ฮั่งเส็ง)', 
    key: 'lotto_data_hangseng_morning.json', 
    name: 'การ์ด ฮั่งเส็ง (เช้า) [แนะนำอันดับ 1]', 
    winRate: '95.6%', 
    missRate: '4.4%',
    bestFocus: 'เด่นรอง',
    focusWinRate: '73.6%'
  },
  { 
    cluster: '2. หุ้นปกติ รอบบ่าย (นิเคอิ ➡️ จีน ➡️ ฮั่งเส็ง)', 
    key: 'lotto_data_china_afternoon.json', 
    name: 'การ์ด จีน (บ่าย) [ยอดนิยม]', 
    winRate: '91.2%', 
    missRate: '8.8%',
    bestFocus: 'เด่นรอง',
    focusWinRate: '68.1%'
  },
  { 
    cluster: '2. หุ้นปกติ รอบบ่าย (นิเคอิ ➡️ จีน ➡️ ฮั่งเส็ง)', 
    key: 'lotto_data_hangseng_afternoon.json', 
    name: 'การ์ด ฮั่งเส็ง (บ่าย) [เด่นหลักแรงสุด]', 
    winRate: '91.2%', 
    missRate: '8.8%',
    bestFocus: 'เด่นหลัก',
    focusWinRate: '73.6%'
  },
  { 
    cluster: '3. หุ้น VIP รอบเช้า (นิเคอิ VIP ➡️ จีน VIP ➡️ ฮั่งเส็ง VIP)', 
    key: 'lotto_data_nikkei_vip_morning.json', 
    name: 'การ์ด นิเคอิ VIP (เช้า) [หลุดน้อยสุด]', 
    winRate: '92.2%', 
    missRate: '7.8%',
    bestFocus: 'เด่นรอง',
    focusWinRate: '72.1%'
  },
  { 
    cluster: '3. หุ้น VIP รอบเช้า (นิเคอิ VIP ➡️ จีน VIP ➡️ ฮั่งเส็ง VIP)', 
    key: 'lotto_data_hangseng_vip_morning.json', 
    name: 'การ์ด ฮั่งเส็ง VIP (เช้า) [เจาะ Top6 แตก 33.3%]', 
    winRate: '87.6%', 
    missRate: '12.4%',
    bestFocus: 'เด่นรอง',
    focusWinRate: '67.4%'
  },
  { 
    cluster: '4. หุ้น VIP รอบบ่าย (นิเคอิ VIP ➡️ จีน VIP ➡️ ฮั่งเส็ง VIP)', 
    key: 'lotto_data_hangseng_vip_afternoon.json', 
    name: 'การ์ด ฮั่งเส็ง VIP (บ่าย) [แม่นสุดในระบบ]', 
    winRate: '97.7%', 
    missRate: '2.3%',
    bestFocus: 'เด่นรอง',
    focusWinRate: '79.8%'
  }
];

cards.forEach(c => {
  console.log('\n========================================================================');
  console.log(`📌 ${c.cluster}`);
  console.log(`ต้นทาง: ${c.name} | เข้าเป้ารวม: ${c.winRate} | หลุด: ${c.missRate}`);
  console.log(`🎯 ตัวที่ตรงเป้าที่สุด: [${c.bestFocus}] (เข้าเดี่ยวถึง ${c.focusWinRate})`);
  console.log('========================================================================');
  const d = getDraws(c.key);
  days.forEach(day => {
    const res = Ey(d, day.code);
    const bestDigit = c.bestFocus === 'เด่นหลัก' ? res.d0 : res.d1;
    console.log(`${day.name.padEnd(25)}: เด่นหลัก=${res.d0} | เด่นรอง=${res.d1} | ⭐ตัวตรงเป้าสุด=[${bestDigit}] | เจาะ Top 6: ${res.pairs}`);
  });
});
