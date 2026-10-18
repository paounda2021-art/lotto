const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find start of main children
const mainStartStr = 'className:"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",children:[';
const posMainStart = js.indexOf(mainStartStr);
console.log('posMainStart:', posMainStart);

const afterMainStart = posMainStart + mainStartStr.length;

// Banner card starts with: n.jsxs("div",{className:"bg-gradient-to-r from-amber-950/80
// Let's verify what it starts with:
console.log('Banner start (100 chars):', js.slice(afterMainStart, afterMainStart + 100));

// Banner card ends with: + ใส่ผลรางวัลใหม่})]})]})
const bannerEndStr = '+ ใส่ผลรางวัลใหม่"})]})]}),';
const posBannerEnd = js.indexOf(bannerEndStr, afterMainStart);
console.log('posBannerEnd:', posBannerEnd);
const bannerFull = js.slice(afterMainStart, posBannerEnd + bannerEndStr.length);
console.log('Banner length:', bannerFull.length);

// Tabs start right after bannerEndStr:
const afterBanner = posBannerEnd + bannerEndStr.length;
console.log('Tabs start (100 chars):', js.slice(afterBanner, afterBanner + 100));

// Tabs end before DayOfWeekAnalyzer (qy):
// Tabs end with: เครื่องมือจับเลขวิน"})]})]}),
const tabsEndStr = 'เครื่องมือจับเลขวิน"})]})]}),';
const posTabsEnd = js.indexOf(tabsEndStr, afterBanner);
console.log('posTabsEnd:', posTabsEnd);
const tabsFull = js.slice(afterBanner, posTabsEnd + tabsEndStr.length);
console.log('Tabs length:', tabsFull.length);

console.log('What comes after tabs:', js.slice(posTabsEnd + tabsEndStr.length, posTabsEnd + tabsEndStr.length + 100));
