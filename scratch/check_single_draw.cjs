const fs = require('fs');

const reg = JSON.parse(fs.readFileSync('scratch/live_hanoi_regular.json', 'utf8'));
const spc = JSON.parse(fs.readFileSync('scratch/live_hanoi_special.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('scratch/live_hanoi_vip.json', 'utf8'));

// What if O was a single session? E.g. what if O only had Regular or Special or VIP?
[...reg, ...spc, ...vip].forEach(dr => {
  const prizes = [];
  if (dr.top2) prizes.push(dr.top2);
  if (dr.bottom2) prizes.push(dr.bottom2);
  
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
  if (chosen.join('') === '1378') {
    console.log(`SINGLE DRAW MATCH: Date=${dr.date}, Day=${dr.dayOfWeek}, Session=${dr.session}, top2=${dr.top2}, bottom2=${dr.bottom2}`);
  }
});
