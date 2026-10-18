const fs = require('fs');

// Read export_modal.js
const modalContent = fs.readFileSync('downloaded_target_worker/assets/export_modal.js', 'utf8');
console.log('Original export_modal.js lines:', modalContent.split('\n').length);
