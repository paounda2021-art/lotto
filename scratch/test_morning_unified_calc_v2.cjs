const fs = require('fs');
const path = require('path');

const morningFiles = {
  'NIKKEI_MORNING': 'นิเคอิเช้า.txt',
  'CHINA_MORNING': 'จีนเช้า.txt',
  'HANGSENG_MORNING': 'ฮั่งเส็งเช้า.txt',
  'NIKKEI_VIP_MORNING': 'นิคเคอิ VIP เช้า.txt',
  'CHINA_VIP_MORNING': 'จีน VIP เช้า.txt',
  'HANGSENG_VIP_MORNING': 'ฮั่งเส็ง VIP เช้า.txt'
};

const morningDraws = [];

Object.entries(morningFiles).forEach(([sess, file]) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (file.includes('VIP')) {
      // 3-line format: Title|Date, Top3, Bottom2
      for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 < lines.length) {
          const header = lines[i];
          const top3 = lines[i + 1];
          const bottom2 = lines[i + 2];
          const date = header.includes('|') ? header.split('|')[1].trim() : header;
          if (/^\d{3}$/.test(top3) && /^\d{2}$/.test(bottom2)) {
            morningDraws.push({
              session: sess,
              date,
              top3,
              top2: top3.slice(-2),
              bottom2
            });
          }
        }
      }
    } else {
      // 1-line format: Date Top3 Bottom2
      lines.forEach(l => {
        const parts = l.split(/\s+/);
        if (parts.length >= 3 && /^\d{3}$/.test(parts[1]) && /^\d{2}$/.test(parts[2])) {
          morningDraws.push({
            session: sess,
            date: parts[0],
            top3: parts[1],
            top2: parts[1].slice(-2),
            bottom2: parts[2]
          });
        }
      });
    }
  }
});

console.log(`Total Morning Draws loaded across 6 Morning Stock Markets: ${morningDraws.length}`);

// Single Digit Stats
const digitCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
const normalMorningCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
const vipMorningCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };

// 2D Pair Stats (direct & mirror counted together to find true top 6 pairs)
const pairHitCounts = {};
const directPairCounts = {};

// 3D Triple Stats
const tripleHitCounts = {};

morningDraws.forEach(d => {
  const isVip = d.session.includes('VIP');
  const allDigits = `${d.top3}${d.bottom2}`;

  // Digits
  for (let ch of allDigits) {
    const num = parseInt(ch, 10);
    if (!isNaN(num)) {
      digitCounts[num]++;
      if (isVip) vipMorningCounts[num]++;
      else normalMorningCounts[num]++;
    }
  }

  // Pairs
  [d.top2, d.bottom2].forEach(p => {
    if (p && p.length === 2) {
      directPairCounts[p] = (directPairCounts[p] || 0) + 1;
      
      // Normalized pair key e.g. "06" for "06" and "60"
      const normKey = p.split('').sort().join('');
      pairHitCounts[normKey] = (pairHitCounts[normKey] || 0) + 1;
    }
  });

  // Triples
  if (d.top3 && d.top3.length === 3) {
    tripleHitCounts[d.top3] = (tripleHitCounts[d.top3] || 0) + 1;
  }
});

const sortedDigits = Object.entries(digitCounts)
  .map(([d, count]) => ({
    digit: parseInt(d, 10),
    totalCount: count,
    normalCount: normalMorningCounts[d],
    vipCount: vipMorningCounts[d],
    percent: Math.round((count / (morningDraws.length * 5)) * 1000) / 10
  }))
  .sort((a, b) => b.totalCount - a.totalCount);

console.log('\n========================================');
console.log('🥇 ☀️ UNIFIED MORNING SINGLE DIGITS (เด่น-รอง)');
console.log('========================================');
sortedDigits.slice(0, 5).forEach((item, idx) => {
  const label = idx === 0 ? 'เด่นหลัก' : idx === 1 ? 'เด่นรอง' : `ตัวเสริม #${idx - 1}`;
  console.log(`${label}: เลข ${item.digit} | เข้าออกรวม ${item.totalCount} ครั้ง (${item.percent}%) [หุ้นปกติเช้า: ${item.normalCount} ครั้ง, หุ้น VIP เช้า: ${item.vipCount} ครั้ง]`);
});

const sortedPairs = Object.entries(directPairCounts)
  .map(([pair, count]) => ({
    pair,
    directCount: count,
    normCount: pairHitCounts[pair.split('').sort().join('')] || count
  }))
  .sort((a, b) => b.normCount - a.normCount || b.directCount - a.directCount)
  .slice(0, 6);

console.log('\n========================================');
console.log('⚡ ☀️ UNIFIED MORNING TOP 6 2D PAIRS (ชุด 2 ตัวเจาะเน้นเล่นได้ทั้งปกติ + VIP เช้า)');
console.log('========================================');
sortedPairs.forEach((item, idx) => {
  console.log(`TOP #${idx + 1}: คู่ ${item.pair} | เข้าออกรวม ${item.normCount} ครั้ง (ตรง: ${item.directCount} ครั้ง)`);
});

const sortedTriples = Object.entries(tripleHitCounts)
  .map(([triple, count]) => ({
    triple,
    count,
    percent: Math.round((count / morningDraws.length) * 1000) / 10
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 4);

console.log('\n========================================');
console.log('🎯 ☀️ UNIFIED MORNING TOP 4 3D TRIPLES (ชุด 3 ตัวตรง 4 ชุด เปอร์เซ็นต์ออกสูง)');
console.log('========================================');
sortedTriples.forEach((item, idx) => {
  console.log(`3D #${idx + 1}: ${item.triple} | ออกรางวัลตรง ${item.count} ครั้ง (${item.percent}% ของทุกงวดเช้า)`);
});
