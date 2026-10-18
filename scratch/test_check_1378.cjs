const fs = require('fs');

async function check() {
  const res = await fetch('https://lotto289.paounda2021.workers.dev/api/draws');
  const d = await res.json();
  const hanoi = d.datasets['lotto_data_hanoi'] || [];
  const spc = d.datasets['lotto_data_hanoi_special'] || [];
  const vip = d.datasets['lotto_data_hanoi_vip'] || [];

  const bundle = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');
  const jsxHelper = { jsx: (tag, props) => props, jsxs: (tag, props) => props };
  
  const startMarker = 'const isStocks = (o==="NIKKEI"';
  const startIdx = bundle.indexOf(startMarker);
  const endMarker = '})())]})},s0=';
  const endIdx = bundle.indexOf(endMarker, startIdx);
  const iifeCode = '((o, a, l, O, N, r, h, n, Ey) => {\n' + bundle.substring(startIdx, endIdx) + '\n})';
  
  function realEy(e, t) {
    const o = e.filter(N => !t || t === 'ALL' || N.dayOfWeek === t);
    const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    o.forEach(N => {
      (String(N.top3 || '') + String(N.bottom2 || '')).split('').forEach(u => {
        const p = parseInt(u, 10);
        if (!isNaN(p)) i[p] = (i[p] || 0) + 1;
      });
    });
    const topSingleDigits = Object.entries(i).map(([digit, count]) => ({ digit: Number(digit), count })).sort((a, b) => b.count - a.count);
    return { topSingleDigits };
  }

  const fn = eval(iifeCode);

  // Case 1: In NEXT mode with Saturday
  const resNext = fn('HANOI', hanoi, 'NEXT', [], null, 'Sat', { dayName: 'เสาร์' }, jsxHelper, realEy);
  const card3Next = resNext.children[2];
  const c3NextDigits = card3Next?.children?.[3]?.children?.[0]?.children?.map(c => c.children);
  const c3NextDesc = card3Next?.children?.[3]?.children?.[1]?.children;
  const c3NextBadge = card3Next?.children?.[2]?.children?.[0]?.children?.[0]?.children?.[1]?.children;
  console.log('NEXT mode Saturday:');
  console.log('Digits:', c3NextDigits);
  console.log('Badge:', c3NextBadge);
  console.log('Desc:', c3NextDesc);

  // Case 2: Past Saturday draws (e.g. 2026-10-10 or 2026-10-03)
  const satDraws = hanoi.filter(x => x.dayOfWeek === 'Sat');
  const resPast = fn('HANOI', hanoi, 'NORMAL', satDraws.slice(0, 1), null, 'Sat', { dayName: 'เสาร์' }, jsxHelper, realEy);
  const card3Past = resPast.children[2];
  const c3PastDigits = card3Past?.children?.[3]?.children?.[0]?.children?.map(c => c.children);
  const c3PastBadge = card3Past?.children?.[2]?.children?.[0]?.children?.[0]?.children?.[1]?.children;
  console.log('\nPAST mode Saturday:');
  console.log('Digits:', c3PastDigits);
  console.log('Badge:', c3PastBadge);
}
check();
