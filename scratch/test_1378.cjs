// What prizes produce 1, 3, 7, 8?
function getPurpleDigits(prizes) {
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
  return chosen.slice(0, 4).sort((x, y) => x - y);
}

// Notice that in the user screenshot:
// 38 is a hit!
// Which draw had 38?
// Let's check what draw on Saturday or any day had 38!
console.log("If prizes contain 38, what else?");
