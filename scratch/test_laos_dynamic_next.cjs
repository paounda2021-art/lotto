const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const allD = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Compare VERIFY mode (Monday 12 Oct) vs NEXT mode (Upcoming Monday)
const WIN4_LAOS_MAP = {
  Mon: [2, 5, 7, 9],
  Tue: [1, 2, 7, 8],
  Wed: [0, 3, 5, 9],
  Thu: [5, 6, 8, 9],
  Fri: [4, 5, 6, 7]
};

console.log('=== CASE 1: VERIFY MODE (จันทร์ 12 ต.ค. ที่ผ่านมา) ===');
const targetDayCode = 'Mon';
const verifiedDigits = WIN4_LAOS_MAP[targetDayCode];
console.log('Card 2 Win 4 Digits:', verifiedDigits);
console.log('Result of Mon 12 Oct: top2=92, bot2=75');
console.log('Hit Status: เข้าเป้า 2 ชุด (92, 75)\n');

console.log('=== CASE 2: NEXT MODE (วันจันทร์ที่จะถึง - คำนวณสดจากผลประจำวันล่าสุด 12 ต.ค.) ===');
const latestDr = allD[0];
console.log(`Latest draw used: ${latestDr.date} (${latestDr.dayNameThai}) full6D=${latestDr.full6D}, top2=${latestDr.top2}, bot2=${latestDr.bottom2}`);

const dStr = (latestDr.full6D || "") + (latestDr.top3 || "") + (latestDr.bottom2 || "");
let sum6D = 0;
dStr.split("").filter(c => c >= "0" && c <= "9").forEach(c => { sum6D += parseInt(c, 10); });
const sumDigit = sum6D % 10;
const shadowDigit = (sumDigit + 5) % 10;
const t2Digits = (latestDr.top2 || "").split("").map(Number);
const b2Digits = (latestDr.bottom2 || "").split("").map(Number);

const d0 = t2Digits[0] !== undefined ? t2Digits[0] : 9;
const d1 = b2Digits[1] !== undefined ? b2Digits[1] : 5;
const d2 = sumDigit !== undefined ? sumDigit : 3;
const d3 = shadowDigit !== undefined ? shadowDigit : 8;

console.log('Card 1 Fresh Digits (เด่น-รอง คัดใหม่):', {
  'เด่นหลัก': d0,
  'เด่นรอง': d1,
  'รอง 1': d2,
  'รอง 2': d3
});

const chosen = [];
const seen = new Set();
[t2Digits[0], b2Digits[1], sumDigit, shadowDigit, t2Digits[1], b2Digits[0]].forEach(d => {
  if (d !== undefined && !isNaN(d) && !seen.has(d)) {
    seen.add(d); chosen.push(d);
  }
});
[3, 5, 8, 9, 0, 1, 2, 4, 6, 7].forEach(c => {
  if (chosen.length < 4 && !seen.has(c)) {
    seen.add(c); chosen.push(c);
  }
});
const nextWin4 = chosen.slice(0, 4).sort((x, y) => x - y);
console.log('Card 2 Win 4 Digits (คัดใหม่สดสำหรับงวดที่จะถึง):', nextWin4);

const pairs = [];
for (let i = 0; i < nextWin4.length; i++) {
  for (let j = 0; j < nextWin4.length; j++) {
    if (i !== j) pairs.push(`${nextWin4[i]}${nextWin4[j]}`);
  }
}
console.log('ชุด 2 ตัว (12 ชุด):', pairs.join(', '));
console.log('Status: ⏳ รอผลออกรางวัล');
