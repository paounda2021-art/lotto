const fs = require('fs');
const allResults = JSON.parse(fs.readFileSync('scratch/all_stocks_ey_results.json', 'utf8'));

function compute4Win(regStats, vipStats) {
  // Pool candidate digits in priority order:
  // 1. reg.d0 (เด่นปกติ), vip.d0 (เด่น VIP)
  // 2. reg.d1 (รองปกติ), vip.d1 (รอง VIP)
  // 3. reg.d2 (เสริมปกติ), vip.d2 (เสริม VIP)
  // 4. Any remaining top digits from stats
  const pool = [];
  if (regStats && regStats.d0 !== undefined) pool.push(regStats.d0);
  if (vipStats && vipStats.d0 !== undefined) pool.push(vipStats.d0);
  if (regStats && regStats.d1 !== undefined) pool.push(regStats.d1);
  if (vipStats && vipStats.d1 !== undefined) pool.push(vipStats.d1);
  if (regStats && regStats.d2 !== undefined) pool.push(regStats.d2);
  if (vipStats && vipStats.d2 !== undefined) pool.push(vipStats.d2);

  // If still need digits, grab from topDigits array
  [regStats, vipStats].forEach(st => {
    if (st && st.topDigits) {
      st.topDigits.forEach(item => pool.push(item.digit));
    }
  });

  // Fallback digits 0-9
  for (let i = 0; i <= 9; i++) pool.push(i);

  const seen = new Set();
  const digits = [];
  for (const d of pool) {
    if (d !== null && d !== undefined && !seen.has(d)) {
      seen.add(d);
      digits.push(d);
      if (digits.length === 4) break;
    }
  }

  digits.sort((a,b) => a - b);

  // 6 2D pairs (direct combinations)
  const pairs2D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      pairs2D.push(String(digits[i]) + String(digits[j]));
    }
  }

  // 4 double pairs
  const doubles = digits.map(d => String(d) + String(d));

  return {
    digits,
    digitsStr: digits.join(' - '),
    pairs2DStr: pairs2D.join(' - '),
    doublesStr: doubles.join(' - '),
    totalPairs: pairs2D.length + doubles.length
  };
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

days.forEach(day => {
  console.log(`\n========================================`);
  console.log(`DAY: ${day}`);
  console.log(`========================================`);

  // Morning
  const regM = allResults[day].nk_m || allResults[day].cn_m;
  const vipM = allResults[day].cn_vip_m || allResults[day].hs_vip_m;
  const winM = compute4Win(regM, vipM);

  console.log(`☀️ รอบเช้า:`);
  console.log(`   - ปกติ: ${regM ? regM.name : 'ปิด'} (${regM ? regM.d0 + '-' + regM.d1 : '-'})`);
  console.log(`   - VIP : ${vipM ? vipM.name : 'ปิด'} (${vipM ? vipM.d0 + '-' + vipM.d1 : '-'})`);
  console.log(`   👉 เด่น 4 ตัววิน: ${winM.digitsStr}`);
  console.log(`   👉 วิน 2 ตัว (6 คู่): ${winM.pairs2DStr}`);
  console.log(`   👉 กันเบิ้ล (4 คู่): ${winM.doublesStr}`);

  // Afternoon
  const regA = allResults[day].cn_a || allResults[day].nk_a;
  const vipA = allResults[day].cn_vip_a || allResults[day].nk_vip_a;
  const winA = compute4Win(regA, vipA);

  console.log(`🌙 รอบบ่าย:`);
  console.log(`   - ปกติ: ${regA ? regA.name : 'ปิด'} (${regA ? regA.d0 + '-' + regA.d1 : '-'})`);
  console.log(`   - VIP : ${vipA ? vipA.name : 'ปิด'} (${vipA ? vipA.d0 + '-' + vipA.d1 : '-'})`);
  console.log(`   👉 เด่น 4 ตัววิน: ${winA.digitsStr}`);
  console.log(`   👉 วิน 2 ตัว (6 คู่): ${winA.pairs2DStr}`);
  console.log(`   👉 กันเบิ้ล (4 คู่): ${winA.doublesStr}`);
});
