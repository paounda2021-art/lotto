const { execSync } = require('child_process');
const fs = require('fs');

const buf = execSync('git show HEAD:downloaded_target_worker/assets/index-CN-5_2d9.js');
fs.writeFileSync('scratch/clean_bundle.js', buf);
console.log('Successfully saved clean_bundle.js as UTF-8 buffer, size:', buf.length);
