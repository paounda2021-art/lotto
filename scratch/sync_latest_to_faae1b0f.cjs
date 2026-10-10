const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'cloudflare_latest_download');
const destFaae = path.join(__dirname, '..', 'cloudflare_download_faae1b0f');
const destDist = path.join(__dirname, '..', 'dist');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.statSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

copyFolderSync(srcDir, destFaae);
copyFolderSync(srcDir, destDist);

console.log('Successfully copied cloudflare_latest_download to cloudflare_download_faae1b0f and dist!');
