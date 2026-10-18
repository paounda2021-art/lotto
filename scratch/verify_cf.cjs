const https = require('https');
https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('CF length:', data.length);
    console.log('CF has STOCK_VIP in 6 rounds:', data.includes('o==="STOCK_VIP")?vipSess'));
  });
});
