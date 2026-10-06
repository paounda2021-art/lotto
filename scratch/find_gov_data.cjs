const fs = require('fs');
const path = require('path');

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) continue;
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('INITIAL_GOVERNMENT_DATA') || content.includes('gov_biweekly') || content.includes('GOVERNMENT')) {
      const idx = content.indexOf('INITIAL_GOVERNMENT_DATA');
      console.log('Found in:', full, 'idx:', idx);
      if (idx >= 0) {
        console.log(content.slice(idx, idx + 500));
      }
    }
  }
}

searchInDir('c:/apps/lotto/scratch');
