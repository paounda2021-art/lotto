const fs = require('fs');

const special = JSON.parse(fs.readFileSync('scratch/live_hanoi_special.json', 'utf8'));
const regular = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('scratch/live_hanoi_vip.json', 'utf8'));

const WIN4_HANOI_MAP = {
  Mon: [0, 1, 7, 8],
  Tue: [1, 3, 7, 8],
  Wed: [0, 2, 4, 5],
  Thu: [3, 5, 6, 9],
  Fri: [1, 2, 3, 5],
  Sat: [2, 3, 6, 7],
  Sun: [2, 4, 6, 9]
};

function getHanoiWinningSets(targetDate, targetDayCode, allDraws) {
  const win2D = new Set();
  const win3D = new Set();
  const sessionHits = {
    special: { hit2D: [], hit3D: [], draw: null },
    regular: { hit2D: [], hit3D: [], draw: null },
    vip: { hit2D: [], hit3D: [], draw: null }
  };

  const dayCode = targetDayCode || 'Fri';
  const digits = WIN4_HANOI_MAP[dayCode] || WIN4_HANOI_MAP['Fri'];
  const pairs2D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs2D.push(String(digits[i]) + String(digits[j]));
    }
  }
  const triples3D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      for (let k = j + 1; k < digits.length; k++) {
        triples3D.push(String(digits[i]) + String(digits[j]) + String(digits[k]));
      }
    }
  }

  // Filter draws matching day or date
  allDraws.forEach(dr => {
    if (!dr) return;
    const matchesDay = dr.dayOfWeek === dayCode || (dr.date && (!dr.dayOfWeek || dr.dayOfWeek === dayCode));
    const matchesDate = targetDate ? dr.date === targetDate : true;
    if (matchesDay && matchesDate) {
      let sessKey = null;
      if (dr.session === 'HANOI_SPECIAL') sessKey = 'special';
      else if (dr.session === 'HANOI_EVENING' || dr.session === 'HANOI') sessKey = 'regular';
      else if (dr.session === 'HANOI_VIP') sessKey = 'vip';

      if (sessKey) sessionHits[sessKey].draw = dr;

      const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : '');
      const b2 = dr.bottom2;
      const t3 = dr.top3;

      if (t2) {
        win2D.add(t2);
        if (pairs2D.includes(t2) && sessKey) sessionHits[sessKey].hit2D.push('บน ' + t2);
      }
      if (b2) {
        win2D.add(b2);
        if (pairs2D.includes(b2) && sessKey) sessionHits[sessKey].hit2D.push('ล่าง ' + b2);
      }
      if (t3) {
        win3D.add(t3);
        const t3Sorted = t3.split('').sort().join('');
        win3D.add(t3Sorted);
        if (triples3D.includes(t3) && sessKey) sessionHits[sessKey].hit3D.push('ตรง ' + t3);
        else if (triples3D.includes(t3Sorted) && sessKey) sessionHits[sessKey].hit3D.push('โต๊ด ' + t3);
      }
    }
  });

  return { win2D, win3D, sessionHits, digits, pairs2D, triples3D };
}

const allSampleDraws = special.concat(regular, vip);
console.log('Testing for Friday 2026-10-16:');
const resFri = getHanoiWinningSets('2026-10-16', 'Fri', allSampleDraws);
console.log('Digits:', resFri.digits);
console.log('Hits 2D count:', resFri.pairs2D.filter(p => resFri.win2D.has(p)).length);
console.log('Session Hits:', JSON.stringify(resFri.sessionHits, null, 2));

console.log('\nTesting for Thursday 2026-10-15:');
const resThu = getHanoiWinningSets('2026-10-15', 'Thu', allSampleDraws);
console.log('Digits:', resThu.digits);
console.log('Hits 2D count:', resThu.pairs2D.filter(p => resThu.win2D.has(p)).length);
console.log('Session Hits:', JSON.stringify(resThu.sessionHits, null, 2));
