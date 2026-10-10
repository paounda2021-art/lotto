const fs = require('fs');
const path = require('path');

const cssFiles = [
  'cloudflare_download_faae1b0f/assets/index-BhHdTzN9.css',
  'cloudflare_download_faae1b0f/assets/index-Cip8XUMO.css',
  'cloudflare_download_afdeb0f4/assets/index-CF9Ii_kx.css',
  'cloudflare_download_afdeb0f4/assets/index-Cip8XUMO.css',
  'lotto/dist/assets/index-D0FNORa4.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const code = fs.readFileSync(file, 'utf8');
    console.log(`CSS [${file}]: size=${code.length}`);
    console.log('  Includes 140b04:', code.includes('140b04'));
    console.log('  Includes bg-gray:', code.includes('bg-gray-') || code.includes('bg-slate-'));
    console.log('  Includes bg-amber:', code.includes('bg-amber-') || code.includes('from-amber-'));
    console.log('  Includes bg-slate:', code.includes('bg-slate-'));
    console.log('---');
  }
});
