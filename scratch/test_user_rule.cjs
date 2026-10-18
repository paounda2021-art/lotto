function resolveHanoiDigits(raw4) {
  // raw4 is e.g. [v0, v1, a0, a1]
  const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const result = [];
  const currentSet = new Set(raw4.filter(x => x !== null && x !== undefined));

  // Let's count occurrences
  const seen = new Set();
  for (let i = 0; i < raw4.length; i++) {
    const val = raw4[i];
    if (val === null || val === undefined) continue;

    if (!seen.has(val)) {
      seen.add(val);
      result.push(val);
    } else {
      // It's a duplicate! Find the first candidate in [0, 1, 2, 3, ...] that is NOT in currentSet
      let replacement = null;
      for (const cand of candidates) {
        if (!currentSet.has(cand)) {
          replacement = cand;
          currentSet.add(cand); // mark as used so a 2nd duplicate won't pick it
          break;
        }
      }
      result.push(replacement);
    }
  }

  return result.sort((a, b) => a - b);
}

// Test case from user: 6, 1, 6, 0
console.log('Test 6, 1, 6, 0:', resolveHanoiDigits([6, 1, 6, 0]));

// Test case where no duplicates: 0, 1, 4, 9
console.log('Test 0, 1, 4, 9:', resolveHanoiDigits([0, 1, 4, 9]));

// Test case where 0 is duplicate: 0, 1, 0, 5
// currentSet has 0, 1, 5
// 0 is duplicate:
// candidate 0: in currentSet (yes)
// candidate 1: in currentSet (yes)
// candidate 2: not in currentSet -> pick 2!
console.log('Test 0, 1, 0, 5:', resolveHanoiDigits([0, 1, 0, 5]));

// Test case where 2 duplicates: 6, 1, 6, 1
// currentSet has 6, 1
// 1st duplicate (6): cand 0 not in currentSet -> pick 0, currentSet adds 0
// 2nd duplicate (1): cand 0 in currentSet, cand 1 in currentSet, cand 2 not in currentSet -> pick 2!
console.log('Test 6, 1, 6, 1:', resolveHanoiDigits([6, 1, 6, 1]));

// Test case where 0, 1, 2 exist: 0, 1, 2, 0
// cand 0, 1, 2 all in currentSet -> pick 3!
console.log('Test 0, 1, 2, 0:', resolveHanoiDigits([0, 1, 2, 0]));
