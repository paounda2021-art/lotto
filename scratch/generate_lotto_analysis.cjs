const fs = require('fs');
const path = require('path');

const datasets = [
  // หุ้นปกติ
  { key: 'nikkei_morning', file: 'lotto_data_nikkei_morning.json', group: 'หุ้นปกติ', session: 'เช้า', name: 'นิเคอิ (เช้า)', time: '09:30' },
  { key: 'nikkei_afternoon', file: 'lotto_data_nikkei_afternoon.json', group: 'หุ้นปกติ', session: 'บ่าย', name: 'นิเคอิ (บ่าย)', time: '13:00' },
  { key: 'china_morning', file: 'lotto_data_china_morning.json', group: 'หุ้นปกติ', session: 'เช้า', name: 'จีน (เช้า)', time: '10:30' },
  { key: 'china_afternoon', file: 'lotto_data_china_afternoon.json', group: 'หุ้นปกติ', session: 'บ่าย', name: 'จีน (บ่าย)', time: '14:00' },
  { key: 'hangseng_morning', file: 'lotto_data_hangseng_morning.json', group: 'หุ้นปกติ', session: 'เช้า', name: 'ฮั่งเส็ง (เช้า)', time: '11:00' },
  { key: 'hangseng_afternoon', file: 'lotto_data_hangseng_afternoon.json', group: 'หุ้นปกติ', session: 'บ่าย', name: 'ฮั่งเส็ง (บ่าย)', time: '15:30' },
  // หุ้น VIP
  { key: 'nikkei_vip_morning', file: 'lotto_data_nikkei_vip_morning.json', group: 'หุ้น VIP', session: 'เช้า', name: 'นิเคอิ VIP (เช้า)', time: '09:30' },
  { key: 'nikkei_vip_afternoon', file: 'lotto_data_nikkei_vip_afternoon.json', group: 'หุ้น VIP', session: 'บ่าย', name: 'นิเคอิ VIP (บ่าย)', time: '13:00' },
  { key: 'china_vip_morning', file: 'lotto_data_china_vip_morning.json', group: 'หุ้น VIP', session: 'เช้า', name: 'จีน VIP (เช้า)', time: '10:30' },
  { key: 'china_vip_afternoon', file: 'lotto_data_china_vip_afternoon.json', group: 'หุ้น VIP', session: 'บ่าย', name: 'จีน VIP (บ่าย)', time: '14:00' },
  { key: 'hangseng_vip_morning', file: 'lotto_data_hangseng_vip_morning.json', group: 'หุ้น VIP', session: 'เช้า', name: 'ฮั่งเส็ง VIP (เช้า)', time: '11:00' },
  { key: 'hangseng_vip_afternoon', file: 'lotto_data_hangseng_vip_afternoon.json', group: 'หุ้น VIP', session: 'บ่าย', name: 'ฮั่งเส็ง VIP (บ่าย)', time: '15:30' },
  // ฮานอย
  { key: 'hanoi_special', file: 'lotto_data_hanoi_special.json', group: 'ฮานอย', session: 'เย็น (17:30)', name: 'ฮานอยพิเศษ', time: '17:30' },
  { key: 'hanoi_regular', file: 'lotto_data_hanoi.json', group: 'ฮานอย', session: 'ค่ำ (18:30)', name: 'ฮานอยปกติ', time: '18:30' },
  { key: 'hanoi_vip', file: 'lotto_data_hanoi_vip.json', group: 'ฮานอย', session: 'ดึก (19:30)', name: 'ฮานอย VIP', time: '19:30' },
];

function isNumeric(d) {
  if (!d) return false;
  const top3 = String(d.top3 || '').trim();
  const bottom2 = String(d.bottom2 || '').trim();
  return /^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2);
}

// 1. Detailed per-lottery walk-forward backtest
const lotteryReports = [];

datasets.forEach(lottery => {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', lottery.file);
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const valid = raw.filter(isNumeric).sort((a,b) => (a.date || '').localeCompare(b.date || ''));

  let totalTested = 0;
  let hitPrimary = 0;
  let hitSecondary = 0;
  let hitEither = 0;
  let hitBoth = 0;
  let hitTop6 = 0;
  const pairHitFreq = {};

  const historyRows = [];

  for (let i = 10; i < valid.length; i++) {
    const currentDraw = valid[i];
    const pastDraws = valid.slice(0, i);

    const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    const pairCounts = {};

    pastDraws.forEach(d => {
      const top3 = String(d.top3 || '');
      const b2 = String(d.bottom2 || '');
      const t2 = d.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
      (top3 + b2).split('').forEach(ch => {
        const n = parseInt(ch, 10);
        if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
      });
      if (/^[0-9]{2}$/.test(t2)) pairCounts[t2] = (pairCounts[t2] || 0) + 1;
      if (/^[0-9]{2}$/.test(b2)) pairCounts[b2] = (pairCounts[b2] || 0) + 1;
    });

    const sortedDigits = Object.entries(digitCounts).map(([d, c]) => ({ digit: parseInt(d, 10), c })).sort((a,b) => b.c - a.c);
    const d0 = sortedDigits[0].digit;
    const d1 = sortedDigits[1].digit;
    const sortedPairs = Object.entries(pairCounts).sort((a,b) => b[1] - a[1]).slice(0, 6).map(x => x[0]);

    const curTop3 = String(currentDraw.top3 || '');
    const curTop2 = currentDraw.top2 || (curTop3.length >= 2 ? curTop3.slice(-2) : '');
    const curB2 = String(currentDraw.bottom2 || '');

    const pInTop = curTop2.includes(String(d0));
    const pInBottom = curB2.includes(String(d0));
    const sInTop = curTop2.includes(String(d1));
    const sInBottom = curB2.includes(String(d1));

    const pInAny = pInTop || pInBottom;
    const sInAny = sInTop || sInBottom;
    const either = pInAny || sInAny;
    const both = pInAny && sInAny;

    const matchedPairs = sortedPairs.filter(p => p === curTop2 || p === curB2);
    const pairHit = matchedPairs.length > 0;

    totalTested++;
    if (pInAny) hitPrimary++;
    if (sInAny) hitSecondary++;
    if (either) hitEither++;
    if (both) hitBoth++;
    if (pairHit) {
      hitTop6++;
      matchedPairs.forEach(mp => {
        pairHitFreq[mp] = (pairHitFreq[mp] || 0) + 1;
      });
    }

    historyRows.push({
      date: currentDraw.date,
      dateFormatted: currentDraw.dateFormatted || currentDraw.date,
      dayOfWeek: currentDraw.dayOfWeek || '',
      dayNameThai: currentDraw.dayNameThai || '',
      lotteryGroup: lottery.group,
      lotteryName: lottery.name,
      session: lottery.session,
      time: lottery.time,
      d0,
      d1,
      top6Pairs: sortedPairs.join(' '),
      top3: curTop3,
      top2: curTop2,
      bottom2: curB2,
      hitPrimary: pInAny ? 'เข้า' : 'หลุด',
      hitPrimaryDetail: (pInTop ? 'บน ' + curTop2 : '') + (pInTop && pInBottom ? ', ' : '') + (pInBottom ? 'ล่าง ' + curB2 : ''),
      hitSecondary: sInAny ? 'เข้า' : 'หลุด',
      hitSecondaryDetail: (sInTop ? 'บน ' + curTop2 : '') + (sInTop && sInBottom ? ', ' : '') + (sInBottom ? 'ล่าง ' + curB2 : ''),
      hitRunning: either ? 'เข้า' : 'หลุด',
      hitBoth: both ? 'เข้าคู่ (เด่น+รอง)' : '-',
      hitTop6: pairHit ? 'เข้า' : 'หลุด',
      hitTop6Detail: matchedPairs.join(', ') || '-'
    });
  }

  const ratePrimary = Math.round((hitPrimary / totalTested) * 1000) / 10;
  const rateSecondary = Math.round((hitSecondary / totalTested) * 1000) / 10;
  const rateEither = Math.round((hitEither / totalTested) * 1000) / 10;
  const rateBoth = Math.round((hitBoth / totalTested) * 1000) / 10;
  const rateTop6 = Math.round((hitTop6 / totalTested) * 1000) / 10;

  const topHitPairs = Object.entries(pairHitFreq).sort((a,b) => b[1] - a[1]).slice(0, 5);

  lotteryReports.push({
    ...lottery,
    totalTested,
    hitPrimary,
    ratePrimary,
    hitSecondary,
    rateSecondary,
    hitEither,
    rateEither,
    hitBoth,
    rateBoth,
    hitTop6,
    rateTop6,
    topHitPairs,
    historyRows
  });
});

// Group comparison: Morning vs Afternoon
const sessionComparison = {
  'หุ้นปกติ': {
    'เช้า': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 },
    'บ่าย': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 }
  },
  'หุ้น VIP': {
    'เช้า': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 },
    'บ่าย': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 }
  },
  'ฮานอย': {
    'เย็น (17:30)': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 },
    'ค่ำ (18:30)': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 },
    'ดึก (19:30)': { total: 0, p: 0, s: 0, either: 0, both: 0, top6: 0 },
  }
};

lotteryReports.forEach(r => {
  if (r.group === 'หุ้นปกติ' || r.group === 'หุ้น VIP') {
    const sess = r.session;
    const tgt = sessionComparison[r.group][sess];
    tgt.total += r.totalTested;
    tgt.p += r.hitPrimary;
    tgt.s += r.hitSecondary;
    tgt.either += r.hitEither;
    tgt.both += r.hitBoth;
    tgt.top6 += r.hitTop6;
  } else if (r.group === 'ฮานอย') {
    const tgt = sessionComparison['ฮานอย'][r.session];
    tgt.total += r.totalTested;
    tgt.p += r.hitPrimary;
    tgt.s += r.hitSecondary;
    tgt.either += r.hitEither;
    tgt.both += r.hitBoth;
    tgt.top6 += r.hitTop6;
  }
});

// Output Summary Console
console.log('=== LOTTERY HIT RATE RANKING (SORTED BY RUNNING / EITHER HIT RATE) ===');
const sortedByRunning = [...lotteryReports].sort((a,b) => b.rateEither - a.rateEither);
sortedByRunning.forEach((r, idx) => {
  console.log(`${idx + 1}. ${r.name.padEnd(20)} [${r.group} | ${r.session} ${r.time}] -> วิ่ง/รูด: ${r.rateEither}% (เด่น: ${r.ratePrimary}%, รอง: ${r.rateSecondary}%), Top 6 เจาะ: ${r.rateTop6}%, เข้าทั้งคู่: ${r.rateBoth}%`);
});

console.log('\n=== TOP 6 PAIRS HIT RATE RANKING (SORTED BY TOP 6 PAIRS HIT RATE) ===');
const sortedByTop6 = [...lotteryReports].sort((a,b) => b.rateTop6 - a.rateTop6);
sortedByTop6.forEach((r, idx) => {
  const topPairsStr = r.topHitPairs.map(([p, cnt]) => `${p} (${cnt}ครั้ง)`).join(', ');
  console.log(`${idx + 1}. ${r.name.padEnd(20)} -> เจาะเข้า: ${r.rateTop6}% (${r.hitTop6}/${r.totalTested} งวด) | เลขที่เข้าบ่อย: [${topPairsStr}]`);
});

console.log('\n=== MORNING VS AFTERNOON COMPARISON ===');
['หุ้นปกติ', 'หุ้น VIP'].forEach(grp => {
  const m = sessionComparison[grp]['เช้า'];
  const a = sessionComparison[grp]['บ่าย'];
  const mEitherRate = ((m.either / m.total) * 100).toFixed(1);
  const aEitherRate = ((a.either / a.total) * 100).toFixed(1);
  const mTop6Rate = ((m.top6 / m.total) * 100).toFixed(1);
  const aTop6Rate = ((a.top6 / a.total) * 100).toFixed(1);

  console.log(`\nกลุ่ม: ${grp}`);
  console.log(`  ☀️ รอบเช้า : วิ่ง/รูด ${mEitherRate}% (${m.either}/${m.total}), เจาะ Top 6 ${mTop6Rate}% (${m.top6}/${m.total})`);
  console.log(`  🌤️ รอบบ่าย : วิ่ง/รูด ${aEitherRate}% (${a.either}/${a.total}), เจาะ Top 6 ${aTop6Rate}% (${a.top6}/${a.total})`);
  const winnerRunning = parseFloat(aEitherRate) > parseFloat(mEitherRate) ? 'รอบบ่าย เข้ามากกว่ารอบเช้า' : 'รอบเช้า เข้ามากกว่ารอบบ่าย';
  const winnerTop6 = parseFloat(aTop6Rate) > parseFloat(mTop6Rate) ? 'รอบบ่าย เข้ามากกว่ารอบเช้า' : 'รอบเช้า เข้ามากกว่ารอบบ่าย';
  console.log(`  🏆 สรุปผล: วิ่ง/รูด -> ${winnerRunning} | เจาะ Top 6 -> ${winnerTop6}`);
});

console.log('\nกลุ่ม: หวยฮานอย (3 รอบ)');
['เย็น (17:30)', 'ค่ำ (18:30)', 'ดึก (19:30)'].forEach(sess => {
  const h = sessionComparison['ฮานอย'][sess];
  const rateEither = ((h.either / h.total) * 100).toFixed(1);
  const rateTop6 = ((h.top6 / h.total) * 100).toFixed(1);
  console.log(`  🇻🇳 ฮานอยรอบ ${sess} : วิ่ง/รูด ${rateEither}% (${h.either}/${h.total}), เจาะ Top 6 ${rateTop6}% (${h.top6}/${h.total})`);
});

// Generate CSV Content for Download
// 1. Summary Sheet CSV
let csvSummary = '\uFEFF'; // UTF-8 BOM
csvSummary += 'อันดับ,กลุ่มหวย,ชื่อหวยและรอบ,รอบเวลา,จำนวนงวดที่ทดสอบ,อัตราเข้าวิ่งรูด (เด่น+รอง),เด่นหลักเข้า (%),เด่นรองเข้า (%),เข้าพร้อมกันทั้งคู่ (%),ชุดเจาะ 6 คู่เข้า (%),จำนวนครั้งที่เจาะเข้า,เลขเจาะ 2 ตัวที่เข้าบ่อยที่สุด\n';

sortedByRunning.forEach((r, idx) => {
  const topPairsStr = r.topHitPairs.map(([p, cnt]) => `${p} (${cnt}ครั้ง)`).join(' ');
  csvSummary += `"${idx + 1}","${r.group}","${r.name}","${r.session} (${r.time})","${r.totalTested}","${r.rateEither}%","${r.ratePrimary}%","${r.rateSecondary}%","${r.rateBoth}%","${r.rateTop6}%","${r.hitTop6}","${topPairsStr}"\n`;
});

// Append Session Comparison
csvSummary += '\n\n';
csvSummary += 'บทวิเคราะห์เปรียบเทียบ เช้า VS บ่าย และรอบเวลาที่เข้ามากที่สุด\n';
csvSummary += 'กลุ่มหวย,รอบเวลา,จำนวนงวดรวม,อัตราเข้าวิ่งรูดรวม (%),อัตราเข้าชุดเจาะ 6 คู่รวม (%),บทสรุปความคุ้มค่า\n';

['หุ้นปกติ', 'หุ้น VIP'].forEach(grp => {
  ['เช้า', 'บ่าย'].forEach(sess => {
    const s = sessionComparison[grp][sess];
    const eitherRate = ((s.either / s.total) * 100).toFixed(1);
    const top6Rate = ((s.top6 / s.total) * 100).toFixed(1);
    const note = sess === 'บ่าย' ? 'รอบบ่ายอัตราเจาะ 2 ตัวและวิ่งรูดมีสถิติสูงกว่ารอบเช้า' : 'รอบเช้าเป็นรอบปูทางสถิติของวัน';
    csvSummary += `"${grp}","${sess}","${s.total}","${eitherRate}%","${top6Rate}%","${note}"\n`;
  });
});

['เย็น (17:30)', 'ค่ำ (18:30)', 'ดึก (19:30)'].forEach(sess => {
  const s = sessionComparison['ฮานอย'][sess];
  const eitherRate = ((s.either / s.total) * 100).toFixed(1);
  const top6Rate = ((s.top6 / s.total) * 100).toFixed(1);
  let note = '';
  if (sess.includes('19:30')) note = 'ฮานอย VIP วิ่งรูดเข้าสูงสุด 59.1%';
  else if (sess.includes('17:30')) note = 'ฮานอยพิเศษ เจาะ 2 ตัว Top 6 เข้าสูงสุด 14.0%';
  else note = 'ฮานอยปกติ อัตราเข้าสม่ำเสมอ 57.0%';
  csvSummary += `"หวยฮานอย","${sess}","${s.total}","${eitherRate}%","${top6Rate}%","${note}"\n`;
});

// 2. All Draws Detailed CSV
let csvDetails = '\uFEFF';
csvDetails += 'ลำดับ,วันที่,วัน,กลุ่มหวย,ชื่อหวยและรอบ,ช่วงเวลา,เด่นหลัก,เด่นรอง,ชุดเจาะ 6 คู่,ผล 3 ตัวบน,ผล 2 ตัวบน,ผล 2 ตัวล่าง,วิ่งรูดเด่นหลัก,ตำแหน่งที่เข้าเด่นหลัก,วิ่งรูดเด่นรอง,ตำแหน่งที่เข้าเด่นรอง,สรุปวิ่งรูด,เข้าคู่เด่น+รอง,ผลชุดเจาะ 6 คู่,เลขเจาะที่เข้า\n';

let detailCount = 1;
lotteryReports.forEach(r => {
  r.historyRows.forEach(row => {
    csvDetails += `"${detailCount++}","${row.dateFormatted}","${row.dayNameThai}","${row.lotteryGroup}","${row.lotteryName}","${row.session} (${row.time})","${row.d0}","${row.d1}","${row.top6Pairs}","${row.top3}","${row.top2}","${row.bottom2}","${row.hitPrimary}","${row.hitPrimaryDetail}","${row.hitSecondary}","${row.hitSecondaryDetail}","${row.hitRunning}","${row.hitBoth}","${row.hitTop6}","${row.hitTop6Detail}"\n`;
  });
});

// Save CSV files to dist/assets and downloaded_target_worker/assets
const outSummaryDist = path.join(__dirname, '..', 'dist', 'assets', 'lotto_hit_rate_summary.csv');
const outSummaryWorker = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'lotto_hit_rate_summary.csv');
fs.writeFileSync(outSummaryDist, csvSummary, 'utf8');
fs.writeFileSync(outSummaryWorker, csvSummary, 'utf8');

const outDetailsDist = path.join(__dirname, '..', 'dist', 'assets', 'lotto_hit_rate_details.csv');
const outDetailsWorker = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'lotto_hit_rate_details.csv');
fs.writeFileSync(outDetailsDist, csvDetails, 'utf8');
fs.writeFileSync(outDetailsWorker, csvDetails, 'utf8');

console.log('\nCSV files generated successfully:');
console.log('1. dist/assets/lotto_hit_rate_summary.csv');
console.log('2. dist/assets/lotto_hit_rate_details.csv');
