const fs = require('fs');
const path = require('path');

function getDraws(f) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return data.filter(x => /^\d{2}$/.test(x.top2) && /^\d{2}$/.test(x.bottom2));
}

const data = {
  regM: {
    nk: getDraws('lotto_data_nikkei_morning.json'),
    cn: getDraws('lotto_data_china_morning.json'),
    hs: getDraws('lotto_data_hangseng_morning.json')
  },
  regA: {
    nk: getDraws('lotto_data_nikkei_afternoon.json'),
    cn: getDraws('lotto_data_china_afternoon.json'),
    hs: getDraws('lotto_data_hangseng_afternoon.json')
  },
  vipM: {
    nk: getDraws('lotto_data_nikkei_vip_morning.json'),
    cn: getDraws('lotto_data_china_vip_morning.json'),
    hs: getDraws('lotto_data_hangseng_vip_morning.json')
  },
  vipA: {
    nk: getDraws('lotto_data_nikkei_vip_afternoon.json'),
    cn: getDraws('lotto_data_china_vip_afternoon.json'),
    hs: getDraws('lotto_data_hangseng_vip_afternoon.json')
  }
};

// Calculate gaps for an ordered stream of draws (chronological order: oldest to newest)
function calculateGaps(drawsChronological, extractor) {
  // extractor returns the digit for a draw
  const gaps = {};
  for (let d = 0; d <= 9; d++) {
    gaps[d] = {
      digit: d,
      totalHits: 0,
      currentGap: 0,
      maxGap: 0,
      gapList: []
    };
  }

  let lastSeen = {};
  for (let d = 0; d <= 9; d++) lastSeen[d] = -1;

  drawsChronological.forEach((draw, idx) => {
    const val = extractor(draw);
    for (let d = 0; d <= 9; d++) {
      if (val === d) {
        gaps[d].totalHits++;
        const gap = lastSeen[d] === -1 ? idx : idx - lastSeen[d] - 1;
        gaps[d].gapList.push(gap);
        if (gap > gaps[d].maxGap) gaps[d].maxGap = gap;
        lastSeen[d] = idx;
      }
    }
  });

  const total = drawsChronological.length;
  for (let d = 0; d <= 9; d++) {
    gaps[d].currentGap = lastSeen[d] === -1 ? total : total - 1 - lastSeen[d];
    const sumGaps = gaps[d].gapList.reduce((a, b) => a + b, 0);
    gaps[d].avgGap = gaps[d].gapList.length > 0 ? (sumGaps / gaps[d].gapList.length).toFixed(1) : total;
    gaps[d].hitRatePct = ((gaps[d].totalHits / total) * 100).toFixed(1);
  }

  return Object.values(gaps);
}

// Evaluate group coverage (e.g. group of 3 digits) in sequence
function evaluateGroup(drawsChronological, group, extractor) {
  let hits = 0;
  let maxGap = 0;
  let currentGap = 0;
  let lastSeen = -1;

  drawsChronological.forEach((draw, idx) => {
    const val = extractor(draw);
    if (group.includes(val)) {
      hits++;
      const gap = lastSeen === -1 ? idx : idx - lastSeen - 1;
      if (gap > maxGap) maxGap = gap;
      lastSeen = idx;
    }
  });

  const total = drawsChronological.length;
  currentGap = lastSeen === -1 ? total : total - 1 - lastSeen;
  return {
    group: group.join('-'),
    hits,
    total,
    hitRatePct: ((hits / total) * 100).toFixed(1),
    maxGap,
    currentGap
  };
}

// Find best 3-digit and 4-digit groups
function findBestGroups(drawsChronological, extractor, size) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let best = [];

  function combinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    const res = [];
    arr.forEach((x, i) => {
      const rest = combinations(arr.slice(i + 1), k - 1);
      rest.forEach(r => res.push([x, ...r]));
    });
    return res;
  }

  const allCombs = combinations(digits, size);
  const evaluated = allCombs.map(c => evaluateGroup(drawsChronological, c, extractor));
  evaluated.sort((a, b) => {
    if (a.maxGap !== b.maxGap) return a.maxGap - b.maxGap; // lower maxGap first
    return b.hits - a.hits; // more hits
  });

  return evaluated.slice(0, 3);
}

// Daily session chase evaluation (3 lotto steps per day: Step 1 NK -> Step 2 CN -> Step 3 HS)
function evaluateSessionChase(dataset, group, posType) {
  // dataset has nk, cn, hs
  // align by date
  // collect dates that appear in nk, cn, hs
  const dateMap = {};
  dataset.nk.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].nk = d; });
  dataset.cn.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].cn = d; });
  dataset.hs.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].hs = d; });

  const sortedDates = Object.keys(dateMap).sort(); // chronological
  let totalDays = 0;
  let winDays = 0;
  let step1Wins = 0;
  let step2Wins = 0;
  let step3Wins = 0;
  let missedDays = 0;

  sortedDates.forEach(dt => {
    const item = dateMap[dt];
    if (!item.nk && !item.cn && !item.hs) return;
    totalDays++;

    const getVal = (d) => {
      if (!d) return null;
      if (posType === 'tensTop') return parseInt(d.top2[0], 10);
      if (posType === 'unitsTop') return parseInt(d.top2[1], 10);
      if (posType === 'tensBottom') return parseInt(d.bottom2[0], 10);
      if (posType === 'unitsBottom') return parseInt(d.bottom2[1], 10);
      return null;
    };

    const v1 = getVal(item.nk);
    const v2 = getVal(item.cn);
    const v3 = getVal(item.hs);

    if (v1 !== null && group.includes(v1)) {
      winDays++;
      step1Wins++;
    } else if (v2 !== null && group.includes(v2)) {
      winDays++;
      step2Wins++;
    } else if (v3 !== null && group.includes(v3)) {
      winDays++;
      step3Wins++;
    } else {
      missedDays++;
    }
  });

  return {
    group: group.join('-'),
    totalDays,
    winDays,
    winPct: ((winDays / totalDays) * 100).toFixed(1),
    step1Wins,
    step2Wins,
    step3Wins,
    missedDays
  };
}

// Flat chronological draws
function flatChronological(drawsObj) {
  let list = [];
  for (const k of Object.keys(drawsObj)) {
    list = list.concat(drawsObj[k]);
  }
  // sort by date ascending
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list;
}

const regAllDraws = flatChronological({ ...data.regM, ...data.regA });
const vipAllDraws = flatChronological({ ...data.vipM, ...data.vipA });

const extractors = {
  tensTop: d => parseInt(d.top2[0], 10),
  unitsTop: d => parseInt(d.top2[1], 10),
  tensBottom: d => parseInt(d.bottom2[0], 10),
  unitsBottom: d => parseInt(d.bottom2[1], 10)
};

const output = {
  regular: {
    tensTopGaps: calculateGaps(regAllDraws, extractors.tensTop).sort((a, b) => b.totalHits - a.totalHits),
    unitsTopGaps: calculateGaps(regAllDraws, extractors.unitsTop).sort((a, b) => b.totalHits - a.totalHits),
    tensBottomGaps: calculateGaps(regAllDraws, extractors.tensBottom).sort((a, b) => b.totalHits - a.totalHits),
    unitsBottomGaps: calculateGaps(regAllDraws, extractors.unitsBottom).sort((a, b) => b.totalHits - a.totalHits),
    best3Groups: {
      tensTop: findBestGroups(regAllDraws, extractors.tensTop, 3),
      unitsTop: findBestGroups(regAllDraws, extractors.unitsTop, 3),
      tensBottom: findBestGroups(regAllDraws, extractors.tensBottom, 3),
      unitsBottom: findBestGroups(regAllDraws, extractors.unitsBottom, 3)
    },
    best4Groups: {
      tensTop: findBestGroups(regAllDraws, extractors.tensTop, 4),
      unitsTop: findBestGroups(regAllDraws, extractors.unitsTop, 4),
      tensBottom: findBestGroups(regAllDraws, extractors.tensBottom, 4),
      unitsBottom: findBestGroups(regAllDraws, extractors.unitsBottom, 4)
    }
  },
  vip: {
    tensTopGaps: calculateGaps(vipAllDraws, extractors.tensTop).sort((a, b) => b.totalHits - a.totalHits),
    unitsTopGaps: calculateGaps(vipAllDraws, extractors.unitsTop).sort((a, b) => b.totalHits - a.totalHits),
    tensBottomGaps: calculateGaps(vipAllDraws, extractors.tensBottom).sort((a, b) => b.totalHits - a.totalHits),
    unitsBottomGaps: calculateGaps(vipAllDraws, extractors.unitsBottom).sort((a, b) => b.totalHits - a.totalHits),
    best3Groups: {
      tensTop: findBestGroups(vipAllDraws, extractors.tensTop, 3),
      unitsTop: findBestGroups(vipAllDraws, extractors.unitsTop, 3),
      tensBottom: findBestGroups(vipAllDraws, extractors.tensBottom, 3),
      unitsBottom: findBestGroups(vipAllDraws, extractors.unitsBottom, 3)
    },
    best4Groups: {
      tensTop: findBestGroups(vipAllDraws, extractors.tensTop, 4),
      unitsTop: findBestGroups(vipAllDraws, extractors.unitsTop, 4),
      tensBottom: findBestGroups(vipAllDraws, extractors.tensBottom, 4),
      unitsBottom: findBestGroups(vipAllDraws, extractors.unitsBottom, 4)
    }
  }
};

fs.writeFileSync(path.join(__dirname, 'gaps_and_groups_results.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('Gaps and groups analysis finished!');
