const fs = require("fs");

const hanoi = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi.json"));
const spc = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_special.json"));
const vip = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json"));

let fullHanoiD = [...hanoi, ...spc, ...vip];

// Let's test what happens when r = 'Sat' and isNextMode = false (or true)
function testCalc(r, isNextMode, mockO) {
  let hanoiPurpleDigits;
  const hanoiPurpleSourcePrizes = [];

  if (isNextMode) {
    const sortedDates = Array.from(new Set(fullHanoiD.map(d => d.date).filter(Boolean))).sort().reverse();
    const latestDt = sortedDates[0];
    const latestSessions = fullHanoiD.filter(d => d.date === latestDt);
    latestSessions.forEach(s => {
      if (s.top2) hanoiPurpleSourcePrizes.push(s.top2);
      if (s.bottom2) hanoiPurpleSourcePrizes.push(s.bottom2);
    });

    const freq = {};
    hanoiPurpleSourcePrizes.forEach(p => p.split("").forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
    let sumP = 0;
    hanoiPurpleSourcePrizes.forEach(p => { sumP += parseInt(p, 10) || 0; });
    const sumDigit = sumP % 10;
    const shadowDigit = (sumDigit + 5) % 10;
    const sortedFreq = Object.keys(freq).map(Number).sort((x, y) => freq[y] - freq[x]);

    const chosen = [];
    const seen = new Set();
    [sortedFreq[0], sortedFreq[1], sumDigit, shadowDigit].forEach(d => {
      if (d !== undefined && !isNaN(d) && !seen.has(d)) {
        seen.add(d); chosen.push(d);
      }
    });
    [sortedFreq[2], sortedFreq[3], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(c => {
      if (chosen.length < 4 && c !== undefined && !isNaN(c) && !seen.has(c)) {
        seen.add(c); chosen.push(c);
      }
    });
    hanoiPurpleDigits = chosen.slice(0, 4).sort((x, y) => x - y);
  } else {
    const targetDayCode = r || "Fri";
    // Look at how activeDayDate was determined:
    // (O && O[0] ? O[0].date : null) || (fullHanoiD.find(d => d.dayOfWeek === targetDayCode)?.date);
    // Notice what O is in Hanoi page! In Hanoi page, what is O?
    // Let's check what O is in the React component!
    const activeDayDate = (mockO && mockO[0] ? mockO[0].date : null) || (fullHanoiD.find(d => d.dayOfWeek === targetDayCode)?.date);
    console.log("activeDayDate for", targetDayCode, ":", activeDayDate);

    const daySessions = fullHanoiD.filter(d => d.date === activeDayDate);
    daySessions.forEach(s => {
      if (s.top2) hanoiPurpleSourcePrizes.push(s.top2);
      if (s.bottom2) hanoiPurpleSourcePrizes.push(s.bottom2);
    });
    if (hanoiPurpleSourcePrizes.length === 0 && mockO) {
      mockO.forEach(s => {
        if (s && s.top2) hanoiPurpleSourcePrizes.push(s.top2);
        if (s && s.bottom2) hanoiPurpleSourcePrizes.push(s.bottom2);
      });
    }

    const freq = {};
    hanoiPurpleSourcePrizes.forEach(p => p.split("").forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
    const rankOrder = hanoiPurpleSourcePrizes.join("") + "0123456789";
    const sortedDigits = Object.keys(freq).map(Number).sort((x, y) => {
      if (freq[y] !== freq[x]) return freq[y] - freq[x];
      return rankOrder.indexOf(String(x)) - rankOrder.indexOf(String(y));
    });

    const chosen = sortedDigits.slice(0, 4);
    const cands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const c of cands) {
      if (chosen.length >= 4) break;
      if (!chosen.includes(c)) chosen.push(c);
    }
    hanoiPurpleDigits = chosen.slice(0, 4).sort((x, y) => x - y);
  }

  console.log({
    r,
    isNextMode,
    hanoiPurpleSourcePrizes,
    hanoiPurpleDigits
  });
}

console.log("--- Test 1: Day = Sat, isNextMode = false, mockO = null ---");
testCalc("Sat", false, null);

console.log("--- Test 2: Day = Sat, isNextMode = true, mockO = null ---");
testCalc("Sat", true, null);
