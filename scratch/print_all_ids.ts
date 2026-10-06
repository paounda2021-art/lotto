import fs from 'fs';
import path from 'path';

const js = fs.readFileSync(path.join(process.cwd(), 'dist/assets/index-Dwgk2uN4.js'), 'utf-8');

const matches = js.match(/\[\{id:"[^\]]+\}\]/g);
matches?.forEach((str, i) => {
  try {
    const arr = new Function(`return ${str}`)();
    if (Array.isArray(arr) && arr.length > 0) {
      console.log(`Index ${i}: first ID = ${arr[0].id}, lotteryType = ${arr[0].lotteryType}, count = ${arr.length}`);
    }
  } catch (e) {}
});
