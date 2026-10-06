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
  const code = await fetchUrl('https://exphuay.com/_app/immutable/entry/app.1A_rs4Ae.js');
  fs.writeFileSync('scratch/app.js', code);
  console.log('Saved app.js, length:', code.length);

  // Search for crypto or decrypt or key or AES or CryptoJS or SubtleCrypto
  const matchKey = code.match(/AES|crypto|decrypt|secret|key|iv|subtle/gi) || [];
  console.log('Matches count:', matchKey.length);
  
  // Look for nodes/ in app.js
  const nodes = code.match(/_app\/immutable\/nodes\/[\w.-]+\.js/g) || [];
  console.log('Node JS files found:', nodes);
}

main();
