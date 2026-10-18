const targetDraws = [
  { session: 'HANOI_SPECIAL', top3: '463', top2: '63', bottom2: '33' },
  { session: 'HANOI_EVENING', top3: '635', top2: '35', bottom2: '82' },
  { session: 'HANOI_VIP',     top3: '768', top2: '68', bottom2: '18' }
];

const digits = [0, 1, 2, 6];
const pairs2D = ['01', '02', '06', '10', '12', '16', '20', '21', '26', '60', '61', '62'];
const triples3D = ['012', '016', '026', '126'];

const sessionConfigs = [
  { key: 'HANOI_SPECIAL', label: '🟠 ฮานอยพิเศษ (17:30)', short: '🟠 พิเศษ' },
  { key: 'HANOI_EVENING', label: '🔴 ฮานอยปกติ (18:30)', short: '🔴 ปกติ' },
  { key: 'HANOI_VIP',     label: '🟣 ฮานอย VIP (19:30)',   short: '🟣 VIP' }
];

const results = sessionConfigs.map(s => {
  const dr = targetDraws.find(d => d.session === s.key);
  if (!dr || !dr.top3) {
    return { ...s, hasResult: false, top3: '-', top2: '-', bottom2: '-', hits: [], statusText: '⏳ รอประกาศผล' };
  }

  const top3 = dr.top3 || '';
  const top2 = dr.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
  const bottom2 = dr.bottom2 || '';

  const hits = [];

  if (triples3D.includes(top3)) {
    hits.push({ type: '3D_DIRECT', text: `✓ 3 ตัวตรง [${top3}]`, badgeClass: 'bg-emerald-500 text-black font-black' });
  } else {
    const sortedT3 = top3.split('').sort().join('');
    if (triples3D.some(t => t.split('').sort().join('') === sortedT3)) {
      hits.push({ type: '3D_TOD', text: `✓ 3 ตัวโต๊ด [${top3}]`, badgeClass: 'bg-teal-500/30 text-teal-200 border border-teal-400' });
    }
  }

  if (pairs2D.includes(top2)) {
    hits.push({ type: '2D_TOP', text: `✓ 2 ตัวบน [${top2}]`, badgeClass: 'bg-emerald-500 text-black font-black' });
  }
  if (pairs2D.includes(bottom2)) {
    hits.push({ type: '2D_BOTTOM', text: `✓ 2 ตัวล่าง [${bottom2}]`, badgeClass: 'bg-cyan-500 text-black font-black' });
  }

  const hitTop = digits.filter(d => top2.includes(String(d)));
  const hitBottom = digits.filter(d => bottom2.includes(String(d)));
  if (hitTop.length > 0 || hitBottom.length > 0) {
    const parts = [];
    if (hitTop.length > 0) parts.push(`บน ${hitTop.join(',')}`);
    if (hitBottom.length > 0) parts.push(`ล่าง ${hitBottom.join(',')}`);
    hits.push({ type: 'ROOD', text: `✓ รูดเข้า [${parts.join(' ')}]`, badgeClass: 'bg-amber-500/20 text-yellow-300 border border-amber-500/40' });
  }

  return {
    ...s,
    hasResult: true,
    top3,
    top2,
    bottom2,
    hits,
    isHit: hits.length > 0,
    statusText: hits.length > 0 ? hits.map(h => h.text).join(' | ') : '❌ ไม่เข้าเป้า'
  };
});

console.log(JSON.stringify(results, null, 2));
