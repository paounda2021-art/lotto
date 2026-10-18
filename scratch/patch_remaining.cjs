const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Card 3 Drill Pairs
const oldCard3Drill = `hanoiPurpleDrillPairs.map(p => {
                    const isHit = !isUpcoming && purpleWin2D && purpleWin2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(168, 85, 247, 0.95), 0 0 6px rgba(192, 132, 252, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(147, 51, 234, 0.18)",
                        border: "1px solid rgba(192, 132, 252, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-purple-400 animate-pulse win4-chip-purple-hit" : "hover:bg-purple-500/30 win4-chip-purple-default"),
                      children: p
                    });
                  })`;

const newCard3Drill = `hanoiPurpleDrillPairs.map(p => {
                    const isHit = !isUpcoming && purpleWin2D && purpleWin2D.has(p);
                    const rTxt = isHit && typeof purpleWin2DRounds !== "undefined" ? _getHitRoundText(p, purpleWin2DRounds) : "";
                    return n.jsxs("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(168, 85, 247, 0.95), 0 0 6px rgba(192, 132, 252, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(147, 51, 234, 0.18)",
                        border: "1px solid rgba(192, 132, 252, 0.35)",
                        color: "#ffffff"
                      },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] scale-110 ring-2 ring-purple-400 animate-pulse win4-chip-purple-hit" : "inline-flex items-center justify-center px-2.5 py-1 hover:bg-purple-500/30 win4-chip-purple-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: p }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard3Drill)) {
  code = code.replace(oldCard3Drill, newCard3Drill);
  console.log('1. Card 3 Drill pairs patched successfully!');
} else {
  console.warn('1. oldCard3Drill marker not found');
}

// 2. Card 3 4-win Pairs
const oldCard3Win = `hanoiPurplePairs2D.map(p => {
                    const isHit = !isUpcoming && purpleWin2D && purpleWin2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(168, 85, 247, 0.95), 0 0 6px rgba(192, 132, 252, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(147, 51, 234, 0.18)",
                        border: "1px solid rgba(192, 132, 252, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-purple-400 animate-pulse win4-chip-purple-hit" : "hover:bg-purple-500/30 win4-chip-purple-default"),
                      children: p
                    });
                  })`;

const newCard3Win = `hanoiPurplePairs2D.map(p => {
                    const isHit = !isUpcoming && purpleWin2D && purpleWin2D.has(p);
                    const rTxt = isHit && typeof purpleWin2DRounds !== "undefined" ? _getHitRoundText(p, purpleWin2DRounds) : "";
                    return n.jsxs("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(168, 85, 247, 0.95), 0 0 6px rgba(192, 132, 252, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(147, 51, 234, 0.18)",
                        border: "1px solid rgba(192, 132, 252, 0.35)",
                        color: "#ffffff"
                      },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] scale-110 ring-2 ring-purple-400 animate-pulse win4-chip-purple-hit" : "inline-flex items-center justify-center px-2.5 py-1 hover:bg-purple-500/30 win4-chip-purple-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: p }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard3Win)) {
  code = code.replace(oldCard3Win, newCard3Win);
  console.log('2. Card 3 4-Win pairs patched successfully!');
} else {
  console.warn('2. oldCard3Win marker not found');
}

// 3. Stock allDraws loop
const oldStockLoop = `allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");`;

const newStockLoop = `allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      if (typeof win2DRounds !== "undefined") _recordDrawRounds(dr, win2DRounds, win3DRounds);
      const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");`;

if (code.includes(oldStockLoop)) {
  code = code.replace(oldStockLoop, newStockLoop);
  console.log('3. Stock allDraws loop patched successfully!');
} else {
  console.warn('3. oldStockLoop marker not found');
}

fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('All remaining patches applied and saved!');
