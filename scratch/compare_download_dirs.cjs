const fs = require('fs');
const path = require('path');

const dirA = path.join(__dirname, '..', 'cloudflare_download_faae1b0f');
const dirB = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4');

console.log('--- DIR A (faae1b0f) ---');
if (fs.existsSync(dirA)) {
  fs.readdirSync(dirA).forEach(f => {
    const s = fs.statSync(path.join(dirA, f));
    console.log(f, s.isDirectory() ? '[DIR]' : s.size);
  });
}

console.log('\n--- DIR B (afdeb0f4) ---');
if (fs.existsSync(dirB)) {
  fs.readdirSync(dirB).forEach(f => {
    const s = fs.statSync(path.join(dirB, f));
    console.log(f, s.isDirectory() ? '[DIR]' : s.size);
  });
}
