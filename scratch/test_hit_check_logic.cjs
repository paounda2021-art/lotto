const fs = require('fs');
const path = require('path');
const dir = 'scratch/live_kv_data';

// Mock window.__KV_DRAWS__
global.window = { __KV_DRAWS__: {} };
const keys = [
  'lotto_data_nikkei_morning', 'lotto_data_china_morning', 'lotto_data_hangseng_morning',
  'lotto_data_nikkei_afternoon', 'lotto_data_china_afternoon', 'lotto_data_hangseng_afternoon',
  'lotto_data_nikkei_vip_morning', 'lotto_data_china_vip_morning', 'lotto_data_hangseng_vip_morning',
  'lotto_data_nikkei_vip_afternoon', 'lotto_data_china_vip_afternoon', 'lotto_data_hangseng_vip_afternoon'
];
keys.forEach(k => {
  window.__KV_DRAWS__[k] = JSON.parse(fs.readFileSync(path.join(dir, k + '.json'), 'utf8'));
});

function getWinningSetsForSession(dayCode, sessCategory, sessTime, drawsArray) {
  const winning2D = new Set();
  const winning3D = new Set();
  
  const relevantKeys = [];
  if (sessCategory === 'reg') {
    if (sessTime === 'Morning') {
      relevantKeys.push('lotto_data_nikkei_morning', 'lotto_data_china_morning', 'lotto_data_hangseng_morning');
    } else {
      relevantKeys.push('lotto_data_nikkei_afternoon', 'lotto_data_china_afternoon', 'lotto_data_hangseng_afternoon');
    }
  } else {
    if (sessTime === 'Morning') {
      relevantKeys.push('lotto_data_nikkei_vip_morning', 'lotto_data_china_vip_morning', 'lotto_data_hangseng_vip_morning');
    } else {
      relevantKeys.push('lotto_data_nikkei_vip_afternoon', 'lotto_data_china_vip_afternoon', 'lotto_data_hangseng_vip_afternoon');
    }
  }

  relevantKeys.forEach(k => {
    const list = window.__KV_DRAWS__[k];
    if (Array.isArray(list)) {
      const item = list.find(d => d.dayOfWeek === dayCode);
      if (item && item.top3 && item.top3 !== 'กผล' && !item.top3.includes('งด')) {
        winning3D.add(item.top3);
        winning3D.add(item.top3.split('').sort().join(''));
        const t2 = item.top2 || (item.top3.length >= 2 ? item.top3.slice(-2) : '');
        if (t2) winning2D.add(t2);
        if (item.bottom2 && !item.bottom2.includes('งด')) winning2D.add(item.bottom2);
      }
    }
  });

  return { winning2D, winning3D };
}

const SESSION_WIN4_DATA = {
  Mon: {
    regMorning: [0, 1, 4, 8],
    regAfternoon: [0, 2, 5, 9],
    vipMorning: [1, 4, 8, 9],
    vipAfternoon: [1, 2, 4, 8]
  },
  Tue: {
    regMorning: [3, 5, 6, 9],
    regAfternoon: [0, 2, 3, 7],
    vipMorning: [3, 4, 7, 9],
    vipAfternoon: [0, 4, 6, 7]
  },
  Wed: {
    regMorning: [1, 2, 3, 6],
    regAfternoon: [0, 1, 7, 9],
    vipMorning: [0, 3, 7, 9],
    vipAfternoon: [2, 3, 4, 7]
  },
  Thu: {
    regMorning: [1, 3, 4, 9],
    regAfternoon: [1, 7, 8, 9],
    vipMorning: [1, 4, 6, 9],
    vipAfternoon: [0, 2, 4, 8]
  },
  Fri: {
    regMorning: [2, 6, 7, 8],
    regAfternoon: [1, 3, 4, 6],
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [0, 6, 7, 8]
  },
  Sat: {
    vipMorning: [0, 1, 2, 6],
    vipAfternoon: [0, 6, 8, 9]
  },
  Sun: {
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [1, 3, 7, 9]
  }
};

function getWin4Pairs(digits) {
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

['Tue', 'Wed', 'Fri', 'Sat'].forEach(day => {
  console.log('==============================');
  console.log('DAY:', day);
  console.log('==============================');
  ['reg', 'vip'].forEach(cat => {
    if (day === 'Sat' && cat === 'reg') return;
    ['Morning', 'Afternoon'].forEach(time => {
      const sessKey = cat + time;
      const digits = SESSION_WIN4_DATA[day]?.[sessKey];
      if (!digits) return;
      const { pairs2D, triples3D } = getWin4Pairs(digits);
      const { winning2D, winning3D } = getWinningSetsForSession(day, cat, time);
      const hits2D = pairs2D.filter(p => winning2D.has(p));
      const hits3D = triples3D.filter(t => winning3D.has(t) || winning3D.has(t.split('').sort().join('')));
      console.log(`[${cat.toUpperCase()} ${time}] Digits: [${digits.join('-')}] | 2D Hits (${hits2D.length}): ${hits2D.join(', ')} | 3D Hits (${hits3D.length}): ${hits3D.join(', ')}`);
    });
  });
});
