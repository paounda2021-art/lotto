function checkHanoiWinHits(digits, pairs2D, triples3D, targetDraws) {
  if (!targetDraws || targetDraws.length === 0) return [];

  const sessionConfigs = [
    { key: 'HANOI_SPECIAL', name: 'ฮานอยพิเศษ (17:30)', short: '🟠 พิเศษ', color: 'from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/40' },
    { key: 'HANOI_EVENING', name: 'ฮานอยปกติ (18:30)', short: '🔴 ปกติ', color: 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40' },
    { key: 'HANOI_VIP', name: 'ฮานอย VIP (19:30)', short: '🟣 VIP', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40' }
  ];

  return sessionConfigs.map(cfg => {
    const draw = targetDraws.find(d => d.session === cfg.key);
    if (!draw || !draw.top3) {
      return {
        ...cfg,
        hasResult: false,
        top3: '-',
        top2: '-',
        bottom2: '-',
        hits: [],
        statusText: '⏳ รอประกาศผล'
      };
    }

    const top3 = draw.top3 || '';
    const top2 = draw.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
    const bottom2 = draw.bottom2 || '';

    const hits = [];

    // Check 3D direct
    if (triples3D.includes(top3)) {
      hits.push({ type: '3D_DIRECT', text: `3 ตัวตรง [${top3}]`, highlight: 'bg-emerald-500 text-black font-black' });
    } else {
      // Check 3D tod
      const sortedTop3 = top3.split('').sort().join('');
      const matchedTod = triples3D.find(t => t.split('').sort().join('') === sortedTop3);
      if (matchedTod) {
        hits.push({ type: '3D_TOD', text: `3 ตัวโต๊ด [${top3}]`, highlight: 'bg-teal-500/30 text-teal-200 border border-teal-400' });
      }
    }

    // Check 2D top
    if (pairs2D.includes(top2)) {
      hits.push({ type: '2D_TOP', text: `2 ตัวบน [${top2}]`, highlight: 'bg-amber-500 text-black font-black' });
    }

    // Check 2D bottom
    if (pairs2D.includes(bottom2)) {
      hits.push({ type: '2D_BOTTOM', text: `2 ตัวล่าง [${bottom2}]`, highlight: 'bg-cyan-500 text-black font-black' });
    }

    // Check rood/running single digits
    const hitDigitsTop = digits.filter(d => top2.includes(String(d)));
    const hitDigitsBottom = digits.filter(d => bottom2.includes(String(d)));
    if (hitDigitsTop.length > 0 || hitDigitsBottom.length > 0) {
      const parts = [];
      if (hitDigitsTop.length > 0) parts.push(`บน ${hitDigitsTop.join(',')}`);
      if (hitDigitsBottom.length > 0) parts.push(`ล่าง ${hitDigitsBottom.join(',')}`);
      hits.push({ type: 'DIGIT', text: `รูดเข้า [${parts.join(' ')}]`, highlight: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' });
    }

    return {
      ...cfg,
      hasResult: true,
      top3,
      top2,
      bottom2,
      hits,
      isHit: hits.length > 0,
      statusText: hits.length > 0 ? `✓ เข้าเป้า (${hits.map(h => h.text).join(', ')})` : '❌ ไม่เข้า'
    };
  });
}

// Test with digits [0, 1, 2, 6]
const digits = [0, 1, 2, 6];
const pairs2D = ['01', '02', '06', '10', '12', '16', '20', '21', '26', '60', '61', '62'];
const triples3D = ['012', '016', '026', '126'];

// Sample mock draws
const mockDraws = [
  { session: 'HANOI_SPECIAL', top3: '463', top2: '63', bottom2: '33' },
  { session: 'HANOI_EVENING', top3: '635', top2: '35', bottom2: '82' },
  { session: 'HANOI_VIP', top3: '768', top2: '68', bottom2: '18' }
];

const check = checkHanoiWinHits(digits, pairs2D, triples3D, mockDraws);
console.log('Hits check result:\n', JSON.stringify(check, null, 2));
