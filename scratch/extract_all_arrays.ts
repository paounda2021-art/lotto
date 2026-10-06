import fs from 'fs';
import path from 'path';

const js = fs.readFileSync(path.join(process.cwd(), 'dist/assets/index-Dwgk2uN4.js'), 'utf-8');

// Find all array literals containing {id:"..."
const arrayMatches = js.match(/\[\{id:"[^\]]+\}\]/g);
console.log('Total array matches found:', arrayMatches?.length);

const datasets: Record<string, any[]> = {};

if (arrayMatches) {
  arrayMatches.forEach(str => {
    try {
      // Evaluate minified JS array literal safely
      const arr = new Function(`return ${str}`)();
      if (Array.isArray(arr) && arr.length > 0 && arr[0].id) {
        const firstId = arr[0].id;
        console.log(`Found dataset with first ID ${firstId}, count: ${arr.length}`);
        if (firstId.startsWith('hns_')) datasets['HANOI_SPECIAL'] = arr;
        if (firstId.startsWith('hne_') || (arr[0].session === 'HANOI_EVENING')) datasets['HANOI_EVENING'] = arr;
        if (firstId.startsWith('hnv_')) datasets['HANOI_VIP'] = arr;
        if (firstId.startsWith('laos_') || arr[0].lotteryType === 'LAOS') datasets['LAOS'] = arr;
        if (firstId.startsWith('dwj_') || arr[0].lotteryType === 'DOWJONES') datasets['DOWJONES'] = arr;
        if (firstId.startsWith('gsb_') || arr[0].lotteryType === 'GSB') datasets['GSB'] = arr;
        if (firstId.startsWith('gov_') || arr[0].lotteryType === 'GOVERNMENT') datasets['GOV'] = arr;
      }
    } catch (e) {
      // ignore
    }
  });
}

console.log('Extracted datasets keys:', Object.keys(datasets));
