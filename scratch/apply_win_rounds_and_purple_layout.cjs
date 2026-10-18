const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('Initial code length:', code.length);

// 1. Add Helper functions at the top of the bundle (if not present)
const roundHelpers = `
function _getDrawRoundLabel(dr) {
  if (!dr) return "";
  const s = String(dr.session || dr.id || "");
  // Hanoi
  if (s.includes("HANOI_SPECIAL") || s.includes("SPECIAL") || s.includes("พิเศษ")) return "พิเศษ";
  if (s.includes("HANOI_VIP")) return "VIP";
  if (s.includes("HANOI_EVENING") || s.includes("EVENING") || s.includes("ปกติ")) return "ปกติ";
  
  // Stock VIP
  if (s.includes("CHINA_VIP_MORNING")) return "จีนวีเช้า";
  if (s.includes("CHINA_VIP_AFTERNOON")) return "จีนวีบ่าย";
  if (s.includes("HANGSENG_VIP_MORNING")) return "ฮั่งวีเช้า";
  if (s.includes("HANGSENG_VIP_AFTERNOON")) return "ฮั่งวีบ่าย";
  if (s.includes("NIKKEI_VIP_MORNING")) return "นิเคอิวีเช้า";
  if (s.includes("NIKKEI_VIP_AFTERNOON")) return "นิเคอิวีบ่าย";
  
  // Regular Stocks
  if (s.includes("CHINA_MORNING")) return "จีนเช้า";
  if (s.includes("CHINA_AFTERNOON")) return "จีนบ่าย";
  if (s.includes("HANGSENG_MORNING")) return "ฮั่งเส็งเช้า";
  if (s.includes("HANGSENG_AFTERNOON")) return "ฮั่งเส็งบ่าย";
  if (s.includes("NIKKEI_MORNING")) return "นิเคอิเช้า";
  if (s.includes("NIKKEI_AFTERNOON")) return "นิเคอิบ่าย";
  
  // General fallback
  if (s.includes("VIP") && (s.includes("MORNING") || s.includes("เช้า"))) return "วีเช้า";
  if (s.includes("VIP") && (s.includes("AFTERNOON") || s.includes("บ่าย"))) return "วีบ่าย";
  if (s.includes("VIP")) return "VIP";
  if (s.includes("MORNING") || s.includes("เช้า")) return "เช้า";
  if (s.includes("AFTERNOON") || s.includes("บ่าย")) return "บ่าย";
  
  // Laos
  if (s.includes("STAR") || s.includes("สตาร์")) return "สตาร์";
  if (s.includes("LAOS") || s.includes("พัฒนา")) return "พัฒนา";
  return "";
}
window._getDrawRoundLabel = _getDrawRoundLabel;

function _recordDrawRounds(dr, roundMap2D, roundMap3D) {
  if (!dr) return;
  const rLabel = _getDrawRoundLabel(dr);
  if (!rLabel) return;
  if (roundMap3D && dr.top3 && dr.top3.trim() !== "") {
    const t3 = dr.top3.trim();
    const s3 = t3.split("").sort().join("");
    if (!roundMap3D.has(t3)) roundMap3D.set(t3, new Set());
    roundMap3D.get(t3).add(rLabel);
    if (!roundMap3D.has(s3)) roundMap3D.set(s3, new Set());
    roundMap3D.get(s3).add(rLabel);
  }
  const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
  if (roundMap2D && t2) {
    if (!roundMap2D.has(t2)) roundMap2D.set(t2, new Set());
    roundMap2D.get(t2).add(rLabel);
  }
  if (roundMap2D && dr.bottom2 && dr.bottom2.trim() !== "") {
    const b2 = dr.bottom2.trim();
    if (!roundMap2D.has(b2)) roundMap2D.set(b2, new Set());
    roundMap2D.get(b2).add(rLabel);
  }
}
window._recordDrawRounds = _recordDrawRounds;

function _getHitRoundText(num, roundMap) {
  if (!num || !roundMap || !roundMap.has(num)) return "";
  return Array.from(roundMap.get(num)).join(", ");
}
window._getHitRoundText = _getHitRoundText;
`;

if (!code.includes('function _getDrawRoundLabel(')) {
  code = roundHelpers + ';' + code;
  console.log('1. Round helper functions prepended to bundle!');
} else {
  console.log('1. Round helper functions already present!');
}

// 2. Update Card 3 layout: Move 4 Win Digits to the LEFT (large size) and Rood to the RIGHT
const oldCard3Row = `        n.jsxs("div", {
          className: "flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-purple-950/30 border border-purple-500/35 rounded-xl relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2.5 flex-wrap",
              children: [
                n.jsxs("div", {
                  className: "flex items-center gap-1.5 bg-black/60 border border-purple-400/50 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.3)]",
                  children: [
                    n.jsx("span", { className: "text-xs font-bold text-purple-300", children: "🌟 รูดตัวเด่น (19 ประตู):" }),
                    n.jsx("span", {
                      style: {
                        color: "#ffffff",
                        textShadow: "0 0 10px rgba(192, 132, 252, 0.9)"
                      },
                      className: "text-xl font-black text-white px-2 py-0.5 bg-purple-600 rounded-lg shadow-sm",
                      children: roodDen
                    })
                  ]
                }),
                n.jsxs("div", {
                  className: "flex items-center gap-1.5 bg-black/60 border border-purple-400/40 px-3 py-1.5 rounded-xl shadow-sm",
                  children: [
                    n.jsx("span", { className: "text-xs font-bold text-purple-300", children: "⚡ รูดตัวรอง (19 ประตู):" }),
                    n.jsx("span", {
                      style: {
                        color: "#ffffff",
                        textShadow: "0 0 10px rgba(192, 132, 252, 0.9)"
                      },
                      className: "text-xl font-black text-white px-2 py-0.5 bg-fuchsia-700 rounded-lg shadow-sm",
                      children: roodRong
                    })
                  ]
                }),
                n.jsx("span", {
                  className: "text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded-lg",
                  children: "✓ สายรูด 19 ประตู สถิติเข้าเป้า 100%"
                })
              ]
            }),
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsx("span", { className: "text-xs font-bold text-gray-300", children: "ชุด 4 เลขวินหลัก:" }),
                n.jsx("div", {
                  className: "flex items-center gap-1.5",
                  children: hanoiPurpleDigits.map(digit => n.jsx("div", {
                    key: digit,
                    style: {
                      color: "#ffffff",
                      background: "linear-gradient(135deg, rgba(147, 51, 234, 0.5) 0%, rgba(168, 85, 247, 0.3) 100%)",
                      border: "2px solid rgba(192, 132, 252, 0.8)",
                      boxShadow: "0 0 14px rgba(168, 85, 247, 0.4)"
                    },
                    className: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white font-black text-lg sm:text-xl flex items-center justify-center shrink-0 win4-main-digit-purple",
                    children: digit
                  }))
                })
              ]
            })
          ]
        })`;

const newCard3Row = `        n.jsxs("div", {
          className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-purple-950/30 border border-purple-500/35 rounded-xl relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-3 flex-wrap",
              children: [
                n.jsx("div", {
                  className: "flex items-center gap-2 sm:gap-2.5 shrink-0",
                  children: hanoiPurpleDigits.map(digit => n.jsx("div", {
                    key: digit,
                    style: {
                      color: "#ffffff",
                      background: "linear-gradient(135deg, rgba(126, 34, 206, 0.85) 0%, rgba(168, 85, 247, 0.5) 100%)",
                      border: "2px solid #c084fc",
                      boxShadow: "0 0 16px rgba(168, 85, 247, 0.45)"
                    },
                    className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white font-black text-2xl flex items-center justify-center scale-100 hover:scale-105 transition-transform shrink-0 win4-main-digit-purple",
                    children: digit
                  }))
                }),
                n.jsxs("div", {
                  className: "flex flex-col justify-center pl-1",
                  children: [
                    n.jsx("span", {
                      style: { color: "#d8b4fe" },
                      className: "text-xs sm:text-sm font-extrabold",
                      children: "ชุด 4 เลขวินหลัก (สูตร 5 ตัวย้อนหลัง)"
                    }),
                    n.jsx("span", {
                      className: "text-[11px] text-purple-300/80 font-medium",
                      children: "เน้นตัดตรง 4 เลขเด่นวินคัดพิเศษ สถิติ 3 นอย เข้าเป้า 100%"
                    })
                  ]
                })
              ]
            }),
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap self-start lg:self-auto",
              children: [
                n.jsxs("div", {
                  className: "flex items-center gap-1.5 bg-black/60 border border-purple-400/50 px-2.5 py-1.5 rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.3)]",
                  children: [
                    n.jsx("span", { className: "text-xs font-bold text-purple-300", children: "🌟 รูดตัวเด่น (19 ประตู):" }),
                    n.jsx("span", {
                      style: {
                        color: "#ffffff",
                        textShadow: "0 0 10px rgba(192, 132, 252, 0.9)"
                      },
                      className: "text-xl font-black text-white px-2 py-0.5 bg-purple-600 rounded-lg shadow-sm",
                      children: roodDen
                    })
                  ]
                }),
                n.jsxs("div", {
                  className: "flex items-center gap-1.5 bg-black/60 border border-purple-400/40 px-2.5 py-1.5 rounded-xl shadow-sm",
                  children: [
                    n.jsx("span", { className: "text-xs font-bold text-purple-300", children: "⚡ รูดตัวรอง (19 ประตู):" }),
                    n.jsx("span", {
                      style: {
                        color: "#ffffff",
                        textShadow: "0 0 10px rgba(192, 132, 252, 0.9)"
                      },
                      className: "text-xl font-black text-white px-2 py-0.5 bg-fuchsia-700 rounded-lg shadow-sm",
                      children: roodRong
                    })
                  ]
                }),
                n.jsx("span", {
                  className: "text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded-lg",
                  children: "✓ สายรูด 100%"
                })
              ]
            })
          ]
        })`;

if (code.includes(oldCard3Row)) {
  code = code.replace(oldCard3Row, newCard3Row);
  console.log('2. Card 3 row layout swapped: 4 Win digits on LEFT (large), Rood on RIGHT!');
} else {
  console.warn('2. Card 3 oldCard3Row marker not found!');
}

// 3. In winData (Card 1): track winning2DRounds and winning3DRounds
const oldWinDataBuild = `const winning2D = new Set, winning3D = new Set, tDate = O && O[0] ? O[0].date : null, allDForDay = (O || []).slice();
        if (tDate && a) {
          a.forEach(d => {
            if ((d.date === tDate || (d.dateFormatted && O[0]?.dateFormatted && d.dateFormatted === O[0].dateFormatted)) && !allDForDay.some(x => x.session === d.session)) {
              allDForDay.push(d);
            }
          });
        }
        allDForDay.forEach(dr => {
          if (dr && dr.top3 && dr.top3.trim() !== "") {
            winning3D.add(dr.top3); winning3D.add(dr.top3.split("").sort().join(""));
          }
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) winning2D.add(t2);
          if (dr.bottom2) winning2D.add(dr.bottom2);
        });
        return { denVip, denPhi, denRuam, rongRuam, digits, pairs2D, triples3D, replacedDups, winning2D, winning3D };`;

const newWinDataBuild = `const winning2D = new Set, winning3D = new Set, winning2DRounds = new Map(), winning3DRounds = new Map(), tDate = O && O[0] ? O[0].date : null, allDForDay = (O || []).slice();
        if (tDate && a) {
          a.forEach(d => {
            if ((d.date === tDate || (d.dateFormatted && O[0]?.dateFormatted && d.dateFormatted === O[0].dateFormatted)) && !allDForDay.some(x => x.session === d.session)) {
              allDForDay.push(d);
            }
          });
        }
        allDForDay.forEach(dr => {
          _recordDrawRounds(dr, winning2DRounds, winning3DRounds);
          if (dr && dr.top3 && dr.top3.trim() !== "") {
            winning3D.add(dr.top3); winning3D.add(dr.top3.split("").sort().join(""));
          }
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) winning2D.add(t2);
          if (dr.bottom2) winning2D.add(dr.bottom2);
        });
        return { denVip, denPhi, denRuam, rongRuam, digits, pairs2D, triples3D, replacedDups, winning2D, winning3D, winning2DRounds, winning3DRounds };`;

if (code.includes(oldWinDataBuild)) {
  code = code.replace(oldWinDataBuild, newWinDataBuild);
  console.log('3. winData enriched with winning2DRounds and winning3DRounds!');
} else {
  console.warn('3. oldWinDataBuild marker not found!');
}

// 4. In Card 1: Display round underneath blinking numbers
const oldCard1Pairs = `winData.pairs2D.map(p => {
                    const isHit = winData.winning2D && winData.winning2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-amber-500/20 border border-amber-500/40 text-white hover:bg-amber-500/30 win4-chip-default"),
                      children: p
                    });
                  })`;

const newCard1Pairs = `winData.pairs2D.map(p => {
                    const isHit = winData.winning2D && winData.winning2D.has(p);
                    const rTxt = isHit && winData.winning2DRounds ? _getHitRoundText(p, winData.winning2DRounds) : "";
                    return n.jsxs("span", {
                      key: p,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "inline-flex items-center justify-center px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-white hover:bg-amber-500/30 win4-chip-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: p }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard1Pairs)) {
  code = code.replace(oldCard1Pairs, newCard1Pairs);
  console.log('4. Card 1 2D pairs updated to show hit round underneath!');
} else {
  console.warn('4. oldCard1Pairs marker not found!');
}

const oldCard1Triples = `winData.triples3D.map(t => {
                    const isHit = winData.winning3D && (winData.winning3D.has(t) || winData.winning3D.has(t.split("").sort().join("")));
                    return n.jsx("span", {
                      key: t,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30 win4-chip-default"),
                      children: t
                    });
                  })`;

const newCard1Triples = `winData.triples3D.map(t => {
                    const isHit = winData.winning3D && (winData.winning3D.has(t) || winData.winning3D.has(t.split("").sort().join("")));
                    const rTxt = isHit && winData.winning3DRounds ? (_getHitRoundText(t, winData.winning3DRounds) || _getHitRoundText(t.split("").sort().join(""), winData.winning3DRounds)) : "";
                    return n.jsxs("span", {
                      key: t,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[42px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "inline-flex items-center justify-center px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30 win4-chip-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: t }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard1Triples)) {
  code = code.replace(oldCard1Triples, newCard1Triples);
  console.log('4. Card 1 3D triples updated to show hit round underneath!');
} else {
  console.warn('4. oldCard1Triples marker not found!');
}

// 5. In Card 2 (Green Card): build hanoiWin2DRounds and hanoiWin3DRounds
const oldCard2WinBuild = `let hanoiWin2D = winData ? winData.winning2D : null;
    let hanoiWin3D = winData ? winData.winning3D : null;
    if (!hanoiWin2D || !hanoiWin3D) {
      hanoiWin2D = new Set();
      hanoiWin3D = new Set();
      const tDate = O && O[0] ? O[0].date : null;
      const allDForDay = (O || []).slice();
      if (tDate && a) {
        a.forEach(d => {
          if ((d.date === tDate || (d.dateFormatted && O[0]?.dateFormatted && d.dateFormatted === O[0].dateFormatted)) && !allDForDay.some(x => x.session === d.session)) {
            allDForDay.push(d);
          }
        });
      }
      allDForDay.forEach(dr => {
        if (dr && dr.top3 && dr.top3.trim() !== "") {
          hanoiWin3D.add(dr.top3);
          hanoiWin3D.add(dr.top3.split("").sort().join(""));
        }
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) hanoiWin2D.add(t2);
        if (dr.bottom2) hanoiWin2D.add(dr.bottom2);
      });
    }`;

const newCard2WinBuild = `let hanoiWin2D = winData ? winData.winning2D : null;
    let hanoiWin3D = winData ? winData.winning3D : null;
    let hanoiWin2DRounds = winData && winData.winning2DRounds ? winData.winning2DRounds : null;
    let hanoiWin3DRounds = winData && winData.winning3DRounds ? winData.winning3DRounds : null;
    if (!hanoiWin2D || !hanoiWin3D || !hanoiWin2DRounds) {
      hanoiWin2D = new Set();
      hanoiWin3D = new Set();
      hanoiWin2DRounds = new Map();
      hanoiWin3DRounds = new Map();
      const tDate = O && O[0] ? O[0].date : null;
      const allDForDay = (O || []).slice();
      if (tDate && a) {
        a.forEach(d => {
          if ((d.date === tDate || (d.dateFormatted && O[0]?.dateFormatted && d.dateFormatted === O[0].dateFormatted)) && !allDForDay.some(x => x.session === d.session)) {
            allDForDay.push(d);
          }
        });
      }
      allDForDay.forEach(dr => {
        _recordDrawRounds(dr, hanoiWin2DRounds, hanoiWin3DRounds);
        if (dr && dr.top3 && dr.top3.trim() !== "") {
          hanoiWin3D.add(dr.top3);
          hanoiWin3D.add(dr.top3.split("").sort().join(""));
        }
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) hanoiWin2D.add(t2);
        if (dr.bottom2) hanoiWin2D.add(dr.bottom2);
      });
    }`;

if (code.includes(oldCard2WinBuild)) {
  code = code.replace(oldCard2WinBuild, newCard2WinBuild);
  console.log('5. Card 2 win build enriched with hanoiWin2DRounds and hanoiWin3DRounds!');
} else {
  console.warn('5. oldCard2WinBuild marker not found!');
}

// 6. In Card 2 (Green Card): Display round underneath blinking numbers
const oldCard2Pairs = `hanoiPairs2D.map(p => {
                    const isHit = hanoiWin2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                        color: "#000000",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(16, 185, 129, 0.95), 0 0 6px rgba(52, 211, 153, 0.8)",
                        textShadow: "none"
                      } : {
                        background: "rgba(16, 185, 129, 0.18)",
                        border: "1px solid rgba(52, 211, 153, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-emerald-400 animate-pulse win4-chip-green-hit" : "hover:bg-emerald-500/30 win4-chip-green-default"),
                      children: p
                    });
                  })`;

const newCard2Pairs = `hanoiPairs2D.map(p => {
                    const isHit = hanoiWin2D.has(p);
                    const rTxt = isHit && hanoiWin2DRounds ? _getHitRoundText(p, hanoiWin2DRounds) : "";
                    return n.jsxs("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                        color: "#000000",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(16, 185, 129, 0.95), 0 0 6px rgba(52, 211, 153, 0.8)",
                        textShadow: "none"
                      } : {
                        background: "rgba(16, 185, 129, 0.18)",
                        border: "1px solid rgba(52, 211, 153, 0.35)",
                        color: "#ffffff"
                      },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] scale-110 ring-2 ring-emerald-400 animate-pulse win4-chip-green-hit" : "inline-flex items-center justify-center px-2.5 py-1 hover:bg-emerald-500/30 win4-chip-green-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: p }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard2Pairs)) {
  code = code.replace(oldCard2Pairs, newCard2Pairs);
  console.log('6. Card 2 2D pairs updated to show hit round underneath!');
} else {
  console.warn('6. oldCard2Pairs marker not found!');
}

const oldCard2Triples = `hanoiTriples3D.map(t => {
                    const isHit = hanoiWin3D.has(t) || hanoiWin3D.has(t.split("").sort().join(""));
                    return n.jsx("span", {
                      key: t,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                        color: "#000000",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(16, 185, 129, 0.95), 0 0 6px rgba(52, 211, 153, 0.8)",
                        textShadow: "none"
                      } : {
                        background: "rgba(20, 184, 166, 0.18)",
                        border: "1px solid rgba(45, 212, 191, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-emerald-400 animate-pulse win4-chip-green-hit" : "hover:bg-teal-500/30 win4-chip-green-default"),
                      children: t
                    });
                  })`;

const newCard2Triples = `hanoiTriples3D.map(t => {
                    const isHit = hanoiWin3D.has(t) || hanoiWin3D.has(t.split("").sort().join(""));
                    const rTxt = isHit && hanoiWin3DRounds ? (_getHitRoundText(t, hanoiWin3DRounds) || _getHitRoundText(t.split("").sort().join(""), hanoiWin3DRounds)) : "";
                    return n.jsxs("span", {
                      key: t,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                        color: "#000000",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(16, 185, 129, 0.95), 0 0 6px rgba(52, 211, 153, 0.8)",
                        textShadow: "none"
                      } : {
                        background: "rgba(20, 184, 166, 0.18)",
                        border: "1px solid rgba(45, 212, 191, 0.35)",
                        color: "#ffffff"
                      },
                      className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[42px] scale-110 ring-2 ring-emerald-400 animate-pulse win4-chip-green-hit" : "inline-flex items-center justify-center px-3 py-1 hover:bg-teal-500/30 win4-chip-green-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                      children: [
                        n.jsx("span", { className: "leading-tight", children: t }),
                        isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                      ]
                    });
                  })`;

if (code.includes(oldCard2Triples)) {
  code = code.replace(oldCard2Triples, newCard2Triples);
  console.log('6. Card 2 3D triples updated to show hit round underneath!');
} else {
  console.warn('6. oldCard2Triples marker not found!');
}

// 7. In Card 3 (Purple Card): build purpleWin2DRounds across allDForDay
const oldCard3WinBuild = `const purpleWin2D = new Set();
    if (!isUpcoming) {
      (O || []).forEach(dr => {
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) purpleWin2D.add(t2);
        if (dr.bottom2) purpleWin2D.add(dr.bottom2);
      });
    }`;

const newCard3WinBuild = `const purpleWin2D = new Set();
    const purpleWin2DRounds = new Map();
    if (!isUpcoming) {
      const tDate = O && O[0] ? O[0].date : null;
      const allDForDay = (O || []).slice();
      if (tDate && a) {
        a.forEach(d => {
          if ((d.date === tDate || (d.dateFormatted && O[0]?.dateFormatted && d.dateFormatted === O[0].dateFormatted)) && !allDForDay.some(x => x.session === d.session)) {
            allDForDay.push(d);
          }
        });
      }
      allDForDay.forEach(dr => {
        _recordDrawRounds(dr, purpleWin2DRounds, null);
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) purpleWin2D.add(t2);
        if (dr.bottom2) purpleWin2D.add(dr.bottom2);
      });
    }`;

if (code.includes(oldCard3WinBuild)) {
  code = code.replace(oldCard3WinBuild, newCard3WinBuild);
  console.log('7. Card 3 win build enriched with allDForDay and purpleWin2DRounds!');
} else {
  console.warn('7. oldCard3WinBuild marker not found!');
}

// 8. In Card 3 (Purple Card): Display round underneath drill pairs and 4-win pairs
const oldCard3DrillPairs = `hanoiPurpleDrillPairs.map(p => {
                    const isHit = !isUpcoming && purpleWin2D.has(p);
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

const newCard3DrillPairs = `hanoiPurpleDrillPairs.map(p => {
                    const isHit = !isUpcoming && purpleWin2D.has(p);
                    const rTxt = isHit && purpleWin2DRounds ? _getHitRoundText(p, purpleWin2DRounds) : "";
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

if (code.includes(oldCard3DrillPairs)) {
  code = code.replace(oldCard3DrillPairs, newCard3DrillPairs);
  console.log('8. Card 3 drill pairs updated to show hit round underneath!');
} else {
  console.warn('8. oldCard3DrillPairs marker not found!');
}

const oldCard3WinPairs = `hanoiPurplePairs2D.map(p => {
                    const isHit = !isUpcoming && purpleWin2D.has(p);
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

const newCard3WinPairs = `hanoiPurplePairs2D.map(p => {
                    const isHit = !isUpcoming && purpleWin2D.has(p);
                    const rTxt = isHit && purpleWin2DRounds ? _getHitRoundText(p, purpleWin2DRounds) : "";
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

if (code.includes(oldCard3WinPairs)) {
  code = code.replace(oldCard3WinPairs, newCard3WinPairs);
  console.log('8. Card 3 4-win pairs updated to show hit round underneath!');
} else {
  console.warn('8. oldCard3WinPairs marker not found!');
}

// 9. In Stock Card 5 & Card 6: build rounds and display under numbers
const oldStockWinBuild = `const win2D = new Set();
    const win3D = new Set();`;

const newStockWinBuild = `const win2D = new Set();
    const win3D = new Set();
    const win2DRounds = new Map();
    const win3DRounds = new Map();`;

if (code.includes(oldStockWinBuild)) {
  code = code.replace(oldStockWinBuild, newStockWinBuild);
  console.log('9. Stock win build enriched with win2DRounds and win3DRounds!');
} else {
  console.warn('9. oldStockWinBuild marker not found!');
}

const oldStockDrLoop = `allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      const isVip = dr.session?.includes("VIP") || dr.session?.includes("vip");
      if (isStocksVip && !isVip) return;
      if (!isStocksVip && isVip) return;`;

const newStockDrLoop = `allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      const isVip = dr.session?.includes("VIP") || dr.session?.includes("vip");
      if (isStocksVip && !isVip) return;
      if (!isStocksVip && isVip) return;
      _recordDrawRounds(dr, win2DRounds, win3DRounds);`;

if (code.includes(oldStockDrLoop)) {
  code = code.replace(oldStockDrLoop, newStockDrLoop);
  console.log('9. Stock dr loop records rounds into win2DRounds and win3DRounds!');
} else {
  console.warn('9. oldStockDrLoop marker not found!');
}

const oldStockPairs = `pairs2D.map(p => {
                  const isHit = !isWaiting && win2D.has(p);
                  return n.jsx("span", {
                    key: p,
                    style: { color: isHit ? "#000000" : "#ffffff" },
                    className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                      (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-amber-500/20 border border-amber-500/40 text-white hover:bg-amber-500/30 win4-chip-default"),
                    children: p
                  });
                })`;

const newStockPairs = `pairs2D.map(p => {
                  const isHit = !isWaiting && win2D.has(p);
                  const rTxt = isHit && typeof win2DRounds !== "undefined" ? _getHitRoundText(p, win2DRounds) : "";
                  return n.jsxs("span", {
                    key: p,
                    style: { color: isHit ? "#000000" : "#ffffff" },
                    className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "inline-flex items-center justify-center px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-white hover:bg-amber-500/30 win4-chip-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                    children: [
                      n.jsx("span", { className: "leading-tight", children: p }),
                      isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                    ]
                  });
                })`;

if (code.includes(oldStockPairs)) {
  code = code.replace(oldStockPairs, newStockPairs);
  console.log('9. Stock pairs updated to show hit round underneath!');
} else {
  console.warn('9. oldStockPairs marker not found!');
}

const oldAfternoonPairs = `pairs2D.map(p => {
                const isHit = !isWaiting && win2D.has(p);
                return n.jsx("span", {
                  key: p,
                  style: isHit ? {
                    background: "linear-gradient(135deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 18px rgba(217, 70, 239, 0.95), 0 0 8px rgba(168, 85, 247, 0.8)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
                  } : {
                    background: "rgba(88, 28, 135, 0.45)",
                    border: "1px solid rgba(168, 85, 247, 0.45)",
                    color: "#ffffff"
                  },
                  className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                    (isHit ? "scale-110 ring-2 ring-fuchsia-400 animate-pulse win4-chip-afternoon-hit" : "hover:bg-purple-800/70 shadow-sm win4-chip-afternoon-default"),
                  children: p
                });
              })`;

const newAfternoonPairs = `pairs2D.map(p => {
                const isHit = !isWaiting && win2D.has(p);
                const rTxt = isHit && typeof win2DRounds !== "undefined" ? _getHitRoundText(p, win2DRounds) : "";
                return n.jsxs("span", {
                  key: p,
                  style: isHit ? {
                    background: "linear-gradient(135deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 18px rgba(217, 70, 239, 0.95), 0 0 8px rgba(168, 85, 247, 0.8)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
                  } : {
                    background: "rgba(88, 28, 135, 0.45)",
                    border: "1px solid rgba(168, 85, 247, 0.45)",
                    color: "#ffffff"
                  },
                  className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[36px] scale-110 ring-2 ring-fuchsia-400 animate-pulse win4-chip-afternoon-hit" : "inline-flex items-center justify-center px-2.5 py-1 hover:bg-purple-800/70 shadow-sm win4-chip-afternoon-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                  children: [
                    n.jsx("span", { className: "leading-tight", children: p }),
                    isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                  ]
                });
              })`;

if (code.includes(oldAfternoonPairs)) {
  code = code.replace(oldAfternoonPairs, newAfternoonPairs);
  console.log('9. Afternoon pairs updated to show hit round underneath!');
} else {
  console.warn('9. oldAfternoonPairs marker not found!');
}

fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('SUCCESS! Updated files written to downloaded_target_worker and dist.');
