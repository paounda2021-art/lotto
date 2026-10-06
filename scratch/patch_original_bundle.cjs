const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

const targetStr = '(r.includes(o)||d.includes(o))';
const replacementStr = '(d&&d.includes(o))';

const count = (code.match(new RegExp(targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`Found ${count} occurrences of target string in index-CN-5_2d9.js`);

code = code.replaceAll(targetStr, replacementStr);
fs.writeFileSync(jsPath, code, 'utf8');
console.log('Successfully patched index-CN-5_2d9.js in cloudflare_latest_download!');
