const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const targets = ['laos_star', 'laosstar', 'ลาวสตาร์', 'laos-star'];
targets.forEach(tgt => {
  let idx = 0;
  console.log(`=== Matches for ${tgt} ===`);
  while ((idx = code.indexOf(tgt, idx + 1)) !== -1) {
    console.log(`[${idx}]:`, code.substring(Math.max(0, idx - 80), idx + 120));
  }
});
