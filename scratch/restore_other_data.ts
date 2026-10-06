import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist/assets');
const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(distDir, file), 'utf-8');
  console.log('File:', file, 'Length:', content.length);
  // Search for keywords
  ['LAOS', 'DOWJONES', 'HANOI', 'GSB', 'GOVERNMENT'].forEach(kw => {
    const idx = content.indexOf(kw);
    console.log(`Keyword ${kw} found at index:`, idx);
  });
});
