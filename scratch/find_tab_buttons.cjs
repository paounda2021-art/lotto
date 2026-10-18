const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const searchTerms = ['"NIKKEI"', '"STOCK_VIP"', '"HANOI"'];
let idx = 0;
while (true) {
  const p = js.indexOf('"STOCK_VIP"', idx);
  if (p === -1) break;
  const chunk = js.slice(Math.max(0, p - 200), p + 300);
  if (chunk.includes('onClick') || chunk.includes('button') || chunk.includes('label') || chunk.includes('id:') || chunk.includes('key:')) {
    console.log('Match at', p, ':');
    console.log(chunk);
    console.log('='.repeat(40));
  }
  idx = p + 11;
}
