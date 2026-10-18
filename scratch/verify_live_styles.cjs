const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Live bundle status:', res.statusCode);
    console.log('Includes #ffedd5:', data.includes('#ffedd5'));
    console.log('Includes #ea580c:', data.includes('#ea580c'));
  });
});
