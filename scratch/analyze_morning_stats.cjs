const fs = require('fs');
const path = require('path');

const normalMorningFiles = {
  'นิเคอิเช้า': 'นิเคอิเช้า.txt',
  'จีนเช้า': 'จีนเช้า.txt',
  'ฮั่งเส็งเช้า': 'ฮั่งเส็งเช้า.txt'
};

const vipMorningFiles = {
  'นิคเคอิ VIP เช้า': 'นิคเคอิ VIP เช้า.txt',
  'จีน VIP เช้า': 'จีน VIP เช้า.txt',
  'ฮั่งเส็ง VIP เช้า': 'ฮั่งเส็ง VIP เช้า.txt'
};

function loadDraws(files, isVip) {
  const draws = [];
  Object.entries(files).forEach(([name, file]) => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Check if 3-line format
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const top3 = lines[i + 1];
        const bottom2 = lines[i + 2];
        if (/^\d{3}$/.test(top3) && /^\d{2}$/.test(bottom2)) {
          draws.push({ market: name, top3, top2: top3.slice(-2), bottom2, type: isVip ? 'VIP' : 'Normal' });
        }
      }
    }
  });
  return draws;
}

const normalDraws = loadDraws(normalMorningFiles, false);
const vipDraws = loadDraws(vipMorningFiles, true);
const allMorningDraws = [...normalDraws, ...vipDraws];

console.log('Normal Morning Draws:', normalDraws.length);
console.log('VIP Morning Draws:', vipDraws.length);
console.log('Total Morning Draws:', allMorningDraws.length);

// Single digit frequency stats
const digitStats = Array.from({length: 10}, (_, i) => ({ digit: i, total: 0, normal: 0, vip: 0 }));
allMorningDraws.forEach(d => {
  const digits = (d.top3 + d.bottom2).split('');
  digits.forEach(ch => {
    const num = parseInt(ch, 10);
    digitStats[num].total++;
    if (d.type === 'VIP') digitStats[num].vip++;
    else digitStats[num].normal++;
  });
});

const sortedDigits = [...digitStats].sort((a, b) => b.total - a.total);
console.log('\n========================================');
console.log('🥇 ☀️ UNIFIED MORNING SINGLE DIGITS (เด่น-รอง)');
console.log('========================================');
sortedDigits.forEach((ds, i) => {
  const totalOcc = allMorningDraws.length * 5;
  const pct = ((ds.total / totalOcc) * 100).toFixed(1);
  const normPct = normalDraws.length > 0 ? ((ds.normal / (normalDraws.length * 5)) * 100).toFixed(1) : 0;
  const vipPct = vipDraws.length > 0 ? ((ds.vip / (vipDraws.length * 5)) * 100).toFixed(1) : 0;
  console.log(`Rank ${i+1}: Digit ${ds.digit} -> Total Hits: ${ds.total}/${totalOcc} (${pct}%) [Normal Morning: ${ds.normal} (${normPct}%), VIP Morning: ${ds.vip} (${vipPct}%)]`);
});

// Pair Hit Counts (Draw level hits for each canonical pair 00..99)
const pairDrawHits = {};
allMorningDraws.forEach(d => {
  const pairsInDraw = new Set([d.top2, d.bottom2]);
  const checked = new Set();
  pairsInDraw.forEach(p => {
    const sortedKey = p.split('').sort().join('');
    if (!pairDrawHits[sortedKey]) {
      pairDrawHits[sortedKey] = { canonical: sortedKey, direct: p, totalHits: 0, normalHits: 0, vipHits: 0 };
    }
    if (!checked.has(sortedKey)) {
      checked.add(sortedKey);
      pairDrawHits[sortedKey].totalHits++;
      if (d.type === 'VIP') pairDrawHits[sortedKey].vipHits++;
      else pairDrawHits[sortedKey].normalHits++;
    }
  });
});

const sortedPairsByHits = Object.values(pairDrawHits).sort((a, b) => b.totalHits - a.totalHits);
console.log('\n========================================');
console.log('⚡ ☀️ UNIFIED MORNING TOP 6 2D PAIRS (คู่เด่นที่เข้ารอบเช้ามากที่สุด)');
console.log('========================================');
sortedPairsByHits.slice(0, 10).forEach((p, i) => {
  const normPct = ((p.normalHits / normalDraws.length) * 100).toFixed(1);
  const vipPct = ((p.vipHits / vipDraws.length) * 100).toFixed(1);
  const totalPct = ((p.totalHits / allMorningDraws.length) * 100).toFixed(1);
  const rev = p.direct.split('').reverse().join('');
  console.log(`Rank ${i+1}: ${p.direct}/${rev} (Key ${p.canonical}) -> Total Hits: ${p.totalHits} (${totalPct}%) [Normal Morning: ${p.normalHits} (${normPct}%), VIP Morning: ${p.vipHits} (${vipPct}%)]`);
});

// 3D Triples
const tripleMap = {};
allMorningDraws.forEach(d => {
  const t = d.top3;
  if (!tripleMap[t]) tripleMap[t] = { triple: t, totalHits: 0, normalHits: 0, vipHits: 0 };
  tripleMap[t].totalHits++;
  if (d.type === 'VIP') tripleMap[t].vipHits++;
  else tripleMap[t].normalHits++;
});
const sortedTriples = Object.values(tripleMap).sort((a, b) => b.totalHits - a.totalHits);
console.log('\n========================================');
console.log('🎯 ☀️ UNIFIED MORNING TOP 4 3D TRIPLES (3 ตัวตรง 4 ชุด)');
console.log('========================================');
sortedTriples.slice(0, 10).forEach((t, i) => {
  const pct = ((t.totalHits / allMorningDraws.length) * 100).toFixed(2);
  const normPct = ((t.normalHits / normalDraws.length) * 100).toFixed(2);
  const vipPct = ((t.vipHits / vipDraws.length) * 100).toFixed(2);
  console.log(`Rank ${i+1}: ${t.triple} -> Total Direct Hits: ${t.totalHits} (${pct}%) [Normal Morning: ${t.normalHits} (${normPct}%), VIP Morning: ${t.vipHits} (${vipPct}%)]`);
});
