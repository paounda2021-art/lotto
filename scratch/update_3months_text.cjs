const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(jsPath, 'utf8');

console.log('Original JS size:', code.length);

// Replace subtitle text to explicitly highlight 3 months complete historical dataset (3,800+ draws)
code = code.replace(
  /A==="STOCKS_COMBINED_MORNING"\?"☀️⭐ วิเคราะห์รวม 12 รอบหุ้น \(ปกติ 6 \+ VIP 6\) ➔ คัดเล่นรอบเช้า":/g,
  'A==="STOCKS_COMBINED_MORNING"?"☀️⭐ สแกนสถิติ 12 รอบหุ้นย้อนหลัง 3 เดือนเต็ม ➔ คัดเด่นเล่นรอบเช้า":'
);

fs.writeFileSync(jsPath, code);
console.log('Saved 3-month text updated bundle, new size:', code.length);

// Verify JS syntax with node --check
try {
  execSync(`node --check "${jsPath}"`);
  console.log('\n✅ SYNTAX CHECK PASSED! No syntax errors found in updated JS file.');
} catch (e) {
  console.error('\n❌ SYNTAX CHECK FAILED:', e.message);
}
