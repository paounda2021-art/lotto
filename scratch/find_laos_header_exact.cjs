const fs = require('fs');

const bundle = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Locate the badge and h4 in Laos card2
const laosIdx = bundle.indexOf('if (isLaos) {');
const marker = bundle.indexOf('(หวยลาวพัฒนา)', laosIdx);
console.log('Found (หวยลาวพัฒนา) in bundle at:', marker);

// Print 600 chars around it
console.log(bundle.slice(marker - 400, marker + 300));
