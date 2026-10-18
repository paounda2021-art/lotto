const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Total Laos draws:', laosData.length);
const with6D = laosData.filter(d => d.full6D);
console.log('Draws with full6D:', with6D.length);
console.log('First 10 draws:');
laosData.slice(0, 10).forEach(d => {
  console.log(`${d.date} (${d.dayOfWeek || d.dayNameThai}): full6D=${d.full6D || '-'}, top3=${d.top3}, top2=${d.top2}, bottom2=${d.bottom2}`);
});
