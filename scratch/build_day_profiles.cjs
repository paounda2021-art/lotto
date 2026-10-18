const fs = require('fs');
const path = require('path');

function getDraws(f) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8'))
    .filter(x => /^\d{2}$/.test(x.top2) && /^\d{2}$/.test(x.bottom2));
}

const reg = {
  m: [getDraws('lotto_data_nikkei_morning.json'), getDraws('lotto_data_china_morning.json'), getDraws('lotto_data_hangseng_morning.json')],
  a: [getDraws('lotto_data_nikkei_afternoon.json'), getDraws('lotto_data_china_afternoon.json'), getDraws('lotto_data_hangseng_afternoon.json')]
};

const vip = {
  m: [getDraws('lotto_data_nikkei_vip_morning.json'), getDraws('lotto_data_china_vip_morning.json'), getDraws('lotto_data_hangseng_vip_morning.json')],
  a: [getDraws('lotto_data_nikkei_vip_afternoon.json'), getDraws('lotto_data_china_vip_afternoon.json'), getDraws('lotto_data_hangseng_vip_afternoon.json')]
};

const days = [
  { key: 'Mon', th: 'จันทร์' },
  { key: 'Tue', th: 'อังคาร' },
  { key: 'Wed', th: 'พุธ' },
  { key: 'Thu', th: 'พฤหัสบดี' },
  { key: 'Fri', th: 'ศุกร์' }
];

function analyzeDay(dayKey, groupSets) {
  const mDraws = groupSets.m.flatMap(ds => ds.filter(d => d.dayOfWeek === dayKey));
  const aDraws = groupSets.a.flatMap(ds => ds.filter(d => d.dayOfWeek === dayKey));

  function rank(arr, ext) {
    const c = Array(10).fill(0);
    arr.forEach(d => c[ext(d)]++);
    return c.map((cnt, digit) => ({ digit, cnt })).sort((a,b) => b.cnt - a.cnt);
  }

  return {
    morning: {
      tensTop: rank(mDraws, d => parseInt(d.top2[0])).slice(0, 4).map(x => x.digit),
      unitsTop: rank(mDraws, d => parseInt(d.top2[1])).slice(0, 4).map(x => x.digit),
      tensBottom: rank(mDraws, d => parseInt(d.bottom2[0])).slice(0, 4).map(x => x.digit),
      unitsBottom: rank(mDraws, d => parseInt(d.bottom2[1])).slice(0, 4).map(x => x.digit)
    },
    afternoon: {
      tensTop: rank(aDraws, d => parseInt(d.top2[0])).slice(0, 4).map(x => x.digit),
      unitsTop: rank(aDraws, d => parseInt(d.top2[1])).slice(0, 4).map(x => x.digit),
      tensBottom: rank(aDraws, d => parseInt(d.bottom2[0])).slice(0, 4).map(x => x.digit),
      unitsBottom: rank(aDraws, d => parseInt(d.bottom2[1])).slice(0, 4).map(x => x.digit)
    }
  };
}

const dayProfiles = {};
days.forEach(d => {
  dayProfiles[d.key] = {
    th: d.th,
    reg: analyzeDay(d.key, reg),
    vip: analyzeDay(d.key, vip)
  };
});

fs.writeFileSync(path.join(__dirname, 'day_profiles.json'), JSON.stringify(dayProfiles, null, 2), 'utf8');
console.log('Day profiles created!');
