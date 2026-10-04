const fs = require('fs');
const path = require('path');

const THAI_MONTHS = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
  'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
};

const DAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

function parseTxtFile(filePath, lotteryType, session) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
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

  // Deduplicate by date
  const seen = new Set();
  const unique = [];
  for (const item of results) {
    if (!seen.has(item.date)) {
      seen.add(item.date);
      unique.push(item);
    }
  }

  // Sort descending by date
  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

// Read current nikkeiData.ts to preserve INITIAL_GOVERNMENT_DATA or existing fallbacks if needed
const nikkeiDataPath = 'c:/apps/lotto/src/data/nikkeiData.ts';
const origContent = fs.readFileSync(nikkeiDataPath, 'utf8');

// Parse updated datasets
const laos = parseTxtFile('c:/apps/lotto/ลาวพัฒนา.txt', 'LAOS', 'LAOS_EVENING');
const dowjones = parseTxtFile('c:/apps/lotto/ดาวโจนส์.txt', 'DOWJONES', 'DOWJONES_NIGHT');
const gsb = parseTxtFile('c:/apps/lotto/ออมสิน.txt', 'GSB', 'GSB_BIWEEKLY');
const hanoiSpecial = parseTxtFile('c:/apps/lotto/พิเศษ.txt', 'HANOI', 'HANOI_SPECIAL');
const hanoiEvening = parseTxtFile('c:/apps/lotto/ปกติ.txt', 'HANOI', 'HANOI_EVENING');
const hanoiVip = parseTxtFile('c:/apps/lotto/vip.txt', 'HANOI', 'HANOI_VIP');

const nkm = parseTxtFile('c:/apps/lotto/นิเคอิเช้า.txt', 'NIKKEI', 'NIKKEI_MORNING');
const nka = parseTxtFile('c:/apps/lotto/นิเคอิบ่าย.txt', 'NIKKEI', 'NIKKEI_AFTERNOON');
const chm = parseTxtFile('c:/apps/lotto/จีนเช้า.txt', 'NIKKEI', 'CHINA_MORNING');
const cha = parseTxtFile('c:/apps/lotto/จีนบ่าย.txt', 'NIKKEI', 'CHINA_AFTERNOON');
const hsm = parseTxtFile('c:/apps/lotto/ฮั่งเส็งเช้า.txt', 'NIKKEI', 'HANGSENG_MORNING');
const hsa = parseTxtFile('c:/apps/lotto/ฮั่งเส็งบ่าย.txt', 'NIKKEI', 'HANGSENG_AFTERNOON');

// Extract INITIAL_GOVERNMENT_DATA from original content
let govStr = 'export const INITIAL_GOVERNMENT_DATA: DrawResult[] = [];';
const govMatch = origContent.match(/export const INITIAL_GOVERNMENT_DATA: DrawResult\[\] = \[[\s\S]*?\];/);
if (govMatch) {
  govStr = govMatch[0];
}

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

export const INITIAL_HANOI_SPECIAL_DATA: DrawResult[] = ${JSON.stringify(hanoiSpecial.length > 0 ? hanoiSpecial : [], null, 2)};

export const INITIAL_HANOI_DATA: DrawResult[] = ${JSON.stringify(hanoiEvening.length > 0 ? hanoiEvening : [], null, 2)};

export const INITIAL_HANOI_VIP_DATA: DrawResult[] = ${JSON.stringify(hanoiVip.length > 0 ? hanoiVip : [], null, 2)};

export const ALL_HANOI_DATA: DrawResult[] = [
  ...INITIAL_HANOI_SPECIAL_DATA,
  ...INITIAL_HANOI_DATA,
  ...INITIAL_HANOI_VIP_DATA
];

export const INITIAL_GSB_DATA: DrawResult[] = ${JSON.stringify(gsb, null, 2)};

${govStr}
`;

fs.writeFileSync(nikkeiDataPath, newTsContent, 'utf8');
console.log('Successfully updated src/data/nikkeiData.ts with user provided historical files!');
