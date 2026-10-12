const fs = require('fs');
const path = require('path');

function loadLotto(file) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', file);
  return JSON.parse(fs.readFileSync(p, 'utf8'))
    .filter(d => /^[0-9]{2,3}$/.test(String(d.top3 || '').trim()) && /^[0-9]{2}$/.test(String(d.bottom2 || '').trim()))
    .sort((a,b) => (a.date || '').localeCompare(b.date || ''));
}

const nikkeiM = loadLotto('lotto_data_nikkei_morning.json');
const chinaM = loadLotto('lotto_data_china_morning.json');
const hangsengM = loadLotto('lotto_data_hangseng_morning.json');

const nikkeiA = loadLotto('lotto_data_nikkei_afternoon.json');
const chinaA = loadLotto('lotto_data_china_afternoon.json');
const hangsengA = loadLotto('lotto_data_hangseng_afternoon.json');

const nikkeiVipM = loadLotto('lotto_data_nikkei_vip_morning.json');
const chinaVipM = loadLotto('lotto_data_china_vip_morning.json');
const hangsengVipM = loadLotto('lotto_data_hangseng_vip_morning.json');

const nikkeiVipA = loadLotto('lotto_data_nikkei_vip_afternoon.json');
const chinaVipA = loadLotto('lotto_data_china_vip_afternoon.json');
const hangsengVipA = loadLotto('lotto_data_hangseng_vip_afternoon.json');

const hanoiSpecial = loadLotto('lotto_data_hanoi_special.json');
const hanoiReg = loadLotto('lotto_data_hanoi.json');
const hanoiVip = loadLotto('lotto_data_hanoi_vip.json');

// Helper to calculate top digits & top pairs from past draws
function getPrediction(pastDraws) {
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
  return { d0, d1, top6: sortedPairs };
}

function checkHit(draw, pred) {
  if (!draw) return { hitRunning: false, hitTop6: false, hitBoth: false };
  const top3 = String(draw.top3 || '');
  const top2 = draw.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
  const b2 = String(draw.bottom2 || '');

  const pHit = top2.includes(String(pred.d0)) || b2.includes(String(pred.d0));
  const sHit = top2.includes(String(pred.d1)) || b2.includes(String(pred.d1));
  const hitRunning = pHit || sHit;
  const hitBoth = pHit && sHit;
  const hitTop6 = pred.top6.includes(top2) || pred.top6.includes(b2);

  return { hitRunning, hitTop6, hitBoth, pHit, sHit };
}

// Simulate 2-lottery chase: Play Lotto1 -> if miss, follow in Lotto2
function simulateChase(lotto1List, lotto2List, sourceLottoForPred, name) {
  // Map dates
  const map1 = new Map(lotto1List.map(d => [d.date, d]));
  const map2 = new Map(lotto2List.map(d => [d.date, d]));

  // Common dates
  const dates = lotto1List.map(d => d.date).filter(dt => map2.has(dt)).sort();

  let totalDays = 0;
  let winRound1Running = 0;
  let winRound2Running = 0;
  let totalWinRunning = 0;
  let lossRunning = 0;

  let winRound1Top6 = 0;
  let winRound2Top6 = 0;
  let totalWinTop6 = 0;

  for (let i = 10; i < dates.length; i++) {
    const dt = dates[i];
    const pastForPred = sourceLottoForPred.filter(d => (d.date || '') < dt);
    if (pastForPred.length < 10) continue;

    const pred = getPrediction(pastForPred);

    const d1 = map1.get(dt);
    const d2 = map2.get(dt);

    const res1 = checkHit(d1, pred);
    const res2 = checkHit(d2, pred);

    totalDays++;

    // Chase for Running (เด่น-รอง 19 ประตู)
    if (res1.hitRunning) {
      winRound1Running++;
      totalWinRunning++;
    } else if (res2.hitRunning) {
      winRound2Running++;
      totalWinRunning++;
    } else {
      lossRunning++;
    }

    // Chase for Top 6 (ชุดเจาะ 2 ตัว 6 คู่)
    if (res1.hitTop6) {
      winRound1Top6++;
      totalWinTop6++;
    } else if (res2.hitTop6) {
      winRound2Top6++;
      totalWinTop6++;
    }
  }

  const rateWinRunning = ((totalWinRunning / totalDays) * 100).toFixed(1);
  const rateWinRound1 = ((winRound1Running / totalDays) * 100).toFixed(1);
  const rateWinRound2 = ((winRound2Running / totalDays) * 100).toFixed(1);
  const rateLoss = ((lossRunning / totalDays) * 100).toFixed(1);

  const rateWinTop6 = ((totalWinTop6 / totalDays) * 100).toFixed(1);

  return {
    name,
    totalDays,
    rateWinRunning,
    rateWinRound1,
    rateWinRound2,
    rateLoss,
    rateWinTop6,
    winRound1Top6,
    winRound2Top6
  };
}

console.log('=== SIMULATION: CHASE STRATEGY ACROSS 2 LOTTERIES ===\n');

// 1. Morning Stock Pairs
const resM1 = simulateChase(nikkeiM, chinaM, nikkeiM, 'เช้าคู่ 1: นิเคอิ เช้า -> ตาม จีน เช้า (ใช้เลขชุดนิเคอิ)');
const resM2 = simulateChase(nikkeiM, chinaM, chinaM, 'เช้าคู่ 1: นิเคอิ เช้า -> ตาม จีน เช้า (ใช้เลขชุดจีน)');
const resM3 = simulateChase(chinaM, hangsengM, chinaM, 'เช้าคู่ 2: จีน เช้า -> ตาม ฮั่งเส็ง เช้า (ใช้เลขชุดจีน)');
const resM4 = simulateChase(chinaM, hangsengM, hangsengM, 'เช้าคู่ 2: จีน เช้า -> ตาม ฮั่งเส็ง เช้า (ใช้เลขชุดฮั่งเส็ง)');

console.log('--- รอบเช้า (หุ้นปกติ) ---');
[resM1, resM2, resM3, resM4].forEach(r => {
  console.log(`📌 ${r.name}`);
  console.log(`   🎯 อัตราเข้า วิ่ง-รูด รวม 2 หวย: ${r.rateWinRunning}% (เข้าหวยแรก ${r.rateWinRound1}%, หลุดแล้วตามเข้าหวยสอง ${r.rateWinRound2}%, หลุดทั้งคู่ ${r.rateLoss}%)`);
  console.log(`   💎 อัตราเข้า เจาะ Top 6 รวม 2 หวย: ${r.rateWinTop6}% (เข้าหวยแรก ${r.winRound1Top6} ครั้ง, เข้าหวยสอง ${r.winRound2Top6} ครั้ง)\n`);
});

// 2. Afternoon Stock Pairs
const resA1 = simulateChase(nikkeiA, chinaA, nikkeiA, 'บ่ายคู่ 1: นิเคอิ บ่าย -> ตาม จีน บ่าย (ใช้เลขชุดนิเคอิ)');
const resA2 = simulateChase(nikkeiA, chinaA, chinaA, 'บ่ายคู่ 1: นิเคอิ บ่าย -> ตาม จีน บ่าย (ใช้เลขชุดจีน)');
const resA3 = simulateChase(chinaA, hangsengA, chinaA, 'บ่ายคู่ 2: จีน บ่าย -> ตาม ฮั่งเส็ง บ่าย (ใช้เลขชุดจีน)');
const resA4 = simulateChase(chinaA, hangsengA, hangsengA, 'บ่ายคู่ 2: จีน บ่าย -> ตาม ฮั่งเส็ง บ่าย (ใช้เลขชุดฮั่งเส็ง)');

console.log('--- รอบบ่าย (หุ้นปกติ) ---');
[resA1, resA2, resA3, resA4].forEach(r => {
  console.log(`📌 ${r.name}`);
  console.log(`   🎯 อัตราเข้า วิ่ง-รูด รวม 2 หวย: ${r.rateWinRunning}% (เข้าหวยแรก ${r.rateWinRound1}%, หลุดแล้วตามเข้าหวยสอง ${r.rateWinRound2}%, หลุดทั้งคู่ ${r.rateLoss}%)`);
  console.log(`   💎 อัตราเข้า เจาะ Top 6 รวม 2 หวย: ${r.rateWinTop6}% (เข้าหวยแรก ${r.winRound1Top6} ครั้ง, เข้าหวยสอง ${r.winRound2Top6} ครั้ง)\n`);
});

// 3. VIP Stocks
const resVipM1 = simulateChase(nikkeiVipM, chinaVipM, nikkeiVipM, 'VIP เช้าคู่ 1: นิเคอิ VIP เช้า -> ตาม จีน VIP เช้า');
const resVipM2 = simulateChase(chinaVipM, hangsengVipM, hangsengVipM, 'VIP เช้าคู่ 2: จีน VIP เช้า -> ตาม ฮั่งเส็ง VIP เช้า');

const resVipA1 = simulateChase(nikkeiVipA, chinaVipA, chinaVipA, 'VIP บ่ายคู่ 1: นิเคอิ VIP บ่าย -> ตาม จีน VIP บ่าย');
const resVipA2 = simulateChase(chinaVipA, hangsengVipA, hangsengVipA, 'VIP บ่ายคู่ 2: จีน VIP บ่าย -> ตาม ฮั่งเส็ง VIP บ่าย');

console.log('--- หุ้น VIP (เช้า-บ่าย) ---');
[resVipM1, resVipM2, resVipA1, resVipA2].forEach(r => {
  console.log(`📌 ${r.name}`);
  console.log(`   🎯 อัตราเข้า วิ่ง-รูด รวม 2 หวย: ${r.rateWinRunning}% (เข้าหวยแรก ${r.rateWinRound1}%, ตามเข้าหวยสอง ${r.rateWinRound2}%)`);
  console.log(`   💎 อัตราเข้า เจาะ Top 6 รวม 2 หวย: ${r.rateWinTop6}%\n`);
});

// 4. Flow from Morning to Afternoon (เลขไหลเช้า -> บ่าย)
// Strategy: Take the winning digits of Morning (นิเคอิ เช้า + จีน เช้า) to chase Afternoon!
function simulateMorningToAfternoonFlow() {
  const dates = nikkeiM.map(d => d.date).filter(dt => {
    return chinaM.some(c => c.date === dt) && nikkeiA.some(a => a.date === dt) && chinaA.some(ca => ca.date === dt);
  });

  let total = 0;
  let flowHit1 = 0; // Hit in Nikkei A
  let flowHit2 = 0; // Miss Nikkei A, hit in China A
  let flowTotal = 0;

  dates.forEach(dt => {
    const nM = nikkeiM.find(d => d.date === dt);
    const cM = chinaM.find(d => d.date === dt);
    const nA = nikkeiA.find(d => d.date === dt);
    const cA = chinaA.find(d => d.date === dt);

    if (!nM || !nA || !cA) return;

    // Extract morning digits from Nikkei Morning
    const mDigits = [...new Set((nM.top3 + nM.bottom2).split(''))];
    // Check if afternoon hits any of these
    const nADigits = (nA.top3 + nA.bottom2).split('');
    const cADigits = (cA.top3 + cA.bottom2).split('');

    const hitNA = mDigits.some(d => nADigits.includes(d));
    const hitCA = mDigits.some(d => cADigits.includes(d));

    total++;
    if (hitNA) {
      flowHit1++;
      flowTotal++;
    } else if (hitCA) {
      flowHit2++;
      flowTotal++;
    }
  });

  console.log('--- สูตรเลขไหลจากรอบเช้า สู่รอบบ่าย (2 หวย: นิเคอิ บ่าย -> จีน บ่าย) ---');
  console.log(`ดึงเลขเด่นที่ออกในรอบเช้า (นิเคอิ เช้า) มาตามในรอบบ่าย:`);
  console.log(`  🎯 อัตราเลขไหลเข้าเป้ารวม 2 หวยบ่าย: ${((flowTotal/total)*100).toFixed(1)}% (${flowTotal}/${total} วัน)`);
  console.log(`     - ไหลเข้าทันทีที่ นิเคอิ (บ่าย): ${((flowHit1/total)*100).toFixed(1)}%`);
  console.log(`     - หลุดนิเคอิแล้วไหลเข้าที่ จีน (บ่าย): ${((flowHit2/total)*100).toFixed(1)}%`);
  console.log(`     - หลุดทั้ง 2 หวยบ่าย: ${(((total-flowTotal)/total)*100).toFixed(1)}%\n`);
}

simulateMorningToAfternoonFlow();
