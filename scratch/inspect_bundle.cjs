const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

console.log('JS Bundle length:', jsContent.length);

const keywords = [
  'NIKKEI', 'HANGSENG', 'CHINA', 'DOWJONES', 'HANOI', 'LAOS', 'GSB', 'GOVERNMENT', 'STOCK_VIP',
  'DayOfWeekAnalyzer', 'WinGenerator', 'MonthlyCalendarView', 'FormulaCalculator', 'BacktestView',
  'exphuay', 'cloudSync'
];

for (const kw of keywords) {
  const matches = (jsContent.match(new RegExp(kw, 'g')) || []).length;
  console.log(`Keyword "${kw}": ${matches} occurrences`);
}
