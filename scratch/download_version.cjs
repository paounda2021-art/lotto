const fs = require('fs');
const path = require('path');

const token = "cfoat_PKQdJwLiqGoe_QCQ9L7lRCeqRpKuIEijd5buzX8sHOI.6Vq6_jStyqTAQOKMhXBJSOXVyPg6nN7iC5Y8JLGfYlo";
const accountId = "ed064034d172975d8ac1ca541252fd70";
const scriptName = "lotto289";
const versionId = "afdeb0f4-cdc6-47d6-8a18-d53b3ef3a861";

const targetDir = path.join(__dirname, '..', 'cloudflare_download_' + versionId.slice(0, 8));
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function api(urlPath, options = {}) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}${urlPath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  return res;
}

async function run() {
  console.log('1. Fetching version metadata...');
  const vRes = await api(`/workers/scripts/${scriptName}/versions/${versionId}`);
  const vJson = await vRes.json();
  console.log('Version details:', JSON.stringify(vJson, null, 2));
  fs.writeFileSync(path.join(targetDir, 'version_meta.json'), JSON.stringify(vJson, null, 2));

  console.log('\n2. Fetching version content...');
  const cRes = await api(`/workers/scripts/${scriptName}/versions/${versionId}/content`);
  const cType = cRes.headers.get('content-type') || '';
  console.log('Content response status:', cRes.status, 'Content-Type:', cType);

  if (cType.includes('multipart/form-data')) {
    const arrayBuf = await cRes.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    fs.writeFileSync(path.join(targetDir, 'content_multipart.raw'), buf);
    console.log('Saved multipart raw content, size:', buf.length);
  } else {
    const text = await cRes.text();
    fs.writeFileSync(path.join(targetDir, 'worker_content.js'), text);
    console.log('Saved worker_content.js, length:', text.length);
  }

  // Also check KV namespace ae6e343df2dc49f3b5def86e9926bebd
  const kvId = "ae6e343df2dc49f3b5def86e9926bebd";
  console.log('\n3. Listing keys in KV Namespace:', kvId);
  const kvKeysRes = await api(`/storage/kv/namespaces/${kvId}/keys`);
  const kvKeysJson = await kvKeysRes.json();
  console.log('KV keys response:', JSON.stringify(kvKeysJson, null, 2));

  const kvDir = path.join(targetDir, 'kv_data');
  if (!fs.existsSync(kvDir)) fs.mkdirSync(kvDir, { recursive: true });

  if (kvKeysJson.success && kvKeysJson.result) {
    for (const item of kvKeysJson.result) {
      const k = item.name;
      const valRes = await api(`/storage/kv/namespaces/${kvId}/values/${encodeURIComponent(k)}`);
      const valText = await valRes.text();
      fs.writeFileSync(path.join(kvDir, `${k}.json`), valText);
      console.log(`Downloaded KV: ${k} (${valText.length} bytes)`);
    }
  }

  // Also check if there's any other KV namespace like 8eb67f32e8f548dcb634c44055c0edcf
  const otherKvId = "8eb67f32e8f548dcb634c44055c0edcf";
  console.log('\n4. Checking other KV Namespace:', otherKvId);
  const otherKvKeysRes = await api(`/storage/kv/namespaces/${otherKvId}/keys`);
  const otherKvKeysJson = await otherKvKeysRes.json();
  console.log('Other KV keys response:', JSON.stringify(otherKvKeysJson, null, 2));
  if (otherKvKeysJson.success && otherKvKeysJson.result) {
    const otherKvDir = path.join(targetDir, 'kv_data_8eb');
    if (!fs.existsSync(otherKvDir)) fs.mkdirSync(otherKvDir, { recursive: true });
    for (const item of otherKvKeysJson.result) {
      const k = item.name;
      const valRes = await api(`/storage/kv/namespaces/${otherKvId}/values/${encodeURIComponent(k)}`);
      const valText = await valRes.text();
      fs.writeFileSync(path.join(otherKvDir, `${k}.json`), valText);
      console.log(`Downloaded KV (8eb): ${k} (${valText.length} bytes)`);
    }
  }
}

run().catch(console.error);
