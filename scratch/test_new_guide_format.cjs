const fs = require('fs');

const data = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hangseng_vip_afternoon.json', 'utf8'));

// Suppose target day is 'Tue'
const targetDay = 'Tue';
const onDay = data.filter(d => (d.dayOfWeek === targetDay || targetDay === 'ALL') && /^[0-9]{2,3}$/.test(d.top3 || ''));

const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
const pairCounts = {};

onDay.forEach(d => {
  (String(d.top3 || '') + String(d.bottom2 || '')).split('').forEach(ch => {
    const n = parseInt(ch, 10);
    if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
  });
  if (d.top2 && /^[0-9]{2}$/.test(d.top2)) pairCounts[d.top2] = (pairCounts[d.top2] || 0) + 1;
  if (d.bottom2 && /^[0-9]{2}$/.test(d.bottom2)) pairCounts[d.bottom2] = (pairCounts[d.bottom2] || 0) + 1;
});

const sortedDigits = Object.entries(digitCounts).map(([d, c]) => ({ digit: parseInt(d, 10), c })).sort((a,b) => b.c - a.c);
const d0 = sortedDigits[0] ? sortedDigits[0].digit : 9;
const d1 = sortedDigits[1] ? sortedDigits[1].digit : 0;

const topPairs = Object.entries(pairCounts)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 6)
  .map(p => p[0]);

while (topPairs.length < 6) {
  const p = `${d0}${topPairs.length}`;
  if (!topPairs.includes(p)) topPairs.push(p);
}

const pairsStr = ' ' + topPairs.slice(0, 6).join(' ');

const dayName = 'อังคาร';
const lottoName = 'หุ้นฮั่งเส็ง VIP';
const sessTitle = 'ฮั่งเส็ง-VIP (บ่าย)';

const msg = [
  '📊 [แนวทางสถิติเลขรายวัน] SystemLucky289',
  `🎯 หวย: ${lottoName}`,
  `📌 รอบ: ${sessTitle}`,
  `🗓️ ประจำ: วัน${dayName}`,
  '--------------------------',
  '🔥 ฟันเด่น วิ่ง-รูด 19 ประตู: ',
  `⭐ เด่นหลัก: ${d0}`,
  `✨ เด่นรอง: ${d1}`,
  '',
  `💎 ชุดเจาะ 2 ตัว (เน้นประจำวัน${dayName}):`,
  pairsStr,
  '--------------------------',
  '🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289'
].join('\n');

console.log(msg);
