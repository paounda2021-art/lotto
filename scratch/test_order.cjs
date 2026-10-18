const fs = require('fs');
for (const file of ['downloaded_target_worker/assets/index-CN-5_2d9.js', 'dist/assets/index-CN-5_2d9.js']) {
  console.log('Checking:', file);
  const js = fs.readFileSync(file, 'utf8');
  const posMain = js.indexOf('className:"flex-1 max-w-7xl');
  const posTabs = js.indexOf('className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7', posMain);
  const posBanner = js.indexOf('ขณะนี้กำลังวิเคราะห์', posMain);
  const posQy = js.indexOf('n.jsx(qy,{', posMain);
  console.log('posTabs:', posTabs, 'posBanner:', posBanner, 'posQy:', posQy);
  console.log('tabs < banner < qy:', posTabs < posBanner && posBanner < posQy);
}
