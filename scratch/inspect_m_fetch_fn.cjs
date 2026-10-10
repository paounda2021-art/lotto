const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const target = 'async function m_';
let idx = code.indexOf(target);
if (idx === -1) {
  idx = code.indexOf('m_=async');
}
if (idx === -1) {
  idx = code.indexOf('m_=');
}

console.log('m_ search index:', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 50, idx + 1500));
}
