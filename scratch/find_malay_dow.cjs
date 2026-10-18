const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Search for tab definitions (arrays containing lottery type keys)
const keys = ['"NIKKEI"', '"STOCK_VIP"', '"DOWJONES"', '"MALAY"', '"LAOS"', '"HANOI"'];

let pos = 0;
while (true) {
  const found = js.indexOf('"DOWJONES"', pos);
  if (found === -1) break;
  // Check context
  const snippet = js.slice(Math.max(0, found - 150), found + 200);
  if (snippet.includes('label:') || snippet.includes('name:') || snippet.includes('id:') || snippet.includes('[') || snippet.includes('{')) {
    if (!snippet.includes('date:') && !snippet.includes('top3:')) {
      console.log('Found non-draw occurrence at', found, ':');
      console.log(snippet);
      console.log('='.repeat(50));
    }
  }
  pos = found + 10;
}
