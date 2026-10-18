const fs = require('fs');
const path = require('path');

global.window = { __KV_DRAWS__: {} };
const keys = [
  'lotto_data_nikkei_morning', 'lotto_data_china_morning', 'lotto_data_hangseng_morning',
  'lotto_data_nikkei_afternoon', 'lotto_data_china_afternoon', 'lotto_data_hangseng_afternoon',
  'lotto_data_nikkei_vip_morning', 'lotto_data_china_vip_morning', 'lotto_data_hangseng_vip_morning',
  'lotto_data_nikkei_vip_afternoon', 'lotto_data_china_vip_afternoon', 'lotto_data_hangseng_vip_afternoon'
];
keys.forEach(k => {
  const filePath = path.join(__dirname, 'live_kv_data', k + '.json');
  if (fs.existsSync(filePath)) {
    window.__KV_DRAWS__[k] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
});

const WIN4_MAP = {
  Mon: { regMorning: [0, 1, 4, 8], regAfternoon: [0, 2, 5, 9], vipMorning: [1, 4, 8, 9], vipAfternoon: [1, 2, 4, 8] },
  Tue: { regMorning: [3, 5, 6, 9], regAfternoon: [0, 2, 3, 7], vipMorning: [3, 4, 7, 9], vipAfternoon: [0, 4, 6, 7] },
  Wed: { regMorning: [1, 2, 3, 6], regAfternoon: [0, 1, 7, 9], vipMorning: [0, 3, 7, 9], vipAfternoon: [2, 3, 4, 7] },
  Thu: { regMorning: [1, 3, 4, 9], regAfternoon: [1, 7, 8, 9], vipMorning: [1, 4, 6, 9], vipAfternoon: [0, 2, 4, 8] },
  Fri: { regMorning: [2, 6, 7, 8], regAfternoon: [1, 3, 4, 6], vipMorning: [0, 1, 5, 8], vipAfternoon: [0, 6, 7, 8] },
  Sat: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 2, 6], vipAfternoon: [0, 6, 8, 9] },
  Sun: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 5, 8], vipAfternoon: [1, 3, 7, 9] }
};

function getWin4PairsHelper(digits) {
  if (!digits || digits.length < 4) return { pairs2D: [], triples3D: [] };
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
  return { pairs2D, triples3D };
}

function getWinningSetsHelper(dayCode, cat, time, targetDate) {
  const win2D = new Set();
  const win3D = new Set();
  const timeStr = time.toLowerCase();
  ["nikkei", "china", "hangseng"].forEach(stk => {
    const key = cat === "vip" ? ("lotto_data_" + stk + "_vip_" + timeStr) : ("lotto_data_" + stk + "_" + timeStr);
    const list = window.__KV_DRAWS__[key];
    if (Array.isArray(list)) {
      const match = list.find(d => targetDate ? d.date === targetDate : d.dayOfWeek === dayCode);
      if (match) {
        if (match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล") {
          win3D.add(match.top3);
          win3D.add(match.top3.split("").sort().join(""));
        }
        const t2 = match.top2 || (match.top3 && match.top3.length >= 2 ? match.top3.slice(-2) : "");
        if (t2) win2D.add(t2);
        if (match.bottom2 && !match.bottom2.includes("งด")) win2D.add(match.bottom2);
      }
    }
  });
  return { win2D, win3D };
}

console.log('=== TEST ALL DAYS ===');
['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
  const dData = WIN4_MAP[day];
  console.log(`\n--- Day: ${day} ---`);
  ['reg', 'vip'].forEach(cat => {
    if ((day === 'Sat' || day === 'Sun') && cat === 'reg') {
      console.log(`  [${cat.toUpperCase()}] Closed on weekend`);
      return;
    }
    ['Morning', 'Afternoon'].forEach(time => {
      const sessKey = cat + time;
      const digits = dData[sessKey];
      const { pairs2D, triples3D } = getWin4PairsHelper(digits);
      const { win2D, win3D } = getWinningSetsHelper(day, cat, time);
      const hit2D = pairs2D.filter(p => win2D.has(p));
      const hit3D = triples3D.filter(t => win3D.has(t) || win3D.has(t.split('').sort().join('')));
      console.log(`  [${cat.toUpperCase()} ${time}] Digits: [${digits.join(',')}] | 2D Hits (${hit2D.length}): ${hit2D.join(',')} | 3D Hits (${hit3D.length}): ${hit3D.join(',')}`);
    });
  });
});
