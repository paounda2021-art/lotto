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

async function run() {
  const raw = await fetchUrl('https://exphuay.com/result/__data.json');
  const json = JSON.parse(raw);
  console.log('JSON keys:', Object.keys(json));
  if (json.nodes) {
    console.log('Nodes length:', json.nodes.length);
    json.nodes.forEach((n, i) => {
      if (n && n.data) {
        console.log(`Node ${i} data length:`, n.data.length);
        console.log(`Node ${i} data items sample:`, n.data.filter(x => typeof x === 'object' && x !== null));
      }
    });
  }
}

run();
