const fs = require('fs');
const path = require('path');

const cleanPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-DBh-DStv.js');
const code = fs.readFileSync(cleanPath, 'utf8');

const ekGovIdx = code.indexOf('K=["701","640"');
console.log('E & K GOVERNMENT override index:', ekGovIdx);
console.log(code.substring(ekGovIdx - 100, ekGovIdx + 300));
