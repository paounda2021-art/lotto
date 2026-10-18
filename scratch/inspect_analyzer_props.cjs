const fs = require('fs');
const c = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find where DayOfWeekAnalyzer is called or rendered
// Look for where Ey(T, r) is called
const idx = c.indexOf('h=W.useMemo(()=>Ey(T,r),[T,r])');
console.log('Index of h=W.useMemo:', idx);
const start = Math.max(0, idx - 400);
console.log(c.substring(start, idx + 400));
