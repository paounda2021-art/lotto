const fs = require('fs');

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
  return results;
}

const files = [
  { name: 'ลาวพัฒนา.txt', lotteryType: 'LAOS', session: 'LAOS_EVENING' },
  { name: 'ดาวโจนส์.txt', lotteryType: 'DOWJONES', session: 'DOWJONES_NIGHT' },
  { name: 'ออมสิน.txt', lotteryType: 'GSB', session: 'GSB_BIWEEKLY' },
  { name: 'พิเศษ.txt', lotteryType: 'HANOI', session: 'HANOI_SPECIAL' },
  { name: 'ปกติ.txt', lotteryType: 'HANOI', session: 'HANOI_EVENING' },
  { name: 'vip.txt', lotteryType: 'HANOI', session: 'HANOI_VIP' },
  { name: 'นิเคอิเช้า.txt', lotteryType: 'NIKKEI', session: 'NIKKEI_MORNING' },
  { name: 'นิเคอิบ่าย.txt', lotteryType: 'NIKKEI', session: 'NIKKEI_AFTERNOON' },
  { name: 'จีนเช้า.txt', lotteryType: 'NIKKEI', session: 'CHINA_MORNING' },
  { name: 'จีนบ่าย.txt', lotteryType: 'NIKKEI', session: 'CHINA_AFTERNOON' },
  { name: 'ฮั่งเส็งเช้า.txt', lotteryType: 'NIKKEI', session: 'HANGSENG_MORNING' },
  { name: 'ฮั่งเส็งบ่าย.txt', lotteryType: 'NIKKEI', session: 'HANGSENG_AFTERNOON' }
];

for (const f of files) {
  const data = parseTxtFile(`c:/apps/lotto/${f.name}`, f.lotteryType, f.session);
  console.log(`${f.name} => ${data.length} records. Latest date: ${data[0]?.dateFormatted} (${data[0]?.top3}/${data[0]?.bottom2})`);
}
