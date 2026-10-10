const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'มาเลย์.txt'), 'utf8');
const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const thaiMonths = {
  'ม.ค.': { m: '01', name: 'มกราคม' },
  'ก.พ.': { m: '02', name: 'กุมภาพันธ์' },
  'มี.ค.': { m: '03', name: 'มีนาคม' },
  'เม.ย.': { m: '04', name: 'เมษายน' },
  'พ.ค.': { m: '05', name: 'พฤษภาคม' },
  'มิ.ย.': { m: '06', name: 'มิถุนายน' },
  'ก.ค.': { m: '07', name: 'กรกฎาคม' },
  'ส.ค.': { m: '08', name: 'สิงหาคม' },
  'ก.ย.': { m: '09', name: 'กันยายน' },
  'ต.ค.': { m: '10', name: 'ตุลาคม' },
  'พ.ย.': { m: '11', name: 'พฤศจิกายน' },
  'ธ.ค.': { m: '12', name: 'ธันวาคม' }
};

const dayOfWeekMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNameThaiMap = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const results = [];
for (let i = 0; i < lines.length; i += 3) {
  const header = lines[i];
  const top3 = lines[i+1];
  const bottom2 = lines[i+2];

  if (!header || !top3 || !bottom2) continue;

  const dateParts = header.replace('มาเลย์ |', '').trim().split(/\s+/);
  const day = parseInt(dateParts[0], 10);
  const monthStr = dateParts[1];
  const yearShort = parseInt(dateParts[2], 10);

  const monthObj = thaiMonths[monthStr];
  const beYear = 2500 + yearShort; // 2569
  const fullYear = beYear - 543; // 2026
  const monthNum = monthObj ? monthObj.m : '01';

  const isoDate = `${fullYear}-${monthNum}-${String(day).padStart(2, '0')}`;
  const dt = new Date(`${isoDate}T00:00:00Z`);
  const dayIdx = dt.getUTCDay();

  const top2 = top3.slice(-2);

  results.push({
    id: `MALAY_MALAY_EVENING_${isoDate}`,
    lotteryType: 'MALAY',
    session: 'MALAY_EVENING',
    date: isoDate,
    dateFormatted: `${String(day).padStart(2, '0')} ${monthStr} ${beYear}`,
    dayOfWeek: dayOfWeekMap[dayIdx],
    dayNameThai: dayNameThaiMap[dayIdx],
    top3: top3,
    top2: top2,
    bottom2: bottom2
  });
}

console.log('Parsed count:', results.length);
console.log('First 3 items:', JSON.stringify(results.slice(0, 3), null, 2));
console.log('Last 2 items:', JSON.stringify(results.slice(-2), null, 2));

fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'malay_data.json'), JSON.stringify(results, null, 2));
