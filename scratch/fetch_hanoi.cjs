const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function main() {
  try {
    console.log('Fetching Special...');
    const specialHtml = await fetchUrl('https://exphuay.com/backward/xsthm');
    fs.writeFileSync('scratch/special.html', specialHtml);
    console.log('Saved special.html, size:', specialHtml.length);

    console.log('Fetching VIP...');
    const vipHtml = await fetchUrl('https://exphuay.com/backward/mlnhngo');
    fs.writeFileSync('scratch/vip.html', vipHtml);
    console.log('Saved vip.html, size:', vipHtml.length);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
