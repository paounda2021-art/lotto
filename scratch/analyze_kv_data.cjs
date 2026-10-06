const fs = require('fs');
const path = require('path');

const kvDir = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'kv_data');
const files = fs.readdirSync(kvDir);

console.log('--- KV Datasets Summary ---');
for (const file of files) {
  if (file.endsWith('.json')) {
    const raw = fs.readFileSync(path.join(kvDir, file), 'utf8');
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        console.log(`${file}: ${data.length} records. Latest: ${JSON.stringify(data[0])}`);
      } else if (data && typeof data === 'object') {
        const keys = Object.keys(data);
        console.log(`${file}: Object with keys [${keys.join(', ')}]`);
      }
    } catch(e) {
      console.log(`${file}: Parse error`);
    }
  }
}
