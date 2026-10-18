const fs = require('fs');
const path = require('path');

const srcExportModal = path.join(__dirname, 'export_modal_combined.js');
const srcIndexPatched = path.join(__dirname, 'index_patched.js');

const targetWorkerExport = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'export_modal.js');
const targetWorkerIndex = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');

const distExport = path.join(__dirname, '..', 'dist', 'assets', 'export_modal.js');
const distIndex = path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js');

fs.copyFileSync(srcExportModal, targetWorkerExport);
fs.copyFileSync(srcExportModal, distExport);
console.log('Synced export_modal.js to downloaded_target_worker and dist');

fs.copyFileSync(srcIndexPatched, targetWorkerIndex);
fs.copyFileSync(srcIndexPatched, distIndex);
console.log('Synced index-CN-5_2d9.js to downloaded_target_worker and dist');
