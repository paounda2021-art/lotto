const fs = require('fs');
const path = require('path');

function getDraws(f) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const allData = {
  nikkeiM: getDraws('lotto_data_nikkei_morning.json'),
  chinaM: getDraws('lotto_data_china_morning.json'),
  hangsengM: getDraws('lotto_data_hangseng_morning.json'),
  nikkeiA: getDraws('lotto_data_nikkei_afternoon.json'),
  chinaA: getDraws('lotto_data_china_afternoon.json'),
  hangsengA: getDraws('lotto_data_hangseng_afternoon.json'),
  nikkeiVipM: getDraws('lotto_data_nikkei_vip_morning.json'),
  chinaVipM: getDraws('lotto_data_china_vip_morning.json'),
  hangsengVipM: getDraws('lotto_data_hangseng_vip_morning.json'),
  nikkeiVipA: getDraws('lotto_data_nikkei_vip_afternoon.json'),
  chinaVipA: getDraws('lotto_data_china_vip_afternoon.json'),
  hangsengVipA: getDraws('lotto_data_hangseng_vip_afternoon.json')
};

function parseDraw(d) {
  if (!d) return null;
  const top3 = String(d.top3 || '').trim();
  const bottom2 = String(d.bottom2 || '').trim();
  if (/^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2)) {
    const top2 = d.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
    return {
      top2,
      tensTop: top2[0],
      unitsTop: top2[1],
      bottom2,
      tensBottom: bottom2[0],
      unitsBottom: bottom2[1],
      isClosed: false
    };
  }
  return { isClosed: true, raw: top3 + bottom2 };
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

const clusters = [
  {
    session: '☀️ รอบเช้า (09:30-11:00)',
    group: 'หุ้นปกติ',
    pairDesc: 'นิเคอิ (เช้า) 09:30 ➡️ ตาม จีน (เช้า) 10:30 ➡️ ตาม ฮั่งเส็ง (เช้า) 11:00',
    cardKey: 'nikkeiM',
    cardName: 'นิเคอิ (เช้า)',
    s1Key: 'nikkeiM', s1Name: 'นิเคอิ (เช้า)',
    s2Key: 'chinaM', s2Name: 'จีน (เช้า)',
    s3Key: 'hangsengM', s3Name: 'ฮั่งเส็ง (เช้า)'
  },
  {
    session: '🌤️ รอบบ่าย (13:00-15:30)',
    group: 'หุ้นปกติ',
    pairDesc: 'นิเคอิ (บ่าย) 13:00 ➡️ ตาม จีน (บ่าย) 14:00 ➡️ ตาม ฮั่งเส็ง (บ่าย) 15:30',
    cardKey: 'chinaA',
    cardName: 'จีน (บ่าย)',
    s1Key: 'nikkeiA', s1Name: 'นิเคอิ (บ่าย)',
    s2Key: 'chinaA', s2Name: 'จีน (บ่าย)',
    s3Key: 'hangsengA', s3Name: 'ฮั่งเส็ง (บ่าย)'
  },
  {
    session: '💎 VIP เช้า (09:30-11:00)',
    group: 'หุ้น VIP',
    pairDesc: 'นิเคอิ VIP (เช้า) 09:30 ➡️ ตาม จีน VIP (เช้า) 10:30 ➡️ ตาม ฮั่งเส็ง VIP (เช้า) 11:00',
    cardKey: 'chinaVipM',
    cardName: 'จีน VIP (เช้า)',
    s1Key: 'nikkeiVipM', s1Name: 'นิเคอิ VIP (เช้า)',
    s2Key: 'chinaVipM', s2Name: 'จีน VIP (เช้า)',
    s3Key: 'hangsengVipM', s3Name: 'ฮั่งเส็ง VIP (เช้า)'
  },
  {
    session: '💎 VIP บ่าย (13:00-15:30)',
    group: 'หุ้น VIP',
    pairDesc: 'นิเคอิ VIP (บ่าย) 13:00 ➡️ ตาม จีน VIP (บ่าย) 14:00 ➡️ ตาม ฮั่งเส็ง VIP (บ่าย) 15:30',
    cardKey: 'chinaVipA',
    cardName: 'จีน VIP (บ่าย)',
    s1Key: 'nikkeiVipA', s1Name: 'นิเคอิ VIP (บ่าย)',
    s2Key: 'chinaVipA', s2Name: 'จีน VIP (บ่าย)',
    s3Key: 'hangsengVipA', s3Name: 'ฮั่งเส็ง VIP (บ่าย)'
  }
];

// Pre-draw Monday (excluding 2026-10-12 so it matches pre-draw cards on screen)
const nikkeiM_Mon = allData.nikkeiM.filter(d => d.date !== '2026-10-12');
const chinaA_Mon = allData.chinaA.filter(d => d.date !== '2026-10-12');
const chinaVipM_Mon = allData.chinaVipM.filter(d => d.date !== '2026-10-12');
const chinaVipA_Mon = allData.chinaVipA.filter(d => d.date !== '2026-10-12');

const weeklyDaysConfig = [
  { code: 'Tue', name: 'วันอังคาร (วันนี้)', dateFormatted: '13 ต.ค. 2569', dateStr: '2026-10-13', isFuture: true },
  { code: 'Wed', name: 'วันพุธ', dateFormatted: '14 ต.ค. 2569', dateStr: '2026-10-14', isFuture: true },
  { code: 'Thu', name: 'วันพฤหัสบดี', dateFormatted: '15 ต.ค. 2569', dateStr: '2026-10-15', isFuture: true },
  { code: 'Fri', name: 'วันศุกร์', dateFormatted: '16 ต.ค. 2569', dateStr: '2026-10-16', isFuture: true },
  { code: 'Mon', name: 'วันจันทร์ (ล่าสุด)', dateFormatted: '12 ต.ค. 2569', dateStr: '2026-10-12', isFuture: false }
];

const pastMonthDates = allData.chinaA
  .map(x => x.date)
  .filter(x => x <= '2026-10-12' && x >= '2026-09-11'); // 22 trading days descending

let csv = '\uFEFF'; // UTF-8 BOM

// 34 Clean Comprehensive Columns
csv += [
  'ลำดับ',
  'ประเภทข้อมูล',
  'วันทำการ',
  'วันที่',
  'ช่วงเวลา',
  'กลุ่มหวย',
  'คู่หวยสูตรล่า (สเต็ป 1 ➡️ 2 ➡️ 3)',
  'การ์ดต้นทาง',
  'เด่นหลัก',
  'เด่นรอง',
  'ชุดเจาะ Top 6',
  'หวย1_ชื่อ',
  'หวย1_2ตัวบน',
  'หวย1_สิบบน',
  'หวย1_หน่วยบน',
  'หวย1_2ตัวล่าง',
  'หวย1_สิบล่าง',
  'หวย1_หน่วยล่าง',
  'หวย2_ชื่อ',
  'หวย2_2ตัวบน',
  'หวย2_สิบบน',
  'หวย2_หน่วยบน',
  'หวย2_2ตัวล่าง',
  'หวย2_สิบล่าง',
  'หวย2_หน่วยล่าง',
  'หวย3_ชื่อ',
  'หวย3_2ตัวบน',
  'หวย3_สิบบน',
  'หวย3_หน่วยบน',
  'หวย3_2ตัวล่าง',
  'หวย3_สิบล่าง',
  'หวย3_หน่วยล่าง',
  'เช็คเป้า_สิบบน',
  'เช็คเป้า_หน่วยบน',
  'เช็คเป้า_สิบล่าง',
  'เช็คเป้า_หน่วยล่าง',
  'สรุปเข้าเป้ารอบไหน',
  'ตำแหน่งที่เข้าเป้าทั้งหมด'
].join(',') + '\n';

let rowIdx = 1;

function evaluateRow(category, dowName, dateFormatted, dateStr, cl, isFuture, isMon) {
  let sourceDraws;
  if (isMon) {
    if (cl.cardKey === 'nikkeiM') sourceDraws = nikkeiM_Mon;
    else if (cl.cardKey === 'chinaA') sourceDraws = chinaA_Mon;
    else if (cl.cardKey === 'chinaVipM') sourceDraws = chinaVipM_Mon;
    else sourceDraws = chinaVipA_Mon;
  } else {
    sourceDraws = dateStr ? allData[cl.cardKey].filter(d => d.date < dateStr) : allData[cl.cardKey];
  }

  // Dow code
  let dowCode = 'ALL';
  if (dowName.includes('จันทร์')) dowCode = 'Mon';
  else if (dowName.includes('อังคาร')) dowCode = 'Tue';
  else if (dowName.includes('พุธ')) dowCode = 'Wed';
  else if (dowName.includes('พฤหัสบดี')) dowCode = 'Thu';
  else if (dowName.includes('ศุกร์')) dowCode = 'Fri';

  const model = Ey(sourceDraws, dowCode);
  const d0 = model.d0;
  const d1 = model.d1;
  const pairs = model.pairs;

  if (isFuture) {
    return [
      `"${rowIdx++}"`,
      `"${category}"`,
      `"${dowName}"`,
      `"${dateFormatted}"`,
      `"${cl.session}"`,
      `"${cl.group}"`,
      `"${cl.pairDesc}"`,
      `"${cl.cardName}"`,
      `"${d0}"`,
      `"${d1}"`,
      `"${pairs}"`,
      `"${cl.s1Name}"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`,
      `"${cl.s2Name}"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`,
      `"${cl.s3Name}"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`, `"รอผล"`,
      `"รอผล"`,
      `"รอผล"`,
      `"รอผล"`,
      `"รอผล"`,
      `"รอผล"`,
      `"รอผล"`
    ].join(',');
  }

  const dr1 = parseDraw(allData[cl.s1Key].find(x => x.date === dateStr));
  const dr2 = parseDraw(allData[cl.s2Key].find(x => x.date === dateStr));
  const dr3 = parseDraw(allData[cl.s3Key].find(x => x.date === dateStr));

  const steps = [
    { name: cl.s1Name, draw: dr1, stepIdx: 1 },
    { name: cl.s2Name, draw: dr2, stepIdx: 2 },
    { name: cl.s3Name, draw: dr3, stepIdx: 3 }
  ];

  function formatDrawCols(sName, draw) {
    if (!draw) return [`"${sName}"`, `"-"`, `"-"`, `"-"`, `"-"`, `"-"`, `"-"`];
    if (draw.isClosed) return [`"${sName}"`, `"ปิด"`, `"ปิด"`, `"ปิด"`, `"ปิด"`, `"ปิด"`, `"ปิด"`];
    return [
      `"${sName}"`,
      `"${draw.top2}"`,
      `"${draw.tensTop}"`,
      `"${draw.unitsTop}"`,
      `"${draw.bottom2}"`,
      `"${draw.tensBottom}"`,
      `"${draw.unitsBottom}"`
    ];
  }

  const allClosed = (!dr1 || dr1.isClosed) && (!dr2 || dr2.isClosed) && (!dr3 || dr3.isClosed);

  function checkPos(posProp, posName) {
    if (allClosed) return 'งดออกผล';
    const hits = [];
    for (const s of steps) {
      if (!s.draw || s.draw.isClosed) continue;
      const val = s.draw[posProp];
      if (val === String(d0) || val === String(d1)) {
        hits.push(s.name.replace(/\s*\(.*?\)/, '') + 'เข้า ' + posName + ' (' + val + ')');
      }
    }
    return hits.length > 0 ? hits.join('; ') : 'X';
  }

  const hitTensTop = checkPos('tensTop', 'สิบบน');
  const hitUnitsTop = checkPos('unitsTop', 'หน่วยบน');
  const hitTensBottom = checkPos('tensBottom', 'สิบล่าง');
  const hitUnitsBottom = checkPos('unitsBottom', 'หน่วยล่าง');

  // Overall chase winner
  let chaseWinner = 'X';
  let allHits = [];

  if (allClosed) {
    chaseWinner = 'งดออกผล (ตลาดปิด)';
  } else {
    for (const s of steps) {
      if (!s.draw || s.draw.isClosed) continue;
      const sNameShort = s.name.replace(/\s*\(.*?\)/, '');
      const tHits = [];
      const bHits = [];

      if (s.draw.tensTop === String(d0) || s.draw.tensTop === String(d1)) tHits.push(`สิบบน(${s.draw.tensTop})`);
      if (s.draw.unitsTop === String(d0) || s.draw.unitsTop === String(d1)) tHits.push(`หน่วยบน(${s.draw.unitsTop})`);
      if (s.draw.tensBottom === String(d0) || s.draw.tensBottom === String(d1)) bHits.push(`สิบล่าง(${s.draw.tensBottom})`);
      if (s.draw.unitsBottom === String(d0) || s.draw.unitsBottom === String(d1)) bHits.push(`หน่วยล่าง(${s.draw.unitsBottom})`);

      if (tHits.length > 0 || bHits.length > 0) {
        const detail = [...tHits, ...bHits].join(', ');
        allHits.push(`${sNameShort}: ${detail}`);
        if (chaseWinner === 'X') {
          chaseWinner = `เข้าที่ ${s.name} (สเต็ป ${s.stepIdx}) [บน:${s.draw.top2}, ล่าง:${s.draw.bottom2}]`;
        }
      }
    }
  }

  const allHitsSummary = allHits.length > 0 ? allHits.join(' | ') : (allClosed ? 'งดออกผล' : 'X');

  return [
    `"${rowIdx++}"`,
    `"${category}"`,
    `"${dowName}"`,
    `"${dateFormatted}"`,
    `"${cl.session}"`,
    `"${cl.group}"`,
    `"${cl.pairDesc}"`,
    `"${cl.cardName}"`,
    `"${d0}"`,
    `"${d1}"`,
    `"${pairs}"`,
    ...formatDrawCols(cl.s1Name, dr1),
    ...formatDrawCols(cl.s2Name, dr2),
    ...formatDrawCols(cl.s3Name, dr3),
    `"${hitTensTop}"`,
    `"${hitUnitsTop}"`,
    `"${hitTensBottom}"`,
    `"${hitUnitsBottom}"`,
    `"${chaseWinner}"`,
    `"${allHitsSummary}"`
  ].join(',');
}

// 1. Weekly Schedule (Upcoming & Latest)
weeklyDaysConfig.forEach(d => {
  clusters.forEach(cl => {
    csv += evaluateRow('แผนสัปดาห์นี้', d.name, d.dateFormatted, d.dateStr, cl, d.isFuture, d.dateStr === '2026-10-12') + '\n';
  });
});

// 2. Historical 1-Month Walk-Forward (22 trading days from 12 Oct down to 11 Sep)
pastMonthDates.forEach(dt => {
  const sampleRec = allData.chinaA.find(x => x.date === dt);
  const thaiDow = 'วัน' + sampleRec.dayNameThai;
  const dateFormatted = sampleRec.dateFormatted;

  clusters.forEach(cl => {
    csv += evaluateRow('ผลย้อนหลัง 1 เดือน', thaiDow, dateFormatted, dt, cl, false, dt === '2026-10-12') + '\n';
  });
});

// Output files
const outDist = path.join(__dirname, '..', 'dist', 'assets', 'lotto_position_chase_daily.csv');
const outWorker = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'lotto_position_chase_daily.csv');

fs.writeFileSync(outDist, csv, 'utf8');
fs.writeFileSync(outWorker, csv, 'utf8');

console.log('Successfully generated lotto_position_chase_daily.csv:');
console.log('Total Rows:', rowIdx - 1);
console.log('File size:', csv.length, 'bytes');
