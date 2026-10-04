const fs = require('fs');
const path = require('path');

// Search all JS files in dist/assets and scratch for GOVERNMENT / gov
function searchJsFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      searchJsFiles(fullPath);
      continue;
    }
    if (!f.endsWith('.js') && !f.endsWith('.ts') && !f.endsWith('.txt')) continue;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    // Search for GOVERNMENT or GOV_BIWEEKLY or government lottery dates
    if (content.includes('GOVERNMENT') || content.includes('รัฐบาลไทย') || content.includes('gov_')) {
      console.log('Found GOVERNMENT keyword in file:', fullPath);
      
      // Match array containing lotteryType: "GOVERNMENT" or id starting with gov
      const matches = content.match(/\[\s*\{[^\]]*"GOVERNMENT"[^\]]*\}\s*\]/g) ||
                      content.match(/\[\s*\{[^{}]*"lotteryType"\s*:\s*"GOVERNMENT"[^\]]*\}\s*\]/g) ||
                      content.match(/\[\s*\{[^{}]*"id"\s*:\s*"gov_[^\]]*\}\s*\]/g);
                      
      if (matches) {
        console.log('Match length:', matches[0].length);
        console.log('Match snippet:', matches[0].slice(0, 300));
        fs.writeFileSync('c:/apps/lotto/scratch/extracted_gov.json', matches[0]);
        return;
      }
    }
  }
}

searchJsFiles('c:/apps/lotto/dist');
searchJsFiles('c:/apps/lotto/scratch');
