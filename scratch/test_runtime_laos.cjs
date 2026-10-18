const fs = require('fs');
const bundle = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

const n = { jsx: (tag, props) => props, jsxs: (tag, props) => props };
const Ey = () => ({ topSingleDigits: [{ digit: 9 }, { digit: 5 }, { digit: 3 }, { digit: 8 }] });

const startMarker = 'const isStocks = (o==="NIKKEI"';
const startIdx = bundle.indexOf(startMarker);
const endMarker = '})())]})},s0=';
const endIdx = bundle.indexOf(endMarker, startIdx);

const iifeCode = '((o, a, l, O, N, r, h, n, Ey) => {\n' + bundle.substring(startIdx, endIdx) + '\n})';
const fn = eval(iifeCode);

const hanoiSample = [
  { id: '1', date: '2026-10-16', session: 'HANOI_EVENING', top3: '756', top2: '56', bottom2: '98', dayOfWeek: 'Fri' },
  { id: '2', date: '2026-10-16', session: 'HANOI_SPECIAL', top3: '045', top2: '45', bottom2: '12', dayOfWeek: 'Fri' },
  { id: '3', date: '2026-10-16', session: 'HANOI_VIP', top3: '866', top2: '66', bottom2: '04', dayOfWeek: 'Fri' }
];

console.log('--- TEST 1: Hanoi NEXT Mode ---');
const resNext = fn('HANOI', hanoiSample, 'NEXT', [], { date: '2026-10-17' }, 'Sat', { dayName: 'เสาร์' }, n, Ey);
const card3Next = resNext.children[2];
console.log('Card 3 Next 4 digits:', card3Next.children[3].children[0].children.map(c => c.children));

console.log('\n--- TEST 2: Hanoi Past Draw Mode ---');
const resPast = fn('HANOI', hanoiSample, 'NORMAL', hanoiSample, { date: '2026-10-16' }, 'Fri', { dayName: 'ศุกร์' }, n, Ey);
const card3Past = resPast.children[2];
console.log('Card 3 Past 4 digits:', card3Past.children[3].children[0].children.map(c => c.children));

const pairsPast = card3Past.children[4].children[0].children[1].children.map(c => ({
  pair: c.children,
  isHit: c.className.includes('win4-chip-purple-hit')
}));
console.log('Past 2D pairs and hits:\n', pairsPast);

const hitCountText = card3Past.children[4].children[0].children[0].children[0].children[1];
console.log('Hit badge text:', hitCountText?.children);
