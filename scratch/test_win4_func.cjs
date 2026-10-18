function computeWin4(regSess, vipSess, dayCode, isMorning) {
  const pool = [];

  function addFromStr(str) {
    if (!str) return;
    const m = str.match(/\d+/g);
    if (m) m.forEach(d => {
      const n = parseInt(d, 10);
      if (!isNaN(n)) pool.push(n);
    });
  }

  if (regSess && regSess.runDigits && regSess.runDigits !== '-') {
    addFromStr(regSess.runDigits);
  }
  if (vipSess && vipSess.runDigits && vipSess.runDigits !== '-') {
    addFromStr(vipSess.runDigits);
  }

  if (dayCode === 'Sat') {
    if (isMorning) {
      pool.push(1, 2, 6, 8, 7, 4);
    } else {
      pool.push(0, 3, 2, 8, 9, 6);
    }
  } else if (dayCode === 'Sun') {
    if (isMorning) {
      pool.push(9, 5, 4, 6, 8, 1);
    } else {
      pool.push(9, 3, 2, 8, 1, 5);
    }
  }

  const runnerUps = {
    Mon: { morning: [6, 9], afternoon: [6, 5] },
    Tue: { morning: [5, 8], afternoon: [7, 6] },
    Wed: { morning: [5, 1], afternoon: [1, 5] },
    Thu: { morning: [1, 2], afternoon: [0, 5] },
    Fri: { morning: [6, 5], afternoon: [7, 9] },
  };
  if (runnerUps[dayCode]) {
    const extra = isMorning ? runnerUps[dayCode].morning : runnerUps[dayCode].afternoon;
    if (extra) extra.forEach(d => pool.push(d));
  }

  for (let i = 0; i <= 9; i++) pool.push(i);

  const seen = new Set();
  const digits = [];
  for (const d of pool) {
    if (!seen.has(d)) {
      seen.add(d);
      digits.push(d);
      if (digits.length === 4) break;
    }
  }

  digits.sort((a,b) => a - b);

  const pairs = [];
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      pairs.push(String(digits[i]) + String(digits[j]));
    }
  }
  const doubles = digits.map(d => String(d) + String(d));

  return {
    digits,
    digitsStr: digits.join(' - '),
    pairsStr: pairs.join(' - '),
    doublesStr: doubles.join(' - ')
  };
}

const mockData = {
  Mon: {
    regM: { runDigits: '1 - 4' },
    regA: { runDigits: '9 - 0' },
    vipM: { runDigits: '6 - 8' },
    vipA: { runDigits: '8 - 4' }
  },
  Tue: {
    regM: { runDigits: '3 - 0' },
    regA: { runDigits: '2 - 5' },
    vipM: { runDigits: '7 - 6' },
    vipA: { runDigits: '2 - 0' }
  },
  Wed: {
    regM: { runDigits: '3 - 6' },
    regA: { runDigits: '4 - 1' },
    vipM: { runDigits: '0 - 9' },
    vipA: { runDigits: '2 - 3' }
  },
  Thu: {
    regM: { runDigits: '4 - 7' },
    regA: { runDigits: '8 - 7' },
    vipM: { runDigits: '5 - 6' },
    vipA: { runDigits: '2 - 4' }
  },
  Fri: {
    regM: { runDigits: '2 - 8' },
    regA: { runDigits: '1 - 6' },
    vipM: { runDigits: '1 - 3' },
    vipA: { runDigits: '0 - 2' }
  },
  Sat: {
    regM: { runDigits: '-' },
    regA: { runDigits: '-' },
    vipM: { runDigits: '1 - 2 (กัน 6)' },
    vipA: { runDigits: '0 - 3 (กัน 2)' }
  },
  Sun: {
    regM: { runDigits: '-' },
    regA: { runDigits: '-' },
    vipM: { runDigits: '9 - 5 (กัน 4)' },
    vipA: { runDigits: '9 - 3' }
  }
};

Object.keys(mockData).forEach(day => {
  const d = mockData[day];
  const wM = computeWin4(d.regM, d.vipM, day, true);
  const wA = computeWin4(d.regA, d.vipA, day, false);
  console.log(`[${day}] Morning Win4: ${wM.digitsStr} | Pairs: ${wM.pairsStr} | Doubles: ${wM.doublesStr}`);
  console.log(`[${day}] Afternn Win4: ${wA.digitsStr} | Pairs: ${wA.pairsStr} | Doubles: ${wA.doublesStr}`);
});
