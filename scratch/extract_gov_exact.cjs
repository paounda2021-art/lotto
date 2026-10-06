const fs = require('fs');

const files = [
  'c:/apps/lotto/scratch/extract_all_datasets.ts',
  'c:/apps/lotto/scratch/find_minified.ts',
  'c:/apps/lotto/scratch/restore_complete_nikkei_data.ts'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  const idx = content.indexOf('INITIAL_GOVERNMENT_DATA');
  if (idx >= 0) {
    console.log('File:', f, 'idx:', idx);
    const snippet = content.slice(idx, idx + 2000);
    console.log(snippet.slice(0, 1000));
  }
}
