const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const WIN4_LAOS_MAP = {
  Mon: [2, 5, 6, 7],
  Tue: [2, 5, 7, 8],
  Wed: [0, 1, 6, 8],
  Thu: [0, 6, 7, 9],
  Fri: [0, 2, 3, 4],
};

['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(day => {
  const digits = WIN4_LAOS_MAP[day];
  const pairs = new Set();
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs.add(`${digits[i]}${digits[j]}`);
    }
  }
  
  // Find draws for this day
  const draws = laosData.filter(d => d.dayOfWeek === day);
  console.log(`\n=== DAY ${day}: Digits [${digits.join(', ')}] (Total draws: ${draws.length}) ===`);
  
  // Latest draw
  const latest = draws[0];
  if (latest) {
    const hit2D = pairs.has(latest.top2) || pairs.has(latest.bottom2);
    console.log(`Latest draw ${latest.date}: top2=${latest.top2}, bot2=${latest.bottom2} => HIT? ${hit2D ? 'YES (' + [latest.top2, latest.bottom2].filter(p => pairs.has(p)).join(', ') + ')' : 'NO (MISS)'}`);
  }
  
  // How many draws hit overall
  let hitCount = 0;
  draws.forEach((dr, idx) => {
    const hit = pairs.has(dr.top2) || pairs.has(dr.bottom2);
    if (hit) hitCount++;
    if (idx < 5) {
      console.log(`  Draw ${idx+1} [${dr.date}]: top2=${dr.top2}, bot2=${dr.bottom2} -> ${hit ? '✓ HIT' : '✗ MISS'}`);
    }
  });
  console.log(`Total hits: ${hitCount}/${draws.length} (${(hitCount/draws.length*100).toFixed(1)}%)`);
});
