const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcJsPath = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcJsPath, 'utf8');

// Replace top3 checking in Uy / Qy
const uyTarget = 'if((r.includes(o)||d.includes(o))&&s.push(`บน ${d||r}`)';
const uyReplacement = 'if(d&&d.includes(o)&&s.push(`บน ${d}`)';
code = code.replaceAll(uyTarget, uyReplacement);

console.log('Replaced Uy/Qy top3 check. Is present in code?', !code.includes(uyTarget));

// Test calling Uy and Qy with test data
try {
  new vm.Script(code);
  console.log('🎉 Code with Uy/Qy fix compiles cleanly with zero errors!');
} catch (e) {
  console.error('VM Error:', e.message);
}
