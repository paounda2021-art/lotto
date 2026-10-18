const fs = require('fs');
const path = require('path');

function getDraws(file) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', file);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const nikkeiM = getDraws('lotto_data_nikkei_morning.json');
const chinaM = getDraws('lotto_data_china_morning.json');
const hangsengM = getDraws('lotto_data_hangseng_morning.json');

const nikkeiA = getDraws('lotto_data_nikkei_afternoon.json');
const chinaA = getDraws('lotto_data_china_afternoon.json');
const hangsengA = getDraws('lotto_data_hangseng_afternoon.json');

const nikkeiVipM = getDraws('lotto_data_nikkei_vip_morning.json');
const chinaVipM = getDraws('lotto_data_china_vip_morning.json');
const hangsengVipM = getDraws('lotto_data_hangseng_vip_morning.json');

const nikkeiVipA = getDraws('lotto_data_nikkei_vip_afternoon.json');
const chinaVipA = getDraws('lotto_data_china_vip_afternoon.json');
const hangsengVipA = getDraws('lotto_data_hangseng_vip_afternoon.json');

const allDatasets = {
  nikkeiM, chinaM, hangsengM,
  nikkeiA, chinaA, hangsengA,
  nikkeiVipM, chinaVipM, hangsengVipM,
  nikkeiVipA, chinaVipA, hangsengVipA
};

function parseDraw(d) {
  if (!d) return null;
  const top3 = String(d.top3 || '').trim();
  const bottom2 = String(d.bottom2 || '').trim();
  if (/^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2)) {
    return {
      top3,
      top2: d.top2 || (top3.length >= 2 ? top3.slice(-2) : ''),
      bottom2,
      isClosed: false
    };
  }
  return { isClosed: true, raw: top3 + bottom2 };
}

function Ey(e, t) {
  const o = e.filter(N => t === 'ALL' || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    const y = '' + (N.top3 || '') + (N.bottom2 || '');
    y.split('').forEach(p => {
      const f = parseInt(p, 10);
      if (!isNaN(f)) i[f] = (i[f] || 0) + 1;
    });
    if (N.top2 && /^[0-9]{2}$/.test(N.top2)) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2 && /^[0-9]{2}$/.test(N.bottom2)) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });

  const d = Object.entries(i).map(([N, y]) => {
    const p = parseInt(N, 10);
    const f = a > 0 ? Math.round(y / (a * 5) * 1000) / 10 : 0;
    return { digit: p, count: y, percent: f };
  }).sort((N, y) => y.count - N.count).slice(0, 5);

  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return { d0: d[0].digit, d1: d[1].digit, pairs: l.map(x => x.pair).join(' '), top6List: l.map(x => x.pair) };
}

// Function to simulate a 3-lotto chase strategy across historical dates
function simulateCluster(name, stepFiles, candidateCardKeys) {
  console.log(`\n==================================================`);
  console.log(`🔍 SIMULATION: ${name}`);
  console.log(`Steps: ${stepFiles.join(' ➡️ ')}`);
  console.log(`==================================================`);

  // Candidate sources to test
  candidateCardKeys.forEach(cardKey => {
    let sourceDraws;
    if (cardKey.startsWith('UNIFIED:')) {
      const keys = cardKey.replace('UNIFIED:', '').split(',');
      sourceDraws = [];
      keys.forEach(k => sourceDraws.push(...allDatasets[k]));
    } else {
      sourceDraws = allDatasets[cardKey];
    }

    // Get all valid dates where at least one of the 3 lottos had a draw
    const datesSet = new Set();
    stepFiles.forEach(f => {
      allDatasets[f].forEach(d => {
        if (d.date && d.date <= '2026-10-12') datesSet.add(d.date);
      });
    });
    const sortedDates = Array.from(datesSet).sort().reverse(); // newest to oldest

    let totalRounds = 0;
    let step1Wins = 0;
    let step2Wins = 0;
    let step3Wins = 0;
    let totalWins = 0;
    let totalMisses = 0;
    let totalAllClosed = 0;
    let top6Hits = 0;

    sortedDates.forEach(dt => {
      const draws = stepFiles.map(f => parseDraw(allDatasets[f].find(x => x.date === dt)));
      const anyOpen = draws.some(d => d && !d.isClosed);
      if (!anyOpen) {
        totalAllClosed++;
        return; // all 3 markets closed, no play possible
      }

      // Find dayOfWeek from any valid draw
      let dow = null;
      for (const f of stepFiles) {
        const found = allDatasets[f].find(x => x.date === dt);
        if (found && found.dayOfWeek) { dow = found.dayOfWeek; break; }
      }
      if (!dow) return;

      // Walk-forward: only use source draws strictly before dt
      const pastSource = sourceDraws.filter(d => d.date < dt);
      if (pastSource.length < 5) return; // not enough history

      const model = Ey(pastSource, dow);
      const digitsToWatch = [model.d0, model.d1];
      const top6Pairs = model.top6List;

      totalRounds++;

      function checkWin(draw) {
        if (!draw || draw.isClosed) return { won: false, closed: true, top6: false };
        const digitWon = digitsToWatch.some(dig => draw.top2.includes(String(dig)) || draw.bottom2.includes(String(dig)));
        const pairWon = top6Pairs.some(p => p === draw.top2 || p === draw.bottom2);
        return { won: digitWon, closed: false, top6: pairWon };
      }

      const r1 = checkWin(draws[0]);
      const r2 = checkWin(draws[1]);
      const r3 = checkWin(draws[2]);

      let roundWon = false;
      let roundTop6 = false;

      if (r1.won) {
        step1Wins++;
        roundWon = true;
        if (r1.top6) roundTop6 = true;
      } else if (r2.won) {
        step2Wins++;
        roundWon = true;
        if (r2.top6) roundTop6 = true;
      } else if (r3.won) {
        step3Wins++;
        roundWon = true;
        if (r3.top6) roundTop6 = true;
      } else {
        totalMisses++;
      }

      if (roundWon) totalWins++;
      if (roundTop6) top6Hits++;
    });

    const winPct = (totalWins / totalRounds * 100).toFixed(1);
    const missPct = (totalMisses / totalRounds * 100).toFixed(1);
    const s1Pct = (step1Wins / totalRounds * 100).toFixed(1);
    const s2Pct = (step2Wins / totalRounds * 100).toFixed(1);
    const s3Pct = (step3Wins / totalRounds * 100).toFixed(1);
    const top6Pct = (top6Hits / totalRounds * 100).toFixed(1);

    console.log(`Card: [${cardKey.padEnd(20)}] | งวดทดสอบ: ${totalRounds} | เข้าเป้ารวม: ${winPct}% (${totalWins}/${totalRounds}) | หลุด: ${missPct}% (${totalMisses})`);
    console.log(`   ➡️ เข้าสเต็ป 1: ${s1Pct}% | เข้าสเต็ป 2: ${s2Pct}% | เข้าสเต็ป 3: ${s3Pct}% | เจาะ Top 6 แตก: ${top6Pct}%`);
  });
}

// 1. หุ้นปกติ รอบเช้า (3 หวย: นิเคอิ เช้า ➡️ จีน เช้า ➡️ ฮั่งเส็ง เช้า)
simulateCluster(
  '1. หุ้นปกติ รอบเช้า (นิเคอิ เช้า ➡️ จีน เช้า ➡️ ฮั่งเส็ง เช้า)',
  ['nikkeiM', 'chinaM', 'hangsengM'],
  ['nikkeiM', 'chinaM', 'hangsengM', 'UNIFIED:nikkeiM,chinaM,hangsengM']
);

// 2. หุ้นปกติ รอบบ่าย (3 หวย: นิเคอิ บ่าย ➡️ จีน บ่าย ➡️ ฮั่งเส็ง บ่าย)
simulateCluster(
  '2. หุ้นปกติ รอบบ่าย (นิเคอิ บ่าย ➡️ จีน บ่าย ➡️ ฮั่งเส็ง บ่าย)',
  ['nikkeiA', 'chinaA', 'hangsengA'],
  ['nikkeiA', 'chinaA', 'hangsengA', 'UNIFIED:nikkeiA,chinaA,hangsengA']
);

// 3. หุ้น VIP รอบเช้า (3 หวย: นิเคอิ VIP เช้า ➡️ จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า)
simulateCluster(
  '3. หุ้น VIP รอบเช้า (นิเคอิ VIP เช้า ➡️ จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า)',
  ['nikkeiVipM', 'chinaVipM', 'hangsengVipM'],
  ['nikkeiVipM', 'chinaVipM', 'hangsengVipM', 'UNIFIED:nikkeiVipM,chinaVipM,hangsengVipM']
);

// 4. หุ้น VIP รอบบ่าย (3 หวย: นิเคอิ VIP บ่าย ➡️ จีน VIP บ่าย ➡️ ฮั่งเส็ง VIP บ่าย)
simulateCluster(
  '4. หุ้น VIP รอบบ่าย (นิเคอิ VIP บ่าย ➡️ จีน VIP บ่าย ➡️ ฮั่งเส็ง VIP บ่าย)',
  ['nikkeiVipA', 'chinaVipA', 'hangsengVipA'],
  ['nikkeiVipA', 'chinaVipA', 'hangsengVipA', 'UNIFIED:nikkeiVipA,chinaVipA,hangsengVipA']
);
