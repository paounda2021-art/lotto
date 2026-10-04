const fs = require('fs');

const dates = [];
const start = new Date(2026, 9, 3); // 2026-10-03
const end = new Date(2026, 6, 1);   // 2026-07-01

const dayNamesThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

// Deterministic random generator for consistent dataset
let seed = 12345;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randDigitStr(len) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += Math.floor(rand() * 10);
  }
  return s;
}

// Special known draw results for Sept/Oct 2026 to align with exphuay real samples:
const specialKnown = {
  '2026-10-02': { top3: '030', top2: '30', bottom2: '13' },
  '2026-10-01': { top3: '849', top2: '49', bottom2: '15' },
  '2026-09-30': { top3: '943', top2: '43', bottom2: '17' },
  '2026-09-29': { top3: '108', top2: '08', bottom2: '37' },
  '2026-09-28': { top3: '758', top2: '58', bottom2: '44' },
};

const vipKnown = {
  '2026-10-02': { top3: '018', top2: '18', bottom2: '47' },
  '2026-10-01': { top3: '624', top2: '24', bottom2: '97' },
};

let curr = new Date(start);
const specialList = [];
const vipList = [];

while (curr >= end) {
  const y = curr.getFullYear();
  const m = curr.getMonth();
  const d = curr.getDate();
  const dateStr = `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const dateFormatted = `${pad2(d)} ${monthNamesThai[m]} ${y + 543}`;
  const dayIdx = curr.getDay();
  const dayOfWeek = dayCodes[dayIdx];
  const dayNameThai = dayNamesThai[dayIdx];

  // Hanoi Special (17:30)
  const specRes = specialKnown[dateStr] || {
    top3: randDigitStr(3),
    top2: randDigitStr(2),
    bottom2: randDigitStr(2)
  };
  specialList.push({
    id: `hns_${y}${pad2(m + 1)}${pad2(d)}`,
    lotteryType: 'HANOI',
    session: 'HANOI_SPECIAL',
    date: dateStr,
    dateFormatted,
    dayOfWeek,
    dayNameThai,
    top3: specRes.top3,
    top2: specRes.top3.slice(-2),
    bottom2: specRes.bottom2
  });

  // Hanoi VIP (19:30)
  const vipRes = vipKnown[dateStr] || {
    top3: randDigitStr(3),
    top2: randDigitStr(2),
    bottom2: randDigitStr(2)
  };
  vipList.push({
    id: `hnv_${y}${pad2(m + 1)}${pad2(d)}`,
    lotteryType: 'HANOI',
    session: 'HANOI_VIP',
    date: dateStr,
    dateFormatted,
    dayOfWeek,
    dayNameThai,
    top3: vipRes.top3,
    top2: vipRes.top3.slice(-2),
    bottom2: vipRes.bottom2
  });

  curr.setDate(curr.getDate() - 1);
}

fs.writeFileSync('scratch/special_data.json', JSON.stringify(specialList, null, 2));
fs.writeFileSync('scratch/vip_data.json', JSON.stringify(vipList, null, 2));

console.log(`Generated ${specialList.length} Hanoi Special items and ${vipList.length} Hanoi VIP items.`);
