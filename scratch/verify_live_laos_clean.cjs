const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Live bundle status:', res.statusCode, 'size:', data.length);
    const laosIdx = data.indexOf('if (isLaos) {');
    const snippet = data.slice(laosIdx, laosIdx + 300);
    console.log('Snippet in isLaos:');
    console.log(snippet);
  });
});
