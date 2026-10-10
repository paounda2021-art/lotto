const fs = require('fs');
const path = require('path');

const baseUrl = 'https://faae1b0f-lotto289.paounda2021.workers.dev';
const targetDir = path.join(__dirname, '..', 'cloudflare_download_faae1b0f');
const assetsDir = path.join(targetDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function downloadFile(relPath, localPath) {
  const url = `${baseUrl}/${relPath}`.replace(/([^:]\/)\/+/g, '$1');
  console.log(`Downloading ${url}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed ${url}: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, buf);
    console.log(`Saved ${localPath} (${buf.length} bytes)`);
    return buf.toString('utf8');
  } catch (e) {
    console.error(`Error downloading ${url}:`, e.message);
    return null;
  }
}

async function run() {
  // 1. Download index.html
  const htmlContent = await downloadFile('index.html', path.join(targetDir, 'index.html'));
  if (!htmlContent) {
    console.error('Failed to download index.html');
    return;
  }

  // 2. Download standard root files
  await downloadFile('robots.txt', path.join(targetDir, 'robots.txt'));
  await downloadFile('favicon.ico', path.join(targetDir, 'favicon.ico'));
  await downloadFile('favicon.svg', path.join(targetDir, 'favicon.svg'));
  await downloadFile('site.webmanifest', path.join(targetDir, 'site.webmanifest'));
  await downloadFile('_worker.js', path.join(targetDir, '_worker.js'));

  // 3. Parse index.html for assets (script src, link href)
  const assetRegex = /(?:src|href)=["']([^"']+\.(?:js|css|png|jpg|jpeg|svg|json|ico|woff2?|ttf))["']/gi;
  const foundAssets = new Set();
  let match;
  while ((match = assetRegex.exec(htmlContent)) !== null) {
    const assetPath = match[1].replace(/^\.\//, '').replace(/^\//, '');
    foundAssets.add(assetPath);
  }

  for (const asset of foundAssets) {
    const content = await downloadFile(asset, path.join(targetDir, asset));
    // If it's a JS file, look for source maps or dynamic imports or further asset paths
    if (asset.endsWith('.js') && content) {
      const subRegex = /["']([^"']+\.(?:js|css|png|jpg|jpeg|svg|json|woff2?|ttf))["']/g;
      let subMatch;
      while ((subMatch = subRegex.exec(content)) !== null) {
        const sub = subMatch[1];
        if (sub.startsWith('./') || sub.startsWith('assets/')) {
          const cleanSub = sub.replace(/^\.\//, '').replace(/^\//, '');
          if (!foundAssets.has(cleanSub)) {
            foundAssets.add(cleanSub);
            await downloadFile(cleanSub, path.join(targetDir, cleanSub));
          }
        }
      }
    }
  }

  console.log('\nAll assets from faae1b0f downloaded successfully!');
}

run();
