const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/assets/export_modal.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Live Cloudflare export_modal.js status:', res.statusCode);
    console.log('Includes openLineSettingsModal:', data.includes('openLineSettingsModal'));
    console.log('Includes sendCurrentResultToLine:', data.includes('sendCurrentResultToLine'));
  });
});

https.get('https://lotto289.paounda2021.workers.dev/assets/index-CN-5_2d9.js', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Live Cloudflare index-CN-5_2d9.js status:', res.statusCode);
    console.log('Includes btn-line-settings-jsx:', data.includes('btn-line-settings-jsx'));
    console.log('Includes btn-line-send-day-jsx:', data.includes('btn-line-send-day-jsx'));
  });
});
