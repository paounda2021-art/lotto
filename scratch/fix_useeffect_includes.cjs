const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original JS size:', code.length);

// Patch STOCK_VIP array
const oldVipIncludes = '"STOCKS_VIP_ALL_3"]';
const newVipIncludes = '"STOCKS_VIP_ALL_3","STOCKS_COMBINED_MORNING"]';
code = code.replace(oldVipIncludes, newVipIncludes);

// Patch NIKKEI array
const oldNikkeiIncludes = '"STOCKS_ALL_3","MORNING","AFTERNOON","BOTH"]';
const newNikkeiIncludes = '"STOCKS_ALL_3","STOCKS_COMBINED_MORNING","MORNING","AFTERNOON","BOTH"]';
code = code.replace(oldNikkeiIncludes, newNikkeiIncludes);

fs.writeFileSync(jsPath, code);
console.log('Saved patched useEffect bundle, new size:', code.length);

// Verify JS syntax with node --check
try {
  execSync(`node --check "${jsPath}"`);
  console.log('\n✅ SYNTAX CHECK PASSED! No syntax errors found in patched JS file.');
} catch (e) {
  console.error('\n❌ SYNTAX CHECK FAILED:', e.message);
}
