const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Live contains dynamic next mode check?', data.includes('isNextMode'));
    console.log('Live contains latest draw 6D calc?', data.includes('raw6D.split'));
  });
}).on('error', e => console.error(e));
