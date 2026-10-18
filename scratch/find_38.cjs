const fs = require('fs');

const reg = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const spc = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));
const allDraws = [...reg, ...spc, ...vip];

console.log('Searching draws with 38:');
allDraws.forEach(d => {
  if (d.top2 === '38' || d.bottom2 === '38' || (d.top3 && d.top3.endsWith('38'))) {
    console.log(`Found 38 in: Date=${d.date}, Day=${d.dayOfWeek}, Session=${d.session}, top3=${d.top3}, top2=${d.top2}, bottom2=${d.bottom2}`);
  }
});
