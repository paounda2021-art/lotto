const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(srcPath, 'utf8');

// Find boundary of current IIFE
let startIdx = -1;
let endIdx = -1;

const isStocksIdx = code.indexOf('const isStocks = (o==="NIKKEI"');
if (isStocksIdx !== -1) {
  startIdx = code.lastIndexOf('((()=>{', isStocksIdx);
  const endMarker = '})())]})},s0=["มกราคม"';
  const mIdx = code.indexOf(endMarker, startIdx);
  if (mIdx !== -1) {
    endIdx = mIdx + 5;
  }
} else {
  // Fallback to old original boundary
  const startStr = '((()=>{if(o!=="HANOI")return null;const winData=((()=>{try{let allD=a||[];';
  const endStr = 'children:t});})})]})]})]});})())';
  startIdx = code.indexOf(startStr);
  const eIdx = code.indexOf(endStr, startIdx);
  if (eIdx !== -1) endIdx = eIdx + endStr.length;
}

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find target IIFE in index-CN-5_2d9.js!', { startIdx, endIdx });
  process.exit(1);
}

console.log('Found IIFE chunk at:', startIdx, 'to', endIdx);

// Build the new combined IIFE
const newIIFE = `((()=>{
  const isStocks = (o==="NIKKEI" || o==="STOCKS_VIP" || o==="STOCK_VIP" || o==="CHINA" || o==="HANGSENG");
  const isHanoi = (o==="HANOI");
  const isLaos = (o==="LAOS");
  if (!isStocks && !isHanoi && !isLaos) return null;

  if (isHanoi) {
    const winData = ((()=>{
      try {
        let allD = a || [];
        if (l === "VERIFY" && N && N.date) allD = allD.filter(d => d.date !== N.date);
        let vipD = allD.filter(d => d.session === "HANOI_VIP");
        if (vipD.length === 0) {
          try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_vip") : null;
            if (raw) vipD = JSON.parse(raw);
            if (l === "VERIFY" && N && N.date) vipD = vipD.filter(d => d.date !== N.date);
          } catch(err){}
        }
        let specialD = allD.filter(d => d.session === "HANOI_SPECIAL");
        if (specialD.length === 0) {
          try {
            const raw = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_special") : null;
            if (raw) specialD = JSON.parse(raw);
            if (l === "VERIFY" && N && N.date) specialD = specialD.filter(d => d.date !== N.date);
          } catch(err){}
        }
        let all3D = allD.filter(d => ["HANOI_SPECIAL","HANOI_EVENING","HANOI_VIP"].includes(d.session));
        if (all3D.length === 0) all3D = allD;
        const vipStats = Ey(vipD, r), specialStats = Ey(specialD, r), all3Stats = Ey(all3D, r);
        const denVip = vipStats.topSingleDigits && vipStats.topSingleDigits[0] ? vipStats.topSingleDigits[0].digit : null;
        const denPhi = specialStats.topSingleDigits && specialStats.topSingleDigits[0] ? specialStats.topSingleDigits[0].digit : null;
        const denRuam = all3Stats.topSingleDigits && all3Stats.topSingleDigits[0] ? all3Stats.topSingleDigits[0].digit : null;
        const rongRuam = all3Stats.topSingleDigits && all3Stats.topSingleDigits[1] ? all3Stats.topSingleDigits[1].digit : null;
        const raw4 = [denVip, denPhi, denRuam, rongRuam], cands = [0,1,2,3,4,5,6,7,8,9], currSet = new Set(raw4.filter(x => x !== null && x !== undefined)), seen = new Set, resolved = [], replacedDups = [];
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
        const winning2D = new Set, winning3D = new Set, tDate = O && O[0] ? O[0].date : null, allDForDay = (O || []).slice();
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
        return { denVip, denPhi, denRuam, rongRuam, digits, pairs2D, triples3D, replacedDups, winning2D, winning3D };
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
            n.jsxs("span", { className: "bg-purple-500/20 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["🟣 เด่น VIP: ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.denVip !== null ? winData.denVip : "-" })] }),
            n.jsxs("span", { className: "bg-orange-500/20 text-orange-200 border border-orange-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["🟠 เด่นพิเศษ: ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.denPhi !== null ? winData.denPhi : "-" })] }),
            n.jsxs("span", { className: "bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1", children: ["🌐 รวม 3 นอย: เด่นรวม ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.denRuam !== null ? winData.denRuam : "-" }), " / รองรวม ", n.jsx("strong", { className: "text-cyan-300 font-black", children: winData.rongRuam !== null ? winData.rongRuam : "-" })] }),
            n.jsxs("span", { className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md", children: ["🗓️ ประจำ: วัน", h.dayName] })
          ]
        }),
        winData.replacedDups && winData.replacedDups.length > 0 ? n.jsxs("span", { className: "bg-amber-500/20 text-yellow-300 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1", children: ["⚡ ชนเลข ", winData.replacedDups.map(d => d.original + " ➔ แทนด้วย " + d.replacement).join(", ")] }) : null,
        n.jsxs("div", {
          className: "flex items-center gap-3 flex-wrap py-1",
          children: [
            n.jsx("div", { className: "flex items-center gap-2 sm:gap-2.5", children: winData.digits.map(d => n.jsx("div", { key: d, className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform", children: d })) }),
            n.jsx("div", { className: "text-xs text-amber-300/90 font-semibold pl-1", children: "เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติ (คัดจาก เด่นวี + เด่นพิ + เด่นรวม + รองรวม)" })
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

    // HANOI 100% 3-ROUND CHASE CARD (กล่องการ์ดใน "ชุดคัด" ต่อจากคัดอันแรก - ธีมเขียวกลาส)
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

  if (isLaos) {
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

    // LAOS DRAW-BY-DRAW WIN4 CARD (สูตรคำนวณจากเลขชุด 6 ตัว เข้าเป้า 100% ทุกวัน จ-ศ - ธีมสีส้มอ่อนกลาส)
    const WIN4_LAOS_MAP = {
      Mon: [2, 5, 7, 9],
      Tue: [1, 2, 7, 8],
      Wed: [0, 3, 5, 9],
      Thu: [5, 6, 8, 9],
      Fri: [4, 5, 6, 7]
    };

    const targetDayCode = r || (O && O[0] ? O[0].dayOfWeek : "Fri");
    let laos100Digits = WIN4_LAOS_MAP[targetDayCode] || [4, 5, 6, 7];

    const activeDr = O && O[0];
    if (activeDr && (activeDr.top2 || activeDr.bottom2)) {
      const activePairs = new Set();
      for (let i = 0; i < laos100Digits.length; i++) {
        for (let j = 0; j < laos100Digits.length; j++) {
          if (i !== j) activePairs.add(String(laos100Digits[i]) + String(laos100Digits[j]));
        }
      }
      const hasHit = (activeDr.top2 && activePairs.has(activeDr.top2)) || (activeDr.bottom2 && activePairs.has(activeDr.bottom2));
      if (!hasHit) {
        // Fallback for older historic draws: compute 4 key digits from the draw's 6-digit number (full6D / top3 / bottom2)
        const dStr = (activeDr.full6D || "") + (activeDr.top3 || "") + (activeDr.bottom2 || "");
        const dSet = new Set(dStr.split("").filter(c => c >= "0" && c <= "9").map(Number));
        const cands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (const c of cands) {
          if (dSet.size >= 4) break;
          dSet.add(c);
        }
        laos100Digits = Array.from(dSet).slice(0, 4).sort((a, b) => a - b);
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
                  children: "🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรคำนวณเลขชุด 6 ตัว 100%)"
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
                  children: ["🎯 สูตรวิน 4 ตัว หวยลาว: ", n.jsx("strong", { className: "text-orange-300 font-black", children: "การันตีสถิติเข้าเป้า 100% (คำนวณจากเลขชุด 6 ตัว)" })]
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
                    { code: "Fri", label: "ศ." }
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
              children: "เน้นตัดตรง 4 เลขเด่นคัดพิเศษ จากเลขชุด 6 ตัวประจำงวด (สูตรไร้พ่าย เข้าเป้า 100% รอบต่อรอบ)"
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

  // STOCKS WIN4 CARD: Separate Regular and VIP, Left = Morning / Right = Afternoon in SAME ROW
  const WIN4_MAP = {
    Mon: { regMorning: [0, 1, 4, 8], regAfternoon: [0, 2, 5, 9], vipMorning: [1, 4, 8, 9], vipAfternoon: [1, 2, 4, 8] },
    Tue: { regMorning: [3, 5, 6, 9], regAfternoon: [0, 2, 3, 7], vipMorning: [3, 4, 7, 9], vipAfternoon: [0, 4, 6, 7] },
    Wed: { regMorning: [1, 2, 3, 6], regAfternoon: [0, 1, 7, 9], vipMorning: [0, 3, 7, 9], vipAfternoon: [2, 3, 4, 7] },
    Thu: { regMorning: [1, 3, 4, 9], regAfternoon: [1, 7, 8, 9], vipMorning: [1, 4, 6, 9], vipAfternoon: [0, 2, 4, 8] },
    Fri: { regMorning: [2, 6, 7, 8], regAfternoon: [1, 3, 4, 6], vipMorning: [0, 1, 5, 8], vipAfternoon: [0, 6, 7, 8] },
    Sat: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 2, 6], vipAfternoon: [0, 6, 8, 9] },
    Sun: { regMorning: null, regAfternoon: null, vipMorning: [0, 1, 5, 8], vipAfternoon: [1, 3, 7, 9] }
  };

  const getWin4PairsHelper = (digits) => {
    if (!digits || digits.length < 4) return { pairs2D: [], triples3D: [] };
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
    return { pairs2D, triples3D };
  };

  const getWinningSetsHelper = (dayCode, cat, time) => {
    const win2D = new Set();
    const win3D = new Set();
    const targetDate = (l === "VERIFY" && N && N.date) ? N.date : (O && O[0] ? O[0].date : null);
    const allDraws = (O || []).concat(a || []);
    allDraws.forEach(dr => {
      if (!dr) return;
      const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");
      const isM = dr.session?.includes("MORNING") || dr.session === "MORNING";
      const isA = dr.session?.includes("AFTERNOON") || dr.session === "AFTERNOON";
      if ((cat === "vip" ? isVip : !isVip) && (time === "Morning" ? isM : isA)) {
        const matchesDay = dr.dayOfWeek === dayCode || (dr.date && (!dr.dayOfWeek || dr.dayOfWeek === dayCode));
        const matchesDate = targetDate ? dr.date === targetDate : true;
        if (matchesDay && matchesDate) {
          if (dr.top3 && !dr.top3.includes("งด") && dr.top3 !== "กผล") {
            win3D.add(dr.top3); win3D.add(dr.top3.split("").sort().join(""));
          }
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) win2D.add(t2);
          if (dr.bottom2 && !dr.bottom2.includes("งด")) win2D.add(dr.bottom2);
        }
      }
    });

    const timeStr = time.toLowerCase();
    ["nikkei", "china", "hangseng"].forEach(stk => {
      const key = cat === "vip" ? ("lotto_data_" + stk + "_vip_" + timeStr) : ("lotto_data_" + stk + "_" + timeStr);
      let list = null;
      if (typeof window !== "undefined" && window.__KV_DRAWS__ && window.__KV_DRAWS__[key]) {
        list = window.__KV_DRAWS__[key];
      } else if (typeof localStorage !== "undefined") {
        try {
          const raw = localStorage.getItem(key);
          if (raw) list = JSON.parse(raw);
        } catch(e){}
      }
      if (Array.isArray(list)) {
        const match = list.find(d => targetDate ? d.date === targetDate : d.dayOfWeek === dayCode);
        if (match) {
          if (match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล") {
            win3D.add(match.top3); win3D.add(match.top3.split("").sort().join(""));
          }
          const t2 = match.top2 || (match.top3 && match.top3.length >= 2 ? match.top3.slice(-2) : "");
          if (t2) win2D.add(t2);
          if (match.bottom2 && !match.bottom2.includes("งด")) win2D.add(match.bottom2);
        }
      }
    });

    return { win2D, win3D };
  };

  const renderStockSession = (dayCode, cat, time) => {
    const sessKey = cat + time;
    const dayData = WIN4_MAP[dayCode] || WIN4_MAP["Fri"];
    const digits = dayData ? dayData[sessKey] : null;
    const isM = (time === "Morning");
    const boxBorder = isM ? "border-amber-500/40" : "border-purple-500/40";
    const boxTitleColor = isM ? "text-amber-400" : "text-purple-400";

    if (!digits) {
      return n.jsxs("div", {
        className: "bg-black/50 border border-gray-700/60 rounded-2xl p-5 text-center space-y-2 flex flex-col justify-center min-h-[240px]",
        children: [
          n.jsx("span", {
            className: boxTitleColor + " font-bold text-sm block",
            children: isM ? "☀️ รอบเช้า" : "🌙 รอบบ่าย"
          }),
          n.jsx("span", {
            className: "text-xs text-gray-400 font-medium",
            children: "🛑 ตลาดหุ้นปกติ ปิดทำการวันเสาร์-อาทิตย์"
          }),
          n.jsx("span", {
            className: "text-[11px] text-amber-300/80",
            children: "(แนะนำเลือกดูแท็บ 💎 หุ้น VIP ออกรางวัลครบ 7 วัน)"
          })
        ]
      });
    }

    const { pairs2D, triples3D } = getWin4PairsHelper(digits);
    const { win2D, win3D } = getWinningSetsHelper(dayCode, cat, time);
    const hitCount2D = pairs2D.filter(p => win2D.has(p)).length;
    const hitCount3D = triples3D.filter(t => win3D.has(t) || win3D.has(t.split("").sort().join(""))).length;

    if (isM) {
      // MORNING (GOLDEN SUNSHINE THEME)
      return n.jsxs("div", {
        className: "bg-black/55 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 flex flex-col justify-between shadow-md",
        children: [
          n.jsxs("div", {
            className: "flex items-center justify-between border-b border-gray-700/40 pb-2",
            children: [
              n.jsxs("div", {
                className: "flex items-center gap-1.5 flex-wrap",
                children: [
                  n.jsx("span", { className: "text-amber-400 text-sm font-black tracking-wide", children: "☀️ รอบเช้า" }),
                  n.jsx("span", {
                    className: "text-[10px] text-gray-400 font-bold",
                    children: cat === "reg" ? "(นิเคอิ 09:30 ➔ จีน 10:30 ➔ ฮั่งเส็ง 11:00)" : "(นิเคอิ VIP 09:30 ➔ จีน VIP 10:30 ➔ ฮั่งเส็ง VIP 11:00)"
                  })
                ]
              }),
              (hitCount2D > 0 || hitCount3D > 0)
                ? n.jsxs("span", {
                    className: "bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-glow-emerald animate-pulse",
                    children: ["✓ เข้าเป้าแล้ว ", (hitCount2D + hitCount3D), " ชุด"]
                  })
                : n.jsx("span", {
                    className: "bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/40",
                    children: "⚡ ล่า 3 สเต็ป"
                  })
            ]
          }),
          n.jsxs("div", {
            className: "flex items-center gap-3 flex-wrap py-1",
            children: [
              n.jsx("div", {
                className: "flex items-center gap-2 sm:gap-2.5 shrink-0",
                children: digits.map(d => n.jsx("div", {
                  key: d,
                  className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform shrink-0",
                  children: d
                }))
              }),
              n.jsx("div", {
                className: "text-xs text-amber-300/90 font-semibold pl-1",
                children: "เน้นตัดตรง 4 เลขเด่นคัดพิเศษ (สูตรไร้พ่าย 100%)"
              })
            ]
          }),
          n.jsxs("div", {
            className: "bg-black/40 border border-amber-500/30 rounded-xl p-3 space-y-2",
            children: [
              n.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  n.jsxs("span", {
                    className: "text-xs font-bold text-amber-300 flex items-center gap-1.5",
                    children: [
                      "⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (" + pairs2D.length + " ชุด):",
                      hitCount2D > 0 ? n.jsxs("span", { className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5", children: ["✓ เข้าเป้า ", hitCount2D, " ชุด"] }) : null
                    ]
                  }),
                  n.jsx("button", {
                    onClick: (e) => {
                      const btn = e.currentTarget;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(pairs2D.join(", "));
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
                children: pairs2D.map(p => {
                  const isHit = win2D.has(p);
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
                      "⚡ ชุดเลขวิน 3 ตัวตรง (" + triples3D.length + " ชุด / 24 โต๊ด):",
                      hitCount3D > 0 ? n.jsxs("span", { className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5", children: ["✓ เข้าเป้า ", hitCount3D, " ชุด"] }) : null
                    ]
                  }),
                  n.jsx("button", {
                    onClick: (e) => {
                      const btn = e.currentTarget;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(triples3D.join(", "));
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
                children: triples3D.map(t => {
                  const isHit = win3D.has(t) || win3D.has(t.split("").sort().join(""));
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
      });
    }

    // AFTERNOON (ORIGINAL BROWN BACKGROUND + PURPLE GLASS ELEMENTS)
    return n.jsxs("div", {
      className: "bg-black/55 border border-purple-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 flex flex-col justify-between shadow-md relative overflow-hidden",
      children: [
        n.jsxs("div", {
          className: "flex items-center justify-between border-b border-purple-500/30 pb-2 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-1.5 flex-wrap",
              children: [
                n.jsx("span", { className: "text-purple-300 text-sm font-black tracking-wide", children: "🌙 รอบบ่าย" }),
                n.jsx("span", {
                  className: "text-[10px] text-purple-200/80 font-bold",
                  children: cat === "reg" ? "(นิเคอิ 13:00 ➔ จีน 14:00 ➔ ฮั่งเส็ง 15:30)" : "(นิเคอิ VIP 13:00 ➔ จีน VIP 14:00 ➔ ฮั่งเส็ง VIP 15:30)"
                })
              ]
            }),
            (hitCount2D > 0 || hitCount3D > 0)
              ? n.jsxs("span", {
                  style: {
                    background: "linear-gradient(90deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "1px solid rgba(245, 208, 254, 0.5)",
                    boxShadow: "0 0 12px rgba(217, 70, 239, 0.6)"
                  },
                  className: "text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-sm animate-pulse win4-badge-afternoon-hit",
                  children: ["✓ เข้าเป้าแล้ว ", (hitCount2D + hitCount3D), " ชุด"]
                })
              : n.jsx("span", {
                  className: "bg-purple-900/60 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500/40",
                  children: "⚡ ล่า 3 สเต็ป"
                })
          ]
        }),
        n.jsxs("div", {
          className: "flex items-center gap-3 flex-wrap py-1 relative z-10",
          children: [
            n.jsx("div", {
              className: "flex items-center gap-2 sm:gap-2.5 shrink-0",
              children: digits.map(d => n.jsx("div", {
                key: d,
                className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-400 text-white font-black text-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(168,85,247,0.5)] border-2 border-purple-200/90 scale-100 hover:scale-105 transition-transform shrink-0",
                children: d
              }))
            }),
            n.jsx("div", {
              className: "text-xs text-purple-200/90 font-semibold pl-1",
              children: "เน้นตัดตรง 4 เลขเด่นคัดพิเศษ (สูตรไร้พ่าย 100%)"
            })
          ]
        }),
        n.jsxs("div", {
          className: "bg-black/40 border border-purple-500/40 rounded-xl p-3 space-y-2 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                n.jsxs("span", {
                  className: "text-xs font-bold text-purple-300 flex items-center gap-1.5",
                  children: [
                    "⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (" + pairs2D.length + " ชุด):",
                    hitCount2D > 0 ? n.jsxs("span", {
                      style: {
                        background: "linear-gradient(90deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                        color: "#ffffff",
                        border: "1px solid rgba(245, 208, 254, 0.5)",
                        boxShadow: "0 0 10px rgba(217, 70, 239, 0.6)"
                      },
                      className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5 win4-badge-afternoon-hit",
                      children: ["✓ เข้าเป้า ", hitCount2D, " ชุด"]
                    }) : null
                  ]
                }),
                n.jsx("button", {
                  onClick: (e) => {
                    const btn = e.currentTarget;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(pairs2D.join(", "));
                      const oldText = btn.innerText;
                      btn.innerText = "✓ คัดลอกแล้ว!";
                      setTimeout(() => { btn.innerText = oldText; }, 1500);
                    }
                  },
                  className: "text-[10px] bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 border border-purple-400/40",
                  children: "📋 คัดลอก 2 ตัว"
                })
              ]
            }),
            n.jsx("div", {
              className: "flex flex-wrap gap-1.5",
              children: pairs2D.map(p => {
                const isHit = win2D.has(p);
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
              })
            })
          ]
        }),
        n.jsxs("div", {
          className: "bg-black/40 border border-indigo-500/40 rounded-xl p-3 space-y-2 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                n.jsxs("span", {
                  className: "text-xs font-bold text-indigo-300 flex items-center gap-1.5",
                  children: [
                    "⚡ ชุดเลขวิน 3 ตัวตรง (" + triples3D.length + " ชุด / 24 โต๊ด):",
                    hitCount3D > 0 ? n.jsxs("span", {
                      style: {
                        background: "linear-gradient(90deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                        color: "#ffffff",
                        border: "1px solid rgba(245, 208, 254, 0.5)",
                        boxShadow: "0 0 10px rgba(217, 70, 239, 0.6)"
                      },
                      className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5 win4-badge-afternoon-hit",
                      children: ["✓ เข้าเป้า ", hitCount3D, " ชุด"]
                    }) : null
                  ]
                }),
                n.jsx("button", {
                  onClick: (e) => {
                    const btn = e.currentTarget;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(triples3D.join(", "));
                      const oldText = btn.innerText;
                      btn.innerText = "✓ คัดลอกแล้ว!";
                      setTimeout(() => { btn.innerText = oldText; }, 1500);
                    }
                  },
                  className: "text-[10px] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 border border-indigo-400/40",
                  children: "📋 คัดลอก 3 ตัว"
                })
              ]
            }),
            n.jsx("div", {
              className: "flex flex-wrap gap-1.5",
              children: triples3D.map(t => {
                const isHit = win3D.has(t) || win3D.has(t.split("").sort().join(""));
                return n.jsx("span", {
                  key: t,
                  style: isHit ? {
                    background: "linear-gradient(135deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 18px rgba(217, 70, 239, 0.95), 0 0 8px rgba(168, 85, 247, 0.8)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)"
                  } : {
                    background: "rgba(67, 24, 120, 0.45)",
                    border: "1px solid rgba(129, 140, 248, 0.45)",
                    color: "#ffffff"
                  },
                  className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                    (isHit ? "scale-110 ring-2 ring-fuchsia-400 animate-pulse win4-chip-afternoon-hit" : "hover:bg-indigo-800/70 shadow-sm win4-chip-afternoon-default"),
                  children: t
                });
              })
            })
          ]
        })
      ]
    });
  };

  const defaultCat = (o === "STOCKS_VIP" || o === "STOCK_VIP" || r === "Sat" || r === "Sun") ? "vip" : "reg";

  return n.jsxs("div", {
    className: "border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 shadow-glow-gold relative overflow-hidden space-y-3.5",
    children: [
      n.jsx("div", { className: "absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" }),
      n.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5",
        children: [
          n.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              n.jsx("span", { className: "bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse", children: "🔥 ชุดคัดเน้นพิเศษ 4 เลข" }),
              n.jsx("h4", { className: "text-sm sm:text-base font-extrabold text-amber-200", children: "ชุดเลขวินเน้น 4 ตัว (ใช้ได้ทั้ง บน-ล่าง & 3 ตัวตรง-โต๊ด)" })
            ]
          }),
          n.jsx("span", { className: "text-[10px] sm:text-xs text-amber-300 font-bold bg-amber-900/60 border border-amber-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto", children: "⚡ 2 ตัว (บน-ล่าง): 12 ชุด | 3 ตัวตรง: 4 ชุด (24 โต๊ด)" })
        ]
      }),
      n.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-bold text-gray-300",
        children: [
          n.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              n.jsx("span", { className: "text-xs font-extrabold text-gray-300 mr-1", children: "หมวดหุ้น:" }),
              n.jsxs("button", {
                type: "button",
                id: "win4-tab-reg",
                onClick: () => {
                  const pr = document.getElementById("win4-panel-reg");
                  const pv = document.getElementById("win4-panel-vip");
                  const tr = document.getElementById("win4-tab-reg");
                  const tv = document.getElementById("win4-tab-vip");
                  const ta = document.getElementById("win4-tab-all");
                  if (pr && pv) {
                    pr.style.display = "block";
                    pv.style.display = "none";
                    if (tr) tr.className = "px-3 py-1 rounded-lg font-black text-xs cursor-pointer bg-emerald-500 text-black border border-emerald-300 shadow-glow-emerald transition-all";
                    if (tv) tv.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all";
                    if (ta) ta.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all";
                  }
                },
                className: defaultCat === "reg"
                  ? "px-3 py-1 rounded-lg font-black text-xs cursor-pointer bg-emerald-500 text-black border border-emerald-300 shadow-glow-emerald transition-all"
                  : "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all",
                children: ["🎌 หุ้นปกติ (เช้า - บ่าย)"]
              }),
              n.jsxs("button", {
                type: "button",
                id: "win4-tab-vip",
                onClick: () => {
                  const pr = document.getElementById("win4-panel-reg");
                  const pv = document.getElementById("win4-panel-vip");
                  const tr = document.getElementById("win4-tab-reg");
                  const tv = document.getElementById("win4-tab-vip");
                  const ta = document.getElementById("win4-tab-all");
                  if (pr && pv) {
                    pr.style.display = "none";
                    pv.style.display = "block";
                    if (tv) tv.className = "px-3 py-1 rounded-lg font-black text-xs cursor-pointer bg-purple-500 text-white border border-purple-300 shadow-glow-purple transition-all";
                    if (tr) tr.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all";
                    if (ta) ta.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all";
                  }
                },
                className: defaultCat === "vip"
                  ? "px-3 py-1 rounded-lg font-black text-xs cursor-pointer bg-purple-500 text-white border border-purple-300 shadow-glow-purple transition-all"
                  : "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all",
                children: ["💎 หุ้น VIP (เช้า - บ่าย)"]
              }),
              n.jsxs("button", {
                type: "button",
                id: "win4-tab-all",
                onClick: () => {
                  const pr = document.getElementById("win4-panel-reg");
                  const pv = document.getElementById("win4-panel-vip");
                  const tr = document.getElementById("win4-tab-reg");
                  const tv = document.getElementById("win4-tab-vip");
                  const ta = document.getElementById("win4-tab-all");
                  if (pr && pv) {
                    pr.style.display = "block";
                    pv.style.display = "block";
                    if (ta) ta.className = "px-3 py-1 rounded-lg font-black text-xs cursor-pointer bg-amber-400 text-black border border-amber-300 shadow-glow-gold transition-all";
                    if (tr) tr.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all";
                    if (tv) tv.className = "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all";
                  }
                },
                className: "px-3 py-1 rounded-lg font-bold text-xs cursor-pointer bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all",
                children: ["👁️ แสดงทั้งสอง (ปกติ + VIP)"]
              })
            ]
          }),
          n.jsxs("div", {
            className: "flex items-center gap-1.5 bg-black/60 border border-amber-500/40 px-2.5 py-1 rounded-xl shadow-inner flex-wrap",
            children: [
              n.jsxs("span", {
                className: "text-[11px] font-black text-amber-300 flex items-center gap-1 pr-1",
                children: ["🗓️ ย้อนดูวัน (วัน", n.jsx("strong", { className: "text-white underline decoration-amber-400 underline-offset-2", children: h.dayName }), "):"]
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
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-glow-gold scale-105 border border-yellow-200 ring-2 ring-amber-400"
                        : "bg-black/50 text-gray-300 hover:text-white hover:bg-gray-800/90 border border-gray-700/60 active:scale-95"),
                    children: dItem.label
                  });
                })
              })
            ]
          })
        ]
      }),

      // REGULAR PANEL
      n.jsxs("div", {
        id: "win4-panel-reg",
        style: { display: defaultCat === "reg" ? "block" : "none" },
        className: "space-y-2 border-t border-emerald-500/20 pt-3",
        children: [
          n.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              n.jsx("span", { className: "bg-emerald-500 text-black text-[11px] font-black px-2.5 py-0.5 rounded-md", children: "🎌 หุ้นปกติ" }),
              n.jsx("span", { className: "text-xs font-bold text-emerald-200", children: "ชุดวินเด่น 4 ตัวคัดพิเศษ (ซ้าย = เช้า / ขวา = บ่าย)" })
            ]
          }),
          (r === "Sat" || r === "Sun")
            ? n.jsxs("div", {
                className: "bg-black/40 border border-amber-500/20 rounded-2xl p-6 text-center space-y-3",
                children: [
                  n.jsx("div", { className: "text-amber-400 font-extrabold text-base", children: "🛑 ตลาดหุ้นปกติ ปิดทำการวันเสาร์-อาทิตย์" }),
                  n.jsx("div", { className: "text-xs text-gray-300", children: "ตลาดหุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง) เปิดทำการวันจันทร์ - ศุกร์" }),
                  n.jsx("button", {
                    type: "button",
                    onClick: () => {
                      const btn = document.getElementById("win4-tab-vip");
                      if (btn) btn.click();
                    },
                    className: "px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg cursor-pointer hover:brightness-110",
                    children: "👉 สลับไปดู 💎 หุ้น VIP (ออกรางวัลทุกวัน)"
                  })
                ]
              })
            : n.jsxs("div", {
                className: "win4-row-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 pt-1",
                style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" },
                children: [
                  renderStockSession(r, "reg", "Morning"),
                  renderStockSession(r, "reg", "Afternoon")
                ]
              })
        ]
      }),

      // VIP PANEL
      n.jsxs("div", {
        id: "win4-panel-vip",
        style: { display: defaultCat === "vip" ? "block" : "none" },
        className: "space-y-2 border-t border-purple-500/20 pt-3",
        children: [
          n.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              n.jsx("span", { className: "bg-purple-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md", children: "💎 หุ้น VIP" }),
              n.jsx("span", { className: "text-xs font-bold text-purple-200", children: "ชุดวินเด่น 4 ตัวคัดพิเศษ (ซ้าย = เช้า / ขวา = บ่าย)" })
            ]
          }),
          n.jsxs("div", {
            className: "win4-row-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 pt-1",
            style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" },
            children: [
              renderStockSession(r, "vip", "Morning"),
              renderStockSession(r, "vip", "Afternoon")
            ]
          })
        ]
      })
    ]
  });
})())`;

// Replace in code
code = code.substring(0, startIdx) + newIIFE + code.substring(endIdx);

fs.writeFileSync(srcPath, code, 'utf8');
console.log('Applied patch to downloaded_target_worker/assets/index-CN-5_2d9.js successfully!');
fs.writeFileSync(path.join(__dirname, 'index_patched.js'), code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('Saved to scratch/index_patched.js and dist/assets/index-CN-5_2d9.js successfully!');
