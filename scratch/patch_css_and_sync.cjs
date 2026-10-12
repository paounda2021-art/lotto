const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('1. Building export_modal_combined.js...');
execSync('node scratch/build_enhanced_export_modal.cjs', { stdio: 'inherit' });

console.log('2. Building index_patched.js...');
execSync('node scratch/test_bundle_patch.cjs', { stdio: 'inherit' });

console.log('3. Updating index-Cip8XUMO.css with vivid LINE Green classes...');
const cssRule = `
/* ==========================================================================
   LINE Notification Buttons - Vivid Brand Green (#06c755)
   ========================================================================== */
#btn-line-settings-ui,
#btn-line-settings-jsx,
.btn-line-nav {
  background-color: #06c755 !important;
  color: #ffffff !important;
  border: 1px solid #05a043 !important;
  font-weight: 800 !important;
  font-size: 12px !important;
  box-shadow: 0 2px 10px rgba(6, 199, 85, 0.5) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
}
#btn-line-settings-ui:hover,
#btn-line-settings-jsx:hover,
.btn-line-nav:hover {
  background-color: #05b54d !important;
  box-shadow: 0 4px 16px rgba(6, 199, 85, 0.7) !important;
  transform: translateY(-1px) !important;
}
#btn-line-settings-ui span,
#btn-line-settings-jsx span,
.btn-line-nav span {
  color: #ffffff !important;
  font-weight: 800 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
}

/* Card-level LINE buttons hidden per user request: "ขอซ่อนปุ่มไลน์ในการ์ดด้านล่างไว้ก่อน ให้เหลือไว้เฉพาะบนหัวเว็บ" */
#btn-line-send-result-ui,
#btn-line-send-day-jsx,
#btn-line-send-result-jsx,
.btn-line-send {
  display: none !important;
}
`;

const workerCssPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-Cip8XUMO.css');
const distCssPath = path.join(__dirname, '..', 'dist', 'assets', 'index-Cip8XUMO.css');

let workerCss = fs.readFileSync(workerCssPath, 'utf8');
const cutIdx = workerCss.indexOf('/* ==========================================================================\n   LINE Notification Buttons');
if (cutIdx !== -1) {
  workerCss = workerCss.substring(0, cutIdx).trim();
}
workerCss += '\n' + cssRule;
fs.writeFileSync(workerCssPath, workerCss, 'utf8');
fs.writeFileSync(distCssPath, workerCss, 'utf8');
console.log('CSS updated successfully in worker and dist.');

console.log('4. Copying patched files to downloaded_target_worker and dist...');
const srcExport = path.join(__dirname, 'export_modal_combined.js');
const srcIndex = path.join(__dirname, 'index_patched.js');

fs.copyFileSync(srcExport, path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'export_modal.js'));
fs.copyFileSync(srcExport, path.join(__dirname, '..', 'dist', 'assets', 'export_modal.js'));

fs.copyFileSync(srcIndex, path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js'));
fs.copyFileSync(srcIndex, path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'));

console.log('5. Validating syntax with node --check...');
execSync('node --check dist/assets/export_modal.js');
execSync('node --check dist/assets/index-CN-5_2d9.js');
execSync('node --check downloaded_target_worker/assets/export_modal.js');
execSync('node --check downloaded_target_worker/assets/index-CN-5_2d9.js');
console.log('All files validated with 0 syntax errors!');
