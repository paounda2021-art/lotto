const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Reverse to chronological order (oldest to newest)
const chrono = laosData.slice().reverse();

console.log('Testing round-by-round flow in Laos:');

// Test 1: From draw t-1 digits, how often does draw t hit 2D pair?
let totalRounds = 0;
let hit2DFromPrevDigits = 0;
let hitDigitFromPrev = 0;

for (let i = 1; i < chrono.length; i++) {
  const prev = chrono[i - 1];
  const curr = chrono[i];
  
  if (!prev.top2 || !curr.top2) continue;
  
  // Extract all digits from previous draw
  let prevDigitsStr = (prev.full6D || '') + (prev.top3 || '') + (prev.bottom2 || '');
  if (!prevDigitsStr) continue;
  
  const prevDigits = Array.from(new Set(prevDigitsStr.split('').map(Number))).sort((a,b)=>a-b);
  
  // Pairs from prevDigits
  const pairs = new Set();
  for (let a = 0; a < prevDigits.length; a++) {
    for (let b = 0; b < prevDigits.length; b++) {
      pairs.add(`${prevDigits[a]}${prevDigits[b]}`);
    }
  }
  
  const top2 = curr.top2;
  const bot2 = curr.bottom2;
  
  const hitTop = pairs.has(top2);
  const hitBot = pairs.has(bot2);
  
  totalRounds++;
  if (hitTop || hitBot) {
    hit2DFromPrevDigits++;
  }
}

console.log(`Prev draw all digits -> curr draw 2D hit: ${hit2DFromPrevDigits}/${totalRounds} (${(hit2DFromPrevDigits/totalRounds*100).toFixed(1)}%)`);
