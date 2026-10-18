const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcPath, 'utf8');

const sIdx = code.indexOf('Ly=({initialDigits:e})=>{');
const nextFnIdx = code.indexOf('function Dy(', sIdx);

if (sIdx === -1 || nextFnIdx === -1) {
  console.error('Could not find Ly boundary in index-CN-5_2d9.js!', { sIdx, nextFnIdx });
  process.exit(1);
}

console.log('Found Ly at:', sIdx, 'to', nextFnIdx);

// Build new Ly with Money Management Card
const newLy = `Ly=({initialDigits:e})=>{
  const [t, o] = W.useState(e.slice(0, 5)),
        [a, i] = W.useState(null),
        r = by(t),
        d = s => {
          if (t.includes(s)) {
            if (t.length <= 2) {
              alert("ควรเลือกเลขอย่างน้อย 2 ตัวสำหรับการจับคู่");
              return;
            }
            o(t.filter(N => N !== s));
          } else {
            if (t.length >= 8) {
              alert("เลือกสูงสุด 8 ตัวเลขเพื่อป้องกันจำนวนชุดที่มากเกินไป");
              return;
            }
            o([...t, s].sort((N, y) => N - y));
          }
        },
        l = (s, N) => {
          navigator.clipboard.writeText(s);
          i(N);
          RN({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
          setTimeout(() => i(null), 2000);
        };

  // Money Management (MM) States
  const [mmCapital, setMmCapital] = W.useState(1000);
  const [mmStrategy, setMmStrategy] = W.useState("martingale");
  const [mmPayoutRate, setMmPayoutRate] = W.useState(92);
  const [mmTargetProfit, setMmTargetProfit] = W.useState(500);
  const [mmBoth, setMmBoth] = W.useState(true);
  const [mmCopied, setMmCopied] = W.useState(false);

  // MM Calculations
  const pairsCount = r.pairs2DCount || (r.pairs2D ? r.pairs2D.length : 20);
  const totalUnitsPerStep = mmBoth ? (pairsCount * 2) : pairsCount;

  let mults = [1, 2, 4];
  let stratDesc = "สูตรยอดนิยม: ถูกสเต็ปไหนได้กำไรทันที แล้วหยุดรอบนั้น";
  if (mmStrategy === "conservative") {
    mults = [1, 2, 3];
    stratDesc = "สูตรประหยัดทุน: เหมาะกับงบน้อย ได้กำไรกำลังดี";
  } else if (mmStrategy === "flat") {
    mults = [1, 1, 1];
    stratDesc = "สูตรคงที่: ลงทุนเท่ากันทุกสเต็ป ความเสี่ยงต่ำสุด";
  }

  const totalMultUnits = (mults[0] + mults[1] + mults[2]) * totalUnitsPerStep;
  let baseBet = Math.max(1, Math.floor(mmCapital / (totalMultUnits > 0 ? totalMultUnits : 1)));

  // Target Profit calculation for baseBet
  const netPerUnitStep1 = mmPayoutRate - totalUnitsPerStep;
  const targetBaseBet = (netPerUnitStep1 > 0 && mmTargetProfit > 0) ? Math.ceil(mmTargetProfit / netPerUnitStep1) : 1;
  const targetTotalCost = targetBaseBet * totalMultUnits;

  const steps = [
    { name: "สเต็ป 1: นิเคอิ (เปิดเกม)", mult: mults[0], tag: "☀️ 09:30 / 13:00" },
    { name: "สเต็ป 2: จีน (ตามผล)", mult: mults[1], tag: "☀️ 10:30 / 14:00" },
    { name: "สเต็ป 3: ฮั่งเส็ง (กู้เกม)", mult: mults[2], tag: "☀️ 11:00 / 15:30" }
  ];

  let cumCost = 0;
  const stepResults = steps.map(st => {
    const betPerUnit = baseBet * st.mult;
    const stepCost = betPerUnit * totalUnitsPerStep;
    cumCost += stepCost;
    const winAmount = betPerUnit * mmPayoutRate;
    const netProfit = winAmount - cumCost;
    const roi = cumCost > 0 ? Math.round((netProfit / cumCost) * 100) : 0;
    return { ...st, betPerUnit, stepCost, cumCost, winAmount, netProfit, roi };
  });

  const totalCost = cumCost;
  const buffer = mmCapital - totalCost;
  const avgProfit = Math.round(stepResults.reduce((sum, s) => sum + s.netProfit, 0) / stepResults.length);
  const avgRoi = totalCost > 0 ? Math.round((avgProfit / (totalCost / 2)) * 100) : 0;

  const handleCopyPlan = () => {
    const text = [
      "💰 แผนการเดินเงิน MM (" + (mmStrategy === "martingale" ? "ล่า 3 สเต็ป 1:2:4" : mmStrategy === "conservative" ? "ล่า 3 สเต็ป 1:2:3" : "คงที่ 1:1:1") + ")",
      "💵 ทุนรวม: " + mmCapital.toLocaleString() + " บาท | จ่ายบาทละ: " + mmPayoutRate + " บาท",
      "🎲 เลขวิน 2 ตัว: " + pairsCount + " ชุด " + (mmBoth ? "(บน+ล่าง รวม " + totalUnitsPerStep + " ตัว)" : "(บนหรือล่าง " + totalUnitsPerStep + " ตัว)"),
      "----------------------------",
      "1️⃣ สเต็ป 1 (นิเคอิ): ตัวละ " + stepResults[0].betPerUnit + "฿ | ทุน " + stepResults[0].stepCost.toLocaleString() + "฿ ➔ กำไรสุทธิ +" + stepResults[0].netProfit.toLocaleString() + "฿ (+" + stepResults[0].roi + "%)",
      "2️⃣ สเต็ป 2 (จีน): ตัวละ " + stepResults[1].betPerUnit + "฿ | ทุน " + stepResults[1].stepCost.toLocaleString() + "฿ (สะสม " + stepResults[1].cumCost.toLocaleString() + "฿) ➔ กำไรสุทธิ +" + stepResults[1].netProfit.toLocaleString() + "฿ (+" + stepResults[1].roi + "%)",
      "3️⃣ สเต็ป 3 (ฮั่งเส็ง): ตัวละ " + stepResults[2].betPerUnit + "฿ | ทุน " + stepResults[2].stepCost.toLocaleString() + "฿ (สะสม " + stepResults[2].cumCost.toLocaleString() + "฿) ➔ กำไรสุทธิ +" + stepResults[2].netProfit.toLocaleString() + "฿ (+" + stepResults[2].roi + "%)",
      "----------------------------",
      "📊 ทุนใช้จริง: " + totalCost.toLocaleString() + "฿ | ทุนสำรองเหลือ: " + (buffer >= 0 ? "+" : "") + buffer.toLocaleString() + "฿",
      "🎯 กำไรเฉลี่ย: +" + avgProfit.toLocaleString() + "฿/รอบ | กฎเหล็ก: เข้าเป้าสเต็ปไหนให้หยุดทันที (Take Profit)!"
    ].join("\\n");
    navigator.clipboard.writeText(text);
    setMmCopied(true);
    RN({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setMmCopied(false), 2000);
  };

  return n.jsxs("div", {
    className: "bg-nikkei-card border border-nikkei-border rounded-2xl p-6 shadow-lg space-y-6",
    children: [
      // 1. Header
      n.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nikkei-border",
        children: [
          n.jsxs("div", {
            children: [
              n.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  n.jsx(j2, { className: "w-5 h-5 text-amber-400" }),
                  n.jsx("h3", { className: "text-xl font-extrabold text-white", children: "เครื่องมือสร้างชุดเลขวิน (Win Number Combination Generator)" })
                ]
              }),
              n.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "เลือกชุดเลขเด่น 0-9 เพื่อสร้างชุดเลขวิน 2 ตัว บน-ล่าง, ชุด 3 ตัว และเลข 19 ประตูอัตโนมัติ" })
            ]
          }),
          n.jsxs("button", {
            onClick: () => o(e.slice(0, 5)),
            className: "bg-nikkei-dark hover:bg-nikkei-cardHover border border-nikkei-border text-xs text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer",
            children: [
              n.jsx(Vy, { className: "w-3.5 h-3.5" }),
              n.jsx("span", { children: "ใช้เลขเด่นจากระบบทำนาย" })
            ]
          })
        ]
      }),

      // 2. Select Digits 0-9
      n.jsxs("div", {
        className: "my-2",
        children: [
          n.jsxs("label", {
            className: "text-xs font-semibold text-gray-300 block mb-2",
            children: ["เลือกตัวเลขเด่นเพื่อนำมาจับวิน (เลือกแล้ว ", t.length, " ตัว):"]
          }),
          n.jsx("div", {
            className: "flex flex-wrap gap-2",
            children: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => {
              const N = t.includes(s);
              return n.jsx("button", {
                key: s,
                onClick: () => d(s),
                className: "w-11 h-11 rounded-xl font-extrabold text-lg transition-all duration-200 cursor-pointer " +
                  (N ? "bg-amber-400 text-black shadow-glow-gold scale-105" : "bg-nikkei-dark hover:bg-gray-800 text-gray-400 border border-nikkei-border"),
                children: s
              });
            })
          })
        ]
      }),

      // 3. 2D and 3D Win Result Boxes
      n.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
        children: [
          n.jsx("div", {
            className: "bg-nikkei-dark/60 border border-nikkei-border rounded-xl p-4 flex flex-col justify-between",
            children: n.jsxs("div", {
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between mb-2",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-amber-400 flex items-center gap-1",
                      children: [
                        n.jsx(wt, { className: "w-4 h-4" }),
                        " ชุดเลขวิน 2 ตัว บน-ล่าง (", r.pairs2DCount, " ชุด)"
                      ]
                    }),
                    n.jsxs("button", {
                      onClick: () => l(r.pairs2D.join(", "), "2D"),
                      className: "text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer",
                      children: [
                        a === "2D" ? n.jsx(bo, { className: "w-3 h-3 text-emerald-400" }) : n.jsx(Ld, { className: "w-3 h-3" }),
                        n.jsx("span", { children: a === "2D" ? "คัดลอกแล้ว" : "คัดลอก 2 ตัว" })
                      ]
                    })
                  ]
                }),
                n.jsx("p", {
                  className: "text-xs text-gray-300 font-mono leading-relaxed bg-nikkei-dark p-3 rounded-lg border border-gray-800 max-h-32 overflow-y-auto",
                  children: r.pairs2D.join(" , ")
                })
              ]
            })
          }),
          n.jsx("div", {
            className: "bg-nikkei-dark/60 border border-nikkei-border rounded-xl p-4 flex flex-col justify-between",
            children: n.jsxs("div", {
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between mb-2",
                  children: [
                    n.jsxs("span", {
                      className: "text-xs font-bold text-cyan-400 flex items-center gap-1",
                      children: [
                        n.jsx(wt, { className: "w-4 h-4" }),
                        " ชุดเลขวิน 3 ตัว (", r.triples3DCount, " ชุด)"
                      ]
                    }),
                    n.jsxs("button", {
                      onClick: () => l(r.triples3D.join(", "), "3D"),
                      className: "text-[11px] text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer",
                      children: [
                        a === "3D" ? n.jsx(bo, { className: "w-3 h-3 text-emerald-400" }) : n.jsx(Ld, { className: "w-3 h-3" }),
                        n.jsx("span", { children: a === "3D" ? "คัดลอกแล้ว" : "คัดลอก 3 ตัว" })
                      ]
                    })
                  ]
                }),
                n.jsx("p", {
                  className: "text-xs text-gray-300 font-mono leading-relaxed bg-nikkei-dark p-3 rounded-lg border border-gray-800 max-h-32 overflow-y-auto",
                  children: r.triples3D.length > 0 ? r.triples3D.join(" , ") : "เลือกตัวเลขอย่างน้อย 3 ตัวเพื่อสร้างชุด 3 ตัว"
                })
              ]
            })
          })
        ]
      }),

      // 4. NEW MONEY MANAGEMENT (MM) CARD
      n.jsxs("div", {
        className: "border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-950/20 via-black/40 to-teal-950/20 shadow-[0_0_25px_rgba(16,185,129,0.12)] relative overflow-hidden space-y-4",
        children: [
          n.jsx("div", { className: "absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" }),
          
          // MM Card Header
          n.jsxs("div", {
            className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-emerald-500/30 pb-3 relative z-10",
            children: [
              n.jsxs("div", {
                children: [
                  n.jsxs("div", {
                    className: "flex items-center gap-2 flex-wrap",
                    children: [
                      n.jsx("span", {
                        className: "bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                        children: "💰 MM Management"
                      }),
                      n.jsx("h4", {
                        className: "text-sm sm:text-base font-extrabold text-white",
                        children: "แผนบริหารเงินทุน & เดินเงินอัจฉริยะ (Money Management)"
                      })
                    ]
                  }),
                  n.jsx("p", {
                    className: "text-xs text-gray-400 mt-0.5",
                    children: "คำนวณการเดินเงินอัตโนมัติตามชุดเลขวินด้านบน วางแผนล่า 3 สเต็ป มีกำไรทุกสเต็ปที่เข้าเป้า"
                  })
                ]
              }),
              n.jsx("span", {
                className: "text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-inner self-start sm:self-auto",
                children: "⚡ คำนวณสด Real-time"
              })
            ]
          }),

          // MM Controls: Capital, Strategy, Rate & Target Profit
          n.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10",
            children: [
              // Column 1: Capital Input & Presets
              n.jsxs("div", {
                className: "bg-black/50 border border-emerald-500/30 rounded-xl p-3 space-y-2",
                children: [
                  n.jsxs("label", {
                    className: "text-xs font-bold text-amber-300 flex items-center justify-between",
                    children: [
                      n.jsx("span", { children: "💵 เงินทุนที่มีทั้งหมด (บาท):" }),
                      n.jsx("span", { className: "text-[10px] text-gray-400 font-normal", children: "งบประมาณ" })
                    ]
                  }),
                  n.jsxs("div", {
                    className: "relative",
                    children: [
                      n.jsx("input", {
                        type: "number",
                        value: mmCapital,
                        onChange: e => setMmCapital(Math.max(10, parseFloat(e.target.value) || 0)),
                        min: "50",
                        step: "50",
                        className: "w-full bg-[#121214] border border-gray-600 rounded-lg px-3 py-1.5 text-white font-black text-base focus:outline-none focus:border-amber-400 transition-colors"
                      }),
                      n.jsx("span", { className: "absolute right-3 top-2 text-xs text-gray-400 font-bold", children: "฿" })
                    ]
                  }),
                  n.jsx("div", {
                    className: "flex items-center gap-1.5 flex-wrap pt-0.5",
                    children: [300, 500, 1000, 2000, 5000].map(amt => n.jsx("button", {
                      key: amt,
                      type: "button",
                      onClick: () => setMmCapital(amt),
                      className: "text-xs font-bold px-2 py-0.5 rounded transition-all cursor-pointer " +
                        (mmCapital === amt
                          ? "bg-amber-400 text-black font-extrabold border border-amber-300 shadow-sm"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"),
                      children: amt.toLocaleString() + "฿"
                    }))
                  })
                ]
              }),

              // Column 2: Strategy Selector & Top/Bottom Checkbox
              n.jsxs("div", {
                className: "bg-black/50 border border-emerald-500/30 rounded-xl p-3 space-y-2",
                children: [
                  n.jsx("label", { className: "text-xs font-bold text-emerald-300 block", children: "🎯 กลยุทธ์การเดินเงิน:" }),
                  n.jsxs("select", {
                    value: mmStrategy,
                    onChange: e => setMmStrategy(e.target.value),
                    className: "w-full bg-[#121214] border border-gray-600 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer",
                    children: [
                      n.jsx("option", { value: "martingale", children: "⚡ ล่า 3 สเต็ป ทบเงินกำไรเพิ่ม (1 : 2 : 4)" }),
                      n.jsx("option", { value: "conservative", children: "🛡️ ล่า 3 สเต็ป ทบคืนทุน+กำไรคงที่ (1 : 2 : 3)" }),
                      n.jsx("option", { value: "flat", children: "⚖️ แบ่งรอบคงที่ (1 : 1 : 1) ความเสี่ยงต่ำ" })
                    ]
                  }),
                  n.jsx("p", { className: "text-[11px] text-gray-400 leading-snug", children: stratDesc }),
                  n.jsx("div", {
                    className: "pt-1 border-t border-gray-800/80",
                    children: n.jsxs("label", {
                      className: "text-[11px] text-gray-300 flex items-center gap-1.5 cursor-pointer select-none",
                      children: [
                        n.jsx("input", {
                          type: "checkbox",
                          checked: mmBoth,
                          onChange: e => setMmBoth(e.target.checked),
                          className: "rounded accent-emerald-500 cursor-pointer"
                        }),
                        n.jsxs("span", { children: ["แทง บน + ล่าง (รวม ", totalUnitsPerStep, " ตัวต่อสเต็ป)"] })
                      ]
                    })
                  })
                ]
              }),

              // Column 3: Payout Rate & Target Daily Profit
              n.jsxs("div", {
                className: "bg-black/50 border border-emerald-500/30 rounded-xl p-3 space-y-2",
                children: [
                  n.jsxs("div", {
                    className: "grid grid-cols-2 gap-2",
                    children: [
                      n.jsxs("div", {
                        children: [
                          n.jsx("span", { className: "text-[10px] text-gray-400 font-bold block mb-1", children: "จ่ายบาทละ:" }),
                          n.jsxs("select", {
                            value: mmPayoutRate,
                            onChange: e => setMmPayoutRate(parseFloat(e.target.value) || 92),
                            className: "w-full bg-[#121214] border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer",
                            children: [
                              n.jsx("option", { value: 90, children: "90 บาท" }),
                              n.jsx("option", { value: 92, children: "92 บาท" }),
                              n.jsx("option", { value: 95, children: "95 บาท" }),
                              n.jsx("option", { value: 100, children: "100 บาท" })
                            ]
                          })
                        ]
                      }),
                      n.jsxs("div", {
                        children: [
                          n.jsx("span", { className: "text-[10px] text-emerald-400 font-bold block mb-1", children: "กำไรเป้าหมาย/วัน:" }),
                          n.jsx("input", {
                            type: "number",
                            value: mmTargetProfit,
                            onChange: e => setMmTargetProfit(Math.max(0, parseFloat(e.target.value) || 0)),
                            min: "100",
                            step: "100",
                            className: "w-full bg-[#121214] border border-gray-600 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                          })
                        ]
                      })
                    ]
                  }),
                  n.jsxs("div", {
                    className: "pt-1 flex items-center justify-between gap-1",
                    children: [
                      n.jsx("div", {
                        className: "flex items-center gap-1",
                        children: [300, 500, 1000].map(tp => n.jsx("button", {
                          key: tp,
                          type: "button",
                          onClick: () => setMmTargetProfit(tp),
                          className: "text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer " +
                            (mmTargetProfit === tp ? "bg-emerald-500 text-black font-extrabold" : "bg-gray-800 text-gray-400 hover:text-white"),
                          children: tp + "฿"
                        }))
                      }),
                      targetTotalCost > 0 ? n.jsxs("button", {
                        type: "button",
                        onClick: () => setMmCapital(targetTotalCost),
                        title: "คลิกเพื่อปรับเงินทุนให้พอดีกับกำไรเป้าหมาย " + mmTargetProfit + " บาท",
                        className: "text-[10px] text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-0.5",
                        children: [
                          n.jsx(wt, { className: "w-2.5 h-2.5 text-emerald-400" }),
                          "ปรับทุน " + targetTotalCost.toLocaleString() + "฿"
                        ]
                      }) : null
                    ]
                  })
                ]
              })
            ]
          }),

          // 3-Step Martingale Calculation Table
          n.jsxs("div", {
            className: "bg-black/60 border border-emerald-500/30 rounded-xl overflow-hidden relative z-10 shadow-inner",
            children: [
              n.jsxs("div", {
                className: "p-2.5 sm:p-3 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2",
                children: [
                  n.jsx("span", {
                    className: "text-xs font-extrabold text-white flex items-center gap-1.5",
                    children: "📋 แผนการเดินเงินล่า 3 สเต็ป (นิเคอิ ➔ จีน ➔ ฮั่งเส็ง)"
                  }),
                  n.jsxs("span", {
                    className: "text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md",
                    children: ["✓ เล่นชุดละ ", totalUnitsPerStep, " ตัว (บน-ล่าง) หักทุนสะสมแล้ว"]
                  })
                ]
              }),
              n.jsx("div", {
                className: "overflow-x-auto",
                children: n.jsxs("table", {
                  className: "w-full text-left text-xs",
                  children: [
                    n.jsx("thead", {
                      children: n.jsxs("tr", {
                        className: "border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold",
                        children: [
                          n.jsx("th", { className: "p-2.5 sm:p-3", children: "สเต็ปที่ / ตลาด" }),
                          n.jsx("th", { className: "p-2.5 sm:p-3 text-center", children: "ตัวละ (บาท)" }),
                          n.jsx("th", { className: "p-2.5 sm:p-3 text-right", children: "ทุนรอบนี้" }),
                          n.jsx("th", { className: "p-2.5 sm:p-3 text-right", children: "ทุนสะสม" }),
                          n.jsx("th", { className: "p-2.5 sm:p-3 text-right", children: "ถูกรางวัลรับ" }),
                          n.jsx("th", { className: "p-2.5 sm:p-3 text-right font-extrabold text-emerald-300", children: "กำไรสุทธิ (ROI)" })
                        ]
                      })
                    }),
                    n.jsx("tbody", {
                      className: "divide-y divide-gray-800/60 font-mono",
                      children: stepResults.map((st, idx) => n.jsxs("tr", {
                        key: st.name,
                        className: "hover:bg-white/5 transition-colors",
                        children: [
                          n.jsxs("td", {
                            className: "p-2.5 sm:p-3 font-sans",
                            children: [
                              n.jsx("div", { className: "font-extrabold text-white text-xs", children: st.name }),
                              n.jsxs("div", { className: "text-[10px] text-gray-400 font-mono", children: [st.tag, " (", totalUnitsPerStep, " ตัว)"] })
                            ]
                          }),
                          n.jsx("td", {
                            className: "p-2.5 sm:p-3 text-center",
                            children: n.jsxs("span", {
                              className: "bg-amber-400/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded font-black text-xs",
                              children: [st.betPerUnit, " ฿"]
                            })
                          }),
                          n.jsxs("td", { className: "p-2.5 sm:p-3 text-right text-gray-300 font-bold", children: [st.stepCost.toLocaleString(), " ฿"] }),
                          n.jsxs("td", { className: "p-2.5 sm:p-3 text-right text-amber-400/90 font-bold", children: [st.cumCost.toLocaleString(), " ฿"] }),
                          n.jsxs("td", { className: "p-2.5 sm:p-3 text-right text-gray-200 font-bold", children: [st.winAmount.toLocaleString(), " ฿"] }),
                          n.jsxs("td", {
                            className: "p-2.5 sm:p-3 text-right",
                            children: [
                              n.jsxs("span", {
                                className: "bg-emerald-500 text-black font-black px-2 py-0.5 rounded text-xs shadow-sm inline-block",
                                children: ["+", st.netProfit.toLocaleString(), " ฿"]
                              }),
                              n.jsxs("div", { className: "text-[10px] text-emerald-400 font-sans mt-0.5", children: ["+", st.roi, "% ROI"] })
                            ]
                          })
                        ]
                      }, st.name))
                    })
                  ]
                })
              })
            ]
          }),

          // KPI Summary Cards
          n.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10",
            children: [
              n.jsxs("div", {
                className: "bg-black/50 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between",
                children: [
                  n.jsxs("div", {
                    children: [
                      n.jsx("span", { className: "text-[10px] sm:text-[11px] text-gray-400 font-bold block", children: "ทุนที่ใช้จริง (3 สเต็ป)" }),
                      n.jsxs("span", { className: "text-base sm:text-lg font-black text-amber-400 font-mono", children: [totalCost.toLocaleString(), " ฿"] })
                    ]
                  }),
                  n.jsx("div", {
                    children: buffer >= 0
                      ? n.jsx("span", { className: "text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-500/30", children: "✓ งบพอดี" })
                      : n.jsxs("span", { className: "text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-1 rounded-md border border-rose-500/30", children: ["⚠️ ขาด ", Math.abs(buffer).toLocaleString(), "฿"] })
                  })
                ]
              }),
              n.jsxs("div", {
                className: "bg-black/50 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between",
                children: [
                  n.jsxs("div", {
                    children: [
                      n.jsx("span", { className: "text-[10px] sm:text-[11px] text-gray-400 font-bold block", children: "กำไรเฉลี่ยเมื่อเข้าเป้า" }),
                      n.jsxs("span", { className: "text-base sm:text-lg font-black text-emerald-400 font-mono", children: ["+", avgProfit.toLocaleString(), " ฿"] })
                    ]
                  }),
                  n.jsxs("span", { className: "text-[10px] font-bold text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-md font-mono", children: ["+", avgRoi, "% ROI"] })
                ]
              }),
              n.jsxs("div", {
                className: "bg-black/50 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between",
                children: [
                  n.jsxs("div", {
                    children: [
                      n.jsx("span", { className: "text-[10px] sm:text-[11px] text-gray-400 font-bold block", children: "ทุนสำรองคงเหลือ (Buffer)" }),
                      n.jsxs("span", { className: "text-base sm:text-lg font-black text-cyan-400 font-mono", children: [(buffer >= 0 ? "+" : "") + buffer.toLocaleString(), " ฿"] })
                    ]
                  }),
                  n.jsx("span", { className: "text-[10px] text-gray-400", children: buffer >= 0 ? "ปลอดภัย" : "ความเสี่ยงสูง" })
                ]
              })
            ]
          }),

          // Tactical Strategy & Copy Plan Button
          n.jsxs("div", {
            className: "bg-gradient-to-r from-emerald-950/40 via-black/40 to-teal-950/40 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10 text-xs",
            children: [
              n.jsxs("div", {
                className: "flex items-start sm:items-center gap-2",
                children: [
                  n.jsx("span", { className: "text-base shrink-0", children: "💡" }),
                  n.jsxs("span", {
                    className: "text-gray-300 leading-relaxed",
                    children: [
                      n.jsx("strong", { className: "text-emerald-300", children: "กฎเหล็กการเล่น: " }),
                      "เมื่อตัวเลขแตกเข้าเป้าที่สเต็ปใดสเต็ปหนึ่งแล้ว ",
                      n.jsx("strong", { className: "text-amber-300", children: "ให้หยุดเล่นทันที (Take Profit) " }),
                      "เพื่อเก็บกำไรเข้ากระเป๋า ไม่ต้องตามต่อจนครบ 3 สเต็ป"
                    ]
                  })
                ]
              }),
              n.jsxs("button", {
                type: "button",
                onClick: handleCopyPlan,
                className: "shrink-0 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black px-3.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer",
                children: [
                  mmCopied ? n.jsx(bo, { className: "w-3.5 h-3.5 text-black" }) : n.jsx(Ld, { className: "w-3.5 h-3.5" }),
                  n.jsx("span", { children: mmCopied ? "✓ คัดลอกแผนแล้ว!" : "📋 คัดลอกแผนเดินเงิน" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};`;

// Replace Ly in code
code = code.substring(0, sIdx) + newLy + code.substring(nextFnIdx);
fs.writeFileSync(srcPath, code, 'utf8');
console.log('Saved enhanced Ly to downloaded_target_worker/assets/index-CN-5_2d9.js!');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('Saved to dist/assets/index-CN-5_2d9.js!');
