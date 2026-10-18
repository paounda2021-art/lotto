const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const allHanoi = [...special, ...normal, ...vip];
allHanoi.sort((a,b) => (b.date || '').localeCompare(a.date || ''));

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

const d0 = (e, t, o) => {
  if (!e || e.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
  const a = e[0].date;
  if (t === "ALL") return { draws: e.filter(N => N.date === a), isFuture: false, isAllRecorded: true };
  if (o && t === o) {
    const s = e[0];
    if (s.dayOfWeek !== t || !s.top3 || s.top3.trim() === "") return { draws: [], isFuture: true, isAllRecorded: false };
  }
  const i = Array.from(new Set(e.filter(s => s.dayOfWeek === t && !!(s.top3 && s.top3.trim() !== "")).map(s => s.date)));
  if (i.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
  const r = i[0], d = e.filter(s => s.date === r), l = d.length > 0 && d.every(s => !!(s.top3 && s.top3.trim() !== ""));
  return { draws: d, isFuture: false, isAllRecorded: l };
};

['Fri', 'Thu', 'Wed'].forEach(day => {
  const { draws: O } = d0(allHanoi, day, 'Sat');
  const targetDate = O[0]?.date;
  
  // Exclude targetDate for historical training
  const trainData = allHanoi.filter(d => d.date !== targetDate);
  const trainVip = trainData.filter(d => d.session === 'HANOI_VIP');

  const vipStats = Ey(trainVip, day);
  const all3Stats = Ey(trainData, day);

  const v0 = vipStats.topSingleDigits[0]?.digit;
  const v1 = vipStats.topSingleDigits[1]?.digit;
  const a0 = all3Stats.topSingleDigits[0]?.digit;
  const a1 = all3Stats.topSingleDigits[1]?.digit;

  const raw4 = [v0, v1, a0, a1];
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
  const pairs2D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) pairs2D.push(`${digits[i]}${digits[j]}`);
    }
  }
  const triples3D = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      for (let k = j + 1; k < digits.length; k++) {
        triples3D.push(`${digits[i]}${digits[j]}${digits[k]}`);
      }
    }
  }

  console.log(`\n=================== Day: ${day} (${targetDate}) ===================`);
  console.log(`Digits: [${digits.join(', ')}] | 2D: ${pairs2D.length} pairs | 3D: ${triples3D.join(', ')}`);

  const sessionConfigs = [
    { key: 'HANOI_SPECIAL', label: '🟠 ฮานอยพิเศษ (17:30)' },
    { key: 'HANOI_EVENING', label: '🔴 ฮานอยปกติ (18:30)' },
    { key: 'HANOI_VIP',     label: '🟣 ฮานอย VIP (19:30)' }
  ];

  sessionConfigs.forEach(s => {
    const dr = O.find(d => d.session === s.key);
    if (!dr || !dr.top3) {
      console.log(`  ${s.label}: ⏳ รอประกาศผลรางวัล`);
      return;
    }
    const top3 = dr.top3;
    const top2 = dr.top2 || top3.slice(1);
    const bottom2 = dr.bottom2;

    const hits = [];
    if (triples3D.includes(top3)) hits.push(`✓ 3 ตัวตรง [${top3}]`);
    const sortedT3 = top3.split('').sort().join('');
    if (triples3D.some(t => t.split('').sort().join('') === sortedT3) && !triples3D.includes(top3)) {
      hits.push(`✓ 3 ตัวโต๊ด [${top3}]`);
    }
    if (pairs2D.includes(top2)) hits.push(`✓ 2 ตัวบน [${top2}]`);
    if (pairs2D.includes(bottom2)) hits.push(`✓ 2 ตัวล่าง [${bottom2}]`);

    const hitTop = digits.filter(d => top2.includes(String(d)));
    const hitBottom = digits.filter(d => bottom2.includes(String(d)));
    if (hitTop.length > 0 || hitBottom.length > 0) {
      const parts = [];
      if (hitTop.length > 0) parts.push(`บน ${hitTop.join(',')}`);
      if (hitBottom.length > 0) parts.push(`ล่าง ${hitBottom.join(',')}`);
      hits.push(`✓ รูดเข้า [${parts.join(' ')}]`);
    }

    console.log(`  ${s.label} (ผล: 3 บน ${top3} | 2 ล่าง ${bottom2}):`);
    if (hits.length > 0) {
      console.log(`     🎉 เข้าเป้า: ${hits.join(' | ')}`);
    } else {
      console.log(`     ❌ ไม่เข้าเป้า`);
    }
  });
});
