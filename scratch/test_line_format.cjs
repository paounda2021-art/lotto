const fs = require('fs');
const path = require('path');

const nikkeiM = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_nikkei_morning.json', 'utf8'));

// Take valid numeric draw
const validDraw = nikkeiM.find(d => /^\d+$/.test(d.top3 || ''));
console.log('Valid draw:', validDraw);

// Compute digits
const past = nikkeiM.filter(d => d.date !== validDraw.date && d.dayOfWeek === validDraw.dayOfWeek && /^\d+$/.test(d.top3 || ''));
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

console.log('Primary (เด่น):', primary, 'Secondary (รอง):', secondary);
console.log('Top2:', validDraw.top2, 'Bottom2:', validDraw.bottom2);

let lines = [];
lines.push(`นิเคอิ-ปก (เช้า)`);
lines.push(`ผล ${validDraw.top3}-${validDraw.bottom2}`);
lines.push('');

if (String(validDraw.bottom2).includes(String(primary))) {
  lines.push(`🌼 นิเคอิ ปก-เช้า เด่น ${primary} [ล่าง ${validDraw.bottom2.split('').join(' ')}]`);
}
if (String(validDraw.top2).includes(String(primary))) {
  lines.push(`🌼 นิเคอิ ปก-เช้า เด่น ${primary} [บน ${validDraw.top2.split('').join(' ')}]`);
}
if (String(validDraw.bottom2).includes(String(secondary))) {
  lines.push(`🌼 นิเคอิ ปก-เช้า รอง ${secondary} [ล่าง ${validDraw.bottom2.split('').join(' ')}]`);
}
if (String(validDraw.top2).includes(String(secondary))) {
  lines.push(`🌼 นิเคอิ ปก-เช้า รอง ${secondary} [บน ${validDraw.top2.split('').join(' ')}]`);
}

lines.push(`🏷️ รวมหุ้น [บน ${validDraw.top2.split('').join(' ')}]`);
lines.push('');
lines.push('🎉🎉🎉🎉');

console.log('Generated message:\n' + lines.join('\n'));
