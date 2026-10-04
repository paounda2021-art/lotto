import fs from 'fs';
import path from 'path';

const js = fs.readFileSync(path.join(process.cwd(), 'dist/assets/index-Dwgk2uN4.js'), 'utf-8');

const matches = js.match(/\[\{id:"[^\]]+\}\]/g);
const datasets: Record<string, any[]> = {};

matches?.forEach(str => {
  try {
    const arr = new Function(`return ${str}`)();
    if (Array.isArray(arr) && arr.length > 0 && arr[0].id) {
      const firstId = arr[0].id;
      if (firstId.startsWith('hns_')) datasets['HANOI_SPECIAL'] = arr;
      if (firstId.startsWith('hn_')) datasets['HANOI_EVENING'] = arr;
      if (firstId.startsWith('hnv_')) datasets['HANOI_VIP'] = arr;
      if (firstId.startsWith('l30') || arr[0].lotteryType === 'LAOS') datasets['LAOS'] = arr;
      if (firstId.startsWith('d28') || arr[0].lotteryType === 'DOWJONES') datasets['DOWJONES'] = arr;
    }
  } catch (e) {}
});

interface DrawResult {
  id: string;
  lotteryType: 'NIKKEI';
  session: string;
  date: string;
  dateFormatted: string;
  dayOfWeek: string;
  dayNameThai: string;
  top3: string;
  top2: string;
  bottom2: string;
}

const thaiMonths: Record<string, string> = {
  'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06',
  'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
};

const dayOfWeekMap: Record<number, { code: string; name: string }> = {
  0: { code: 'Sun', name: 'อาทิตย์' },
  1: { code: 'Mon', name: 'จันทร์' },
  2: { code: 'Tue', name: 'อังคาร' },
  3: { code: 'Wed', name: 'พุธ' },
  4: { code: 'Thu', name: 'พฤหัสบดี' },
  5: { code: 'Fri', name: 'ศุกร์' },
  6: { code: 'Sat', name: 'เสาร์' }
};

function parseStockFile(filename: string, session: string, prefix: string): DrawResult[] {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  const results: DrawResult[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.includes('|')) {
      const parts = line.split('|');
      const dateRaw = parts[1]?.trim();
      const nextLine1 = lines[i + 1] || '';
      const nextLine2 = lines[i + 2] || '';

      if (dateRaw && nextLine1 !== 'งดออกผล' && nextLine1.length === 3 && nextLine2.length === 2) {
        const dateParts = dateRaw.split(/\s+/);
        if (dateParts.length >= 3) {
          const dayNum = parseInt(dateParts[0], 10);
          const monthStr = dateParts[1];
          const yearShort = parseInt(dateParts[2], 10);
          const monthNum = thaiMonths[monthStr] || '01';
          const yearBE = yearShort < 100 ? 2500 + yearShort : yearShort;
          const yearAD = yearBE - 543;

          const dateObj = new Date(yearAD, parseInt(monthNum, 10) - 1, dayNum);
          const dayInfo = dayOfWeekMap[dateObj.getDay()] || { code: 'Mon', name: 'จันทร์' };

          const dayStr = String(dayNum).padStart(2, '0');
          const dateIso = `${yearAD}-${monthNum}-${dayStr}`;
          const dateFormatted = `${dayStr} ${monthStr} ${yearBE}`;
          const id = `${prefix}_${yearAD}${monthNum}${dayStr}`;

          results.push({
            id,
            lotteryType: 'NIKKEI',
            session,
            date: dateIso,
            dateFormatted,
            dayOfWeek: dayInfo.code,
            dayNameThai: dayInfo.name,
            top3: nextLine1,
            top2: nextLine1.slice(1),
            bottom2: nextLine2
          });
        }
      }
      i += 3;
    } else {
      i++;
    }
  }

  return results;
}

const nkm = parseStockFile('นิเคอิเช้า.txt', 'NIKKEI_MORNING', 'nkm');
const nka = parseStockFile('นิเคอิบ่าย.txt', 'NIKKEI_AFTERNOON', 'nka');
const chm = parseStockFile('จีนเช้า.txt', 'CHINA_MORNING', 'chm');
const cha = parseStockFile('จีนบ่าย.txt', 'CHINA_AFTERNOON', 'cha');
const hsm = parseStockFile('ฮั่งเส็งเช้า.txt', 'HANGSENG_MORNING', 'hsm');
const hsa = parseStockFile('ฮั่งเส็งบ่าย.txt', 'HANGSENG_AFTERNOON', 'hsa');

const nikkeiDataContent = `import { DrawResult } from '../types';

export const INITIAL_NIKKEI_MORNING_DATA: DrawResult[] = ${JSON.stringify(nkm, null, 2)};

export const INITIAL_NIKKEI_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(nka, null, 2)};

export const INITIAL_CHINA_MORNING_DATA: DrawResult[] = ${JSON.stringify(chm, null, 2)};

export const INITIAL_CHINA_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(cha, null, 2)};

export const INITIAL_HANGSENG_MORNING_DATA: DrawResult[] = ${JSON.stringify(hsm, null, 2)};

export const INITIAL_HANGSENG_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(hsa, null, 2)};

export const INITIAL_LAOS_DATA: DrawResult[] = ${JSON.stringify(datasets['LAOS'] || [], null, 2)};

export const INITIAL_DOWJONES_DATA: DrawResult[] = ${JSON.stringify(datasets['DOWJONES'] || [], null, 2)};

export const INITIAL_HANOI_SPECIAL_DATA: DrawResult[] = ${JSON.stringify(datasets['HANOI_SPECIAL'] || [], null, 2)};

export const INITIAL_HANOI_DATA: DrawResult[] = ${JSON.stringify(datasets['HANOI_EVENING'] || [], null, 2)};

export const INITIAL_HANOI_VIP_DATA: DrawResult[] = ${JSON.stringify(datasets['HANOI_VIP'] || [], null, 2)};

export const INITIAL_GSB_DATA: DrawResult[] = [];

export const INITIAL_GOVERNMENT_DATA: DrawResult[] = [];

export const ALL_NIKKEI_DATA: DrawResult[] = [...INITIAL_NIKKEI_MORNING_DATA, ...INITIAL_NIKKEI_AFTERNOON_DATA];

export const ALL_HANOI_DATA: DrawResult[] = [...INITIAL_HANOI_SPECIAL_DATA, ...INITIAL_HANOI_DATA, ...INITIAL_HANOI_VIP_DATA];

export const ALL_STOCKS_DATA: DrawResult[] = [
  ...INITIAL_NIKKEI_MORNING_DATA, ...INITIAL_NIKKEI_AFTERNOON_DATA,
  ...INITIAL_CHINA_MORNING_DATA, ...INITIAL_CHINA_AFTERNOON_DATA,
  ...INITIAL_HANGSENG_MORNING_DATA, ...INITIAL_HANGSENG_AFTERNOON_DATA
];
`;

fs.writeFileSync(path.join(process.cwd(), 'src/data/nikkeiData.ts'), nikkeiDataContent, 'utf-8');
console.log('Successfully regenerated src/data/nikkeiData.ts with ALL exported symbols!');
