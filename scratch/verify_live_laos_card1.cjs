const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const laosIdx = data.indexOf('if (isLaos) {');
    const marker = data.indexOf('// LAOS DRAW-BY-DRAW WIN4 CARD', laosIdx);
    console.log('Snippet before marker in isLaos:');
    console.log(data.slice(marker - 100, marker));
  });
});
