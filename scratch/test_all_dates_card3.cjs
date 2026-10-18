const fs = require('fs');

const reg = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const spc = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));
const allDraws = [...reg, ...spc, ...vip];

const dates = Array.from(new Set(allDraws.map(d => d.date))).sort().reverse();

console.log('--- Printing Card 3 result for every date ---');
dates.forEach(dt => {
  const daySessions = allDraws.filter(d => d.date === dt);
  const prizes = [];
  daySessions.forEach(s => {
    if (s.top2) prizes.push(s.top2);
    if (s.bottom2) prizes.push(s.bottom2);
  });
  
  const freq = {};
  prizes.forEach(p => p.split('').forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
  const rankOrder = prizes.join('') + '0123456789';
  const sortedDigits = Object.keys(freq).map(Number).sort((x, y) => {
    if (freq[y] !== freq[x]) return freq[y] - freq[x];
    return rankOrder.indexOf(String(x)) - rankOrder.indexOf(String(y));
  });

  const chosen = sortedDigits.slice(0, 4);
  const cands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const c of cands) {
    if (chosen.length >= 4) break;
    if (!chosen.includes(c)) chosen.push(c);
  }
  chosen.sort((a, b) => a - b);
  console.log(`Date: ${dt} (${daySessions[0]?.dayOfWeek}) -> Digits: [${chosen}] Prizes: [${prizes}]`);
});
