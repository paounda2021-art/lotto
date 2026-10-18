const special = { session: 'HANOI_SPECIAL', top3: '463', top2: '63', bottom2: '33' };
const normal = { session: 'HANOI_EVENING', top3: '635', top2: '35', bottom2: '82' };
const vip = { session: 'HANOI_VIP', top3: '768', top2: '68', bottom2: '18' };

const O = [special, normal, vip];
const digits = [0, 1, 2, 6];
const pairs2D = ['01', '02', '06', '10', '12', '16', '20', '21', '26', '60', '61', '62'];
const triples3D = ['012', '016', '026', '126'];

const sessions = [
  { key: 'HANOI_SPECIAL', label: '🟠 ฮานอยพิเศษ (17:30)', draw: special },
  { key: 'HANOI_EVENING', label: '🔴 ฮานอยปกติ (18:30)', draw: normal },
  { key: 'HANOI_VIP',     label: '🟣 ฮานอย VIP (19:30)',   draw: vip }
];

sessions.forEach(s => {
  const dr = s.draw;
  console.log(`\n=== ${s.label} ===`);
  if (!dr || !dr.top3) {
    console.log('⏳ รอผลออกรางวัล');
    return;
  }
  const top3 = dr.top3;
  const top2 = dr.top2 || top3.slice(1);
  const bottom2 = dr.bottom2;
  console.log(`ผลรางวัล: 3 บน: ${top3} | 2 บน: ${top2} | 2 ล่าง: ${bottom2}`);

  const hits = [];

  // Check 3D
  if (triples3D.includes(top3)) {
    hits.push(`✓ 3 ตัวตรง [${top3}]`);
  } else {
    const sortedT3 = top3.split('').sort().join('');
    if (triples3D.some(t => t.split('').sort().join('') === sortedT3)) {
      hits.push(`✓ 3 ตัวโต๊ด [${top3}]`);
    }
  }

  // Check 2D
  if (pairs2D.includes(top2)) hits.push(`✓ 2 ตัวบน [${top2}]`);
  if (pairs2D.includes(bottom2)) hits.push(`✓ 2 ตัวล่าง [${bottom2}]`);

  // Check digits
  const hitTop = digits.filter(d => top2.includes(String(d)));
  const hitBottom = digits.filter(d => bottom2.includes(String(d)));
  if (hitTop.length > 0 || hitBottom.length > 0) {
    const parts = [];
    if (hitTop.length > 0) parts.push(`บน ${hitTop.join(',')}`);
    if (hitBottom.length > 0) parts.push(`ล่าง ${hitBottom.join(',')}`);
    hits.push(`✓ รูดเข้า [${parts.join(' ')}]`);
  }

  if (hits.length > 0) {
    console.log('สถานะ:', hits.join(' | '));
  } else {
    console.log('สถานะ: ❌ ไม่เข้าเป้า');
  }
});
