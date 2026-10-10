const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'live_worker_download');
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        return downloadBinary(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function main() {
  console.log('Fetching live index.html from Cloudflare Worker...');
  const res = await fetchUrl('https://lotto289.paounda2021.workers.dev/');
  console.log('Index status:', res.statusCode);
  
  const html = res.body;
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), html, 'utf8');

  // Extract assets
  const jsMatch = html.match(/src="(\/assets\/[^"]+)"/);
  const cssMatch = html.match(/href="(\/assets\/[^"]+)"/);

  if (jsMatch) {
    const jsUrl = 'https://lotto289.paounda2021.workers.dev' + jsMatch[1];
    const fileName = path.basename(jsMatch[1]);
    console.log('Downloading live JS:', jsUrl);
    await downloadBinary(jsUrl, path.join(targetDir, 'assets', fileName));
  }

  if (cssMatch) {
    const cssUrl = 'https://lotto289.paounda2021.workers.dev' + cssMatch[1];
    const fileName = path.basename(cssMatch[1]);
    console.log('Downloading live CSS:', cssUrl);
    await downloadBinary(cssUrl, path.join(targetDir, 'assets', fileName));
  }

  console.log('🎉 Live worker download completed successfully!');
}

main().catch(err => {
  console.error('Failed download:', err);
  process.exit(1);
});
