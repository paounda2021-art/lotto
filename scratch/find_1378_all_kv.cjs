const fs = require('fs');

const reg = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const spc = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));
const allDraws = [...reg, ...spc, ...vip];

const dates = Array.from(new Set(allDraws.map(d => d.date))).sort().reverse();

console.log('--- Searching which date gives 1, 3, 7, 8 in KV Data ---');
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
  const str = chosen.join('');
  if (str === '1378') {
    console.log('MATCH FOUND (PAST MODE)! Date:', dt, 'DayOfWeek:', daySessions[0]?.dayOfWeek, 'DateFormatted:', daySessions[0]?.dateFormatted, 'Prizes:', prizes);
  }

  // Also check NEXT mode
  let sumP = 0; prizes.forEach(p => { sumP += parseInt(p, 10) || 0; });
  const sumDigit = sumP % 10;
  const shadowDigit = (sumDigit + 5) % 10;
  const sortedFreq = Object.keys(freq).map(Number).sort((x, y) => freq[y] - freq[x]);
  const chosenNext = [];
  const seenNext = new Set();
  [sortedFreq[0], sortedFreq[1], sumDigit, shadowDigit].forEach(d => {
    if (d !== undefined && !isNaN(d) && !seenNext.has(d)) {
      seenNext.add(d); chosenNext.push(d);
    }
  });
  [sortedFreq[2], sortedFreq[3], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(c => {
    if (chosenNext.length < 4 && c !== undefined && !isNaN(c) && !seenNext.has(c)) {
      seenNext.add(c); chosenNext.push(c);
    }
  });
  chosenNext.sort((a, b) => a - b);
  if (chosenNext.join('') === '1378') {
    console.log('MATCH FOUND (NEXT MODE)! Date:', dt, 'DayOfWeek:', daySessions[0]?.dayOfWeek, 'DateFormatted:', daySessions[0]?.dateFormatted, 'Prizes:', prizes);
  }
});
