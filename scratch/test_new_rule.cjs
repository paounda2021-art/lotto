const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const allHanoi = [...special, ...normal, ...vip];

function Ey(e, t = "Fri") {
  const o = e.filter(N => t === "ALL" || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    `${N.top3||''}${N.bottom2||''}`.split("").forEach(u => {
      const p = parseInt(u, 10);
      if (!isNaN(p)) i[p] = (i[p] || 0) + 1;
    });
    if (N.top2) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });
  const d = Object.entries(i).map(([N, y]) => {
    const u = parseInt(N, 10);
    const p = a > 0 ? Math.round(y / (a * 5) * 1e3) / 10 : 0;
    return { digit: u, count: y, percent: p };
  }).sort((N, y) => y.count - N.count);

  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return { dayOfWeek: t, totalDrawsOnDay: a, topSingleDigits: d, top2DPairs: l };
}

// Check on Friday (like in user screenshot)
const targetDate = '2026-10-09';
const trainData = allHanoi.filter(d => d.date !== targetDate);
const trainVip = trainData.filter(d => d.session === 'HANOI_VIP');
const trainSpecial = trainData.filter(d => d.session === 'HANOI_SPECIAL');

const vipStats = Ey(trainVip, 'Fri');
const specialStats = Ey(trainSpecial, 'Fri');
const all3Stats = Ey(trainData, 'Fri');

const denVip = vipStats.topSingleDigits[0]?.digit;
const denPhi = specialStats.topSingleDigits[0]?.digit;
const denRuam = all3Stats.topSingleDigits[0]?.digit;
const rongRuam = all3Stats.topSingleDigits[1]?.digit;

console.log('Friday (Fri) Stats:');
console.log('  เด่นวี (VIP):', denVip);
console.log('  เด่นพิ (Special):', denPhi);
console.log('  เด่นรวม (All3):', denRuam);
console.log('  รองรวม (All3):', rongRuam);

const raw4 = [denVip, denPhi, denRuam, rongRuam];
console.log('Raw 4:', raw4);

const cands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const currSet = new Set(raw4.filter(x => x !== null && x !== undefined));
const seen = new Set();
const resolved = [];
const replacedDups = [];

for (let i = 0; i < raw4.length; i++) {
  const val = raw4[i];
  if (val === null || val === undefined) continue;
  if (!seen.has(val)) {
    seen.add(val);
    resolved.push(val);
  } else {
    for (const c of cands) {
      if (!currSet.has(c)) {
        resolved.push(c);
        currSet.add(c);
        replacedDups.push({ original: val, replacement: c });
        break;
      }
    }
  }
}

const digits = resolved.slice(0, 4).sort((a,b) => a - b);
console.log('Resolved 4 digits:', digits);
console.log('Replaced dups:', replacedDups);
