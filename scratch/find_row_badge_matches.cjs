const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const target = '🇹🇭 รัฐบาลไทย (15:30)';
let idx = 0;
let matchCount = 0;
while ((idx = code.indexOf(target, idx + 1)) !== -1) {
  matchCount++;
  console.log(`Match ${matchCount} at ${idx}:\n`, code.substring(idx - 150, idx + 150), '\n---');
}
