const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Generate all C(10, 4) = 210 combinations of 4 digits
const allCombos = [];
for (let a = 0; a <= 6; a++) {
  for (let b = a + 1; b <= 7; b++) {
    for (let c = b + 1; c <= 8; c++) {
      for (let d = c + 1; d <= 9; d++) {
        allCombos.push([a, b, c, d]);
      }
    }
  }
}

function getPairs(digits) {
  const p = new Set();
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) p.add(`${digits[i]}${digits[j]}`);
    }
  }
  return p;
}

['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(day => {
  const draws = laosData.filter(d => d.dayOfWeek === day);
  console.log(`\n========================================`);
  console.log(`Finding best 4-digit combos for ${day} (Total draws: ${draws.length})`);
  console.log(`Latest draw: ${draws[0].date} (top2=${draws[0].top2}, bot2=${draws[0].bottom2}, full6D=${draws[0].full6D || '-'})`);

  // We want combos that:
  // 1) MUST HIT the latest draw (draws[0])!
  // 2) Maximize hits over recent 3, 5, 10 draws, and overall!
  
  const results = [];
  allCombos.forEach(combo => {
    const pairs = getPairs(combo);
    const hitLatest = pairs.has(draws[0].top2) || pairs.has(draws[0].bottom2);
    if (!hitLatest) return; // Must hit latest draw!

    let recent3Hits = 0;
    draws.slice(0, 3).forEach(dr => {
      if (pairs.has(dr.top2) || pairs.has(dr.bottom2)) recent3Hits++;
    });

    let recent5Hits = 0;
    draws.slice(0, 5).forEach(dr => {
      if (pairs.has(dr.top2) || pairs.has(dr.bottom2)) recent5Hits++;
    });

    let totalHits = 0;
    draws.forEach(dr => {
      if (pairs.has(dr.top2) || pairs.has(dr.bottom2)) totalHits++;
    });

    results.push({
      combo,
      recent3Hits,
      recent5Hits,
      totalHits,
      latestPair: [draws[0].top2, draws[0].bottom2].filter(p => pairs.has(p)).join(', ')
    });
  });

  // Sort by recent3Hits desc, recent5Hits desc, totalHits desc
  results.sort((x, y) => {
    if (y.recent3Hits !== x.recent3Hits) return y.recent3Hits - x.recent3Hits;
    if (y.recent5Hits !== x.recent5Hits) return y.recent5Hits - x.recent5Hits;
    return y.totalHits - x.totalHits;
  });

  console.log(`Top 5 combos for ${day}:`);
  results.slice(0, 5).forEach((r, idx) => {
    console.log(` #${idx+1}: [${r.combo.join(', ')}] -> Latest Hit: ${r.latestPair} | Recent 3: ${r.recent3Hits}/3 (${(r.recent3Hits/3*100).toFixed(0)}%) | Recent 5: ${r.recent5Hits}/5 | Total: ${r.totalHits}/${draws.length} (${(r.totalHits/draws.length*100).toFixed(1)}%)`);
  });
});
