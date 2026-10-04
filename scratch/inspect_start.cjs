const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
  const code = await fetchUrl('https://exphuay.com/_app/immutable/entry/start.Bu858oXZ.js');
  fs.writeFileSync('scratch/start.js', code);
  console.log('Saved start.js, length:', code.length);

  const nodes = code.match(/_app\/immutable\/nodes\/[\w.-]+\.js/g) || code.match(/nodes\/[\w.-]+\.js/g) || [];
  console.log('Node JS files found in start.js:', nodes);
}

main();
