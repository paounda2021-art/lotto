const fs = require('fs');
const path = require('path');

const token = "cfoat_PKQdJwLiqGoe_QCQ9L7lRCeqRpKuIEijd5buzX8sHOI.6Vq6_jStyqTAQOKMhXBJSOXVyPg6nN7iC5Y8JLGfYlo";
const accountId = "ed064034d172975d8ac1ca541252fd70";
const scriptName = "lotto289";
const versionId = "faae1b0f-72a5-493c-b57f-e1a8b16cb754";

const targetDir = path.join(__dirname, 'cloudflare_download_' + versionId.slice(0, 8));
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
  console.log('1. Fetching version metadata for faae1b0f...');
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

  // Also check if workers.dev or subdomain exists for this version or production deployment
  console.log('\n3. Checking deployments...');
  const depRes = await api(`/workers/scripts/${scriptName}/deployments`);
  const depJson = await depRes.json();
  console.log('Deployments:', JSON.stringify(depJson, null, 2));
  fs.writeFileSync(path.join(targetDir, 'deployments.json'), JSON.stringify(depJson, null, 2));
}

run().catch(console.error);
