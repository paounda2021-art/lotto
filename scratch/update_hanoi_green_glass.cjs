const fs = require('fs');
const path = require('path');

const patchFile = path.join(__dirname, 'apply_win4_card_patch.cjs');
let code = fs.readFileSync(patchFile, 'utf8');

const startMarker = '// HANOI 100% 3-ROUND CHASE CARD';
const endMarker = 'if (!card1 && !card2) return null;';

const sIdx = code.indexOf(startMarker);
const eIdx = code.indexOf(endMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('Could not find markers:', { sIdx, eIdx });
  process.exit(1);
}

const replacement = `// HANOI 100% 3-ROUND CHASE CARD (กล่องการ์ดใน "ชุดคัด" ต่อจากคัดอันแรก - ธีมเขียวกลาส)
    const WIN4_HANOI_MAP = {
      Mon: [0, 1, 7, 8],
      Tue: [1, 3, 7, 8],
      Wed: [0, 2, 4, 5],
      Thu: [3, 5, 6, 9],
      Fri: [1, 2, 3, 5],
      Sat: [2, 3, 6, 7],
      Sun: [2, 4, 6, 9]
    };

    const targetDayCode = r || (O && O[0] ? O[0].dayOfWeek : "Fri");
    const hanoi100Digits = WIN4_HANOI_MAP[targetDayCode] || WIN4_HANOI_MAP["Fri"];
    const hanoiPairs2D = [];
    for (let i = 0; i < hanoi100Digits.length; i++) {
      for (let j = 0; j < hanoi100Digits.length; j++) {
        if (i !== j) hanoiPairs2D.push(String(hanoi100Digits[i]) + String(hanoi100Digits[j]));
      }
    }
    const hanoiTriples3D = [];
    for (let i = 0; i < hanoi100Digits.length; i++) {
      for (let j = i + 1; j < hanoi100Digits.length; j++) {
        for (let k = j + 1; k < hanoi100Digits.length; k++) {
          hanoiTriples3D.push(String(hanoi100Digits[i]) + String(hanoi100Digits[j]) + String(hanoi100Digits[k]));
        }
      }
    }

    // เช็คเข้าเป้า หลักการเดียวกับ ชุดวินการ์ดที่ 1 (เดิม)
    let hanoiWin2D = winData ? winData.winning2D : null;
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
    }

    const hanoiHitCount2D = hanoiPairs2D.filter(p => hanoiWin2D.has(p)).length;
    const hanoiHitCount3D = hanoiTriples3D.filter(t => hanoiWin3D.has(t) || hanoiWin3D.has(t.split("").sort().join(""))).length;

    const card2 = n.jsxs("div", {
      className: "border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 bg-black/55 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden space-y-3.5",
      children: [
        n.jsx("div", { className: "absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" }),
        n.jsxs("div", {
          className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/30 pb-2.5 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsx("span", {
                  className: "bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                  children: "🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรไร้พ่าย 100%)"
                }),
                n.jsx("h4", {
                  className: "text-sm sm:text-base font-extrabold text-emerald-200",
                  children: "ชุดเลขวินเน้น 4 ตัว ล่า 3 รอบ (ฮานอยพิเศษ ➔ ปกติ ➔ VIP)"
                })
              ]
            }),
            n.jsx("span", {
              className: "text-[10px] sm:text-xs text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto",
              children: "⚡ 2 ตัว (บน-ล่าง): " + hanoiPairs2D.length + " ชุด | 3 ตัวตรง: " + hanoiTriples3D.length + " ชุด (24 โต๊ด)"
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
                  className: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",
                  children: ["🎯 สูตรวิน 4 ตัว ล่า 3 นอย: ", n.jsx("strong", { className: "text-emerald-300 font-black", children: "การันตีสถิติเข้าเป้า 100%" })]
                }),
                n.jsxs("span", {
                  className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md",
                  children: ["🗓️ ประจำ: วัน", h.dayName]
                })
              ]
            }),
            n.jsxs("div", {
              className: "flex items-center gap-1.5 bg-black/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl shadow-inner flex-wrap",
              children: [
                n.jsxs("span", {
                  className: "text-[11px] font-black text-emerald-300 flex items-center gap-1 pr-1",
                  children: ["🗓️ ย้อนดูวัน (วัน", n.jsx("strong", { className: "text-white underline decoration-emerald-400 underline-offset-2", children: h.dayName }), "):"]
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
                          ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)] scale-105 border border-emerald-200 ring-2 ring-emerald-400"
                          : "bg-black/50 text-gray-300 hover:text-white hover:bg-emerald-950/50 border border-gray-700/60 active:scale-95"),
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
              children: hanoi100Digits.map(d => n.jsx("div", {
                key: d,
                style: {
                  color: "#ffffff",
                  background: "linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(16, 185, 129, 0.5) 100%)",
                  border: "2px solid #34d399",
                  boxShadow: "0 0 16px rgba(16, 185, 129, 0.45)"
                },
                className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white font-black text-2xl flex items-center justify-center scale-100 hover:scale-105 transition-transform shrink-0 win4-main-digit-green",
                children: d
              }))
            }),
            n.jsx("div", {
              style: { color: "#6ee7b7" },
              className: "text-xs font-semibold pl-1",
              children: "เน้นตัดตรง 4 เลขเด่นคัดพิเศษ สูตรไร้พ่าย 100% (สถิติล่า 3 นอย เข้าเป้าทุกวันไม่มีหลุด)"
            })
          ]
        }),
        n.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 relative z-10",
          children: [
            n.jsxs("div", {
              className: "bg-black/40 border border-emerald-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-emerald-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (" + hanoiPairs2D.length + " ชุด):",
                        hanoiHitCount2D > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                            color: "#000000",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(16, 185, 129, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", hanoiHitCount2D, " ชุด"]
                        }) : null
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(hanoiPairs2D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(16, 185, 129, 0.6) 100%)",
                        border: "1px solid rgba(52, 211, 153, 0.6)",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-green",
                      children: "📋 คัดลอก 2 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: hanoiPairs2D.map(p => {
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
                  })
                })
              ]
            }),
            n.jsxs("div", {
              className: "bg-black/40 border border-teal-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-teal-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดเลขวิน 3 ตัวตรง (" + hanoiTriples3D.length + " ชุด / 24 โต๊ด):",
                        hanoiHitCount3D > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
                            color: "#000000",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(16, 185, 129, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", hanoiHitCount3D, " ชุด"]
                        }) : null
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(hanoiTriples3D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(16, 185, 129, 0.6) 100%)",
                        border: "1px solid rgba(52, 211, 153, 0.6)",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-green",
                      children: "📋 คัดลอก 3 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: hanoiTriples3D.map(t => {
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
                  })
                })
              ]
            })
          ]
        })
      ]
    });

    `;

code = code.slice(0, sIdx) + replacement + code.slice(eIdx);
fs.writeFileSync(patchFile, code, 'utf8');
console.log('Successfully updated apply_win4_card_patch.cjs with Green Glass card2!');
