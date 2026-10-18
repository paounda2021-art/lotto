const fs = require('fs');
const path = require('path');

function getDraws(file) {
  const p = path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', file);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const datasets = {
  nikkeiM: getDraws('lotto_data_nikkei_morning.json'),
  chinaM: getDraws('lotto_data_china_morning.json'),
  hangsengM: getDraws('lotto_data_hangseng_morning.json'),
  nikkeiA: getDraws('lotto_data_nikkei_afternoon.json'),
  chinaA: getDraws('lotto_data_china_afternoon.json'),
  hangsengA: getDraws('lotto_data_hangseng_afternoon.json'),
  nikkeiVipM: getDraws('lotto_data_nikkei_vip_morning.json'),
  chinaVipM: getDraws('lotto_data_china_vip_morning.json'),
  hangsengVipM: getDraws('lotto_data_hangseng_vip_morning.json'),
  nikkeiVipA: getDraws('lotto_data_nikkei_vip_afternoon.json'),
  chinaVipA: getDraws('lotto_data_china_vip_afternoon.json'),
  hangsengVipA: getDraws('lotto_data_hangseng_vip_afternoon.json')
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

const clusters = [
  {
    title: '1. หุ้นปกติ รอบเช้า (3 หวย: นิเคอิ เช้า 09:30 ➡️ จีน เช้า 10:30 ➡️ ฮั่งเส็ง เช้า 11:00)',
    steps: ['nikkeiM', 'chinaM', 'hangsengM'],
    candidateCards: [
      { key: 'nikkeiM', label: 'การ์ด นิเคอิ (เช้า)' },
      { key: 'chinaM', label: 'การ์ด จีน (เช้า)' },
      { key: 'hangsengM', label: 'การ์ด ฮั่งเส็ง (เช้า)' },
      { key: 'UNIFIED', label: 'การ์ด รวมสถิติเช้า (3 หวย)' }
    ]
  },
  {
    title: '2. หุ้นปกติ รอบบ่าย (3 หวย: นิเคอิ บ่าย 13:00 ➡️ จีน บ่าย 14:00 ➡️ ฮั่งเส็ง บ่าย 15:30)',
    steps: ['nikkeiA', 'chinaA', 'hangsengA'],
    candidateCards: [
      { key: 'nikkeiA', label: 'การ์ด นิเคอิ (บ่าย)' },
      { key: 'chinaA', label: 'การ์ด จีน (บ่าย)' },
      { key: 'hangsengA', label: 'การ์ด ฮั่งเส็ง (บ่าย)' },
      { key: 'UNIFIED', label: 'การ์ด รวมสถิติบ่าย (3 หวย)' }
    ]
  },
  {
    title: '3. หุ้น VIP รอบเช้า (3 หวย: นิเคอิ VIP เช้า 09:30 ➡️ จีน VIP เช้า 10:30 ➡️ ฮั่งเส็ง VIP เช้า 11:00)',
    steps: ['nikkeiVipM', 'chinaVipM', 'hangsengVipM'],
    candidateCards: [
      { key: 'nikkeiVipM', label: 'การ์ด นิเคอิ VIP (เช้า)' },
      { key: 'chinaVipM', label: 'การ์ด จีน VIP (เช้า)' },
      { key: 'hangsengVipM', label: 'การ์ด ฮั่งเส็ง VIP (เช้า)' },
      { key: 'UNIFIED', label: 'การ์ด รวมสถิติ VIP เช้า (3 หวย)' }
    ]
  },
  {
    title: '4. หุ้น VIP รอบบ่าย (3 หวย: นิเคอิ VIP บ่าย 13:00 ➡️ จีน VIP บ่าย 14:00 ➡️ ฮั่งเส็ง VIP บ่าย 15:30)',
    steps: ['nikkeiVipA', 'chinaVipA', 'hangsengVipA'],
    candidateCards: [
      { key: 'nikkeiVipA', label: 'การ์ด นิเคอิ VIP (บ่าย)' },
      { key: 'chinaVipA', label: 'การ์ด จีน VIP (บ่าย)' },
      { key: 'hangsengVipA', label: 'การ์ด ฮั่งเส็ง VIP (บ่าย)' },
      { key: 'UNIFIED', label: 'การ์ด รวมสถิติ VIP บ่าย (3 หวย)' }
    ]
  }
];

const results = [];

clusters.forEach(cl => {
  const clRes = { title: cl.title, cards: [] };

  cl.candidateCards.forEach(card => {
    let sourceDraws;
    if (card.key === 'UNIFIED') {
      sourceDraws = [];
      cl.steps.forEach(s => sourceDraws.push(...datasets[s]));
    } else {
      sourceDraws = datasets[card.key];
    }

    const datesSet = new Set();
    cl.steps.forEach(f => {
      datasets[f].forEach(d => {
        if (d.date && d.date <= '2026-10-12') datesSet.add(d.date);
      });
    });
    const sortedDates = Array.from(datesSet).sort().reverse();

    let totalRounds = 0;
    let hitD0Only = 0;
    let hitD1Only = 0;
    let hitBothDigits = 0;
    let hitAnyDigit = 0;
    let step1Hits = 0;
    let step2Hits = 0;
    let step3Hits = 0;
    let misses = 0;
    let top6Hits = 0;

    sortedDates.forEach(dt => {
      const draws = cl.steps.map(f => parseDraw(datasets[f].find(x => x.date === dt)));
      const anyOpen = draws.some(d => d && !d.isClosed);
      if (!anyOpen) return;

      let dow = null;
      for (const f of cl.steps) {
        const found = datasets[f].find(x => x.date === dt);
        if (found && found.dayOfWeek) { dow = found.dayOfWeek; break; }
      }
      if (!dow) return;

      const pastSource = sourceDraws.filter(d => d.date < dt);
      if (pastSource.length < 5) return;

      const model = Ey(pastSource, dow);
      const d0 = model.d0;
      const d1 = model.d1;
      const top6List = model.top6List;

      totalRounds++;

      function checkDraw(draw) {
        if (!draw || draw.isClosed) return { d0: false, d1: false, top6: false };
        const h0 = draw.top2.includes(String(d0)) || draw.bottom2.includes(String(d0));
        const h1 = draw.top2.includes(String(d1)) || draw.bottom2.includes(String(d1));
        const hTop6 = top6List.includes(draw.top2) || top6List.includes(draw.bottom2);
        return { d0: h0, d1: h1, anyDigit: h0 || h1, top6: hTop6 };
      }

      const resList = draws.map(checkDraw);

      const d0HitAnyStep = resList.some(r => r.d0);
      const d1HitAnyStep = resList.some(r => r.d1);
      const top6HitAnyStep = resList.some(r => r.top6);

      if (d0HitAnyStep) hitD0Only++;
      if (d1HitAnyStep) hitD1Only++;
      if (d0HitAnyStep && d1HitAnyStep) hitBothDigits++;
      if (d0HitAnyStep || d1HitAnyStep) hitAnyDigit++;
      else misses++;

      if (top6HitAnyStep) top6Hits++;

      // Sequential chase: Step 1 -> Step 2 -> Step 3
      if (resList[0].anyDigit) {
        step1Hits++;
      } else if (resList[1].anyDigit) {
        step2Hits++;
      } else if (resList[2].anyDigit) {
        step3Hits++;
      }
    });

    const d0Rate = (hitD0Only / totalRounds * 100).toFixed(1);
    const d1Rate = (hitD1Only / totalRounds * 100).toFixed(1);
    const anyRate = (hitAnyDigit / totalRounds * 100).toFixed(1);
    const missRate = (misses / totalRounds * 100).toFixed(1);
    const s1Rate = (step1Hits / totalRounds * 100).toFixed(1);
    const s2Rate = (step2Hits / totalRounds * 100).toFixed(1);
    const s3Rate = (step3Hits / totalRounds * 100).toFixed(1);
    const top6Rate = (top6Hits / totalRounds * 100).toFixed(1);

    // Pick best between d0 vs d1
    const bestDigitType = hitD0Only > hitD1Only ? 'เด่นหลัก' : (hitD1Only > hitD0Only ? 'เด่นรอง' : 'เท่ากัน');

    clRes.cards.push({
      cardKey: card.key,
      label: card.label,
      totalRounds,
      anyRate,
      missRate,
      d0Rate,
      d1Rate,
      bestDigitType,
      s1Rate,
      s2Rate,
      s3Rate,
      top6Rate
    });
  });

  results.push(clRes);
});

// Output clean report
console.log('=== ผลการวิเคราะห์สูตรล่า 3 หวย แยกเช้า-บ่าย (Walk-Forward Historical Testing) ===\n');

results.forEach(cl => {
  console.log(`📌 ${cl.title}`);
  console.log('-'.repeat(90));
  console.log(
    'การ์ดต้นทาง'.padEnd(30) + 
    'เข้าเป้ารวม'.padEnd(12) + 
    'อัตราหลุด'.padEnd(10) + 
    'เด่นหลักเข้า'.padEnd(14) + 
    'เด่นรองเข้า'.padEnd(14) + 
    'ตัวที่แม่นกว่า'.padEnd(14) +
    'เจาะ Top6'
  );
  console.log('-'.repeat(90));

  cl.cards.forEach(c => {
    console.log(
      c.label.padEnd(30) + 
      `${c.anyRate}%`.padEnd(12) + 
      `${c.missRate}%`.padEnd(10) + 
      `${c.d0Rate}%`.padEnd(14) + 
      `${c.d1Rate}%`.padEnd(14) + 
      `${c.bestDigitType} (${c.bestDigitType === 'เด่นหลัก' ? c.d0Rate : c.d1Rate}%)`.padEnd(16) +
      `${c.top6Rate}%`
    );
  });
  console.log('\n');
});

// Compute actual numbers for each day of week using the best card for each cluster
const daysOfWeek = [
  { code: 'Mon', name: 'วันจันทร์' },
  { code: 'Tue', name: 'วันอังคาร (วันนี้ 13 ต.ค.)' },
  { code: 'Wed', name: 'วันพุธ' },
  { code: 'Thu', name: 'วันพฤหัสบดี' },
  { code: 'Fri', name: 'วันศุกร์' },
  { code: 'ALL', name: 'ทุกวันทำการ (ALL)' }
];

console.log('=== ตารางชุดเลขจริงที่แนะนำให้ใช้แยก เช้า-บ่าย (จันทร์ - ศุกร์) ===\n');

const recommendedCards = [
  { clusterName: '1. หุ้นปกติ รอบเช้า (นิเคอิ ➡️ จีน ➡️ ฮั่งเส็ง)', bestCardKey: 'hangsengM', bestCardLabel: 'ฮั่งเส็ง (เช้า)' },
  { clusterName: '2. หุ้นปกติ รอบบ่าย (นิเคอิ ➡️ จีน ➡️ ฮั่งเส็ง)', bestCardKey: 'chinaA', bestCardLabel: 'จีน (บ่าย)' },
  { clusterName: '3. หุ้น VIP รอบเช้า (นิเคอิ VIP ➡️ จีน VIP ➡️ ฮั่งเส็ง VIP)', bestCardKey: 'hangsengVipM', bestCardLabel: 'ฮั่งเส็ง VIP (เช้า)' },
  { clusterName: '4. หุ้น VIP รอบบ่าย (นิเคอิ VIP ➡️ จีน VIP ➡️ ฮั่งเส็ง VIP)', bestCardKey: 'hangsengVipA', bestCardLabel: 'ฮั่งเส็ง VIP (บ่าย)' }
];

// Let's print out the exact numbers for each day of week
fs.writeFileSync('scratch/deep_analysis_result.json', JSON.stringify({ results }, null, 2));
