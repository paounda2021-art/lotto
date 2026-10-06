const fs = require('fs');
const path = require('path');

const THAI_MONTHS = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
  'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
};

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

function parseGovTxtFile() {
  const rootDir = 'c:/apps/lotto';
  const files = fs.readdirSync(rootDir).filter(f => f.includes('รัฐบาลไทย') && f.endsWith('.txt'));
  if (files.length === 0) {
    console.log('Gov txt file not found');
    return [];
  }

  const filePath = path.join(rootDir, files[0]);
  console.log('Parsing file:', filePath);
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

  // Deduplicate and sort descending by date
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

const govData = parseGovTxtFile();
console.log('Parsed Government records count:', govData.length);
console.log('Latest 3 records:', govData.slice(0, 3));
