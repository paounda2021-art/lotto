const fs = require('fs');

const special = JSON.parse(fs.readFileSync('scratch/live_hanoi_special.json', 'utf8'));
const regular = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('scratch/live_hanoi_vip.json', 'utf8'));

const daysMap = {};
[special, regular, vip].forEach(list => list.forEach(dr => {
  if (!daysMap[dr.date]) daysMap[dr.date] = { date: dr.date, dayOfWeek: dr.dayOfWeek, draws: [] };
  daysMap[dr.date].draws.push(dr);
}));

const dates = Object.keys(daysMap).sort().reverse();
const combos = [];
for (let a = 0; a < 10; a++) {
  for (let b = a + 1; b < 10; b++) {
    for (let c = b + 1; c < 10; c++) {
      for (let d = c + 1; d < 10; d++) {
        combos.push([a, b, c, d]);
      }
    }
  }
}

const dayCodes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const bestDayMap = {};

dayCodes.forEach(day => {
  const dayDates = dates.filter(dt => daysMap[dt].dayOfWeek === day);
  for (let winLen of [12, 10, 8, 7, 6, 5]) {
    const testDates = dayDates.slice(0, winLen);
    const cand = [];
    combos.forEach(combo => {
      const pairs = new Set();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (i !== j) pairs.add(String(combo[i]) + String(combo[j]));
        }
      }
      const triples = new Set();
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          for (let k = j + 1; k < 4; k++) {
            triples.add(String(combo[i]) + String(combo[j]) + String(combo[k]));
          }
        }
      }

      let hits = 0;
      let totalHitCount = 0;
      testDates.forEach(dt => {
        let dayHit = false;
        daysMap[dt].draws.forEach(dr => {
          const t2 = dr.top2 || (dr.top3 ? dr.top3.slice(-2) : '');
          const b2 = dr.bottom2;
          const t3 = dr.top3;
          const t3Sorted = t3 ? t3.split('').sort().join('') : '';
          if (pairs.has(t2) || pairs.has(b2) || (t3 && (triples.has(t3) || triples.has(t3Sorted)))) {
            dayHit = true;
            totalHitCount++;
          }
        });
        if (dayHit) hits++;
      });

      if (hits === testDates.length) {
        cand.push({ combo, totalHitCount, winLen });
      }
    });

    if (cand.length > 0) {
      cand.sort((x, y) => y.totalHitCount - x.totalHitCount);
      console.log('Day ' + day + ' (' + winLen + ' weeks): Found ' + cand.length + ' 100% combos! Top: [' + cand[0].combo.join(', ') + '] with ' + cand[0].totalHitCount + ' hits');
      bestDayMap[day] = cand[0].combo;
      break;
    }
  }
});

console.log('\nFINAL WIN4_HANOI_MAP:');
console.log(JSON.stringify(bestDayMap, null, 2));

// Test recent 7 days sequentially
console.log('\n=== TESTING PAST 7 CONSECUTIVE DAYS WITH THIS MAP ===');
const recent7 = dates.slice(0, 7);
recent7.forEach(dt => {
  const dObj = daysMap[dt];
  const dayCode = dObj.dayOfWeek;
  const combo = bestDayMap[dayCode];
  const pairs = new Set();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) pairs.add(String(combo[i]) + String(combo[j]));
    }
  }
  const hitDraws = [];
  dObj.draws.forEach(dr => {
    const t2 = dr.top2 || (dr.top3 ? dr.top3.slice(-2) : '');
    const b2 = dr.bottom2;
    const hitP = [];
    if (pairs.has(t2)) hitP.push('บน:' + t2);
    if (pairs.has(b2)) hitP.push('ล่าง:' + b2);
    if (hitP.length > 0) {
      hitDraws.push(dr.session + ' (' + hitP.join(', ') + ')');
    }
  });
  console.log(dt + ' (' + dayCode + ') Combo [' + combo.join(',') + '] => ' + (hitDraws.length > 0 ? 'HIT ' + hitDraws.length + ' times: ' + hitDraws.join(' | ') : 'MISS'));
});
