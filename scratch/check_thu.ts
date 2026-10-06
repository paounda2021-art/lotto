import {
  INITIAL_NIKKEI_MORNING_DATA,
  INITIAL_NIKKEI_AFTERNOON_DATA,
  INITIAL_CHINA_MORNING_DATA,
  INITIAL_CHINA_AFTERNOON_DATA,
  INITIAL_HANGSENG_MORNING_DATA,
  INITIAL_HANGSENG_AFTERNOON_DATA
} from '../src/data/nikkeiData.ts';

const allStock = [
  ...INITIAL_NIKKEI_MORNING_DATA, ...INITIAL_NIKKEI_AFTERNOON_DATA,
  ...INITIAL_CHINA_MORNING_DATA, ...INITIAL_CHINA_AFTERNOON_DATA,
  ...INITIAL_HANGSENG_MORNING_DATA, ...INITIAL_HANGSENG_AFTERNOON_DATA
];

const thuDraws = allStock.filter(d => d.dayOfWeek === 'Thu');
console.log('Total Thursday draws in stock data:', thuDraws.length);

const dates = Array.from(new Set(thuDraws.map(d => d.date))).sort().reverse();
console.log('Latest Thursday dates:', dates.slice(0, 5));

dates.slice(0, 3).forEach(date => {
  console.log(`\n--- Date: ${date} ---`);
  const draws = thuDraws.filter(d => d.date === date);
  draws.forEach(d => {
    console.log(`${d.session} (${d.dayNameThai}): top3=${d.top3}, top2=${d.top2}, bottom2=${d.bottom2}`);
  });
});
