const fs = require('fs');

const code = fs.readFileSync('cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js', 'utf8');

const idx = code.indexOf('async function m_');
const dnIdx = code.lastIndexOf('function DN', idx);

console.log('DN search index:', dnIdx);
if (dnIdx !== -1) {
  console.log(code.substring(dnIdx - 50, dnIdx + 1500));
}
