const fs = require('fs');

const builds = {
  'faae1b0f': 'cloudflare_download_faae1b0f/assets/index-CN-5_2d9.js',
  'afdeb0f4': 'cloudflare_download_afdeb0f4/assets/index-CN-5_2d9.js',
  'latest': 'cloudflare_latest_download/assets/index-CN-5_2d9.js',
  'lotto_dist': 'lotto/dist/assets/index-Dhau0GXT.js'
};

Object.entries(builds).forEach(([name, path]) => {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const hasGold = content.includes('#140b04') || content.includes('amber-950') || content.includes('gold') || content.includes('หวยหุ้นดาวโจนส์');
    console.log(`Build [${name}]: size=${content.length}, hasGoldTheme=${hasGold}`);
    // Check if US Dow Jones label is present
    const dowJonesIdx = content.indexOf('หวยหุ้นดาวโจนส์');
    if (dowJonesIdx !== -1) {
      console.log(`  [${name}] Dow Jones snippet:`, content.substring(dowJonesIdx - 50, dowJonesIdx + 150));
    }
  }
});
