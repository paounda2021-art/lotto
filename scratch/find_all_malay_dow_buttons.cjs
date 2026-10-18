const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

function findButtons(type) {
  let idx = 0;
  while ((idx = js.indexOf(type, idx)) !== -1) {
    const chunk = js.slice(Math.max(0, idx - 100), idx + 150);
    if (chunk.includes('button') || chunk.includes('onClick') || chunk.includes('option') || chunk.includes('select')) {
      console.log(`[Button/Option for ${type}] at ${idx}:`);
      console.log(chunk);
      console.log('-'.repeat(40));
    }
    idx += type.length;
  }
}

console.log('=== MALAY ===');
findButtons('"MALAY"');
console.log('=== DOWJONES ===');
findButtons('"DOWJONES"');
