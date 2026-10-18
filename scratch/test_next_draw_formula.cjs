const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to compute dynamic 4 win digits for NEXT upcoming draw from latest draw
function getDynamicNextWin4(latestDraw) {
  if (!latestDraw) return [3, 5, 8, 9];
  
  // 1. Digits from latest draw
  const dStr = (latestDraw.full6D || '') + (latestDraw.top3 || '') + (latestDraw.bottom2 || '');
  const digitsInLatest = Array.from(new Set(dStr.split('').filter(c => c >= '0' && c <= '9').map(Number)));
  
  // 2. Sum of 6D (or all digits)
  let sum = 0;
  dStr.split('').filter(c => c >= '0' && c <= '9').forEach(c => { sum += parseInt(c, 10); });
  const sumDigit = sum % 10;
  const shadowDigit = (sumDigit + 5) % 10;
  
  // 3. Flow from top2 & bottom2
  const top2Digits = (latestDraw.top2 || '').split('').map(Number);
  const bot2Digits = (latestDraw.bottom2 || '').split('').map(Number);
  
  // Primary candidates: hot flow from top2 + bottom2 + sum digit + shadow digit
  const priority = [
    top2Digits[0],
    bot2Digits[1] !== undefined ? bot2Digits[1] : bot2Digits[0],
    sumDigit,
    shadowDigit,
    top2Digits[1],
    bot2Digits[0]
  ].filter(x => x !== undefined && !isNaN(x));
  
  const chosen = [];
  const seen = new Set();
  for (const d of priority) {
    if (!seen.has(d)) {
      seen.add(d);
      chosen.push(d);
      if (chosen.length === 4) break;
    }
  }
  
  // Fill up to 4 if needed
  const cands = [3, 5, 8, 9, 0, 1, 2, 4, 6, 7];
  for (const c of cands) {
    if (chosen.length >= 4) break;
    if (!seen.has(c)) {
      seen.add(c);
      chosen.push(c);
    }
  }
  
  return chosen.sort((a, b) => a - b);
}

console.log('Latest recorded draw:', laosData[0].date, 'full6D:', laosData[0].full6D, 'top2:', laosData[0].top2, 'bot2:', laosData[0].bottom2);
const nextDigits = getDynamicNextWin4(laosData[0]);
console.log('Dynamic Win 4 for UPCOMING DRAW (คำนวณสดจากงวดล่าสุด):', nextDigits);

// Pairs
const pairs = [];
for (let i = 0; i < nextDigits.length; i++) {
  for (let j = 0; j < nextDigits.length; j++) {
    if (i !== j) pairs.push(`${nextDigits[i]}${nextDigits[j]}`);
  }
}
console.log('2D Pairs (12 ชุด):', pairs.join(', '));
