const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'downloaded_target_worker');
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.html
fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));
console.log('Copied index.html to dist/');

// Copy assets
const srcAssets = path.join(srcDir, 'assets');
const distAssets = path.join(distDir, 'assets');
if (!fs.existsSync(distAssets)) {
  fs.mkdirSync(distAssets, { recursive: true });
}

for (const file of fs.readdirSync(srcAssets)) {
  fs.copyFileSync(path.join(srcAssets, file), path.join(distAssets, file));
  console.log(`Copied ${file} to dist/assets/`);
}

// Copy favicon or any other files
for (const file of fs.readdirSync(srcDir)) {
  if (file !== 'assets' && file !== 'kv_data') {
    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, path.join(distDir, file));
      console.log(`Copied ${file} to dist/`);
    }
  }
}

console.log('Sync complete!');
