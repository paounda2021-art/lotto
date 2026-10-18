const fs = require('fs');
const path = require('path');

function getDraws(f) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return data.filter(x => /^\d{2}$/.test(x.top2) && /^\d{2}$/.test(x.bottom2));
}

const sets = {
  regular: {
    nikkeiM: getDraws('lotto_data_nikkei_morning.json'),
    chinaM: getDraws('lotto_data_china_morning.json'),
    hangsengM: getDraws('lotto_data_hangseng_morning.json'),
    nikkeiA: getDraws('lotto_data_nikkei_afternoon.json'),
    chinaA: getDraws('lotto_data_china_afternoon.json'),
    hangsengA: getDraws('lotto_data_hangseng_afternoon.json')
  },
  vip: {
    nikkeiVipM: getDraws('lotto_data_nikkei_vip_morning.json'),
    chinaVipM: getDraws('lotto_data_china_vip_morning.json'),
    hangsengVipM: getDraws('lotto_data_hangseng_vip_morning.json'),
    nikkeiVipA: getDraws('lotto_data_nikkei_vip_afternoon.json'),
    chinaVipA: getDraws('lotto_data_china_vip_afternoon.json'),
    hangsengVipA: getDraws('lotto_data_hangseng_vip_afternoon.json')
  }
};

// Helper: collect draws into flat array
function flattenDraws(drawsObj) {
  let list = [];
  for (const k of Object.keys(drawsObj)) {
    list = list.concat(drawsObj[k]);
  }
  return list;
}

function analyzeCategory(draws, name) {
  // Digit counts: tensTop, unitsTop, tensBottom, unitsBottom
  const counts = {
    tensTop: Array(10).fill(0),
    unitsTop: Array(10).fill(0),
    tensBottom: Array(10).fill(0),
    unitsBottom: Array(10).fill(0)
  };

  // Pairing matrix: tens -> units
  // pairTop[tens][units] = count
  const pairTop = Array.from({length: 10}, () => Array(10).fill(0));
  const pairBottom = Array.from({length: 10}, () => Array(10).fill(0));

  draws.forEach(d => {
    const tTop = parseInt(d.top2[0], 10);
    const uTop = parseInt(d.top2[1], 10);
    const tBot = parseInt(d.bottom2[0], 10);
    const uBot = parseInt(d.bottom2[1], 10);

    counts.tensTop[tTop]++;
    counts.unitsTop[uTop]++;
    counts.tensBottom[tBot]++;
    counts.unitsBottom[uBot]++;

    pairTop[tTop][uTop]++;
    pairBottom[tBot][uBot]++;
  });

  // Top 4 units for each tens
  function getTopUnitsForTens(matrix, tensCounts) {
    const res = {};
    for (let t = 0; t <= 9; t++) {
      const unitsList = matrix[t].map((cnt, u) => ({ unit: u, count: cnt }));
      unitsList.sort((a, b) => b.count - a.count);
      const top4 = unitsList.slice(0, 4);
      const totalOccurrences = tensCounts[t];
      const top4CountSum = top4.reduce((s, x) => s + x.count, 0);
      const coveragePct = totalOccurrences > 0 ? ((top4CountSum / totalOccurrences) * 100).toFixed(1) : 0;
      res[t] = {
        total: totalOccurrences,
        top4Units: top4.map(x => x.unit),
        top4Pairs: top4.map(x => `${t}${x.unit} (${x.count}ครั้ง)`),
        pairsOnly: top4.map(x => `${t}${x.unit}`),
        unitsWithCount: top4,
        coveragePct: coveragePct
      };
    }
    return res;
  }

  // Sort digit rankings
  function rankDigits(arr) {
    const total = arr.reduce((s, x) => s + x, 0);
    return arr.map((cnt, digit) => ({
      digit,
      count: cnt,
      pct: ((cnt / total) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  }

  return {
    name,
    totalDraws: draws.length,
    rankTensTop: rankDigits(counts.tensTop),
    rankUnitsTop: rankDigits(counts.unitsTop),
    rankTensBottom: rankDigits(counts.tensBottom),
    rankUnitsBottom: rankDigits(counts.unitsBottom),
    pairingTop: getTopUnitsForTens(pairTop, counts.tensTop),
    pairingBottom: getTopUnitsForTens(pairBottom, counts.tensBottom)
  };
}

// 1. Regular stocks: Morning, Afternoon, Combined
const regMorning = flattenDraws({ nikkeiM: sets.regular.nikkeiM, chinaM: sets.regular.chinaM, hangsengM: sets.regular.hangsengM });
const regAfternoon = flattenDraws({ nikkeiA: sets.regular.nikkeiA, chinaA: sets.regular.chinaA, hangsengA: sets.regular.hangsengA });
const regAll = regMorning.concat(regAfternoon);

// 2. VIP stocks: Morning, Afternoon, Combined
const vipMorning = flattenDraws({ nikkeiVipM: sets.vip.nikkeiVipM, chinaVipM: sets.vip.chinaVipM, hangsengVipM: sets.vip.hangsengVipM });
const vipAfternoon = flattenDraws({ nikkeiVipA: sets.vip.nikkeiVipA, chinaVipA: sets.vip.chinaVipA, hangsengVipA: sets.vip.hangsengVipA });
const vipAll = vipMorning.concat(vipAfternoon);

const results = {
  regAll: analyzeCategory(regAll, 'หุ้นปกติ รวมทั้งหมด'),
  regMorning: analyzeCategory(regMorning, 'หุ้นปกติ รอบเช้า'),
  regAfternoon: analyzeCategory(regAfternoon, 'หุ้นปกติ รอบบ่าย'),
  vipAll: analyzeCategory(vipAll, 'หุ้น VIP รวมทั้งหมด'),
  vipMorning: analyzeCategory(vipMorning, 'หุ้น VIP รอบเช้า'),
  vipAfternoon: analyzeCategory(vipAfternoon, 'หุ้น VIP รอบบ่าย')
};

fs.writeFileSync(path.join(__dirname, 'tens_units_pairing_results.json'), JSON.stringify(results, null, 2), 'utf8');
console.log('Analysis complete! File written to scratch/tens_units_pairing_results.json');
