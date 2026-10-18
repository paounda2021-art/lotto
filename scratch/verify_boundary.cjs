const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const mainStartStr = 'className:"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",children:[';
const posMainStart = js.indexOf(mainStartStr);
const bannerStart = posMainStart + mainStartStr.length;

// Find tabs start
const tabsStartStr = 'n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7';
const posTabsStart = js.indexOf(tabsStartStr, bannerStart);

// Banner chunk is from bannerStart to posTabsStart
const bannerChunk = js.slice(bannerStart, posTabsStart);

// Find DayOfWeekAnalyzer (qy) start
const qyStartStr = 'n.jsx(qy,{';
const posQyStart = js.indexOf(qyStartStr, posTabsStart);

// Tabs chunk is from posTabsStart to posQyStart
const tabsChunk = js.slice(posTabsStart, posQyStart);

console.log('bannerStart:', bannerStart);
console.log('posTabsStart:', posTabsStart);
console.log('posQyStart:', posQyStart);
console.log('bannerChunk starts with:', bannerChunk.slice(0, 80));
console.log('bannerChunk ends with:', bannerChunk.slice(-80));
console.log('tabsChunk starts with:', tabsChunk.slice(0, 80));
console.log('tabsChunk ends with:', tabsChunk.slice(-80));

console.log('Does bannerChunk end with comma?', bannerChunk.endsWith(','));
console.log('Does tabsChunk end with comma?', tabsChunk.endsWith(','));
