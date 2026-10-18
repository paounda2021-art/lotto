const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const WIN4_LAOS_MAP = {
  Mon: [2, 5, 7, 9],
  Tue: [1, 2, 7, 8],
  Wed: [0, 3, 5, 9],
  Thu: [5, 6, 8, 9],
  Fri: [4, 5, 6, 7]
};

console.log('Testing Latest Draws for Mon-Fri with new WIN4_LAOS_MAP:');
['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(day => {
  const draws = laosData.filter(d => d.dayOfWeek === day);
  const dr = draws[0];
  const digits = WIN4_LAOS_MAP[day];
  const pairs = new Set();
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs.add(`${digits[i]}${digits[j]}`);
    }
  }
  const hitTop = pairs.has(dr.top2);
  const hitBot = pairs.has(dr.bottom2);
  console.log(`${day} (${dr.date}): full6D=${dr.full6D}, top2=${dr.top2}, bot2=${dr.bottom2}`);
  console.log(`  Digits: [${digits.join(', ')}]`);
  console.log(`  Hit Top? ${hitTop} | Hit Bot? ${hitBot} => 100% HIT? ${hitTop || hitBot}`);
});
