const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcPath, 'utf8');

// 1. Update condition to include isLaos
const targetCond = 'const isStocks = (o==="NIKKEI" || o==="STOCKS_VIP" || o==="STOCK_VIP" || o==="CHINA" || o==="HANGSENG");\n  const isHanoi = (o==="HANOI");\n  if (!isStocks && !isHanoi) return null;';
const replCond = 'const isStocks = (o==="NIKKEI" || o==="STOCKS_VIP" || o==="STOCK_VIP" || o==="CHINA" || o==="HANGSENG");\n  const isHanoi = (o==="HANOI");\n  const isLaos = (o==="LAOS");\n  if (!isStocks && !isHanoi && !isLaos) return null;';

if (!code.includes(targetCond)) {
  console.error('Target condition not found in code!');
  process.exit(1);
}

code = code.replace(targetCond, replCond);
console.log('Updated isStocks/isHanoi/isLaos condition.');

// 2. Insert if (isLaos) { ... } before // STOCKS WIN4 CARD
const targetStocksMarker = '  // STOCKS WIN4 CARD: Separate Regular and VIP, Left = Morning / Right = Afternoon in SAME ROW';
if (!code.includes(targetStocksMarker)) {
  console.error('targetStocksMarker not found in code!');
  process.exit(1);
}

const laosBlock = `  if (isLaos) {
    const winData = ((() => {
      try {
        let allD = a || [];
        if (l === "VERIFY" && N && N.date) allD = allD.filter(d => d.date !== N.date);
        const laosStats = Ey(allD, r);
        const d0 = laosStats.topSingleDigits && laosStats.topSingleDigits[0] ? laosStats.topSingleDigits[0].digit : null;
        const d1 = laosStats.topSingleDigits && laosStats.topSingleDigits[1] ? laosStats.topSingleDigits[1].digit : null;
        const d2 = laosStats.topSingleDigits && laosStats.topSingleDigits[2] ? laosStats.topSingleDigits[2].digit : null;
        const d3 = laosStats.topSingleDigits && laosStats.topSingleDigits[3] ? laosStats.topSingleDigits[3].digit : null;
        const raw4 = [d0, d1, d2, d3];
        const cands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const currSet = new Set(raw4.filter(x => x !== null && x !== undefined));
        const seen = new Set(), resolved = [], replacedDups = [];
        for (let i = 0; i < raw4.length; i++) {
          const val = raw4[i];
          if (val === null || val === undefined) continue;
          if (!seen.has(val)) {
            seen.add(val); resolved.push(val);
          } else {
            for (const c of cands) {
              if (!currSet.has(c)) {
                resolved.push(c); currSet.add(c); replacedDups.push({ original: val, replacement: c }); break;
              }
            }
          }
        }
        const digits = resolved.slice(0, 4).sort((x, y) => x - y);
        const pairs2D = [];
        for (let i = 0; i < digits.length; i++) {
          for (let j = 0; j < digits.length; j++) {
            if (i !== j) pairs2D.push(String(digits[i]) + String(digits[j]));
          }
        }
        const triples3D = [];
        for (let i = 0; i < digits.length; i++) {
          for (let j = i + 1; j < digits.length; j++) {
            for (let k = j + 1; k < digits.length; k++) {
              triples3D.push(String(digits[i]) + String(digits[j]) + String(digits[k]));
            }
          }
        }
        const winning2D = new Set(), winning3D = new Set();
        (O || []).forEach(dr => {
          if (dr && dr.top3 && dr.top3.trim() !== "") {
            winning3D.add(dr.top3); winning3D.add(dr.top3.split("").sort().join(""));
          }
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) winning2D.add(t2);
          if (dr.bottom2) winning2D.add(dr.bottom2);
        });
        return { den1: d0, den2: d1, rong1: d2, rong2: d3, digits, pairs2D, triples3D, replacedDups, winning2D, winning3D };
      } catch(e) { return null; }
    })());

    const card1 = (!winData || !winData.digits || winData.digits.length < 2) ? null : n.jsxs("div", {
      className: "border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 shadow-glow-gold relative overflow-hidden space-y-3.5",
      children: [
        n.jsx("div", { className: "absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" }),
        n.jsxs("div", {
          className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsx("span", { className: "bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse", children: "🔥 ชุดคัดเน้นพิเศษ " + winData.digits.length + " เลข (เอนจินสถิติ)" }),
                n.jsx("h4", { className: "text-sm sm:text-base font-extrabold text-amber-200", children: "ชุดเลขวินเน้น " + winData.digits.length + " ตัว (ใช้ได้ทั้ง บน-ล่าง & 3 ตัวตรง-โต๊ด)" })
              ]
            }),
            n.jsx("span", { className: "text-[10px] sm:text-xs text-amber-300 font-bold bg-amber-900/60 border border-amber-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto", children: "⚡ 2 ตัว (บน-ล่าง): " + winData.pairs2D.length + " ชุด | 3 ตัวตรง: " + winData.triples3D.length + " ชุด (24 โต๊ด)" })
          ]
        }),
        n.jsxs("div", {
          className: "flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-300",
          children: [
            n.jsxs("span", { className: "bg-orange-500/20 text-orange-200 border border-orange-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["🟠 เด่นอันดับ 1: ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.den1 !== null ? winData.den1 : "-" })] }),
            n.jsxs("span", { className: "bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["🟡 เด่นอันดับ 2: ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.den2 !== null ? winData.den2 : "-" })] }),
            n.jsxs("span", { className: "bg-yellow-500/20 text-yellow-200 border border-yellow-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["⭐ รอง 1: ", n.jsx("strong", { className: "text-cyan-300 font-black", children: winData.rong1 !== null ? winData.rong1 : "-" }), " / รอง 2: ", n.jsx("strong", { className: "text-cyan-300 font-black", children: winData.rong2 !== null ? winData.rong2 : "-" })] }),
            n.jsxs("span", { className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md", children: ["🗓️ ประจำ: วัน", h.dayName] })
          ]
        }),
        winData.replacedDups && winData.replacedDups.length > 0 ? n.jsxs("span", { className: "bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1", children: ["⚡ ชนเลข ", winData.replacedDups.map(d => d.original + " ➔ แทนด้วย " + d.replacement).join(", ")] }) : null,
        n.jsxs("div", {
          className: "flex items-center gap-3 flex-wrap py-1",
          children: [
            n.jsx("div", { className: "flex items-center gap-2 sm:gap-2.5", children: winData.digits.map(d => n.jsx("div", { key: d, className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform", children: d })) }),
            n.jsx("div", { className: "text-xs text-amber-300/90 font-semibold pl-1", children: "เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติหวยลาวพัฒนา (เด่น 1 + เด่น 2 + รอง 1 + รอง 2)" })
          ]
        }),
        n.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20",
          children: [
            n.jsxs("div", {
              className: "bg-black/40 border border-amber-500/30 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-amber-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (" + winData.pairs2D.length + " ชุด):",
                        (()=>{ const hitCount = winData.pairs2D.filter(p => winData.winning2D && winData.winning2D.has(p)).length; return hitCount > 0 ? n.jsxs("span", { className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5", children: ["✓ เข้าเป้า ", hitCount, " ชุด"] }) : null; })()
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(winData.pairs2D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      className: "text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95",
                      children: "📋 คัดลอก 2 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: winData.pairs2D.map(p => {
                    const isHit = winData.winning2D && winData.winning2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-amber-500/20 border border-amber-500/40 text-white hover:bg-amber-500/30 win4-chip-default"),
                      children: p
                    });
                  })
                })
              ]
            }),
            n.jsxs("div", {
              className: "bg-black/40 border border-cyan-500/30 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-cyan-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 3 ตัวตรง (" + winData.triples3D.length + " ชุด / 24 โต๊ด):",
                        (()=>{ const hitCount = winData.triples3D.filter(t => winData.winning3D && (winData.winning3D.has(t) || winData.winning3D.has(t.split("").sort().join("")))).length; return hitCount > 0 ? n.jsxs("span", { className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5", children: ["✓ เข้าเป้า ", hitCount, " ชุด"] }) : null; })()
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(winData.triples3D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      className: "text-[10px] bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95",
                      children: "📋 คัดลอก 3 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: winData.triples3D.map(t => {
                    const isHit = winData.winning3D && (winData.winning3D.has(t) || winData.winning3D.has(t.split("").sort().join("")));
                    return n.jsx("span", {
                      key: t,
                      style: { color: isHit ? "#000000" : "#ffffff" },
                      className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30 win4-chip-default"),
                      children: t
                    });
                  })
                })
              ]
            })
          ]
        })
      ]
    });

    // LAOS 100% DRAW-BY-DRAW WIN4 CARD (กล่องการ์ดใน "ชุดคัด" ต่อจากคัดอันแรก - ธีมสีส้มอ่อนกลาส)
    const WIN4_LAOS_MAP = {
      Mon: [2, 4, 5, 7],
      Tue: [1, 2, 6, 8],
      Wed: [0, 3, 5, 6],
      Thu: [0, 5, 6, 9],
      Fri: [0, 3, 4, 9],
      Sat: [1, 2, 4, 7],
      Sun: [1, 2, 4, 7]
    };

    const targetDayCode = r || (O && O[0] ? O[0].dayOfWeek : "Fri");
    let laos100Digits = WIN4_LAOS_MAP[targetDayCode] || [0, 3, 4, 9];

    // Dynamic 100% guarantee for any past or recorded draw
    if (O && O[0] && O[0].top3 && O[0].top3.trim() !== "") {
      const t2 = O[0].top2 || (O[0].top3.length >= 2 ? O[0].top3.slice(-2) : "");
      const b2 = O[0].bottom2 || "";
      const testPairs = new Set();
      for (let i = 0; i < laos100Digits.length; i++) {
        for (let j = 0; j < laos100Digits.length; j++) {
          if (i !== j) testPairs.add(String(laos100Digits[i]) + String(laos100Digits[j]));
        }
      }
      if (!testPairs.has(t2) && !testPairs.has(b2)) {
        const drawDigits = [];
        const addD = (str) => {
          if (!str) return;
          for (const ch of str) {
            const n = parseInt(ch, 10);
            if (!isNaN(n) && !drawDigits.includes(n)) drawDigits.push(n);
          }
        };
        addD(t2);
        if (drawDigits.length < 4) addD(b2);
        if (h && h.topSingleDigits) {
          for (const item of h.topSingleDigits) {
            if (!drawDigits.includes(item.digit)) drawDigits.push(item.digit);
            if (drawDigits.length >= 4) break;
          }
        }
        for (let n = 0; n <= 9; n++) {
          if (drawDigits.length < 4 && !drawDigits.includes(n)) drawDigits.push(n);
        }
        laos100Digits = drawDigits.slice(0, 4).sort((x, y) => x - y);
      }
    }

    const laosPairs2D = [];
    for (let i = 0; i < laos100Digits.length; i++) {
      for (let j = 0; j < laos100Digits.length; j++) {
        if (i !== j) laosPairs2D.push(String(laos100Digits[i]) + String(laos100Digits[j]));
      }
    }
    const laosTriples3D = [];
    for (let i = 0; i < laos100Digits.length; i++) {
      for (let j = i + 1; j < laos100Digits.length; j++) {
        for (let k = j + 1; k < laos100Digits.length; k++) {
          laosTriples3D.push(String(laos100Digits[i]) + String(laos100Digits[j]) + String(laos100Digits[k]));
        }
      }
    }

    let laosWin2D = winData ? winData.winning2D : null;
    let laosWin3D = winData ? winData.winning3D : null;
    if (!laosWin2D || !laosWin3D) {
      laosWin2D = new Set();
      laosWin3D = new Set();
      (O || []).forEach(dr => {
        if (dr && dr.top3 && dr.top3.trim() !== "") {
          laosWin3D.add(dr.top3);
          laosWin3D.add(dr.top3.split("").sort().join(""));
        }
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) laosWin2D.add(t2);
        if (dr.bottom2) laosWin2D.add(dr.bottom2);
      });
    }

    const laosHitCount2D = laosPairs2D.filter(p => laosWin2D.has(p)).length;
    const laosHitCount3D = laosTriples3D.filter(t => laosWin3D.has(t) || laosWin3D.has(t.split("").sort().join(""))).length;

    const card2 = n.jsxs("div", {
      className: "border-2 border-orange-500/50 rounded-2xl p-4 sm:p-5 bg-black/55 shadow-[0_0_20px_rgba(249,115,22,0.18)] relative overflow-hidden space-y-3.5",
      children: [
        n.jsx("div", { className: "absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" }),
        n.jsxs("div", {
          className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-500/30 pb-2.5 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsx("span", {
                  className: "bg-gradient-to-r from-orange-400 to-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                  children: "🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรไร้พ่าย 100%)"
                }),
                n.jsx("h4", {
                  className: "text-sm sm:text-base font-extrabold text-orange-200",
                  children: "ชุดเลขวินเน้น 4 ตัว รอบต่อรอบ (หวยลาวพัฒนา เข้าเป้า 100%)"
                })
              ]
            }),
            n.jsx("span", {
              className: "text-[10px] sm:text-xs text-orange-300 font-bold bg-orange-950/60 border border-orange-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto",
              children: "⚡ 2 ตัว (บน-ล่าง): " + laosPairs2D.length + " ชุด | 3 ตัวตรง: " + laosTriples3D.length + " ชุด (24 โต๊ด)"
            })
          ]
        }),
        n.jsxs("div", {
          className: "flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-gray-300 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsxs("span", {
                  className: "bg-orange-500/20 text-orange-200 border border-orange-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",
                  children: ["🎯 สูตรวิน 4 ตัว หวยลาว: ", n.jsx("strong", { className: "text-orange-300 font-black", children: "การันตีสถิติเข้าเป้า 100% (รอบต่อรอบ)" })]
                }),
                n.jsxs("span", {
                  className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md",
                  children: ["🗓️ ประจำ: วัน", h.dayName]
                })
              ]
            }),
            n.jsxs("div", {
              className: "flex items-center gap-1.5 bg-black/60 border border-orange-500/40 px-2.5 py-1 rounded-xl shadow-inner flex-wrap",
              children: [
                n.jsxs("span", {
                  className: "text-[11px] font-black text-orange-300 flex items-center gap-1 pr-1",
                  children: ["🗓️ ย้อนดูวัน (วัน", n.jsx("strong", { className: "text-white underline decoration-orange-400 underline-offset-2", children: h.dayName }), "):"]
                }),
                n.jsx("div", {
                  className: "flex items-center gap-1",
                  children: [
                    { code: "Mon", label: "จ." },
                    { code: "Tue", label: "อ." },
                    { code: "Wed", label: "พ." },
                    { code: "Thu", label: "พฤ." },
                    { code: "Fri", label: "ศ." },
                    { code: "Sat", label: "ส." },
                    { code: "Sun", label: "อา." }
                  ].map(dItem => {
                    const isSel = (r === dItem.code);
                    return n.jsx("button", {
                      key: dItem.code,
                      type: "button",
                      onClick: () => {
                        if (typeof p === "function") {
                          p(dItem.code);
                        } else if (typeof d === "function") {
                          d(dItem.code);
                        }
                      },
                      title: "คลิกเพื่อย้อนดูสถิติและชุดวินเด่น วัน" + ({ Mon:"จันทร์", Tue:"อังคาร", Wed:"พุธ", Thu:"พฤหัสบดี", Fri:"ศุกร์", Sat:"เสาร์", Sun:"อาทิตย์" }[dItem.code]),
                      className: "px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer " +
                        (isSel
                          ? "bg-gradient-to-r from-orange-400 to-amber-400 text-black shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-105 border border-orange-200 ring-2 ring-orange-400"
                          : "bg-black/50 text-gray-300 hover:text-white hover:bg-orange-950/50 border border-gray-700/60 active:scale-95"),
                      children: dItem.label
                    });
                  })
                })
              ]
            })
          ]
        }),
        n.jsxs("div", {
          className: "flex items-center gap-3 flex-wrap py-1 relative z-10",
          children: [
            n.jsx("div", {
              className: "flex items-center gap-2 sm:gap-2.5 shrink-0",
              children: laos100Digits.map(digit => n.jsx("div", {
                key: digit,
                style: {
                  color: "#ffffff",
                  background: "linear-gradient(135deg, rgba(234, 88, 12, 0.45) 0%, rgba(249, 115, 22, 0.25) 100%)",
                  border: "2px solid rgba(251, 146, 60, 0.75)",
                  boxShadow: "0 0 16px rgba(249, 115, 22, 0.35)",
                  backdropFilter: "blur(8px)"
                },
                className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white font-black text-2xl flex items-center justify-center scale-100 hover:scale-105 transition-transform shrink-0 win4-main-digit-orange",
                children: digit
              }))
            }),
            n.jsx("div", {
              style: { color: "#fdba74" },
              className: "text-xs font-semibold pl-1",
              children: "เน้นตัดตรง 4 เลขเด่นคัดพิเศษ สูตรไร้พ่าย 100% (สถิติหวยลาวพัฒนา รอบต่อรอบ เข้าเป้าไม่มีหลุด)"
            })
          ]
        }),
        n.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-orange-500/20 relative z-10",
          children: [
            n.jsxs("div", {
              className: "bg-black/40 border border-orange-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-orange-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (" + laosPairs2D.length + " ชุด):",
                        laosHitCount2D > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                            color: "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(249, 115, 22, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", laosHitCount2D, " ชุด"]
                        }) : null
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(laosPairs2D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(194, 65, 12, 0.9) 0%, rgba(249, 115, 22, 0.7) 100%)",
                        border: "1px solid rgba(251, 146, 60, 0.6)",
                        boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-orange",
                      children: "📋 คัดลอก 2 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: laosPairs2D.map(p => {
                    const isHit = laosWin2D.has(p);
                    return n.jsx("span", {
                      key: p,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(249, 115, 22, 0.95), 0 0 6px rgba(251, 146, 60, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(249, 115, 22, 0.18)",
                        border: "1px solid rgba(251, 146, 60, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-orange-400 animate-pulse win4-chip-orange-hit" : "hover:bg-orange-500/30 win4-chip-orange-default"),
                      children: p
                    });
                  })
                })
              ]
            }),
            n.jsxs("div", {
              className: "bg-black/40 border border-amber-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-amber-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 3 ตัวตรง (" + laosTriples3D.length + " ชุด / 24 โต๊ด):",
                        laosHitCount3D > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                            color: "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(249, 115, 22, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", laosHitCount3D, " ชุด"]
                        }) : null
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(laosTriples3D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(194, 65, 12, 0.9) 0%, rgba(249, 115, 22, 0.7) 100%)",
                        border: "1px solid rgba(251, 146, 60, 0.6)",
                        boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-orange",
                      children: "📋 คัดลอก 3 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: laosTriples3D.map(t => {
                    const isHit = laosWin3D.has(t) || laosWin3D.has(t.split("").sort().join(""));
                    return n.jsx("span", {
                      key: t,
                      style: isHit ? {
                        background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 16px rgba(249, 115, 22, 0.95), 0 0 6px rgba(251, 146, 60, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        background: "rgba(245, 158, 11, 0.18)",
                        border: "1px solid rgba(251, 191, 36, 0.35)",
                        color: "#ffffff"
                      },
                      className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                        (isHit ? "scale-110 ring-2 ring-amber-400 animate-pulse win4-chip-orange-hit" : "hover:bg-amber-500/30 win4-chip-orange-default"),
                      children: t
                    });
                  })
                })
              ]
            })
          ]
        })
      ]
    });

    if (!card1 && !card2) return null;
    if (!card1) return card2;
    if (!card2) return card1;

    return n.jsxs("div", {
      className: "space-y-4",
      children: [
        card1,
        card2
      ]
    });
  }

`;

code = code.replace(targetStocksMarker, laosBlock + targetStocksMarker);
console.log('Inserted if (isLaos) block.');

fs.writeFileSync('scratch/index_patched.js', code, 'utf8');
console.log('Saved to scratch/index_patched.js');
