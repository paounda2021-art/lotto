const fs = require('fs');

const targetFile = 'scratch/apply_win4_card_patch.cjs';
let content = fs.readFileSync(targetFile, 'utf8');

// Locate start and end of Card 3
const card3StartMarker = '// HANOI 100% 6-PRIZE WIN4 CARD';
const card3EndMarker = 'const cards = [card1, card2, card3].filter(Boolean);';

const startIdx = content.indexOf(card3StartMarker);
const endIdx = content.indexOf(card3EndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const newCard3Code = `// HANOI 100% 5-DIGIT SPECIAL PURPLE CARD (การ์ดที่ 3 - ธีมม่วงกลาส วิเคราะห์จากผลนอยพิเศษ 5 ตัวงวดเมื่อวาน: รูด 19 ประตู เด่น-รอง 100% & เจาะวิน 4 ตัว)
    const HANOI_SPECIAL_5D_MAP = {
      '2026-10-01': { full5: '78849', top3: '849', top2: '49', bot2: '15' },
      '2026-10-02': { full5: '22030', top3: '030', top2: '30', bot2: '13' },
      '2026-10-03': { full5: '83948', top3: '948', top2: '48', bot2: '59' },
      '2026-10-04': { full5: '47792', top3: '792', top2: '92', bot2: '44' },
      '2026-10-05': { full5: '81751', top3: '751', top2: '51', bot2: '12' },
      '2026-10-06': { full5: '39283', top3: '283', top2: '83', bot2: '09' },
      '2026-10-07': { full5: '51499', top3: '499', top2: '99', bot2: '90' },
      '2026-10-08': { full5: '78576', top3: '576', top2: '76', bot2: '40' },
      '2026-10-09': { full5: '20007', top3: '007', top2: '07', bot2: '81' },
      '2026-10-10': { full5: '16463', top3: '463', top2: '63', bot2: '33' },
      '2026-10-11': { full5: '75291', top3: '291', top2: '91', bot2: '16' },
      '2026-10-12': { full5: '07286', top3: '286', top2: '86', bot2: '45' },
      '2026-10-13': { full5: '74307', top3: '307', top2: '07', bot2: '16' },
      '2026-10-14': { full5: '14104', top3: '104', top2: '04', bot2: '12' },
      '2026-10-15': { full5: '12830', top3: '830', top2: '30', bot2: '88' },
      '2026-10-16': { full5: '8045',  top3: '045', top2: '45', bot2: '12' },
      '2026-10-17': { full5: '42338', top3: '338', top2: '38', bot2: '95' },
      '2026-10-18': { full5: '67291', top3: '291', top2: '91', bot2: '68' }
    };

    try {
      const local5D = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_hanoi_special_5d_map") : null;
      if (local5D) Object.assign(HANOI_SPECIAL_5D_MAP, JSON.parse(local5D));
    } catch(err){}

    // รวบรวมข้อมูลผลรางวัลฮานอยทั้ง 3 รอบ (พิเศษ, ปกติ, VIP)
    let fullHanoiD = (allD || []).slice();
    try {
      const rawVip = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_vip") : null;
      if (rawVip) {
        const parsedVip = JSON.parse(rawVip);
        parsedVip.forEach(v => { if (!fullHanoiD.some(x => x.id === v.id || (x.date === v.date && x.session === v.session))) fullHanoiD.push(v); });
      }
      const rawSpc = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_special") : null;
      if (rawSpc) {
        const parsedSpc = JSON.parse(rawSpc);
        parsedSpc.forEach(s => { if (!fullHanoiD.some(x => x.id === s.id || (x.date === s.date && x.session === s.session))) fullHanoiD.push(s); });
      }
    } catch(err){}

    const sortedUniqueDates = Array.from(new Set(fullHanoiD.map(d => d.date).filter(Boolean))).sort();
    const latestRecordedDate = sortedUniqueDates[sortedUniqueDates.length - 1]; // e.g. "2026-10-18"
    const latestDayOfWeek = (fullHanoiD.find(d => d.date === latestRecordedDate)?.dayOfWeek) || "Sun";

    // ระบุสถานะว่ากำลังดู "งวดถัดไป / วันที่ยังมาไม่ถึง (isUpcoming)" หรือไม่
    const isUpcoming = (l === "NEXT") || (r === i) || (g === true) || (latestDayOfWeek === "Sun" && r === "Mon") || (!O || O.length === 0 || !O.some(x => x && x.top2));

    let prevDate = null;
    let targetDate = (O && O[0] && O[0].date) ? O[0].date : null;
    if (!targetDate && r) {
      const datesForDay = sortedUniqueDates.filter(dt => fullHanoiD.some(d => d.date === dt && d.dayOfWeek === r));
      if (datesForDay.length > 0) targetDate = datesForDay[datesForDay.length - 1];
    }
    if (!targetDate) targetDate = latestRecordedDate;

    if (isUpcoming) {
      prevDate = latestRecordedDate;
    } else {
      const tIdx = sortedUniqueDates.indexOf(targetDate);
      if (tIdx > 0) prevDate = sortedUniqueDates[tIdx - 1];
      else if (sortedUniqueDates.length > 1) prevDate = sortedUniqueDates[sortedUniqueDates.length - 2];
    }

    let prevData = prevDate ? HANOI_SPECIAL_5D_MAP[prevDate] : null;
    if (!prevData && prevDate) {
      const spcSession = fullHanoiD.find(d => d.date === prevDate && (d.session === "HANOI_SPECIAL" || d.session === "SPECIAL"));
      if (spcSession) {
        prevData = {
          full5: spcSession.prize5d || spcSession.full5 || (spcSession.top3 ? "00" + spcSession.top3 : ""),
          top3: spcSession.top3 || "",
          top2: spcSession.top2 || "",
          bot2: spcSession.bottom2 || ""
        };
      }
    }

    const f5 = String(prevData?.full5 || "42338");
    const t3 = String(prevData?.top3 || "338");
    const b2 = String(prevData?.bot2 || "95");

    const sTop = t3.split("").reduce((a, b) => a + Number(b), 0) % 10;
    const sBot = b2.split("").reduce((a, b) => a + Number(b), 0) % 10;
    const s5D = f5.split("").reduce((a, b) => a + Number(b), 0) % 10;

    const roodDen = sTop;
    let roodRong = (sBot !== sTop) ? sBot : s5D;
    if (roodRong === roodDen) roodRong = (roodDen + 5) % 10;

    // สกัด 4 ตัววิน
    const cand = [];
    const seen = new Set();
    const pushCand = (x) => {
      if (x !== undefined && !isNaN(x) && !seen.has(x) && cand.length < 4) {
        seen.add(x); cand.push(x);
      }
    };
    pushCand(roodDen);
    pushCand(roodRong);
    pushCand(s5D);
    if (f5.length >= 2) pushCand(Number(f5[1]));
    if (f5.length >= 1) pushCand(Number(f5[0]));
    if (b2.length >= 2) pushCand(Number(b2[1]));
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(pushCand);

    const hanoiPurpleDigits = cand.slice(0, 4).sort((a, b) => a - b);

    // 12 ชุดวิน 2 ตัว บน-ล่าง
    const hanoiPurplePairs2D = [];
    for (let i = 0; i < hanoiPurpleDigits.length; i++) {
      for (let j = 0; j < hanoiPurpleDigits.length; j++) {
        if (i !== j) hanoiPurplePairs2D.push(String(hanoiPurpleDigits[i]) + String(hanoiPurpleDigits[j]));
      }
    }

    // ชุดเจาะเน้น 2 ตัว (Direct Drill Pairs)
    const hanoiPurpleDrillPairs = [];
    const addDrill = (a, b) => {
      if (a !== undefined && b !== undefined && a !== b) {
        const p1 = String(a) + String(b);
        const p2 = String(b) + String(a);
        if (!hanoiPurpleDrillPairs.includes(p1)) hanoiPurpleDrillPairs.push(p1);
        if (!hanoiPurpleDrillPairs.includes(p2)) hanoiPurpleDrillPairs.push(p2);
      }
    };
    if (f5.length >= 2) addDrill(f5[0], f5[1]);
    addDrill(roodDen, roodRong);
    if (b2.length >= 2 && t3.length >= 2) addDrill(b2[1], t3[1]);
    if (f5.length >= 2) addDrill(roodDen, f5[1]);

    // เช็คผลรางวัลที่ออกจริง (หากเป็นวันล่วงหน้า ห้ามเช็คเป้าเด็ดขาด)
    const purpleWin2D = new Set();
    if (!isUpcoming) {
      (O || []).forEach(dr => {
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
        if (t2) purpleWin2D.add(t2);
        if (dr.bottom2) purpleWin2D.add(dr.bottom2);
      });
    }

    const hanoiPurpleHitCount2D = isUpcoming ? 0 : hanoiPurplePairs2D.filter(p => purpleWin2D.has(p)).length;
    const hanoiPurpleDrillHitCount = isUpcoming ? 0 : hanoiPurpleDrillPairs.filter(p => purpleWin2D.has(p)).length;

    const card3 = n.jsxs("div", {
      className: "border-2 border-purple-500/50 rounded-2xl p-4 sm:p-5 bg-black/55 shadow-[0_0_20px_rgba(168,85,247,0.25)] relative overflow-hidden space-y-4",
      children: [
        n.jsx("div", { className: "absolute -right-6 -bottom-6 w-28 h-28 bg-purple-500/12 rounded-full blur-xl pointer-events-none" }),
        n.jsxs("div", {
          className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/30 pb-2.5 relative z-10",
          children: [
            n.jsxs("div", {
              className: "flex items-center gap-2 flex-wrap",
              children: [
                n.jsx("span", {
                  className: "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                  children: isUpcoming ? ("🔥 สูตรนอยพิเศษ 5 ตัว (งวดวัน" + h.dayName + "ที่จะถึง)") : "🔥 สูตรนอยพิเศษ 5 ตัวงวดเมื่อวาน (สถิติ 100%)"
                }),
                n.jsx("h4", {
                  style: {
                    color: "#ffffff",
                    textShadow: "0 0 14px rgba(192, 132, 252, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)"
                  },
                  className: "text-sm sm:text-base font-extrabold text-white",
                  children: isUpcoming ? ("ชุดเลขรูด 19 ประตู & เจาะวิน 4 ตัว งวดวัน" + h.dayName + "ที่จะถึง (ฮานอย 3 นอย)") : "ชุดเลขรูด 19 ประตู & เจาะวิน 4 ตัว ล่า 3 รอบ (พิเศษ ➔ ปกติ ➔ VIP)"
                })
              ]
            }),
            n.jsx("span", {
              className: "text-[10px] sm:text-xs text-purple-300 font-bold bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto",
              children: "⚡ รูด 19 ประตู: เด่น " + roodDen + " | รอง " + roodRong + " (สถิติ 100%)"
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
                  className: "bg-purple-500/20 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",
                  children: [
                    "🎯 ฐานคำนวณจากนอยพิเศษ: ",
                    n.jsx("strong", {
                      className: "text-purple-300 font-black",
                      children: isUpcoming
                        ? ("ผลงวดล่าสุด (5 ตัว: " + f5 + " | บน: " + t3 + " | ล่าง: " + b2 + ") ➔ สำหรับวัน" + h.dayName + "ที่จะถึง")
                        : ("ผลงวดเมื่อวาน (5 ตัว: " + f5 + " | บน: " + t3 + " | ล่าง: " + b2 + ") ➔ ล่า 3 นอย")
                    })
                  ]
                }),
                n.jsxs("span", {
                  className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md",
                  children: ["🗓️ ประจำ: วัน", h.dayName, isUpcoming ? " (งวดถัดไป)" : ""]
                })
              ]
            }),
            n.jsxs("div", {
              className: "flex items-center gap-1.5 bg-black/60 border border-purple-500/40 px-2.5 py-1 rounded-xl shadow-inner flex-wrap",
              children: [
                n.jsxs("span", {
                  className: "text-[11px] font-black text-purple-300 flex items-center gap-1 pr-1",
                  children: ["🗓️ ย้อนดูวัน (วัน", n.jsx("strong", { className: "text-white underline decoration-purple-400 underline-offset-2", children: h.dayName }), "):"]
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
                          ? "bg-gradient-to-r from-purple-400 to-fuchsia-400 text-black shadow-[0_0_12px_rgba(168,85,247,0.6)] scale-105 border border-purple-200 ring-2 ring-purple-400"
                          : "bg-black/50 text-gray-300 hover:text-white hover:bg-purple-950/50 border border-gray-700/60 active:scale-95"),
                      children: dItem.label
                    });
                  })
                })
              ]
            })
          ]
        }),
        n.jsxs("div", {
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
        }),
        n.jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 relative z-10",
          children: [
            n.jsxs("div", {
              style: { border: "1px solid rgba(168, 85, 247, 0.4)" },
              className: "bg-black/40 border border-purple-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      style: { color: "#d8b4fe" },
                      className: "text-xs font-bold text-purple-300 flex items-center gap-1.5",
                      children: [
                        "🎯 ชุดเจาะเน้น 2 ตัว บน-ล่าง (" + hanoiPurpleDrillPairs.length + " ชุด):",
                        hanoiPurpleDrillHitCount > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                            color: "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(168, 85, 247, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", hanoiPurpleDrillHitCount, " ชุด"]
                        }) : (isUpcoming || purpleWin2D.size === 0 ? n.jsx("span", {
                          style: { background: "rgba(168, 85, 247, 0.2)", color: "#d8b4fe", border: "1px solid rgba(192, 132, 252, 0.4)" },
                          className: "text-[10px] font-bold px-2 py-0.5 rounded-md ml-1.5",
                          children: isUpcoming ? ("⏳ รอผลออกรางวัล (วัน" + h.dayName + "ยังมาไม่ถึง)") : "⏳ รอผลออกรางวัล"
                        }) : (purpleWin2D.size < 6 && purpleWin2D.size > 0 ? n.jsx("span", {
                          style: { background: "rgba(168, 85, 247, 0.2)", color: "#d8b4fe", border: "1px solid rgba(192, 132, 252, 0.4)" },
                          className: "text-[10px] font-bold px-2 py-0.5 rounded-md ml-1.5",
                          children: "⏳ กำลังล่ารอบถัดไป"
                        }) : null))
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(hanoiPurpleDrillPairs.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(126, 34, 206, 0.9) 0%, rgba(168, 85, 247, 0.7) 100%)",
                        border: "1px solid rgba(192, 132, 252, 0.6)",
                        boxShadow: "0 2px 8px rgba(168, 85, 247, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-purple",
                      children: "📋 คัดลอกชุดเจาะ"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: hanoiPurpleDrillPairs.map(p => {
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
                  })
                })
              ]
            }),
            n.jsxs("div", {
              style: { border: "1px solid rgba(168, 85, 247, 0.4)" },
              className: "bg-black/40 border border-purple-500/40 rounded-xl p-3 space-y-2",
              children: [
                n.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    n.jsxs("span", {
                      style: { color: "#d8b4fe" },
                      className: "text-xs font-bold text-purple-300 flex items-center gap-1.5",
                      children: [
                        "⚡ ชุดวิน 4 ตัว บน-ล่าง (" + hanoiPurplePairs2D.length + " ชุด):",
                        hanoiPurpleHitCount2D > 0 ? n.jsxs("span", {
                          style: {
                            background: "linear-gradient(90deg, #9333ea 0%, #a855f7 50%, #c084fc 100%)",
                            color: "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 10px rgba(168, 85, 247, 0.7)"
                          },
                          className: "text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                          children: ["✓ เข้าเป้า ", hanoiPurpleHitCount2D, " ชุด"]
                        }) : (isUpcoming || purpleWin2D.size === 0 ? n.jsx("span", {
                          style: { background: "rgba(168, 85, 247, 0.2)", color: "#d8b4fe", border: "1px solid rgba(192, 132, 252, 0.4)" },
                          className: "text-[10px] font-bold px-2 py-0.5 rounded-md ml-1.5",
                          children: isUpcoming ? ("⏳ รอผลออกรางวัล (วัน" + h.dayName + "ยังมาไม่ถึง)") : "⏳ รอผลออกรางวัล"
                        }) : (purpleWin2D.size < 6 && purpleWin2D.size > 0 ? n.jsx("span", {
                          style: { background: "rgba(168, 85, 247, 0.2)", color: "#d8b4fe", border: "1px solid rgba(192, 132, 252, 0.4)" },
                          className: "text-[10px] font-bold px-2 py-0.5 rounded-md ml-1.5",
                          children: "⏳ กำลังล่ารอบถัดไป"
                        }) : null))
                      ]
                    }),
                    n.jsx("button", {
                      onClick: (e) => {
                        const btn = e.currentTarget;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(hanoiPurplePairs2D.join(", "));
                          const oldText = btn.innerText;
                          btn.innerText = "✓ คัดลอกแล้ว!";
                          setTimeout(() => { btn.innerText = oldText; }, 1500);
                        }
                      },
                      style: {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, rgba(126, 34, 206, 0.9) 0%, rgba(168, 85, 247, 0.7) 100%)",
                        border: "1px solid rgba(192, 132, 252, 0.6)",
                        boxShadow: "0 2px 8px rgba(168, 85, 247, 0.3)"
                      },
                      className: "text-[10px] text-white font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95 win4-btn-copy-purple",
                      children: "📋 คัดลอก 2 ตัว"
                    })
                  ]
                }),
                n.jsx("div", {
                  className: "flex flex-wrap gap-1.5",
                  children: hanoiPurplePairs2D.map(p => {
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
                  })
                })
              ]
            })
          ]
        })
      ]
    });

    `;

const updatedContent = content.slice(0, startIdx) + newCard3Code + content.slice(endIdx);
fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('Successfully patched Card 3 in', targetFile);
