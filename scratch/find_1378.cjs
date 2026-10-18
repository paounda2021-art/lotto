const fs = require("fs");

const hanoi = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi.json"));
const spc = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_special.json"));
const vip = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json"));

let fullHanoiD = [...hanoi, ...spc, ...vip];
const allDates = [...new Set(fullHanoiD.map(d => d.date))];

console.log("Checking all dates for purple digits [1, 3, 7, 8]...");
allDates.forEach(dt => {
  const daySessions = fullHanoiD.filter(d => d.date === dt);
  const prizes = [];
  daySessions.forEach(s => {
    if (s.top2) prizes.push(s.top2);
    if (s.bottom2) prizes.push(s.bottom2);
  });

  const freq = {};
  prizes.forEach(p => p.split("").forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
  const rankOrder = prizes.join("") + "0123456789";
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
  const digits = chosen.slice(0, 4).sort((x, y) => x - y);
  
  if (digits.join(",") === "1,3,7,8") {
    console.log(`MATCH FOUND! Date: ${dt}, Day: ${daySessions[0]?.dayOfWeek}, Prizes:`, prizes);
  }
});

// Also test Card 2's WIN4_HANOI_MAP
const WIN4_HANOI_MAP = {
  Mon: [0, 1, 7, 8],
  Tue: [1, 3, 7, 8],
  Wed: [0, 2, 4, 5],
  Thu: [3, 5, 6, 9],
  Fri: [1, 2, 3, 5],
  Sat: [2, 3, 6, 7],
  Sun: [2, 4, 6, 9]
};
console.log("WIN4_HANOI_MAP:", WIN4_HANOI_MAP);
