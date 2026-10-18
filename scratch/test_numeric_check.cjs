const fs = require('fs');

const nikkeiMorning = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_nikkei_morning.json', 'utf8'));

function isNumericResult(draw) {
  if (!draw) return false;
  const top3 = (draw.top3 || '').trim();
  const bottom2 = (draw.bottom2 || '').trim();
  return /^\d{2,3}$/.test(top3) && /^\d{2}$/.test(bottom2);
}

const draw0 = nikkeiMorning[0];
console.log('Draw 0 is numeric:', isNumericResult(draw0), draw0.top3, draw0.bottom2);

const validDraw = nikkeiMorning.find(isNumericResult);
console.log('Valid draw is numeric:', isNumericResult(validDraw), validDraw.top3, validDraw.bottom2);

// Compute digits for validDraw
const past = nikkeiMorning.filter(d => d.date !== validDraw.date && isNumericResult(d));
const counts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
past.forEach(d => {
  `${d.top3}${d.bottom2}`.split('').forEach(ch => {
    const num = parseInt(ch, 10);
    if (!isNaN(num)) counts[num] = (counts[num] || 0) + 1;
  });
});
const sorted = Object.entries(counts).map(([d, c]) => ({ digit: parseInt(d), c })).sort((a,b) => b.c - a.c);
const primary = sorted[0].digit;
const secondary = sorted[1].digit;

console.log('Primary:', primary, 'Secondary:', secondary);

// Format result
const resLines = [];
resLines.push('นิเคอิ-ปก (เช้า)');
if (validDraw.dateFormatted) {
  resLines.push(`(งวด ${validDraw.dateFormatted})`);
}
resLines.push(`ผล ${validDraw.top3}-${validDraw.bottom2}`);
resLines.push('');
if (validDraw.bottom2.includes(String(primary))) {
  resLines.push(`🌼 นิเคอิ ปก-เช้า เด่น ${primary} [ล่าง ${validDraw.bottom2.split('').join(' ')}]`);
}
if (validDraw.top2.includes(String(primary))) {
  resLines.push(`🌼 นิเคอิ ปก-เช้า เด่น ${primary} [บน ${validDraw.top2.split('').join(' ')}]`);
}
if (validDraw.bottom2.includes(String(secondary))) {
  resLines.push(`🌼 นิเคอิ ปก-เช้า รอง ${secondary} [ล่าง ${validDraw.bottom2.split('').join(' ')}]`);
}
if (validDraw.top2.includes(String(secondary))) {
  resLines.push(`🌼 นิเคอิ ปก-เช้า รอง ${secondary} [บน ${validDraw.top2.split('').join(' ')}]`);
}
resLines.push(`🏷️ รวมหุ้น [บน ${validDraw.top2.split('').join(' ')}]`);
resLines.push('');
resLines.push('🎉🎉🎉🎉');

console.log('--- Result Message ---');
console.log(resLines.join('\n'));
