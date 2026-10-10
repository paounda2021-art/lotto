const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

const snippet = code.slice(747400, 747800);
console.log(snippet);
