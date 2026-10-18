const fs = require('fs');

const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

function findOccurrences(term) {
  let idx = 0;
  while ((idx = code.indexOf(term, idx)) !== -1) {
    console.log('--- Found', term, 'at', idx, '---');
    console.log(code.substring(Math.max(0, idx - 80), Math.min(code.length, idx + 120)));
    idx += term.length;
  }
}

findOccurrences('lotto_active_lottery_type');
findOccurrences('lotto_selected_session');
