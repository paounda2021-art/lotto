const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

console.log(`Bundle size: ${jsContent.length} bytes`);

// Look for unique lottery names or constants
const keywords = [
  'THAI_GOVT', 'HANOI', 'LAOS', 'NIKKEI_MORNING', 'NIKKEI_AFTERNOON', 'NIKKEI_VIP',
  'LAOS_STAR', 'CHINA', 'HANGSENG', 'LAOS_VIP'
];

for (const kw of keywords) {
  const matches = (jsContent.match(new RegExp(kw, 'g')) || []).length;
  console.log(`Keyword '${kw}': ${matches} occurrences`);
}

// Look for build info / version strings
const titleMatch = jsContent.match(/SystemLucky\d*/g);
console.log('Title matches:', [...new Set(titleMatch)]);

// Check for recent dataset dates
const dates = jsContent.match(/202[4-6]-\d{2}-\d{2}/g) || [];
console.log(`Found ${dates.length} date strings. Latest 5 dates:`, [...new Set(dates)].slice(-5));
