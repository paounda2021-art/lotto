const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'x-sveltekit-invalidated': '01'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
  });
}

async function main() {
  try {
    const urls = [
      'https://exphuay.com/backward/xsthm/__data.json',
      'https://exphuay.com/backward/mlnhngo/__data.json',
      'https://exphuay.com/api/backward/xsthm',
      'https://exphuay.com/api/backward/mlnhngo',
      'https://exphuay.com/api/result/xsthm',
      'https://exphuay.com/api/result/mlnhngo'
    ];

    for (const u of urls) {
      console.log('Testing', u);
      const res = await fetchUrl(u);
      console.log('Status:', res.status, 'Data length:', res.data.length);
      if (res.status === 200 && res.data.length > 50) {
        console.log('Sample:', res.data.slice(0, 300));
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
