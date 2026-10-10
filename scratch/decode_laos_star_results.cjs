const https = require('https');
const crypto = require('crypto');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Decryption function mirroring exphuay l_
function decryptPayload(payload, ivHex) {
  try {
    const key = Buffer.from("7x!A$9vP#2mK8L@q5wZ&1nE*4jU(6tY)", 'utf8');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(payload, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

async function run() {
  const rawData = await fetchUrl('https://exphuay.com/backward/laosstar/__data.json');
  const json = JSON.parse(rawData);
  const results = [];

  if (json.nodes) {
    for (const node of json.nodes) {
      if (node && node.data) {
        for (const item of node.data) {
          if (item && typeof item === 'object' && item.payload !== undefined && item.iv !== undefined) {
            const payload = typeof item.payload === 'number' ? node.data[item.payload] : item.payload;
            const iv = typeof item.iv === 'number' ? node.data[item.iv] : item.iv;
            const dec = decryptPayload(payload, iv);
            if (Array.isArray(dec)) {
              dec.forEach(d => results.push(d));
            }
          }
        }
      }
    }
  }

  console.log(`Decoded ${results.length} records from backward/laosstar`);
  if (results.length > 0) {
    console.log('Sample decoded record:', results[0]);
    console.log('\nTop 10 Laos Star draws from exphuay:');
    results.slice(0, 10).forEach(r => {
      console.log(`Name: ${r.lottosName} | Date: ${r.lottosDate} | Number: ${r.lottosNumber} | Under: ${r.lottosUnder}`);
    });
  }
}

run();
