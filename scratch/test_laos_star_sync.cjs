const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testFetch() {
  const urls = [
    'https://exphuay.com/result/__data.json',
    'https://exphuay.com/backward/laosstar/__data.json',
    'https://exphuay.com/backward/laos-star/__data.json'
  ];

  for (const u of urls) {
    try {
      const body = await fetchUrl(u);
      console.log(`[${u}]: Length=${body.length}, status OK`);
    } catch (e) {
      console.log(`[${u}]: Error ${e.message}`);
    }
  }
}

testFetch();
