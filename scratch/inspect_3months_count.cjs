const path = require('path');
const fs = require('fs');

// Count records in text files or TS data files
const stockFiles = [
  'นิเคอิเช้า.txt', 'นิเคอิบ่าย.txt',
  'จีนเช้า.txt', 'จีนบ่าย.txt',
  'ฮั่งเส็งเช้า.txt', 'ฮั่งเส็งบ่าย.txt',
  'นิคเคอิ VIP เช้า.txt', 'นิคเคอิ VIP บ่าย.txt',
  'จีน VIP เช้า.txt', 'จีน VIP บ่าย.txt',
  'ฮั่งเส็ง VIP เช้า.txt', 'ฮั่งเส็ง VIP บ่าย.txt'
];

let total3MonthsCount = 0;

stockFiles.forEach(f => {
  const filePath = path.join(__dirname, '..', f);
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(l => l.trim().length > 0);
    console.log(`${f}: ${lines.length} draws`);
    total3MonthsCount += lines.length;
  }
});

console.log(`\nTOTAL 12 Stock Sessions (3 Months Historical Draws): ${total3MonthsCount} draws`);
