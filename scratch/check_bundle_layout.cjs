const fs = require('fs');

const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

const posBanner = js.indexOf('ขณะนี้กำลังวิเคราะห์');
console.log('posBanner:', posBanner);

// Find where main starts before posBanner
const posMain = js.lastIndexOf('<main', posBanner) !== -1 ? js.lastIndexOf('<main', posBanner) : js.lastIndexOf('className:"flex-1 max-w-7xl', posBanner);
console.log('posMain:', posMain);

// Let's print from posMain to posBanner + 3000
const slice = js.slice(posMain - 100, posBanner + 5000);

// Find where the 7 tabs start
const posTabs = slice.indexOf('OVERVIEW');
console.log('posTabs relative:', posTabs);

// Find where DayOfWeekAnalyzer (qy) is rendered
const posQy = slice.indexOf('qy,{');
console.log('posQy relative:', posQy);
