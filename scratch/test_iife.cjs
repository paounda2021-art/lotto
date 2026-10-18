const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const a = [...special, ...normal, ...vip];
const o = "HANOI";
const r = "Sat";
const l = "NEXT";
const N = null;
const h = { dayName: "เสาร์" };

function Ey(e, t = "Sat") {
  const o = e.filter(N => t === "ALL" || N.dayOfWeek === t);
  const a = o.length;
  const i = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  const r = {};
  o.forEach(N => {
    `${N.top3||''}${N.bottom2||''}`.split("").forEach(u => {
      const p = parseInt(u, 10);
      if (!isNaN(p)) i[p] = (i[p] || 0) + 1;
    });
    if (N.top2) r[N.top2] = (r[N.top2] || 0) + 1;
    if (N.bottom2) r[N.bottom2] = (r[N.bottom2] || 0) + 1;
  });
  const d = Object.entries(i).map(([N, y]) => {
    const u = parseInt(N, 10);
    const p = a > 0 ? Math.round(y / (a * 5) * 1e3) / 10 : 0;
    return { digit: u, count: y, percent: p };
  }).sort((N, y) => y.count - N.count);

  const l = Object.entries(r).map(([N, y]) => ({ pair: N, count: y })).sort((N, y) => y.count - N.count).slice(0, 6);
  return {
    dayOfWeek: t,
    totalDrawsOnDay: a,
    topSingleDigits: d,
    top2DPairs: l
  };
}

// Mock jsx
const n = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
  Fragment: 'Fragment'
};

const result = ((()=>{
  if(o!=="HANOI") return null;
  const winData = (()=>{
    try {
      let allD = a || [];
      if (l === "VERIFY" && N && N.date) allD = allD.filter(d => d.date !== N.date);
      let vipD = allD.filter(d => d.session === "HANOI_VIP");
      if (vipD.length === 0) {
        try {
          const raw = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_vip") : null;
          if (raw) vipD = JSON.parse(raw);
          if (l === "VERIFY" && N && N.date) vipD = vipD.filter(d => d.date !== N.date);
        } catch(err) {}
      }
      let all3D = allD.filter(d => ["HANOI_SPECIAL", "HANOI_EVENING", "HANOI_VIP"].includes(d.session));
      if (all3D.length === 0) all3D = allD;
      const vipStats = Ey(vipD, r);
      const all3Stats = Ey(all3D, r);
      const v0 = vipStats.topSingleDigits && vipStats.topSingleDigits[0] ? vipStats.topSingleDigits[0].digit : null;
      const v1 = vipStats.topSingleDigits && vipStats.topSingleDigits[1] ? vipStats.topSingleDigits[1].digit : null;
      const a0 = all3Stats.topSingleDigits && all3Stats.topSingleDigits[0] ? all3Stats.topSingleDigits[0].digit : null;
      const a1 = all3Stats.topSingleDigits && all3Stats.topSingleDigits[1] ? all3Stats.topSingleDigits[1].digit : null;
      let digits = Array.from(new Set([v0, v1, a0, a1].filter(x => x !== null && x !== undefined)));
      if (all3Stats.topSingleDigits) {
        for (const item of all3Stats.topSingleDigits) {
          if (!digits.includes(item.digit)) digits.push(item.digit);
          if (digits.length >= 4) break;
        }
      }
      if (vipStats.topSingleDigits && digits.length < 4) {
        for (const item of vipStats.topSingleDigits) {
          if (!digits.includes(item.digit)) digits.push(item.digit);
          if (digits.length >= 4) break;
        }
      }
      digits = digits.slice(0, 4).sort((x, y) => x - y);
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
      return { v0, v1, a0, a1, digits, pairs2D, triples3D };
    } catch(e) { return null; }
  })();

  if (!winData || !winData.digits || winData.digits.length < 2) return null;

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
              n.jsx("span", {
                className: "bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse",
                children: "🔥 ชุดคัดเน้นพิเศษ " + winData.digits.length + " เลข"
              }),
              n.jsx("h4", {
                className: "text-sm sm:text-base font-extrabold text-amber-200",
                children: "ชุดเลขวินเน้น " + winData.digits.length + " ตัว (ใช้ได้ทั้ง บน-ล่าง & 3 ตัวตรง-โต๊ด)"
              })
            ]
          }),
          n.jsx("span", {
            className: "text-[10px] sm:text-xs text-amber-300 font-bold bg-amber-900/60 border border-amber-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto",
            children: "⚡ 2 ตัว (บน-ล่าง): " + winData.pairs2D.length + " ชุด | 3 ตัวตรง: " + winData.triples3D.length + " ชุด (24 โต๊ด)"
          })
        ]
      }),
      n.jsxs("div", {
        className: "flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-300",
        children: [
          n.jsxs("span", {
            className: "bg-purple-500/20 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",
            children: ["🟣 นอย VIP: เด่นหลัก ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.v0 !== null ? winData.v0 : "-" }), " / เด่นรอง ", n.jsx("strong", { className: "text-cyan-300 font-black", children: winData.v1 !== null ? winData.v1 : "-" })]
          }),
          n.jsxs("span", {
            className: "bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1",
            children: ["🌐 รวม 3 นอย: เด่นหลัก ", n.jsx("strong", { className: "text-amber-300 font-black", children: winData.a0 !== null ? winData.a0 : "-" }), " / เด่นรอง ", n.jsx("strong", { className: "text-cyan-300 font-black", children: winData.a1 !== null ? winData.a1 : "-" })]
          }),
          n.jsxs("span", {
            className: "bg-black/40 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md",
            children: ["🗓️ ประจำ: วัน", h.dayName]
          })
        ]
      }),
      n.jsxs("div", {
        className: "flex items-center gap-3 flex-wrap py-1",
        children: [
          n.jsx("div", {
            className: "flex items-center gap-2 sm:gap-2.5",
            children: winData.digits.map(d => n.jsx("div", {
              className: "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform",
              children: d
            }, d))
          }),
          n.jsx("div", {
            className: "text-xs text-amber-300/90 font-semibold pl-1",
            children: "เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติ (คัดจากเด่น นอย VIP + รวม 3 นอย)"
          })
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
                    children: ["⚡ ชุดเลขวิน 2 ตัว บน-ล่าง (", winData.pairs2D.length, " ชุด):"]
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
                children: winData.pairs2D.map(p => n.jsx("span", {
                  className: "px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black font-mono text-xs sm:text-sm tracking-wider hover:bg-amber-500/30 transition-colors",
                  children: p
                }, p))
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
                    children: ["⚡ ชุดเลขวิน 3 ตัวตรง (", winData.triples3D.length, " ชุด / 24 โต๊ด):"]
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
                children: winData.triples3D.map(t => n.jsx("span", {
                  className: "px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black font-mono text-xs sm:text-sm tracking-wider hover:bg-cyan-500/30 transition-colors",
                  children: t
                }, t))
              })
            ]
          })
        ]
      })
    ]
  });
})())
;

console.log('JSX Tree generated successfully! Type:', result.type);
console.log('Props children count:', result.props.children.length);
