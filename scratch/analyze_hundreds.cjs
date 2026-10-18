const fs = require('fs');
const path = require('path');

const fileConfigs = [
  { group: 'หุ้นปกติ', name: 'นิเคอิ (เช้า)', time: '09:30', file: 'lotto_data_nikkei_morning.json' },
  { group: 'หุ้นปกติ', name: 'จีน (เช้า)', time: '10:30', file: 'lotto_data_china_morning.json' },
  { group: 'หุ้นปกติ', name: 'ฮั่งเส็ง (เช้า)', time: '11:00', file: 'lotto_data_hangseng_morning.json' },
  { group: 'หุ้นปกติ', name: 'นิเคอิ (บ่าย)', time: '13:00', file: 'lotto_data_nikkei_afternoon.json' },
  { group: 'หุ้นปกติ', name: 'จีน (บ่าย)', time: '14:00', file: 'lotto_data_china_afternoon.json' },
  { group: 'หุ้นปกติ', name: 'ฮั่งเส็ง (บ่าย)', time: '15:30', file: 'lotto_data_hangseng_afternoon.json' },
  { group: 'หุ้น VIP', name: 'นิเคอิ VIP (เช้า)', time: '09:30', file: 'lotto_data_nikkei_vip_morning.json' },
  { group: 'หุ้น VIP', name: 'จีน VIP (เช้า)', time: '10:30', file: 'lotto_data_china_vip_morning.json' },
  { group: 'หุ้น VIP', name: 'ฮั่งเส็ง VIP (เช้า)', time: '11:00', file: 'lotto_data_hangseng_vip_morning.json' },
  { group: 'หุ้น VIP', name: 'นิเคอิ VIP (บ่าย)', time: '13:00', file: 'lotto_data_nikkei_vip_afternoon.json' },
  { group: 'หุ้น VIP', name: 'จีน VIP (บ่าย)', time: '14:00', file: 'lotto_data_china_vip_afternoon.json' },
  { group: 'หุ้น VIP', name: 'ฮั่งเส็ง VIP (บ่าย)', time: '15:30', file: 'lotto_data_hangseng_vip_afternoon.json' },
  { group: 'ฮานอย', name: 'ฮานอยพิเศษ', time: '17:30', file: 'lotto_data_hanoi_special.json' },
  { group: 'ฮานอย', name: 'ฮานอยปกติ', time: '18:30', file: 'lotto_data_hanoi.json' },
  { group: 'ฮานอย', name: 'ฮานอย VIP', time: '19:30', file: 'lotto_data_hanoi_vip.json' }
];

function analyzeHundreds(fConfig) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', fConfig.file);
  const draws = JSON.parse(fs.readFileSync(p, 'utf8'));

  // Valid 3-digit draws
  const validDraws = draws.filter(d => d.top3 && /^[0-9]{3}$/.test(String(d.top3).trim()));
  const total = validDraws.length;

  const countsAll = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  let evenCount = 0; // 0,2,4,6,8
  let highCount = 0; // 5,6,7,8,9

  const countsByDay = {
    Mon: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Tue: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Wed: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Thu: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Fri: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Sat: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 },
    Sun: { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, total: 0 }
  };

  validDraws.forEach(d => {
    const t3 = String(d.top3).trim();
    const hDigit = parseInt(t3[0], 10);
    countsAll[hDigit]++;
    if (hDigit % 2 === 0) evenCount++;
    if (hDigit >= 5) highCount++;

    const dow = d.dayOfWeek;
    if (countsByDay[dow]) {
      countsByDay[dow][hDigit]++;
      countsByDay[dow].total++;
    }
  });

  // Sort overall
  const sortedOverall = Object.entries(countsAll)
    .map(([dig, cnt]) => ({
      digit: parseInt(dig, 10),
      count: cnt,
      pct: ((cnt / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // Sort for Tuesday (วันนี้)
  const tueData = countsByDay.Tue;
  const sortedTue = Object.entries(tueData)
    .filter(([k]) => k !== 'total')
    .map(([dig, cnt]) => ({
      digit: parseInt(dig, 10),
      count: cnt,
      pct: tueData.total > 0 ? ((cnt / tueData.total) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count);

  return {
    group: fConfig.group,
    name: fConfig.name,
    time: fConfig.time,
    totalDraws: total,
    topRank1: sortedOverall[0],
    topRank2: sortedOverall[1],
    topRank3: sortedOverall[2],
    topRank4: sortedOverall[3],
    topRank5: sortedOverall[4],
    allSorted: sortedOverall,
    evenPct: ((evenCount / total) * 100).toFixed(1),
    oddPct: (((total - evenCount) / total) * 100).toFixed(1),
    highPct: ((highCount / total) * 100).toFixed(1),
    lowPct: (((total - highCount) / total) * 100).toFixed(1),
    tueTop1: sortedTue[0],
    tueTop2: sortedTue[1],
    tueTop3: sortedTue[2],
    tueTotal: tueData.total
  };
}

const allResults = fileConfigs.map(analyzeHundreds);

console.log('=== สรุปผลวิเคราะห์สถิติ "หลักร้อย" ทั้ง 15 รอบ (หุ้นปกติ, หุ้น VIP, ฮานอย) ===\n');

allResults.forEach(r => {
  console.log(`📌 [${r.group}] ${r.name.padEnd(20)} (${r.time} น.) | ตรวจ ${r.totalDraws} งวด`);
  console.log(`   👑 หลักร้อยออกบ่อยสุด (Overall): อันดับ 1=[${r.topRank1.digit}] (${r.topRank1.pct}%), อันดับ 2=[${r.topRank2.digit}] (${r.topRank2.pct}%), อันดับ 3=[${r.topRank3.digit}] (${r.topRank3.pct}%)`);
  console.log(`   🎯 วันอังคารชอบมา: อันดับ 1=[${r.tueTop1.digit}] (${r.tueTop1.pct}%), อันดับ 2=[${r.tueTop2.digit}] (${r.tueTop2.pct}%) | จาก ${r.tueTotal} งวด`);
  console.log(`   ⚖️ พฤติกรรม: คู่ ${r.evenPct}% vs คี่ ${r.oddPct}% | สูง(5-9) ${r.highPct}% vs ต่ำ(0-4) ${r.lowPct}%\n`);
});

fs.writeFileSync('scratch/hundreds_analysis_output.json', JSON.stringify(allResults, null, 2));
