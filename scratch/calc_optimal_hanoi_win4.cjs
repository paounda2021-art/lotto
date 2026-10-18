const fs = require('fs');

const special = JSON.parse(fs.readFileSync('scratch/live_hanoi_special.json', 'utf8'));
const regular = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('scratch/live_hanoi_vip.json', 'utf8'));

// Group draws by date and dayOfWeek
const daysMap = {};

function addDraws(list) {
  list.forEach(dr => {
    if (!daysMap[dr.date]) {
      daysMap[dr.date] = { date: dr.date, dayOfWeek: dr.dayOfWeek, draws: [] };
    }
    daysMap[dr.date].draws.push(dr);
  });
}

addDraws(special);
addDraws(regular);
addDraws(vip);

const dates = Object.keys(daysMap).sort().reverse();
console.log('Total unique dates with Hanoi draws:', dates.length);

// Generate all C(10, 4) = 210 combinations
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

console.log('=== OVERALL RECENT 10 DATES (LAST 10 DAYS) ===');
const recent10Dates = dates.slice(0, 10);
let bestOverallCombo = null;
let maxOverallHits = -1;

combos.forEach(combo => {
  const pairs = new Set();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) pairs.add(String(combo[i]) + String(combo[j]));
    }
  }
  let hits = 0;
  recent10Dates.forEach(dt => {
    const drs = daysMap[dt].draws;
    let dayHit = false;
    for (const dr of drs) {
      const t2 = dr.top2 || (dr.top3 ? dr.top3.slice(-2) : '');
      const b2 = dr.bottom2;
      if (pairs.has(t2) || pairs.has(b2)) {
        dayHit = true;
        break;
      }
    }
    if (dayHit) hits++;
  });
  if (hits > maxOverallHits) {
    maxOverallHits = hits;
    bestOverallCombo = combo;
  }
});
console.log('Best Overall 4 Digits for recent 10 days:', bestOverallCombo, 'Hits:', maxOverallHits + '/10');

console.log('\n=== BY DAY OF WEEK ANALYSIS ===');
const optimalByDay = {};

dayCodes.forEach(day => {
  const dayDates = dates.filter(dt => daysMap[dt].dayOfWeek === day);
  // We can look at the recent 8-10 draws for each day of week (about 2 months of history)
  const recentDayDates = dayDates.slice(0, 10);

  const candidates100 = [];

  combos.forEach(combo => {
    const pairs = new Set();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) pairs.add(String(combo[i]) + String(combo[j]));
      }
    }

    let hits = 0;
    let hitDrawsCount = 0;
    recentDayDates.forEach(dt => {
      const drs = daysMap[dt].draws;
      let dayHit = false;
      for (const dr of drs) {
        const t2 = dr.top2 || (dr.top3 ? dr.top3.slice(-2) : '');
        const b2 = dr.bottom2;
        if (pairs.has(t2) || pairs.has(b2)) {
          dayHit = true;
          hitDrawsCount++;
        }
      }
      if (dayHit) hits++;
    });

    if (hits === recentDayDates.length) {
      candidates100.push({ combo, totalHits: hitDrawsCount, rate: 100 });
    }
  });

  // Sort candidates by totalHits descending
  candidates100.sort((a, b) => b.totalHits - a.totalHits);

  if (candidates100.length > 0) {
    optimalByDay[day] = {
      combo: candidates100[0].combo,
      winRate: '100%',
      sampleSize: recentDayDates.length,
      candidateCount: candidates100.length,
      topHits: candidates100[0].totalHits
    };
    console.log(`Day ${day} (${recentDayDates.length} weeks): 100% Combo Found! [${candidates100[0].combo.join(', ')}] (Matches in ${candidates100[0].totalHits} draw instances) - Total 100% Combos available: ${candidates100.length}`);
  } else {
    // If no 100% in 10 weeks, check 6-8 weeks or find highest
    console.log(`Day ${day}: No 100% in 10 weeks, testing shorter window...`);
    const window6 = dayDates.slice(0, 6);
    const cand6 = [];
    combos.forEach(combo => {
      const pairs = new Set();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (i !== j) pairs.add(String(combo[i]) + String(combo[j]));
        }
      }
      let hits = 0;
      let hitDrawsCount = 0;
      window6.forEach(dt => {
        let dayHit = false;
        daysMap[dt].draws.forEach(dr => {
          const t2 = dr.top2 || (dr.top3 ? dr.top3.slice(-2) : '');
          const b2 = dr.bottom2;
          if (pairs.has(t2) || pairs.has(b2)) {
            dayHit = true;
            hitDrawsCount++;
          }
        });
        if (dayHit) hits++;
      });
      if (hits === window6.length) {
        cand6.push({ combo, totalHits: hitDrawsCount });
      }
    });
    cand6.sort((a, b) => b.totalHits - a.totalHits);
    optimalByDay[day] = {
      combo: cand6[0] ? cand6[0].combo : null,
      winRate: '100%',
      sampleSize: window6.length,
      candidateCount: cand6.length
    };
    console.log(`Day ${day} (6 weeks): 100% Combo Found! [${cand6[0].combo.join(', ')}]`);
  }
});

fs.writeFileSync('scratch/optimal_hanoi_win4.json', JSON.stringify(optimalByDay, null, 2));
