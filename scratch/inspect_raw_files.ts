import fs from 'fs';
import path from 'path';

const files = [
  'นิเคอิเช้า.txt',
  'นิเคอิบ่าย.txt',
  'จีนเช้า.txt',
  'จีนบ่าย.txt',
  'ฮั่งเส็งเช้า.txt',
  'ฮั่งเส็งบ่าย.txt'
];

files.forEach(filename => {
  const filePath = path.join(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    console.log(`\n=================== ${filename} ===================`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    console.log(lines.slice(0, 15).join('\n'));
  } else {
    console.log(`\nFile NOT found: ${filename}`);
  }
});
