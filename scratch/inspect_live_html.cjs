const https = require('https');

https.get('https://lotto289.paounda2021.workers.dev/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML from https://lotto289.paounda2021.workers.dev/:');
    console.log(data);
  });
}).on('error', (err) => {
  console.error('HTTPS Fetch Error:', err);
});
