const fs = require('fs');

const transcriptPath = 'C:/Users/FMO-10/.gemini/antigravity/brain/25d57040-2149-4a63-bbf0-9b18bfd18c7d/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

const idx = content.indexOf('export const INITIAL_GOVERNMENT_DATA');
if (idx >= 0) {
  console.log('Found INITIAL_GOVERNMENT_DATA in transcript!');
  const endIdx = content.indexOf('];', idx);
  if (endIdx > idx) {
    const code = content.slice(idx, endIdx + 2);
    console.log(code.slice(0, 500));
    fs.writeFileSync('c:/apps/lotto/scratch/gov_data_recovered.txt', code, 'utf8');
    console.log('Saved to scratch/gov_data_recovered.txt');
  }
} else {
  console.log('Not found');
}
