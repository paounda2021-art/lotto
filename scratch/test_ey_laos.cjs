const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', 'lotto_data_laos.json');
const laosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// analyzeDayOfWeekStats implementation
function analyzeDayOfWeekStats(data, targetDay) {
  const matchingDraws = data.filter((item) => targetDay === 'ALL' || item.dayOfWeek === targetDay);
  const totalDrawsOnDay = matchingDraws.length;

  const digitCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  const pairCounts = {};

  matchingDraws.forEach((draw) => {
    const allDigits = `${draw.top3}${draw.bottom2}`;
    allDigits.split('').forEach((ch) => {
      const d = parseInt(ch, 10);
      if (!isNaN(d)) {
        digitCounts[d] = (digitCounts[d] || 0) + 1;
      }
    });

    if (draw.top2) {
      pairCounts[draw.top2] = (pairCounts[draw.top2] || 0) + 1;
    }
    if (draw.bottom2) {
      pairCounts[draw.bottom2] = (pairCounts[draw.bottom2] || 0) + 1;
    }
  });

  const topSingleDigits = Object.entries(digitCounts)
    .map(([dStr, count]) => {
      const digit = parseInt(dStr, 10);
      const percent = totalDrawsOnDay > 0 ? Math.round((count / (totalDrawsOnDay * 5)) * 1000) / 10 : 0;
      return { digit, count, percent };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalDrawsOnDay, topSingleDigits };
}

console.log('--- Monday 12 Oct (Last Monday - VERIFY mode: excluding 12 Oct) ---');
const prevData = laosData.filter(d => d.date !== '2026-10-12');
const statsPrev = analyzeDayOfWeekStats(prevData, 'Mon');
console.log('Top single digits for last Monday:', statsPrev.topSingleDigits);

console.log('--- Monday Upcoming (Next Monday - NEXT mode: including 12 Oct) ---');
const statsNext = analyzeDayOfWeekStats(laosData, 'Mon');
console.log('Top single digits for upcoming Monday:', statsNext.topSingleDigits);
