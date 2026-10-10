const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const lIdx = code.indexOf('async function l_');
console.log(code.substring(lIdx - 300, lIdx + 100));
