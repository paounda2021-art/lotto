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
  const rawData = await fetchUrl('https://exphuay.com/backward/laosstar/__data.json');
  const json = JSON.parse(rawData);
  console.log('Nodes count:', json.nodes ? json.nodes.length : 0);
  if (json.nodes) {
    json.nodes.forEach((n, i) => {
      console.log(`Node ${i} type:`, typeof n, 'type of data:', typeof (n && n.data));
      if (n && n.data) {
        console.log(`Node ${i} data length:`, n.data.length);
        console.log(`Node ${i} data sample:`, n.data.slice(0, 10));
      }
    });
  }
}

run();
