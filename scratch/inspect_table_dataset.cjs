const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('LAOS_STAR', idx + 1)) !== -1) {
  matches.push({ idx, snippet: code.substring(Math.max(0, idx - 50), idx + 150) });
}

console.log(`Found ${matches.length} matches for LAOS_STAR:`);
matches.forEach((m, i) => {
  console.log(`[${i + 1}] at ${m.idx}:\n  ${m.snippet}\n`);
});
