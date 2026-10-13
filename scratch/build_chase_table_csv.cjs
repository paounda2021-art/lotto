const fs = require('fs');
const path = require('path');

function getDraws(file) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', file);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const nikkeiM = getDraws('lotto_data_nikkei_morning.json');
const chinaM = getDraws('lotto_data_china_morning.json');
const nikkeiA = getDraws('lotto_data_nikkei_afternoon.json');
const chinaA = getDraws('lotto_data_china_afternoon.json');
const hangsengA = getDraws('lotto_data_hangseng_afternoon.json');
const chinaVipM = getDraws('lotto_data_china_vip_morning.json');
const hangsengVipM = getDraws('lotto_data_hangseng_vip_morning.json');

const filesMap = {
  'lotto_data_nikkei_morning.json': nikkeiM,
  'lotto_data_china_morning.json': chinaM,
  'lotto_data_nikkei_afternoon.json': nikkeiA,
  'lotto_data_china_afternoon.json': chinaA,
  'lotto_data_hangseng_afternoon.json': hangsengA,
  'lotto_data_china_vip_morning.json': chinaVipM,
  'lotto_data_hangseng_vip_morning.json': hangsengVipM
};

function getDraw(file, date) {
  const data = filesMap[file];
  if (!data) return null;
  const d = data.find(x => x.date === date);
  if (!d) return null;
  const top3 = String(d.top3 || '').trim();
  const bottom2 = String(d.bottom2 || '').trim();
  if (/^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2)) {
    return {
      top3,
      top2: d.top2 || (top3.length >= 2 ? top3.slice(-2) : ''),
      bottom2
    };
  }
  return { isClosed: true, raw: top3 + bottom2 };
}

function checkTarget(targetDate, l1, l2, d0, d1, top6Pairs) {
  if (!targetDate) return { hitD0: '-', hitD1: '-', hitTop6: '-' };

  const draw1 = getDraw(l1.file, targetDate);
  const draw2 = getDraw(l2.file, targetDate);

  if (!draw1 && !draw2) {
    return { hitD0: 'รอผล', hitD1: 'รอผล', hitTop6: 'รอผล' };
  }

  if (draw1 && draw1.isClosed && draw2 && draw2.isClosed) {
    return { hitD0: 'งดออกผล', hitD1: 'งดออกผล', hitTop6: 'งดออกผล' };
  }

  function checkDigit(draw, name, digit) {
    if (!draw || draw.isClosed) return null;
    const tHit = draw.top2.includes(String(digit));
    const bHit = draw.bottom2.includes(String(digit));
    if (tHit && bHit) return name + 'เข้า ' + draw.top2 + ' บน, ' + draw.bottom2 + ' ล่าง';
    if (tHit) return name + 'เข้า ' + draw.top2 + ' บน';
    if (bHit) return name + 'เข้า ' + draw.bottom2 + ' ล่าง';
    return null;
  }

  function checkPairs(draw, name, pairs) {
    if (!draw || draw.isClosed) return null;
    const tMatch = pairs.find(p => p === draw.top2);
    const bMatch = pairs.find(p => p === draw.bottom2);
    if (tMatch && bMatch) return name + 'เข้า ' + tMatch + ' บน, ' + bMatch + ' ล่าง';
    if (tMatch) return name + 'เข้า ' + tMatch + ' บน';
    if (bMatch) return name + 'เข้า ' + bMatch + ' ล่าง';
    return null;
  }

  const pairsList = top6Pairs.split(' ');

  let hitD0 = checkDigit(draw1, l1.shortName, d0);
  if (!hitD0) hitD0 = checkDigit(draw2, l2.shortName, d0);
  if (!hitD0) {
    if ((!draw1 || draw1.isClosed) && !draw2) hitD0 = 'รอผล';
    else if (!draw2 && draw1 && !draw1.isClosed) hitD0 = 'รอผล';
    else hitD0 = 'X';
  }

  let hitD1 = checkDigit(draw1, l1.shortName, d1);
  if (!hitD1) hitD1 = checkDigit(draw2, l2.shortName, d1);
  if (!hitD1) {
    if ((!draw1 || draw1.isClosed) && !draw2) hitD1 = 'รอผล';
    else if (!draw2 && draw1 && !draw1.isClosed) hitD1 = 'รอผล';
    else hitD1 = 'X';
  }

  let hitTop6 = checkPairs(draw1, l1.shortName, pairsList);
  if (!hitTop6) hitTop6 = checkPairs(draw2, l2.shortName, pairsList);
  if (!hitTop6) {
    if ((!draw1 || draw1.isClosed) && !draw2) hitTop6 = 'รอผล';
    else if (!draw2 && draw1 && !draw1.isClosed) hitTop6 = 'รอผล';
    else hitTop6 = 'X';
  }

  const cleanFormat = (txt) => {
    if (txt === 'X' || txt === 'รอผล' || txt === '-' || txt === 'งดออกผล') return txt;
    return txt.replace(/^จีน\s+เข้า/, 'จีนเข้า')
              .replace(/^ฮั่งเส็ง\s+เข้า/, 'ฮั่งเส็งเข้า')
              .replace(/^นิเคอิ\s+เข้า/, 'นิเคอิเข้า')
              .replace(/^จีน VIP\s+เข้า/, 'จีน VIPเข้า')
              .replace(/^ฮั่งเส็ง VIP\s+เข้า/, 'ฮั่งเส็ง VIPเข้า');
  };

  return { 
    hitD0: cleanFormat(hitD0), 
    hitD1: cleanFormat(hitD1), 
    hitTop6: cleanFormat(hitTop6) 
  };
}

// Exact same Ey calculation as the website frontend
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

// Pre-draw data for Monday 12 Oct (excluding 2026-10-12 so it matches pre-draw card on screen)
const nikkeiM_Mon = nikkeiM.filter(d => d.date !== '2026-10-12');
const chinaA_Mon = chinaA.filter(d => d.date !== '2026-10-12');
const hangsengVipM_Mon = hangsengVipM.filter(d => d.date !== '2026-10-12');

const weeklyDaysConfig = [
  { code: 'Mon', name: 'วันจันทร์', dateFormatted: '12 ต.ค. 2569', dateStr: '2026-10-12', isMon: true },
  { code: 'Tue', name: 'วันอังคาร', dateFormatted: '13 ต.ค. 2569', dateStr: '2026-10-13', isMon: false },
  { code: 'Wed', name: 'วันพุธ', dateFormatted: '14 ต.ค. 2569', dateStr: '2026-10-14', isMon: false },
  { code: 'Thu', name: 'วันพฤหัสบดี', dateFormatted: '15 ต.ค. 2569', dateStr: '2026-10-15', isMon: false },
  { code: 'Fri', name: 'วันศุกร์', dateFormatted: '16 ต.ค. 2569', dateStr: '2026-10-16', isMon: false },
  { code: 'ALL', name: 'สถิติรวมทุกวันทำการ', dateFormatted: 'ทุกวันทำการ', dateStr: '', isMon: false }
];

// All trading dates in the past 1 calendar month (11 ก.ย. 2569 ถึง 12 ต.ค. 2569)
const pastMonthDates = chinaA
  .map(x => x.date)
  .filter(x => x <= '2026-10-12' && x >= '2026-09-11'); // 22 trading days descending

let csv = '\uFEFF'; // UTF-8 BOM for Excel
// Clean 16-column header
csv += 'ลำดับ,ประเภทข้อมูล,วันทำการ,วันที่,ช่วงเวลา,คู่หวยที่เล่น (สเต็ป 1 ➡️ สเต็ป 2),การ์ดต้นทางบนเว็บ,เด่นหลัก (รูด 19),เป้ารูดเด่น,เด่นรอง (รูด 19),เป้ารูดรอง,ชุดเจาะ 2 ตัว Top 6 คู่,เป้าเจาะ,อัตราเข้าเป้าชนะรวม (%),อัตราการหลุด (%),กลยุทธ์การเล่น (เข้าหยุด/หลุดตามทบ)\n';

let rowIdx = 1;

// 1. SECTION 1: Current Week Strategy Plan (จันทร์ 12 ต.ค. - ศุกร์ 16 ต.ค. 2569) & Summary
weeklyDaysConfig.forEach(d => {
  const category = d.code === 'ALL' ? 'สถิติภาพรวม' : 'แผนสัปดาห์นี้';
  const nM_src = d.isMon ? nikkeiM_Mon : nikkeiM;
  const cA_src = d.isMon ? chinaA_Mon : chinaA;
  const hVip_src = d.isMon ? hangsengVipM_Mon : hangsengVipM;

  // 1. Morning (นิเคอิ เช้า ➡️ จีน เช้า) using Nikkei Morning card
  const resM = Ey(nM_src, d.code);
  const chM = checkTarget(d.dateStr, 
    { file: 'lotto_data_nikkei_morning.json', shortName: 'นิเคอิ' }, 
    { file: 'lotto_data_china_morning.json', shortName: 'จีน' }, 
    resM.d0, resM.d1, resM.pairs
  );
  csv += `"${rowIdx++}","${category}","${d.name}","${d.dateFormatted}","☀️ รอบเช้า (09:30-10:30)","นิเคอิ (เช้า) 09:30 ➡️ ตาม จีน (เช้า) 10:30","นิเคอิ (เช้า)","${resM.d0}","${chM.hitD0}","${resM.d1}","${chM.hitD1}","${resM.pairs}","${chM.hitTop6}","86.3%","13.7%","แทงนิเคอิเช้า ถ้าเข้าเป้าหยุดทันที หากหลุดตามทบจีนเช้า"\n`;

  // 2. Afternoon Recommended (นิเคอิ บ่าย ➡️ จีน บ่าย) using China Afternoon card
  const resA = Ey(cA_src, d.code);
  const chA1 = checkTarget(d.dateStr, 
    { file: 'lotto_data_nikkei_afternoon.json', shortName: 'นิเคอิ' }, 
    { file: 'lotto_data_china_afternoon.json', shortName: 'จีน' }, 
    resA.d0, resA.d1, resA.pairs
  );
  csv += `"${rowIdx++}","${category}","${d.name}","${d.dateFormatted}","🌤️ รอบบ่าย (แนะนำ 🥇 13:00-14:00)","นิเคอิ (บ่าย) 13:00 ➡️ ตาม จีน (บ่าย) 14:00","จีน (บ่าย)","${resA.d0}","${chA1.hitD0}","${resA.d1}","${chA1.hitD1}","${resA.pairs}","${chA1.hitTop6}","89.0%","11.0%","หลุดน้อยที่สุดในระบบ แทงนิเคอิบ่าย ถ้าหลุดตามทบจีนบ่าย"\n`;

  // 3. Afternoon Alternative (จีน บ่าย ➡️ ฮั่งเส็ง บ่าย) using China Afternoon card
  const chA2 = checkTarget(d.dateStr, 
    { file: 'lotto_data_china_afternoon.json', shortName: 'จีน' }, 
    { file: 'lotto_data_hangseng_afternoon.json', shortName: 'ฮั่งเส็ง' }, 
    resA.d0, resA.d1, resA.pairs
  );
  csv += `"${rowIdx++}","${category}","${d.name}","${d.dateFormatted}","🌤️ รอบบ่าย (ทางเลือกเจาะแตก 14:00-15:30)","จีน (บ่าย) 14:00 ➡️ ตาม ฮั่งเส็ง (บ่าย) 15:30","จีน (บ่าย)","${resA.d0}","${chA2.hitD0}","${resA.d1}","${chA2.hitD1}","${resA.pairs}","${chA2.hitTop6}","87.2%","12.8%","ชุดเจาะ 2 ตัวเข้าดีที่สุด (25.6%) แทงจีนบ่าย ถ้าหลุดตามฮั่งเส็งบ่าย"\n`;

  // 4. VIP Morning (จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า) using Hangseng VIP Morning card
  const resVip = Ey(hVip_src, d.code);
  const chVip = checkTarget(d.dateStr, 
    { file: 'lotto_data_china_vip_morning.json', shortName: 'จีน VIP' }, 
    { file: 'lotto_data_hangseng_vip_morning.json', shortName: 'ฮั่งเส็ง VIP' }, 
    resVip.d0, resVip.d1, resVip.pairs
  );
  csv += `"${rowIdx++}","${category}","${d.name}","${d.dateFormatted}","💎 VIP เช้า (10:30-11:00)","จีน VIP (เช้า) 10:30 ➡️ ตาม ฮั่งเส็ง VIP (เช้า) 11:00","ฮั่งเส็ง VIP (เช้า)","${resVip.d0}","${chVip.hitD0}","${resVip.d1}","${chVip.hitD1}","${resVip.pairs}","${chVip.hitTop6}","84.7%","15.3%","สำหรับสายหุ้น VIP เจาะ 2 ตัว Top 6 แตกบ่อย"\n`;
});

// 2. SECTION 2: 1-Month Historical Walk-Forward Simulation (22 trading days from 12 ต.ค. 2569 down to 11 ก.ย. 2569)
pastMonthDates.forEach(dt => {
  const sampleRec = chinaA.find(x => x.date === dt);
  const dow = sampleRec.dayOfWeek;
  const thaiDow = 'วัน' + sampleRec.dayNameThai;
  const dateFormatted = sampleRec.dateFormatted;

  // Strict walk-forward: only use past draws before dt
  const nM_past = nikkeiM.filter(d => d.date < dt);
  const cA_past = chinaA.filter(d => d.date < dt);
  const hVip_past = hangsengVipM.filter(d => d.date < dt);

  // 1. Morning (นิเคอิ เช้า ➡️ จีน เช้า)
  const resM = Ey(nM_past, dow);
  const chM = checkTarget(dt, 
    { file: 'lotto_data_nikkei_morning.json', shortName: 'นิเคอิ' }, 
    { file: 'lotto_data_china_morning.json', shortName: 'จีน' }, 
    resM.d0, resM.d1, resM.pairs
  );
  csv += `"${rowIdx++}","ผลย้อนหลังจริง 1 เดือน","${thaiDow}","${dateFormatted}","☀️ รอบเช้า (09:30-10:30)","นิเคอิ (เช้า) 09:30 ➡️ ตาม จีน (เช้า) 10:30","นิเคอิ (เช้า)","${resM.d0}","${chM.hitD0}","${resM.d1}","${chM.hitD1}","${resM.pairs}","${chM.hitTop6}","86.3%","13.7%","แทงนิเคอิเช้า ถ้าเข้าเป้าหยุดทันที หากหลุดตามทบจีนเช้า"\n`;

  // 2. Afternoon Recommended (นิเคอิ บ่าย ➡️ จีน บ่าย)
  const resA = Ey(cA_past, dow);
  const chA1 = checkTarget(dt, 
    { file: 'lotto_data_nikkei_afternoon.json', shortName: 'นิเคอิ' }, 
    { file: 'lotto_data_china_afternoon.json', shortName: 'จีน' }, 
    resA.d0, resA.d1, resA.pairs
  );
  csv += `"${rowIdx++}","ผลย้อนหลังจริง 1 เดือน","${thaiDow}","${dateFormatted}","🌤️ รอบบ่าย (แนะนำ 🥇 13:00-14:00)","นิเคอิ (บ่าย) 13:00 ➡️ ตาม จีน (บ่าย) 14:00","จีน (บ่าย)","${resA.d0}","${chA1.hitD0}","${resA.d1}","${chA1.hitD1}","${resA.pairs}","${chA1.hitTop6}","89.0%","11.0%","หลุดน้อยที่สุดในระบบ แทงนิเคอิบ่าย ถ้าหลุดตามทบจีนบ่าย"\n`;

  // 3. Afternoon Alternative (จีน บ่าย ➡️ ฮั่งเส็ง บ่าย)
  const chA2 = checkTarget(dt, 
    { file: 'lotto_data_china_afternoon.json', shortName: 'จีน' }, 
    { file: 'lotto_data_hangseng_afternoon.json', shortName: 'ฮั่งเส็ง' }, 
    resA.d0, resA.d1, resA.pairs
  );
  csv += `"${rowIdx++}","ผลย้อนหลังจริง 1 เดือน","${thaiDow}","${dateFormatted}","🌤️ รอบบ่าย (ทางเลือกเจาะแตก 14:00-15:30)","จีน (บ่าย) 14:00 ➡️ ตาม ฮั่งเส็ง (บ่าย) 15:30","จีน (บ่าย)","${resA.d0}","${chA2.hitD0}","${resA.d1}","${chA2.hitD1}","${resA.pairs}","${chA2.hitTop6}","87.2%","12.8%","ชุดเจาะ 2 ตัวเข้าดีที่สุด (25.6%) แทงจีนบ่าย ถ้าหลุดตามฮั่งเส็งบ่าย"\n`;

  // 4. VIP Morning (จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า)
  const resVip = Ey(hVip_past, dow);
  const chVip = checkTarget(dt, 
    { file: 'lotto_data_china_vip_morning.json', shortName: 'จีน VIP' }, 
    { file: 'lotto_data_hangseng_vip_morning.json', shortName: 'ฮั่งเส็ง VIP' }, 
    resVip.d0, resVip.d1, resVip.pairs
  );
  csv += `"${rowIdx++}","ผลย้อนหลังจริง 1 เดือน","${thaiDow}","${dateFormatted}","💎 VIP เช้า (10:30-11:00)","จีน VIP (เช้า) 10:30 ➡️ ตาม ฮั่งเส็ง VIP (เช้า) 11:00","ฮั่งเส็ง VIP (เช้า)","${resVip.d0}","${chVip.hitD0}","${resVip.d1}","${chVip.hitD1}","${resVip.pairs}","${chVip.hitTop6}","84.7%","15.3%","สำหรับสายหุ้น VIP เจาะ 2 ตัว Top 6 แตกบ่อย"\n`;
});

// Output files
const outDist = path.join(__dirname, '..', 'dist', 'assets', 'lotto_chase_strategy_daily.csv');
const outWorker = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'lotto_chase_strategy_daily.csv');

fs.writeFileSync(outDist, csv, 'utf8');
fs.writeFileSync(outWorker, csv, 'utf8');

console.log('Successfully generated lotto_chase_strategy_daily.csv:');
console.log('Total Rows:', rowIdx - 1);
console.log('File size:', csv.length, 'bytes');
