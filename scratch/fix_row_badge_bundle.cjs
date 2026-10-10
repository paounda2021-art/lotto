const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesToPatch = [
  path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js')
];

const target = 'children:"🇱🇦 ลาวพัฒนา (20:30)"}):t==="HANOI"?';
const replacement = 'children:"🇱🇦 ลาวพัฒนา (20:30)"}):t==="LAOS_STAR"?n.jsx("span",{className:"inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-extrabold",children:"⭐ ลาวสตาร์ (15:45)"}):t==="HANOI"?';

filesToPatch.forEach(jsPath => {
  if (!fs.existsSync(jsPath)) return;
  let code = fs.readFileSync(jsPath, 'utf8');

  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(jsPath, code);
    console.log(`[${path.basename(jsPath)}] Patched row badge for LAOS_STAR`);
  } else {
    console.log(`[${path.basename(jsPath)}] Target not found or already patched`);
  }

  try {
    execSync(`node --check "${jsPath}"`);
    console.log(`✅ [${path.basename(jsPath)}] Syntax check PASSED!`);
  } catch (e) {
    console.error(`❌ [${path.basename(jsPath)}] Syntax check FAILED:`, e.message);
  }
});
