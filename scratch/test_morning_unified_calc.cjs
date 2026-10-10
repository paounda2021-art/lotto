const fs = require('fs');
const path = require('path');

// Read all 6 morning text files
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
    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    lines.forEach(l => {
      const parts = l.trim().split(/\s+/);
      if (parts.length >= 3) {
        morningDraws.push({
          session: sess,
          date: parts[0],
          top3: parts[1],
          top2: parts[1].length >= 2 ? parts[1].slice(-2) : parts[1],
          bottom2: parts[2]
        });
      }
    });
  }
});

console.log(`Total Morning Draws loaded across 6 Morning Stock Markets: ${morningDraws.length}`);

// Calculate single digit statistics
const digitCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
const normalMorningCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
const vipMorningCounts = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };

const pairCounts = {};
const normalPairCounts = {};
const vipPairCounts = {};

const tripleCounts = {};

morningDraws.forEach(d => {
  const isVip = d.session.includes('VIP');
  const digits = `${d.top3}${d.bottom2}`;
  
  for (let ch of digits) {
    const num = parseInt(ch, 10);
    if (!isNaN(num)) {
      digitCounts[num]++;
      if (isVip) vipMorningCounts[num]++;
      else normalMorningCounts[num]++;
    }
  }

  // Count 2D pairs (normalized order or direct)
  [d.top2, d.bottom2].forEach(p => {
    if (p && p.length === 2) {
      pairCounts[p] = (pairCounts[p] || 0) + 1;
      const rev = p.split('').reverse().join('');
      if (rev !== p) {
        // also account for reverse pair hit frequency
        pairCounts[rev] = (pairCounts[rev] || 0) + 0.8;
      }
      if (isVip) vipPairCounts[p] = (vipPairCounts[p] || 0) + 1;
      else normalPairCounts[p] = (normalPairCounts[p] || 0) + 1;
    }
  });

  // Count 3D triples
  if (d.top3 && d.top3.length === 3) {
    tripleCounts[d.top3] = (tripleCounts[d.top3] || 0) + 1;
  }
});

const sortedDigits = Object.entries(digitCounts)
  .map(([d, count]) => ({
    digit: parseInt(d, 10),
    totalCount: count,
    normalCount: normalMorningCounts[d],
    vipCount: vipMorningCounts[d]
  }))
  .sort((a, b) => b.totalCount - a.totalCount);

console.log('\n--- TOP SINGLE DIGITS FOR MORNING SESSIONS ---');
sortedDigits.slice(0, 5).forEach((item, idx) => {
  console.log(`#${idx + 1}: Digit ${item.digit} | Total Hits: ${item.totalCount} (Normal Morning: ${item.normalCount}, VIP Morning: ${item.vipCount})`);
});

const sortedPairs = Object.entries(pairCounts)
  .map(([pair, count]) => ({
    pair,
    totalCount: Math.round(count),
    normalCount: normalPairCounts[pair] || 0,
    vipCount: vipPairCounts[pair] || 0
  }))
  .sort((a, b) => b.totalCount - a.totalCount)
  .slice(0, 6);

console.log('\n--- TOP 6 2D PAIRS FOR MORNING SESSIONS ---');
sortedPairs.forEach((item, idx) => {
  console.log(`#${idx + 1}: Pair ${item.pair} | Total Hits: ${item.totalCount} (Normal Morning: ${item.normalCount}, VIP Morning: ${item.vipCount})`);
});

const sortedTriples = Object.entries(tripleCounts)
  .map(([triple, count]) => ({
    triple,
    count,
    percent: Math.round((count / morningDraws.length) * 1000) / 10
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 4);

console.log('\n--- TOP 4 3D DIRECT TRIPLES FOR MORNING SESSIONS ---');
sortedTriples.forEach((item, idx) => {
  console.log(`#${idx + 1}: Triple ${item.triple} | Hits: ${item.count} times (${item.percent}%)`);
});
