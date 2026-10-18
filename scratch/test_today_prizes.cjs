// Let's test combinations of 17 Oct 2026 results that include 38 (top) and 95 (bottom)
function calc(prizes) {
  const freq = {};
  prizes.forEach(p => p.split('').forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
  const rankOrder = prizes.join('') + '0123456789';
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
  return chosen.slice(0, 4).sort((x, y) => x - y);
}

// Suppose prizes from today has:
// Special: 38, 95
// What if Regular had: 87, 80? Or 71, 73? Or 18, 37?
console.log("Testing with [38, 95, 87, 80, 81, 84]:", calc(['38', '95', '87', '80', '81', '84']));
console.log("Testing with [38, 95, 71, 13, 78, 83]:", calc(['38', '95', '71', '13', '78', '83']));
