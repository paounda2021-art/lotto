const fs = require('fs');

const bundle = fs.readFileSync('scratch/test_golden_bundle.js', 'utf8');

fs.writeFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', bundle, 'utf8');
console.log('Saved to downloaded_target_worker/assets/index-CN-5_2d9.js');

fs.writeFileSync('dist/assets/index-CN-5_2d9.js', bundle, 'utf8');
console.log('Saved to dist/assets/index-CN-5_2d9.js');
