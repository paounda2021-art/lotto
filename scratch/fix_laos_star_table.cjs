const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesToPatch = [
  path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js')
];

filesToPatch.forEach(jsPath => {
  if (!fs.existsSync(jsPath)) return;
  let code = fs.readFileSync(jsPath, 'utf8');

  // Subtitle patch
  const t2 = 't==="DOWJONES"?"แสดงผลหวยหุ้นดาวโจนส์ย้อนหลัง ดัชนีปิดตลาดสหรัฐฯ อ้างอิง exphuay":t==="LAOS"?"แสดงผลหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง อ้างอิง LottoTH":';
  const r2 = 't==="DOWJONES"?"แสดงผลหวยหุ้นดาวโจนส์ย้อนหลัง ดัชนีปิดตลาดสหรัฐฯ อ้างอิง exphuay":t==="LAOS"?"แสดงผลหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง อ้างอิง LottoTH":t==="LAOS_STAR"?"แสดงผลหวยลาวสตาร์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ออกทุกวัน รอบ 15:45 น.":';
  if (code.includes(t2)) {
    code = code.replace(t2, r2);
    console.log(`[${path.basename(jsPath)}] Patched subtitle for LAOS_STAR`);
  }

  fs.writeFileSync(jsPath, code);

  try {
    execSync(`node --check "${jsPath}"`);
    console.log(`✅ [${path.basename(jsPath)}] Syntax check PASSED!`);
  } catch (e) {
    console.error(`❌ [${path.basename(jsPath)}] Syntax check FAILED:`, e.message);
  }
});
