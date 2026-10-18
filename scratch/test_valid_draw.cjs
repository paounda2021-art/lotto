const fs = require('fs');

const nikkeiMorning = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_nikkei_morning.json', 'utf8'));

console.log('Total draws:', nikkeiMorning.length);
console.log('Draw 0:', nikkeiMorning[0]);
console.log('Draw 1:', nikkeiMorning[1]);

const valid = nikkeiMorning.find(d => /^\d+$/.test(d.top3 || ''));
console.log('Found valid draw:', valid);
