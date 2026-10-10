const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Location 753416: dataset mapping
console.log('--- LOCATION 753416 ---');
console.log(code.slice(753300, 753600));

// Location 578448: normal stock buttons
console.log('--- LOCATION 578448 ---');
console.log(code.slice(578350, 578600));

// Location 579941: VIP stock buttons
console.log('--- LOCATION 579941 ---');
console.log(code.slice(579850, 580100));
