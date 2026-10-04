const fs = require('fs');
const path = require('path');

const THAI_MONTHS = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
  'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
};

const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const DAY_EN_MAP = {
  'วันอาทิตย์': 'Sun', 'อาทิตย์': 'Sun',
  'วันจันทร์': 'Mon', 'จันทร์': 'Mon',
  'วันอังคาร': 'Tue', 'อังคาร': 'Tue',
  'วันพุธ': 'Wed', 'พุธ': 'Wed',
  'วันพฤหัสบดี': 'Thu', 'พฤหัสบดี': 'Thu',
  'วันศุกร์': 'Fri', 'ศุกร์': 'Fri',
  'วันเสาร์': 'Sat', 'เสาร์': 'Sat'
};

const DAY_TH_MAP = {
  'วันอาทิตย์': 'อาทิตย์', 'อาทิตย์': 'อาทิตย์',
  'วันจันทร์': 'จันทร์', 'จันทร์': 'จันทร์',
  'วันอังคาร': 'อังคาร', 'อังคาร': 'อังคาร',
  'วันพุธ': 'พุธ', 'พุธ': 'พุธ',
  'วันพฤหัสบดี': 'พฤหัสบดี', 'พฤหัสบดี': 'พฤหัสบดี',
  'วันศุกร์': 'ศุกร์', 'ศุกร์': 'ศุกร์',
  'วันเสาร์': 'เสาร์', 'เสาร์': 'เสาร์'
};

function parseStandardTxtFile(filePath, lotteryType, session) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  const results = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.includes('|')) {
      const parts = line.split('|');
      const dateStr = parts[1].trim();
      const dateParts = dateStr.split(/\s+/);
      if (dateParts.length >= 3) {
        const day = parseInt(dateParts[0], 10);
        const monthShort = dateParts[1];
        const year2D = parseInt(dateParts[2], 10);
        const monthNum = THAI_MONTHS[monthShort] || 1;
        const yearBE = year2D > 50 ? 2500 + year2D : 2000 + year2D;
        const yearAD = yearBE - 543;

        const top3Val = lines[i + 1] || '';
        const bottom2Val = lines[i + 2] || '';

        if (top3Val && top3Val !== 'งดออกผล' && !top3Val.includes('|')) {
          const dObj = new Date(yearAD, monthNum - 1, day);
          const dayOfWeek = DAY_EN[dObj.getDay()];
          const dayNameThai = DAY_TH[dObj.getDay()];

          const mmStr = String(monthNum).padStart(2, '0');
          const ddStr = String(day).padStart(2, '0');
          const dateIso = `${yearAD}-${mmStr}-${ddStr}`;
          const dateFormatted = `${ddStr} ${monthShort} ${yearBE}`;

          const top3 = String(top3Val).padStart(3, '0');
          const top2 = top3.slice(-2);
          const bottom2 = String(bottom2Val).padStart(2, '0');

          results.push({
            id: `${session.toLowerCase()}_${yearAD}${mmStr}${ddStr}`,
            lotteryType,
            session,
            date: dateIso,
            dateFormatted,
            dayOfWeek,
            dayNameThai,
            top3,
            top2,
            bottom2
          });
          i += 3;
          continue;
        }
      }
    }
    i++;
  }

  const seen = new Set();
  const unique = [];
  for (const item of results) {
    if (!seen.has(item.date)) {
      seen.add(item.date);
      unique.push(item);
    }
  }

  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

function parseGovTxtFile() {
  const rootDir = 'c:/apps/lotto';
  const files = fs.readdirSync(rootDir).filter(f => f.includes('รัฐบาลไทย') && f.endsWith('.txt'));
  if (files.length === 0) return [];

  const filePath = path.join(rootDir, files[0]);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const results = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.includes('รัฐบาลไทย')) {
      const dateLine = lines[i + 1] || '';
      const dayLine = lines[i + 2] || '';
      const numbersLine = lines[i + 3] || '';

      const dateParts = dateLine.split(/\s+/);
      if (dateParts.length >= 3) {
        const day = parseInt(dateParts[0], 10);
        const monthShort = dateParts[1];
        const yearBE = parseInt(dateParts[2], 10);
        const yearAD = yearBE > 2500 ? yearBE - 543 : yearBE;
        const monthNum = THAI_MONTHS[monthShort] || 1;

        const numParts = numbersLine.split(/\t+|\s+/);
        if (numParts.length >= 4) {
          const full6D = numParts[0].trim();
          const top3 = numParts[1].trim();
          const top2 = numParts[2].trim();
          const bottom2 = numParts[3].trim();

          const dayOfWeek = DAY_EN_MAP[dayLine] || 'Mon';
          const dayNameThai = DAY_TH_MAP[dayLine] || 'จันทร์';

          const mmStr = String(monthNum).padStart(2, '0');
          const ddStr = String(day).padStart(2, '0');
          const dateIso = `${yearAD}-${mmStr}-${ddStr}`;
          const dateFormatted = `${ddStr} ${monthShort} ${yearBE}`;

          results.push({
            id: `gov_${yearAD}${mmStr}${ddStr}`,
            lotteryType: 'GOVERNMENT',
            session: 'GOV_BIWEEKLY',
            date: dateIso,
            dateFormatted,
            dayOfWeek,
            dayNameThai,
            full6D,
            top3,
            top2,
            bottom2
          });
          i += 4;
          continue;
        }
      }
    }
    i++;
  }

  const seen = new Set();
  const unique = [];
  for (const item of results) {
    if (!seen.has(item.date)) {
      seen.add(item.date);
      unique.push(item);
    }
  }

  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

const nikkeiDataPath = 'c:/apps/lotto/src/data/nikkeiData.ts';

const laos = parseStandardTxtFile('c:/apps/lotto/ลาวพัฒนา.txt', 'LAOS', 'LAOS_EVENING');
const dowjones = parseStandardTxtFile('c:/apps/lotto/ดาวโจนส์.txt', 'DOWJONES', 'DOWJONES_NIGHT');
const gsb = parseStandardTxtFile('c:/apps/lotto/ออมสิน.txt', 'GSB', 'GSB_BIWEEKLY');
const gov = parseGovTxtFile();
const hanoiSpecial = parseStandardTxtFile('c:/apps/lotto/พิเศษ.txt', 'HANOI', 'HANOI_SPECIAL');
const hanoiEvening = parseStandardTxtFile('c:/apps/lotto/ปกติ.txt', 'HANOI', 'HANOI_EVENING');
const hanoiVip = parseStandardTxtFile('c:/apps/lotto/vip.txt', 'HANOI', 'HANOI_VIP');

const nkm = parseStandardTxtFile('c:/apps/lotto/นิเคอิเช้า.txt', 'NIKKEI', 'NIKKEI_MORNING');
const nka = parseStandardTxtFile('c:/apps/lotto/นิเคอิบ่าย.txt', 'NIKKEI', 'NIKKEI_AFTERNOON');
const chm = parseStandardTxtFile('c:/apps/lotto/จีนเช้า.txt', 'NIKKEI', 'CHINA_MORNING');
const cha = parseStandardTxtFile('c:/apps/lotto/จีนบ่าย.txt', 'NIKKEI', 'CHINA_AFTERNOON');
const hsm = parseStandardTxtFile('c:/apps/lotto/ฮั่งเส็งเช้า.txt', 'NIKKEI', 'HANGSENG_MORNING');
const hsa = parseStandardTxtFile('c:/apps/lotto/ฮั่งเส็งบ่าย.txt', 'NIKKEI', 'HANGSENG_AFTERNOON');

const newTsContent = `import { DrawResult } from '../types';

export const INITIAL_NIKKEI_MORNING_DATA: DrawResult[] = ${JSON.stringify(nkm, null, 2)};

export const INITIAL_NIKKEI_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(nka, null, 2)};

export const INITIAL_CHINA_MORNING_DATA: DrawResult[] = ${JSON.stringify(chm, null, 2)};

export const INITIAL_CHINA_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(cha, null, 2)};

export const INITIAL_HANGSENG_MORNING_DATA: DrawResult[] = ${JSON.stringify(hsm, null, 2)};

export const INITIAL_HANGSENG_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(hsa, null, 2)};

export const ALL_NIKKEI_DATA: DrawResult[] = [
  ...INITIAL_NIKKEI_MORNING_DATA,
  ...INITIAL_NIKKEI_AFTERNOON_DATA
];

export const ALL_STOCKS_DATA: DrawResult[] = [
  ...INITIAL_NIKKEI_MORNING_DATA,
  ...INITIAL_NIKKEI_AFTERNOON_DATA,
  ...INITIAL_CHINA_MORNING_DATA,
  ...INITIAL_CHINA_AFTERNOON_DATA,
  ...INITIAL_HANGSENG_MORNING_DATA,
  ...INITIAL_HANGSENG_AFTERNOON_DATA
];

export const INITIAL_LAOS_DATA: DrawResult[] = ${JSON.stringify(laos, null, 2)};

export const INITIAL_DOWJONES_DATA: DrawResult[] = ${JSON.stringify(dowjones, null, 2)};

export const INITIAL_HANOI_SPECIAL_DATA: DrawResult[] = ${JSON.stringify(hanoiSpecial, null, 2)};

export const INITIAL_HANOI_DATA: DrawResult[] = ${JSON.stringify(hanoiEvening, null, 2)};

export const INITIAL_HANOI_VIP_DATA: DrawResult[] = ${JSON.stringify(hanoiVip, null, 2)};

export const ALL_HANOI_DATA: DrawResult[] = [
  ...INITIAL_HANOI_SPECIAL_DATA,
  ...INITIAL_HANOI_DATA,
  ...INITIAL_HANOI_VIP_DATA
];

export const INITIAL_GSB_DATA: DrawResult[] = ${JSON.stringify(gsb, null, 2)};

export const INITIAL_GOVERNMENT_DATA: DrawResult[] = ${JSON.stringify(gov, null, 2)};
`;

fs.writeFileSync(nikkeiDataPath, newTsContent, 'utf8');
console.log(`Successfully updated src/data/nikkeiData.ts! Government count: ${gov.length}`);
