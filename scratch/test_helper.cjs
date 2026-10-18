const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const allHanoi = [...special, ...normal, ...vip];

function Ey(e, t = "Sat") {
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
  return {
    dayOfWeek: t,
    totalDrawsOnDay: a,
    topSingleDigits: d,
    top2DPairs: l
  };
}

const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "ALL"];
days.forEach(day => {
  const vipStats = Ey(vip, day);
  const all3Stats = Ey(allHanoi, day);
  const v0 = vipStats.topSingleDigits[0]?.digit;
  const v1 = vipStats.topSingleDigits[1]?.digit;
  const a0 = all3Stats.topSingleDigits[0]?.digit;
  const a1 = all3Stats.topSingleDigits[1]?.digit;

  let digits = Array.from(new Set([v0, v1, a0, a1].filter(x => x !== undefined && x !== null))).sort((a,b)=>a-b);
  
  const pairs2D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs2D.push(String(digits[i]) + String(digits[j]));
    }
  }

  const triples3D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      for (let k = j + 1; k < digits.length; k++) {
        triples3D.push(String(digits[i]) + String(digits[j]) + String(digits[k]));
      }
    }
  }

  console.log(`Day ${day}: VIP=[${v0}, ${v1}], All3=[${a0}, ${a1}] => ${digits.length} Digits: ${JSON.stringify(digits)} | 2D: ${pairs2D.length} sets | 3D: ${triples3D.length} sets (${triples3D.length * 6} โต๊ด)`);
});
