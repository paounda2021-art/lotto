const fs = require('fs');

const files = [
  'downloaded_target_worker/assets/index-CN-5_2d9.js',
  'dist/assets/index-CN-5_2d9.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    continue;
  }
  let js = fs.readFileSync(file, 'utf8');

  const mainStartStr = 'className:"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",children:[';
  const posMainStart = js.indexOf(mainStartStr);
  if (posMainStart === -1) {
    console.log('Could not find mainStartStr in', file);
    continue;
  }
  const bannerStart = posMainStart + mainStartStr.length;

  // Tabs start
  const tabsStartStr = 'n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7';
  const posTabsStart = js.indexOf(tabsStartStr, bannerStart);
  if (posTabsStart === -1) {
    console.log('Could not find tabsStartStr in', file);
    continue;
  }

  // qy start
  const qyStartStr = 'n.jsx(qy,{';
  const posQyStart = js.indexOf(qyStartStr, posTabsStart);
  if (posQyStart === -1) {
    console.log('Could not find qyStartStr in', file);
    continue;
  }

  const bannerChunk = js.slice(bannerStart, posTabsStart);
  const tabsChunk = js.slice(posTabsStart, posQyStart);

  if (!bannerChunk.endsWith(',') || !tabsChunk.endsWith(',')) {
    console.log('Error: chunks do not end with comma in', file);
    continue;
  }

  // Swap: tabsChunk first, then bannerChunk
  const newSegment = tabsChunk + bannerChunk;
  const newJs = js.slice(0, bannerStart) + newSegment + js.slice(posQyStart);

  fs.writeFileSync(file, newJs, 'utf8');
  console.log('Successfully swapped banner and tabs in:', file);
}
