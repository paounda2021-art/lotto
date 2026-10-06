import fs from 'fs';
import path from 'path';

const js = fs.readFileSync(path.join(process.cwd(), 'dist/assets/index-Dwgk2uN4.js'), 'utf-8');

['laos_', 'dwj_', 'hns_', 'hne_', 'hnv_', 'gsb_', 'gov_'].forEach(tag => {
  const idx = js.indexOf(tag);
  console.log(`Tag ${tag} at index ${idx}:`);
  if (idx !== -1) {
    console.log(js.substring(idx - 50, idx + 150));
  }
});
