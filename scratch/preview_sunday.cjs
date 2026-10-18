const prizes = ["38", "95", "38", "77", "16", "30"];
const freq = {};
prizes.forEach(p => p.split("").forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
let sumP = 0;
prizes.forEach(p => { sumP += parseInt(p, 10) || 0; });
const sumDigit = sumP % 10;
const shadowDigit = (sumDigit + 5) % 10;
const sortedFreq = Object.keys(freq).map(Number).sort((x, y) => freq[y] - freq[x]);

const chosen = [];
const seen = new Set();
[sortedFreq[0], sortedFreq[1], sumDigit, shadowDigit].forEach(d => {
  if (d !== undefined && !isNaN(d) && !seen.has(d)) {
    seen.add(d); chosen.push(d);
  }
});
[sortedFreq[2], sortedFreq[3], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(c => {
  if (chosen.length < 4 && c !== undefined && !isNaN(c) && !seen.has(c)) {
    seen.add(c); chosen.push(c);
  }
});
const purpleDigits = chosen.slice(0, 4).sort((x, y) => x - y);
console.log("Sunday Purple Digits from Today 6 Prizes:", purpleDigits);
console.log("Freq:", freq, "Sum:", sumP, "SumDigit:", sumDigit, "Shadow:", shadowDigit);
