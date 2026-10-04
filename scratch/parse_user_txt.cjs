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
    console.log(`File not found: ${filePath}`);
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
      const dateStr = parts[1].trim(); // e.g. "2 ต.ค. 69"
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
  return results;
}

const laos = parseTxtFile('c:/apps/lotto/ลาวพัฒนา.txt', 'LAOS', 'LAOS_EVENING');
const dow = parseTxtFile('c:/apps/lotto/ดาวโจนส์.txt', 'DOWJONES', 'DOWJONES_NIGHT');
const gsb = parseTxtFile('c:/apps/lotto/ออมสิน.txt', 'GSB', 'GSB_BIWEEKLY');
const special = parseTxtFile('c:/apps/lotto/พิเศษ.txt', 'HANOI', 'HANOI_SPECIAL');
const evening = parseTxtFile('c:/apps/lotto/ปกติ.txt', 'HANOI', 'HANOI_EVENING');
const vip = parseTxtFile('c:/apps/lotto/vip.txt', 'HANOI', 'HANOI_VIP');

console.log('Parsed Laos count:', laos.length, 'Latest:', laos[0]);
console.log('Parsed Dowjones count:', dow.length, 'Latest:', dow[0]);
console.log('Parsed GSB count:', gsb.length, 'Latest:', gsb[0]);
console.log('Parsed Special Hanoi count:', special.length, 'Latest:', special[0]);
console.log('Parsed Evening Hanoi count:', evening.length, 'Latest:', evening[0]);
console.log('Parsed VIP Hanoi count:', vip.length, 'Latest:', vip[0]);
