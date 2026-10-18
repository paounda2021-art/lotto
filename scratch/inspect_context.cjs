const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const matches = [...code.matchAll(/vt\s*=\s*/g)];
console.log('vt matches:', matches.length);
for (const m of matches) {
  if (m.index > 800000 && m.index < 933576) {
    console.log('Match at', m.index, ':', code.substring(m.index, m.index + 200));
  }
}
