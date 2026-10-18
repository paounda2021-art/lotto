const fs = require('fs');
const path = require('path');

function getDraws(f) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8'))
    .filter(x => /^\d{2}$/.test(x.top2) && /^\d{2}$/.test(x.bottom2));
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

const dayProfiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'day_profiles.json'), 'utf8'));

// Backtest session chase (Step 1 NK -> Step 2 CN -> Step 3 HS)
function runBacktest(sessionSet, profileKey, isVip, isAfternoon) {
  // align by date
  const dateMap = {};
  sessionSet.nk.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].nk = d; });
  sessionSet.cn.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].cn = d; });
  sessionSet.hs.forEach(d => { if (!dateMap[d.date]) dateMap[d.date] = {}; dateMap[d.date].hs = d; });

  const sortedDates = Object.keys(dateMap).sort();
  const daysResult = {
    Mon: { total: 0, winPairTop: 0, winPairBot: 0, winPairAny: 0, winTensTop: 0, winUnitsTop: 0, winTensBot: 0, winUnitsBot: 0, s1: 0, s2: 0, s3: 0, miss: 0 },
    Tue: { total: 0, winPairTop: 0, winPairBot: 0, winPairAny: 0, winTensTop: 0, winUnitsTop: 0, winTensBot: 0, winUnitsBot: 0, s1: 0, s2: 0, s3: 0, miss: 0 },
    Wed: { total: 0, winPairTop: 0, winPairBot: 0, winPairAny: 0, winTensTop: 0, winUnitsTop: 0, winTensBot: 0, winUnitsBot: 0, s1: 0, s2: 0, s3: 0, miss: 0 },
    Thu: { total: 0, winPairTop: 0, winPairBot: 0, winPairAny: 0, winTensTop: 0, winUnitsTop: 0, winTensBot: 0, winUnitsBot: 0, s1: 0, s2: 0, s3: 0, miss: 0 },
    Fri: { total: 0, winPairTop: 0, winPairBot: 0, winPairAny: 0, winTensTop: 0, winUnitsTop: 0, winTensBot: 0, winUnitsBot: 0, s1: 0, s2: 0, s3: 0, miss: 0 }
  };

  let allTotal = 0;
  let allWinPairAny = 0;
  let allWinTensTop = 0;
  let allWinUnitsTop = 0;
  let allWinTensBot = 0;
  let allWinUnitsBot = 0;
  let allS1 = 0, allS2 = 0, allS3 = 0, allMiss = 0;

  sortedDates.forEach(dt => {
    const item = dateMap[dt];
    const sampleDraw = item.nk || item.cn || item.hs;
    if (!sampleDraw) return;
    const dayOfWeek = sampleDraw.dayOfWeek;
    if (!daysResult[dayOfWeek]) return; // only Mon-Fri

    const profGroup = isVip ? dayProfiles[dayOfWeek].vip : dayProfiles[dayOfWeek].reg;
    const prof = isAfternoon ? profGroup.afternoon : profGroup.morning;

    // Rules:
    // Top 2 Tens + Top 4 Units -> 8 pairs
    const tensTop2 = prof.tensTop.slice(0, 2);
    const unitsTop4 = prof.unitsTop.slice(0, 4);
    const tensBot2 = prof.tensBottom.slice(0, 2);
    const unitsBot4 = prof.unitsBottom.slice(0, 4);

    const targetPairsTop = [];
    tensTop2.forEach(t => unitsTop4.forEach(u => targetPairsTop.push(`${t}${u}`)));
    const targetPairsBot = [];
    tensBot2.forEach(t => unitsBot4.forEach(u => targetPairsBot.push(`${t}${u}`)));

    daysResult[dayOfWeek].total++;
    allTotal++;

    // Check step 1, 2, 3
    let hitStep = null;
    let hitTop = false;
    let hitBot = false;
    let hitTensT = false;
    let hitUnitsT = false;
    let hitTensB = false;
    let hitUnitsB = false;

    const steps = [item.nk, item.cn, item.hs];
    steps.forEach((st, idx) => {
      if (!st) return;
      const tTop = parseInt(st.top2[0], 10);
      const uTop = parseInt(st.top2[1], 10);
      const tBot = parseInt(st.bottom2[0], 10);
      const uBot = parseInt(st.bottom2[1], 10);

      const isTopHit = targetPairsTop.includes(st.top2);
      const isBotHit = targetPairsBot.includes(st.bottom2);

      if (tensTop2.includes(tTop)) hitTensT = true;
      if (unitsTop4.includes(uTop)) hitUnitsT = true;
      if (tensBot2.includes(tBot)) hitTensB = true;
      if (unitsBot4.includes(uBot)) hitUnitsB = true;

      if (isTopHit) hitTop = true;
      if (isBotHit) hitBot = true;

      if ((isTopHit || isBotHit) && hitStep === null) {
        hitStep = idx + 1;
      }
    });

    if (hitTop) daysResult[dayOfWeek].winPairTop++;
    if (hitBot) daysResult[dayOfWeek].winPairBot++;
    if (hitTop || hitBot) {
      daysResult[dayOfWeek].winPairAny++;
      allWinPairAny++;
    }

    if (hitTensT) { daysResult[dayOfWeek].winTensTop++; allWinTensTop++; }
    if (hitUnitsT) { daysResult[dayOfWeek].winUnitsTop++; allWinUnitsTop++; }
    if (hitTensB) { daysResult[dayOfWeek].winTensBot++; allWinTensBot++; }
    if (hitUnitsB) { daysResult[dayOfWeek].winUnitsBot++; allWinUnitsBot++; }

    if (hitStep === 1) { daysResult[dayOfWeek].s1++; allS1++; }
    else if (hitStep === 2) { daysResult[dayOfWeek].s2++; allS2++; }
    else if (hitStep === 3) { daysResult[dayOfWeek].s3++; allS3++; }
    else { daysResult[dayOfWeek].miss++; allMiss++; }
  });

  return {
    allTotal,
    allWinPairAny,
    pairAnyPct: ((allWinPairAny / allTotal) * 100).toFixed(1),
    allWinTensTop,
    tensTopPct: ((allWinTensTop / allTotal) * 100).toFixed(1),
    allWinUnitsTop,
    unitsTopPct: ((allWinUnitsTop / allTotal) * 100).toFixed(1),
    allWinTensBot,
    tensBotPct: ((allWinTensBot / allTotal) * 100).toFixed(1),
    allWinUnitsBot,
    unitsBotPct: ((allWinUnitsBot / allTotal) * 100).toFixed(1),
    allS1,
    allS2,
    allS3,
    allMiss,
    byDay: daysResult
  };
}

const summary = {
  regMorning: runBacktest(data.regM, 'reg', false, false),
  regAfternoon: runBacktest(data.regA, 'reg', false, true),
  vipMorning: runBacktest(data.vipM, 'vip', true, false),
  vipAfternoon: runBacktest(data.vipA, 'vip', true, true)
};

fs.writeFileSync(path.join(__dirname, 'backtest_summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log('Backtest complete! Written to scratch/backtest_summary.json');
