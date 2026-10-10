const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const idx = 763000;
console.log(code.substring(idx, idx + 1500));
