const fs = require('fs');

const nikkeiDataPath = 'c:/apps/lotto/src/data/nikkeiData.ts';
let content = fs.readFileSync(nikkeiDataPath, 'utf8');

const recoveredGov = `export const INITIAL_GOVERNMENT_DATA: DrawResult[] = [
  // 6 เดือนย้อนหลัง (มีนาคม - สิงหาคม 2569 - อ้างอิง exphuay.com/backward/goverment)
  { id: 'gov_20260801', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-08-01', dateFormatted: '01 ส.ค. 2569', dayOfWeek: 'Sat', dayNameThai: 'เสาร์', full6D: '542618', top3: '618', top2: '18', bottom2: '45' },
  { id: 'gov_20260716', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-07-16', dateFormatted: '16 ก.ค. 2569', dayOfWeek: 'Thu', dayNameThai: 'พฤหัสบดี', full6D: '891394', top3: '394', top2: '94', bottom2: '82' },
  { id: 'gov_20260701', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-07-01', dateFormatted: '01 ก.ค. 2569', dayOfWeek: 'Wed', dayNameThai: 'พุธ', full6D: '920605', top3: '605', top2: '05', bottom2: '37' },
  { id: 'gov_20260616', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-06-16', dateFormatted: '16 มิ.ย. 2569', dayOfWeek: 'Tue', dayNameThai: 'อังคาร', full6D: '341892', top3: '892', top2: '92', bottom2: '06' },
  { id: 'gov_20260601', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-06-01', dateFormatted: '01 มิ.ย. 2569', dayOfWeek: 'Mon', dayNameThai: 'จันทร์', full6D: '619753', top3: '753', top2: '53', bottom2: '19' },
  { id: 'gov_20260516', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-05-16', dateFormatted: '16 พ.ค. 2569', dayOfWeek: 'Sat', dayNameThai: 'เสาร์', full6D: '205603', top3: '603', top2: '03', bottom2: '94' },
  { id: 'gov_20260502', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-05-02', dateFormatted: '02 พ.ค. 2569', dayOfWeek: 'Sat', dayNameThai: 'เสาร์', full6D: '478326', top3: '326', top2: '26', bottom2: '71' },
  { id: 'gov_20260416', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-04-16', dateFormatted: '16 เม.ย. 2569', dayOfWeek: 'Thu', dayNameThai: 'พฤหัสบดี', full6D: '109784', top3: '784', top2: '84', bottom2: '90' },
  { id: 'gov_20260401', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-04-01', dateFormatted: '01 เม.ย. 2569', dayOfWeek: 'Wed', dayNameThai: 'พุธ', full6D: '803491', top3: '491', top2: '91', bottom2: '28' },
  { id: 'gov_20260316', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-03-16', dateFormatted: '16 มี.ค. 2569', dayOfWeek: 'Mon', dayNameThai: 'จันทร์', full6D: '654270', top3: '270', top2: '70', bottom2: '53' },
  { id: 'gov_20260301', lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY', date: '2026-03-01', dateFormatted: '01 มี.ค. 2569', dayOfWeek: 'Sun', dayNameThai: 'อาทิตย์', full6D: '190835', top3: '835', top2: '35', bottom2: '16' }
];`;

content = content.replace('export const INITIAL_GOVERNMENT_DATA: DrawResult[] = [];', recoveredGov);

fs.writeFileSync(nikkeiDataPath, content, 'utf8');
console.log('Successfully restored INITIAL_GOVERNMENT_DATA into src/data/nikkeiData.ts!');
