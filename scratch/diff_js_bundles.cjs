const fs = require('fs');

const pathA = 'cloudflare_download_faae1b0f/assets/index-DBh-DStv.js';
const pathB = 'cloudflare_latest_download/assets/index-CN-5_2d9.js';

if (fs.existsSync(pathA) && fs.existsSync(pathB)) {
  const a = fs.readFileSync(pathA, 'utf8');
  const b = fs.readFileSync(pathB, 'utf8');

  console.log(`Length A (faae1b0f original): ${a.length}`);
  console.log(`Length B (latest download): ${b.length}`);

  // Find first difference offset
  let firstDiff = -1;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) {
      firstDiff = i;
      break;
    }
  }

  console.log('First diff offset:', firstDiff);
  if (firstDiff !== -1) {
    console.log('Context in A:\n', a.substring(Math.max(0, firstDiff - 50), firstDiff + 100));
    console.log('\nContext in B:\n', b.substring(Math.max(0, firstDiff - 50), firstDiff + 100));
  }
}
