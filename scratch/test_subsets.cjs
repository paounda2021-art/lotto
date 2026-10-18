// Check what prizes give [1, 3, 7, 8]
function calc(prizes) {
  const freq = {};
  prizes.forEach(p => p.split("").forEach(ch => { freq[ch] = (freq[ch] || 0) + 1; }));
  const rankOrder = prizes.join("") + "0123456789";
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
  return chosen.slice(0, 4).sort((x, y) => x - y).join("");
}

// Notice in the screenshot:
// 38 is a hit!
// Which prizes from 3 sessions on Saturday or other days?
console.log("If prizes = ['38', '95'] (today's special only):", calc(['38', '95']));
// Output: sortedDigits: 3, 8, 9, 5 -> cands: [3, 8, 9, 5] -> sorted: 3, 5, 8, 9.

// What if prizes = ['38', '17']?
console.log("If prizes = ['38', '17']:", calc(['38', '17']));
// Output: [1, 3, 7, 8]!
