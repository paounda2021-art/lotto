const fs = require('fs');

const bundle = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

// Find where vipD, all3D, vipStats are computed in winData
const search = 'const vipStats=Ey(vipD,r),all3Stats=Ey(all3D,r);';
console.log('Found stats search:', bundle.includes(search));

// Let's inspect around winData
const idx = bundle.indexOf('const winData=');
console.log('winData idx:', idx);
console.log(bundle.slice(idx, idx + 800));
