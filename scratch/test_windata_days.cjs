const fs = require('fs');

const reg = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const spc = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));
const allDraws = [...reg, ...spc, ...vip];

function Ey(e, t = "Sat") {
  const o = e.filter(N => t === "ALL" || N.dayOfWeek === t),
    a = o.length,
    i = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    r = {};
  o.forEach(N => {
    `${N.top3}${N.bottom2}`.split("").forEach(u => {
      const p = parseInt(u, 10);
      isNaN(p) || (i[p] = (i[p] || 0) + 1);
    });
    N.top2 && (r[N.top2] = (r[N.top2] || 0) + 1);
    N.bottom2 && (r[N.bottom2] = (r[N.bottom2] || 0) + 1);
  });
  const d = Object.entries(i).map(([N, y]) => {
    const u = parseInt(N, 10),
      p = a > 0 ? Math.round(y / (a * 5) * 1e3) / 10 : 0;
    return { digit: u, count: y, percent: p };
  }).sort((N, y) => y.count - N.count).slice(0, 5);
  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return {
    dayName: { Sat: "เสาร์", Mon: "จันทร์", Tue: "อังคาร", Wed: "พุธ", Thu: "พฤหัสบดี", Fri: "ศุกร์", Sun: "อาทิตย์", ALL: "ทุกวันทำการ" }[t] || "วันประจำสัปดาห์",
    dayOfWeek: t,
    totalDrawsOnDay: a,
    topSingleDigits: d,
    top2DPairs: l,
    matchingDraws: o
  };
}

['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(r => {
  const vipD = allDraws.filter(d => d.session === 'HANOI_VIP');
  const specialD = allDraws.filter(d => d.session === 'HANOI_SPECIAL');
  const all3D = allDraws.filter(d => ['HANOI_SPECIAL', 'HANOI_EVENING', 'HANOI_VIP'].includes(d.session));
  const vipStats = Ey(vipD, r), specialStats = Ey(specialD, r), all3Stats = Ey(all3D, r);
  const denVip = vipStats.topSingleDigits && vipStats.topSingleDigits[0] ? vipStats.topSingleDigits[0].digit : null;
  const denPhi = specialStats.topSingleDigits && specialStats.topSingleDigits[0] ? specialStats.topSingleDigits[0].digit : null;
  const denRuam = all3Stats.topSingleDigits && all3Stats.topSingleDigits[0] ? all3Stats.topSingleDigits[0].digit : null;
  const rongRuam = all3Stats.topSingleDigits && all3Stats.topSingleDigits[1] ? all3Stats.topSingleDigits[1].digit : null;
  const raw4 = [denVip, denPhi, denRuam, rongRuam], cands = [0,1,2,3,4,5,6,7,8,9], currSet = new Set(raw4.filter(x => x !== null && x !== undefined)), seen = new Set, resolved = [], replacedDups = [];
  for (let i = 0; i < raw4.length; i++) {
    const val = raw4[i];
    if (val === null || val === undefined) continue;
    if (!seen.has(val)) {
      seen.add(val); resolved.push(val);
    } else {
      for (const c of cands) {
        if (!currSet.has(c)) {
          resolved.push(c); currSet.add(c); replacedDups.push({ original: val, replacement: c }); break;
        }
      }
    }
  }
  const digits = resolved.slice(0, 4).sort((x, y) => x - y);
  console.log(`Day: ${r}, raw4: [${raw4}], digits: [${digits}]`);
});
