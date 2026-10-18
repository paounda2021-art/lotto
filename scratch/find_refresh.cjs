const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

function findMatches(keyword) {
  let idx = 0;
  console.log(`=== Matches for "${keyword}" ===`);
  while ((idx = js.indexOf(keyword, idx)) !== -1) {
    console.log(idx, ':', js.slice(Math.max(0, idx - 60), Math.min(js.length, idx + 100)));
    idx += keyword.length;
  }
}

findMatches('รีเซ็ต');
findMatches('exphuay');
