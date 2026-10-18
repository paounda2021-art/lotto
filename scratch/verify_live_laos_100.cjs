const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Live contains updated title?', data.includes('ชุดเลขวินเน้น 4 ตัว รอบต่อรอบ (หวยลาวพัฒนา เข้าเป้า 100%)'));
    console.log('Live contains Mon:[2, 5, 7, 9]?', data.includes('Mon: [2, 5, 7, 9]'));
    console.log('Live contains Fri:[4, 5, 6, 7]?', data.includes('Fri: [4, 5, 6, 7]'));
  });
}).on('error', e => console.error(e));
