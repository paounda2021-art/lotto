const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('Original code length:', code.length);

// 1. Replace getWinningSetsHelper
const oldHelper = `const getWinningSetsHelper = (dayCode, cat, time) => {
    const win2D = new Set();
    const win3D = new Set();
    const win2DRounds = new Map();
    const win3DRounds = new Map();

    // Determine targetDate from O (draws of the selected day from d0(a, r, i)):
    let targetDate = null;
    if (O && O.length > 0 && O[0]?.date) {
      const oMatchesDay = O.some(d => d && (d.dayOfWeek === dayCode || !d.dayOfWeek));
      if (oMatchesDay) {
        targetDate = O[0].date;
      }
    }

    // If day is in future (g === true) or no draws recorded for this day, wait for results
    if (!targetDate || (typeof g !== "undefined" && g === true)) {
      return { win2D, win3D, isWaiting: true };
    }

    let hasActualResultsForSession = false;
    const allDraws = (O || []).concat(a || []);
    allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      if (typeof win2DRounds !== "undefined") _recordDrawRounds(dr, win2DRounds, win3DRounds);
      const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");
      const isM = dr.session?.includes("MORNING") || dr.session === "MORNING";
      const isA = dr.session?.includes("AFTERNOON") || dr.session === "AFTERNOON";
      if ((cat === "vip" ? isVip : !isVip) && (time === "Morning" ? isM : isA)) {
        if (dr.top3 && !dr.top3.includes("งด") && dr.top3 !== "กผล" && dr.top3.trim() !== "") {
          hasActualResultsForSession = true;
          win3D.add(dr.top3); win3D.add(dr.top3.split("").sort().join(""));
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) win2D.add(t2);
        }
        if (dr.bottom2 && !dr.bottom2.includes("งด") && dr.bottom2.trim() !== "") {
          win2D.add(dr.bottom2);
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
        const match = list.find(d => d && d.date === targetDate);
        if (match && match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล" && match.top3.trim() !== "") {
          hasActualResultsForSession = true;
          win3D.add(match.top3); win3D.add(match.top3.split("").sort().join(""));
          const t2 = match.top2 || (match.top3.length >= 2 ? match.top3.slice(-2) : "");
          if (t2) win2D.add(t2);
          if (match.bottom2 && !match.bottom2.includes("งด") && match.bottom2.trim() !== "") {
            win2D.add(match.bottom2);
          }
        }
      }
    });

    const isWaiting = !hasActualResultsForSession;
    if (isWaiting) {
      win2D.clear();
      win3D.clear();
    }

    return { win2D, win3D, isWaiting };
  };`;

const newHelper = `const getWinningSetsHelper = (dayCode, cat, time) => {
    const win2D = new Set();
    const win3D = new Set();
    const win2DRounds = new Map();
    const win3DRounds = new Map();

    // Determine targetDate from O (draws of the selected day from d0(a, r, i)):
    let targetDate = null;
    if (O && O.length > 0 && O[0]?.date) {
      const oMatchesDay = O.some(d => d && (d.dayOfWeek === dayCode || !d.dayOfWeek));
      if (oMatchesDay) {
        targetDate = O[0].date;
      }
    }

    // If day is in future (g === true) or no draws recorded for this day, wait for results
    if (!targetDate || (typeof g !== "undefined" && g === true)) {
      return { win2D, win3D, win2DRounds, win3DRounds, isWaiting: true };
    }

    let hasActualResultsForSession = false;
    const allDraws = (O || []).concat(a || []);
    allDraws.forEach(dr => {
      if (!dr || dr.date !== targetDate) return;
      const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");
      const isM = dr.session?.includes("MORNING") || dr.session === "MORNING";
      const isA = dr.session?.includes("AFTERNOON") || dr.session === "AFTERNOON";
      if ((cat === "vip" ? isVip : !isVip) && (time === "Morning" ? isM : isA)) {
        if (dr.top3 && !dr.top3.includes("งด") && dr.top3 !== "กผล" && dr.top3.trim() !== "") {
          hasActualResultsForSession = true;
          _recordDrawRounds(dr, win2DRounds, win3DRounds);
          win3D.add(dr.top3); win3D.add(dr.top3.split("").sort().join(""));
          const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
          if (t2) win2D.add(t2);
        }
        if (dr.bottom2 && !dr.bottom2.includes("งด") && dr.bottom2.trim() !== "") {
          win2D.add(dr.bottom2);
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
        const match = list.find(d => d && d.date === targetDate);
        if (match && match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล" && match.top3.trim() !== "") {
          hasActualResultsForSession = true;
          const stkLabel = (stk === "china" ? "จีน" : stk === "nikkei" ? "นิเคอิ" : "ฮั่งเส็ง") + (cat === "vip" ? "วี" : "") + (time === "Morning" ? "เช้า" : "บ่าย");
          const m3 = match.top3.trim();
          const s3 = m3.split("").sort().join("");
          win3D.add(m3); win3D.add(s3);
          if (!win3DRounds.has(m3)) win3DRounds.set(m3, new Set());
          win3DRounds.get(m3).add(stkLabel);
          if (!win3DRounds.has(s3)) win3DRounds.set(s3, new Set());
          win3DRounds.get(s3).add(stkLabel);

          const t2 = match.top2 || (m3.length >= 2 ? m3.slice(-2) : "");
          if (t2) {
            win2D.add(t2);
            if (!win2DRounds.has(t2)) win2DRounds.set(t2, new Set());
            win2DRounds.get(t2).add(stkLabel);
          }
          if (match.bottom2 && !match.bottom2.includes("งด") && match.bottom2.trim() !== "") {
            const b2 = match.bottom2.trim();
            win2D.add(b2);
            if (!win2DRounds.has(b2)) win2DRounds.set(b2, new Set());
            win2DRounds.get(b2).add(stkLabel);
          }
        }
      }
    });

    const isWaiting = !hasActualResultsForSession;
    if (isWaiting) {
      win2D.clear();
      win3D.clear();
      win2DRounds.clear();
      win3DRounds.clear();
    }

    return { win2D, win3D, win2DRounds, win3DRounds, isWaiting };
  };`;

if (code.includes(oldHelper)) {
  code = code.replace(oldHelper, newHelper);
  console.log('1. getWinningSetsHelper updated to record stkLabel and return win2DRounds & win3DRounds!');
} else {
  console.warn('1. oldHelper marker not found!');
}

// 2. Destructure win2DRounds and win3DRounds in renderStockSession
const oldDestruct = 'const { win2D, win3D, isWaiting } = getWinningSetsHelper(dayCode, cat, time);';
const newDestruct = 'const { win2D, win3D, win2DRounds, win3DRounds, isWaiting } = getWinningSetsHelper(dayCode, cat, time);';

if (code.includes(oldDestruct)) {
  code = code.replace(oldDestruct, newDestruct);
  console.log('2. Destructure in renderStockSession updated!');
} else {
  console.warn('2. oldDestruct marker not found!');
}

// 3. Morning 3D triples
const oldMorning3D = `children: triples3D.map(t => {
                  const isHit = !isWaiting && (win3D.has(t) || win3D.has(t.split("").sort().join("")));
                  return n.jsx("span", {
                    key: t,
                    style: { color: isHit ? "#000000" : "#ffffff" },
                    className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                      (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse win4-chip-hit" : "bg-cyan-500/20 border border-cyan-500/40 text-white hover:bg-cyan-500/30 win4-chip-default"),
                    children: t
                  });
                })`;

const newMorning3D = `children: triples3D.map(t => {
                  const isHit = !isWaiting && (win3D.has(t) || win3D.has(t.split("").sort().join("")));
                  const rTxt = isHit && typeof win3DRounds !== "undefined" ? (_getHitRoundText(t, win3DRounds) || _getHitRoundText(t.split("").sort().join(""), win3DRounds)) : "";
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

if (code.includes(oldMorning3D)) {
  code = code.replace(oldMorning3D, newMorning3D);
  console.log('3. Morning 3D triples updated to show hit round underneath!');
} else {
  console.warn('3. oldMorning3D marker not found!');
}

// 4. Afternoon 3D triples
const oldAfternoon3D = `children: triples3D.map(t => {
                const isHit = !isWaiting && (win3D.has(t) || win3D.has(t.split("").sort().join("")));
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
              })`;

const newAfternoon3D = `children: triples3D.map(t => {
                const isHit = !isWaiting && (win3D.has(t) || win3D.has(t.split("").sort().join("")));
                const rTxt = isHit && typeof win3DRounds !== "undefined" ? (_getHitRoundText(t, win3DRounds) || _getHitRoundText(t.split("").sort().join(""), win3DRounds)) : "";
                return n.jsxs("span", {
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
                  className: (isHit ? "inline-flex flex-col items-center justify-center px-2 py-0.5 min-w-[42px] scale-110 ring-2 ring-fuchsia-400 animate-pulse win4-chip-afternoon-hit" : "inline-flex items-center justify-center px-3 py-1 hover:bg-indigo-800/70 shadow-sm win4-chip-afternoon-default") + " rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all",
                  children: [
                    n.jsx("span", { className: "leading-tight", children: t }),
                    isHit && rTxt ? n.jsx("span", { className: "text-[9px] font-extrabold leading-none mt-0.5 px-1 py-0.5 rounded bg-black/85 text-white shadow-sm border border-white/30 whitespace-nowrap", children: rTxt }) : null
                  ]
                });
              })`;

if (code.includes(oldAfternoon3D)) {
  code = code.replace(oldAfternoon3D, newAfternoon3D);
  console.log('4. Afternoon 3D triples updated to show hit round underneath!');
} else {
  console.warn('4. oldAfternoon3D marker not found!');
}

fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');
console.log('Stock dual cards patched and saved successfully to downloaded_target_worker and dist!');
