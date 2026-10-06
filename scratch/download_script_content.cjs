const fs = require('fs');
const path = require('path');

const token = "cfoat_PKQdJwLiqGoe_QCQ9L7lRCeqRpKuIEijd5buzX8sHOI.6Vq6_jStyqTAQOKMhXBJSOXVyPg6nN7iC5Y8JLGfYlo";
const accountId = "ed064034d172975d8ac1ca541252fd70";
const scriptName = "lotto289";
const versionId = "afdeb0f4-cdc6-47d6-8a18-d53b3ef3a861";

const targetDir = path.join(__dirname, '..', 'cloudflare_download_' + versionId.slice(0, 8));

async function tryEndpoint(url, name) {
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`[${res.status}] ${name} -> Content-Type: ${res.headers.get('content-type')}`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`  Size: ${buf.length} bytes`);
      fs.writeFileSync(path.join(targetDir, name), buf);
    } else {
      const txt = await res.text();
      console.log(`  Error body:`, txt.slice(0, 200));
    }
  } catch (e) {
    console.error(`  Exception on ${name}:`, e.message);
  }
}

async function run() {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
  await tryEndpoint(`${base}/workers/scripts/${scriptName}/content`, 'script_content.raw');
  await tryEndpoint(`${base}/workers/scripts/${scriptName}/content/v2`, 'script_content_v2.raw');
  await tryEndpoint(`${base}/workers/scripts/${scriptName}/versions/${versionId}/content`, 'version_content.raw');
  await tryEndpoint(`${base}/workers/scripts/${scriptName}`, 'script_meta.json');
}

run();
