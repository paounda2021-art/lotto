const fs = require('fs');
const path = require('path');

function getDraws(f) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'downloaded_target_worker', 'kv_data', f), 'utf8'));
}

function parseDraw(d) {
  if (!d) return null;
  const top3 = String(d.top3 || '').trim();
  const bottom2 = String(d.bottom2 || '').trim();
  if (/^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2)) {
    return { top2: d.top2 || (top3.length >= 2 ? top3.slice(-2) : ''), bottom2, isClosed: false };
  }
  return { isClosed: true };
}

function Ey(e, t) {
  const o = e.filter(N => t === 'ALL' || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    const y = '' + (N.top3 || '') + (N.bottom2 || '');
    y.split('').forEach(p => { const f = parseInt(p, 10); if (!isNaN(f)) i[f] = (i[f] || 0) + 1; });
    if (N.top2 && /^[0-9]{2}$/.test(N.top2)) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2 && /^[0-9]{2}$/.test(N.bottom2)) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });
  const d = Object.entries(i).map(([N, y]) => ({ digit: parseInt(N, 10), count: y })).sort((N, y) => y.count - N.count).slice(0, 5);
  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return { d0: d[0].digit, d1: d[1].digit, pairs: l.map(x => x.pair).join(' ') };
}

const tests = [
  {
    name: '1. หุ้นปกติ เช้า (นิเคอิ เช้า ➡️ จีน เช้า ➡️ ฮั่งเส็ง เช้า)',
    cardFile: 'lotto_data_nikkei_morning.json',
    cardName: 'การ์ด นิเคอิ (เช้า)',
    steps: ['lotto_data_nikkei_morning.json', 'lotto_data_china_morning.json', 'lotto_data_hangseng_morning.json']
  },
  {
    name: '1. หุ้นปกติ เช้า (นิเคอิ เช้า ➡️ จีน เช้า ➡️ ฮั่งเส็ง เช้า)',
    cardFile: 'lotto_data_china_morning.json',
    cardName: 'การ์ด จีน (เช้า)',
    steps: ['lotto_data_nikkei_morning.json', 'lotto_data_china_morning.json', 'lotto_data_hangseng_morning.json']
  },
  {
    name: '2. หุ้นปกติ บ่าย (นิเคอิ บ่าย ➡️ จีน บ่าย ➡️ ฮั่งเส็ง บ่าย)',
    cardFile: 'lotto_data_china_afternoon.json',
    cardName: 'การ์ด จีน (บ่าย)',
    steps: ['lotto_data_nikkei_afternoon.json', 'lotto_data_china_afternoon.json', 'lotto_data_hangseng_afternoon.json']
  },
  {
    name: '2. หุ้นปกติ บ่าย (นิเคอิ บ่าย ➡️ จีน บ่าย ➡️ ฮั่งเส็ง บ่าย)',
    cardFile: 'lotto_data_hangseng_afternoon.json',
    cardName: 'การ์ด ฮั่งเส็ง (บ่าย)',
    steps: ['lotto_data_nikkei_afternoon.json', 'lotto_data_china_afternoon.json', 'lotto_data_hangseng_afternoon.json']
  },
  {
    name: '3. หุ้น VIP เช้า (นิเคอิ VIP เช้า ➡️ จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า)',
    cardFile: 'lotto_data_china_vip_morning.json',
    cardName: 'การ์ด จีน VIP (เช้า)',
    steps: ['lotto_data_nikkei_vip_morning.json', 'lotto_data_china_vip_morning.json', 'lotto_data_hangseng_vip_morning.json']
  },
  {
    name: '3. หุ้น VIP เช้า (นิเคอิ VIP เช้า ➡️ จีน VIP เช้า ➡️ ฮั่งเส็ง VIP เช้า)',
    cardFile: 'lotto_data_hangseng_vip_morning.json',
    cardName: 'การ์ด ฮั่งเส็ง VIP (เช้า)',
    steps: ['lotto_data_nikkei_vip_morning.json', 'lotto_data_china_vip_morning.json', 'lotto_data_hangseng_vip_morning.json']
  },
  {
    name: '4. หุ้น VIP บ่าย (นิเคอิ VIP บ่าย ➡️ จีน VIP บ่าย ➡️ ฮั่งเส็ง VIP บ่าย)',
    cardFile: 'lotto_data_china_vip_afternoon.json',
    cardName: 'การ์ด จีน VIP (บ่าย)',
    steps: ['lotto_data_nikkei_vip_afternoon.json', 'lotto_data_china_vip_afternoon.json', 'lotto_data_hangseng_vip_afternoon.json']
  },
  {
    name: '4. หุ้น VIP บ่าย (นิเคอิ VIP บ่าย ➡️ จีน VIP บ่าย ➡️ ฮั่งเส็ง VIP บ่าย)',
    cardFile: 'lotto_data_hangseng_vip_afternoon.json',
    cardName: 'การ์ด ฮั่งเส็ง VIP (บ่าย)',
    steps: ['lotto_data_nikkei_vip_afternoon.json', 'lotto_data_china_vip_afternoon.json', 'lotto_data_hangseng_vip_afternoon.json']
  }
];

console.log('=== การทดสอบเชิงลึก: เด่นหลัก vs เด่นรอง vs เล่นคู่เด่น+รอง (Walk-Forward ทุกงวด) ===\n');

tests.forEach(t => {
  const cardData = getDraws(t.cardFile);
  const stepData = t.steps.map(getDraws);

  const dates = cardData.map(x => x.date).filter(x => x <= '2026-10-12');

  let totalRounds = 0;
  let d0Wins = 0;
  let d1Wins = 0;
  let d0OnlyWins = 0;
  let d1OnlyWins = 0;
  let bothWins = 0;
  let anyWins = 0;
  let bothMissed = 0;

  // Track which step hit first for d0
  let d0Step1 = 0, d0Step2 = 0, d0Step3 = 0;

  dates.forEach(dt => {
    const past = cardData.filter(x => x.date < dt);
    if (past.length < 10) return;
    const rec = cardData.find(x => x.date === dt);
    if (!rec || !rec.dayOfWeek) return;

    const model = Ey(past, rec.dayOfWeek);
    const d0 = model.d0;
    const d1 = model.d1;

    const draws = stepData.map(d => parseDraw(d.find(x => x.date === dt))).filter(x => x && !x.isClosed);
    if (draws.length === 0) return;

    totalRounds++;

    let h0 = false;
    let h1 = false;
    let s0Hit = 0;

    draws.forEach((dr, sIdx) => {
      const hit0 = dr.top2.includes(String(d0)) || dr.bottom2.includes(String(d0));
      const hit1 = dr.top2.includes(String(d1)) || dr.bottom2.includes(String(d1));
      if (hit0 && !h0) { h0 = true; s0Hit = sIdx + 1; }
      if (hit1) h1 = true;
    });

    if (h0) {
      d0Wins++;
      if (s0Hit === 1) d0Step1++;
      else if (s0Hit === 2) d0Step2++;
      else if (s0Hit === 3) d0Step3++;
    }
    if (h1) d1Wins++;
    if (h0 && !h1) d0OnlyWins++;
    if (!h0 && h1) d1OnlyWins++;
    if (h0 && h1) bothWins++;
    if (h0 || h1) anyWins++;
    else bothMissed++;
  });

  const pD0 = (d0Wins / totalRounds * 100).toFixed(1);
  const pD1 = (d1Wins / totalRounds * 100).toFixed(1);
  const pAny = (anyWins / totalRounds * 100).toFixed(1);
  const pMiss = (bothMissed / totalRounds * 100).toFixed(1);
  const pD0Miss = ((totalRounds - d0Wins) / totalRounds * 100).toFixed(1);
  const pD1Miss = ((totalRounds - d1Wins) / totalRounds * 100).toFixed(1);

  console.log(`📌 ${t.name}`);
  console.log(`   ใช้: ${t.cardName} (ทดสอบ ${totalRounds} งวด)`);
  console.log(`   👑 [เด่นหลัก] เข้าเป้า: ${pD0}% (${d0Wins}/${totalRounds}) | ❌ หากเล่นเด่นหลักตัวเดียว หลุด: ${pD0Miss}%`);
  console.log(`   🥈 [เด่นรอง] เข้าเป้า: ${pD1}% (${d1Wins}/${totalRounds}) | ❌ หากเล่นเด่นรองตัวเดียว หลุด: ${pD1Miss}%`);
  console.log(`   🔥 [เด่นหลัก + เด่นรอง (เล่นคู่)] เข้าเป้า: ${pAny}% (${anyWins}/${totalRounds}) | ❌ หลุดรวม: ${pMiss}%`);
  console.log(`   👉 เด่นหลักเข้าคนเดียว (รองหลุด): ${d0OnlyWins} งวด | เด่นรองเข้าคนเดียว (หลักหลุด): ${d1OnlyWins} งวด | เข้าทั้งคู่: ${bothWins} งวด`);
  console.log(`   🎯 เด่นหลักจบที่: สเต็ป 1=${d0Step1} งวด, สเต็ป 2=${d0Step2} งวด, สเต็ป 3=${d0Step3} งวด\n`);
});
