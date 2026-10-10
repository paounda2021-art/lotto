const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

console.log('File size:', code.length, 'bytes');

// 1. Search for sessions or stock titles
const sessMatches = code.match(/STOCKS_[A-Z0-9_]+/g) || [];
console.log('Sessions in bundle:', [...new Set(sessMatches)]);

// 2. Search for UI text snippets
const textSnippets = [
  'รวมทุกหุ้น VIP (6 รอบ)',
  'รวมทุกหุ้นปกติ (6 รอบ)',
  'สถิติเลขออกซ้ำรายวันสัปดาห์',
  'สรุปฟันธงเลขเด่นรูดประจำวัน',
  'เด่นหลัก',
  'เด่นรอง',
  'TOP 6'
];

textSnippets.forEach(snip => {
  const count = (code.match(new RegExp(snip, 'g')) || []).length;
  console.log(`Snippet "${snip}": ${count} matches`);
});

// 3. Find where sessions or dropdown/buttons are created in JS
const sessionButtons = code.match(/["']STOCKS_ALL_3["']/g) || [];
console.log('STOCKS_ALL_3 occurrences:', sessionButtons.length);
