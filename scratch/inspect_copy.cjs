const fs = require('fs');
const path = require('path');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(srcJsPath, 'utf8');

const startIdx = code.indexOf('h.topSingleDigits.length>=2&&n.jsxs("div",{className:"bg-gradient-to-r');
console.log(code.substring(startIdx - 4000, startIdx - 1500));
