const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// posMain:
const posMain = js.indexOf('className:"flex-1 max-w-7xl');
console.log('posMain:', posMain);

// Let's see what children main has:
console.log('Main children start:', js.slice(posMain, posMain + 300));

// Let's find where the banner card ends
// It ends before the tabs:
const posTabsStart = js.lastIndexOf('className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7', 828899);
console.log('posTabsStart:', posTabsStart);
console.log('Before tabs (200 chars):', js.slice(posTabsStart - 200, posTabsStart));
