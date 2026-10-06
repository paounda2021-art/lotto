import {
  INITIAL_NIKKEI_MORNING_DATA,
  INITIAL_NIKKEI_AFTERNOON_DATA,
  INITIAL_CHINA_MORNING_DATA,
  INITIAL_CHINA_AFTERNOON_DATA,
  INITIAL_HANGSENG_MORNING_DATA,
  INITIAL_HANGSENG_AFTERNOON_DATA
} from '../src/data/nikkeiData.ts';
import { analyzeDayOfWeekStats } from '../src/utils/calculator.ts';

const allStock = [
  ...INITIAL_NIKKEI_MORNING_DATA, ...INITIAL_NIKKEI_AFTERNOON_DATA,
  ...INITIAL_CHINA_MORNING_DATA, ...INITIAL_CHINA_AFTERNOON_DATA,
  ...INITIAL_HANGSENG_MORNING_DATA, ...INITIAL_HANGSENG_AFTERNOON_DATA
];

const reportThu = analyzeDayOfWeekStats(allStock, 'Thu');
console.log('Thursday Day Report Top Single Digits:');
console.log(reportThu.topSingleDigits);

const thuDraws1001 = allStock.filter(d => d.date === '2026-10-01');
console.log('\n2026-10-01 Draws:');
thuDraws1001.forEach(d => console.log(d.session, 'top3:', d.top3, 'top2:', d.top2, 'bottom2:', d.bottom2));

const thuDraws0924 = allStock.filter(d => d.date === '2026-09-24');
console.log('\n2026-09-24 Draws:');
thuDraws0924.forEach(d => console.log(d.session, 'top3:', d.top3, 'top2:', d.top2, 'bottom2:', d.bottom2));
