const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

// Tag session if not tagged
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

const day = "Sat";
const vipStats = Ey(vip, day);
const all3Stats = Ey(allHanoi, day);

console.log('=== DAY:', day, '===');
console.log('นอย VIP:');
console.log('เด่นหลัก:', vipStats.topSingleDigits[0]);
console.log('เด่นรอง:', vipStats.topSingleDigits[1]);

console.log('\nรวม 3 นอย:');
console.log('เด่นหลัก:', all3Stats.topSingleDigits[0]);
console.log('เด่นรอง:', all3Stats.topSingleDigits[1]);

const v0 = vipStats.topSingleDigits[0]?.digit;
const v1 = vipStats.topSingleDigits[1]?.digit;
const a0 = all3Stats.topSingleDigits[0]?.digit;
const a1 = all3Stats.topSingleDigits[1]?.digit;

// Combine unique
const baseDigits = [v0, v1, a0, a1].filter(x => x !== undefined && x !== null);
let distinctDigits = Array.from(new Set(baseDigits));

// If fewer than 4 distinct digits, fill from top digits of all3 or VIP
if (distinctDigits.length < 4) {
  for (const item of all3Stats.topSingleDigits) {
    if (!distinctDigits.includes(item.digit)) {
      distinctDigits.push(item.digit);
      if (distinctDigits.length === 4) break;
    }
  }
}
if (distinctDigits.length < 4) {
  for (const item of vipStats.topSingleDigits) {
    if (!distinctDigits.includes(item.digit)) {
      distinctDigits.push(item.digit);
      if (distinctDigits.length === 4) break;
    }
  }
}

distinctDigits = distinctDigits.slice(0, 4).sort((a, b) => a - b);
console.log('\n4 เลขเด่นชุดคัดเน้นพิเศษ:', distinctDigits);

// 2D Win Pairs (12 pairs for 4 digits)
const pairs2D = [];
for (let i = 0; i < distinctDigits.length; i++) {
  for (let j = 0; j < distinctDigits.length; j++) {
    if (i !== j) {
      pairs2D.push(`${distinctDigits[i]}${distinctDigits[j]}`);
    }
  }
}
console.log('2 ตัว (บน-ล่าง) 12 ชุด:', pairs2D);

// 3D Win Triples (4 triples for 4 digits)
const triples3D = [];
for (let i = 0; i < distinctDigits.length; i++) {
  for (let j = i + 1; j < distinctDigits.length; j++) {
    for (let k = j + 1; k < distinctDigits.length; k++) {
      triples3D.push(`${distinctDigits[i]}${distinctDigits[j]}${distinctDigits[k]}`);
    }
  }
}
console.log('3 ตัวตรง 4 ชุด:', triples3D);
