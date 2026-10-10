const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(jsPath, 'utf8');

// Search for onClick handlers in Navbar component
// Let's find onClick:()=>r("STOCKS_ALL_3") and see what r is!
let pos = code.indexOf('onClick:()=>r("STOCKS_ALL_3")');
if (pos !== -1) {
  console.log('--- Match at pos', pos, '---');
  console.log(code.slice(pos - 300, pos + 300));
} else {
  console.log('Not found exact string, searching STOCKS_ALL_3');
  pos = code.indexOf('STOCKS_ALL_3');
  console.log(code.slice(pos - 200, pos + 200));
}

// Search for where session state is set or validated in App component!
console.log('\n--- Searching session state validation in App component ---');
let pos2 = 0;
while ((pos2 = code.indexOf('lotto_selected_session', pos2)) !== -1) {
  console.log(`Match lotto_selected_session at ${pos2}`);
  console.log(code.slice(pos2 - 200, pos2 + 300));
  pos2 += 20;
}
