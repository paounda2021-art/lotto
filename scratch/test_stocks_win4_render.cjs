const fs = require('fs');

// Mock React jsx
const n = {
  jsx: (type, props, key) => ({ type, props, key }),
  jsxs: (type, props, key) => ({ type, props, key }),
  Fragment: 'Fragment'
};

const o = 'NIKKEI';
const r = 'Sat';
const h = { dayName: 'เสาร์' };
const a = [];
const O = [];

const SESSION_WIN4_DATA = {
  Mon: {
    regMorning: [0, 1, 4, 8],
    regAfternoon: [0, 2, 5, 9],
    vipMorning: [1, 4, 8, 9],
    vipAfternoon: [1, 2, 4, 8]
  },
  Tue: {
    regMorning: [3, 5, 6, 9],
    regAfternoon: [0, 2, 3, 7],
    vipMorning: [3, 4, 7, 9],
    vipAfternoon: [0, 4, 6, 7]
  },
  Wed: {
    regMorning: [1, 2, 3, 6],
    regAfternoon: [0, 1, 7, 9],
    vipMorning: [0, 3, 7, 9],
    vipAfternoon: [2, 3, 4, 7]
  },
  Thu: {
    regMorning: [1, 3, 4, 9],
    regAfternoon: [1, 7, 8, 9],
    vipMorning: [1, 4, 6, 9],
    vipAfternoon: [0, 2, 4, 8]
  },
  Fri: {
    regMorning: [2, 6, 7, 8],
    regAfternoon: [1, 3, 4, 6],
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [0, 6, 7, 8]
  },
  Sat: {
    regMorning: null,
    regAfternoon: null,
    vipMorning: [0, 1, 2, 6],
    vipAfternoon: [0, 6, 8, 9]
  },
  Sun: {
    regMorning: null,
    regAfternoon: null,
    vipMorning: [0, 1, 5, 8],
    vipAfternoon: [1, 3, 7, 9]
  }
};

function getWin4Pairs(digits) {
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
}

function getWinningSets(dayCode, cat, time) {
  const win2D = new Set();
  const win3D = new Set();
  const allDraws = (O || []).concat(a || []);
  allDraws.forEach(dr => {
    if (!dr) return;
    const isVip = dr.session?.includes('VIP') || dr.lotteryType?.includes('VIP');
    const isM = dr.session?.includes('MORNING') || dr.session === 'MORNING';
    const isA = dr.session?.includes('AFTERNOON') || dr.session === 'AFTERNOON';
    if ((cat === 'vip' ? isVip : !isVip) && (time === 'Morning' ? isM : isA)) {
      if (dr.dayOfWeek === dayCode || (dr.date && (!dr.dayOfWeek || dr.dayOfWeek === dayCode))) {
        if (dr.top3 && !dr.top3.includes('งด') && dr.top3 !== 'กผล') {
          win3D.add(dr.top3);
          win3D.add(dr.top3.split('').sort().join(''));
        }
        const t2 = dr.top2 || (dr.top3 && dr.top3.length >= 2 ? dr.top3.slice(-2) : '');
        if (t2) win2D.add(t2);
        if (dr.bottom2 && !dr.bottom2.includes('งด')) win2D.add(dr.bottom2);
      }
    }
  });

  const timeStr = time.toLowerCase();
  ['nikkei', 'china', 'hangseng'].forEach(stk => {
    const key = cat === 'vip' ? `lotto_data_${stk}_vip_${timeStr}` : `lotto_data_${stk}_${timeStr}`;
    let list = null;
    if (typeof window !== 'undefined' && window.__KV_DRAWS__ && window.__KV_DRAWS__[key]) {
      list = window.__KV_DRAWS__[key];
    } else if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(key);
        if (raw) list = JSON.parse(raw);
      } catch(e){}
    }
    if (Array.isArray(list)) {
      const match = list.find(d => d.dayOfWeek === dayCode);
      if (match) {
        if (match.top3 && !match.top3.includes('งด') && match.top3 !== 'กผล') {
          win3D.add(match.top3);
          win3D.add(match.top3.split('').sort().join(''));
        }
        const t2 = match.top2 || (match.top3 && match.top3.length >= 2 ? match.top3.slice(-2) : '');
        if (t2) win2D.add(t2);
        if (match.bottom2 && !match.bottom2.includes('งด')) win2D.add(match.bottom2);
      }
    }
  });

  return { win2D, win3D };
}

function renderSessionBox(dayCode, cat, time) {
  const sessKey = cat + time;
  const dayData = SESSION_WIN4_DATA[dayCode] || SESSION_WIN4_DATA['Fri'];
  const digits = dayData ? dayData[sessKey] : null;

  if (!digits) {
    return n.jsxs("div", {
      className: "bg-black/50 border border-gray-700/50 rounded-2xl p-4 text-center space-y-2",
      children: [
        n.jsx("span", {
          className: time === "Morning" ? "text-amber-400 font-bold text-sm block" : "text-purple-400 font-bold text-sm block",
          children: time === "Morning" ? "☀️ รอบเช้า" : "🌙 รอบบ่าย"
        }),
        n.jsx("span", {
          className: "text-xs text-gray-400",
          children: "ตลาดปิดทำการสำหรับรอบนี้"
        })
      ]
    });
  }

  const { pairs2D, triples3D } = getWin4Pairs(digits);
  const { win2D, win3D } = getWinningSets(dayCode, cat, time);
  const hitCount2D = pairs2D.filter(p => win2D.has(p)).length;
  const hitCount3D = triples3D.filter(t => win3D.has(t) || win3D.has(t.split('').sort().join(''))).length;

  return n.jsxs("div", {
    className: "bg-black/50 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 flex flex-col justify-between",
    children: [
      n.jsxs("div", {
        className: "flex items-center justify-between border-b border-amber-500/20 pb-2",
        children: [
          n.jsxs("div", {
            className: "flex items-center gap-1.5 flex-wrap",
            children: [
              n.jsx("span", {
                className: time === "Morning" ? "text-amber-400 text-sm font-black" : "text-purple-400 text-sm font-black",
                children: time === "Morning" ? "☀️ รอบเช้า" : "🌙 รอบบ่าย"
              }),
              n.jsx("span", {
                className: "text-[10px] text-gray-400 font-bold",
                children: cat === "reg"
                  ? (time === "Morning" ? "(นิเคอิ 09:30 ➔ จีน 10:30 ➔ ฮั่งเส็ง 11:00)" : "(นิเคอิ 13:00 ➔ จีน 14:00 ➔ ฮั่งเส็ง 15:30)")
                  : (time === "Morning" ? "(นิเคอิ VIP 09:30 ➔ จีน VIP 10:30 ➔ ฮั่งเส็ง VIP 11:00)" : "(นิเคอิ VIP 13:00 ➔ จีน VIP 14:00 ➔ ฮั่งเส็ง VIP 15:30)")
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
            className: "flex items-center gap-2",
            children: digits.map(d => n.jsx("div", {
              key: d,
              className: "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform",
              children: d
            }))
          }),
          n.jsx("div", {
            className: "text-[11px] text-amber-300/90 font-semibold pl-1",
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
                  hitCount2D > 0 ? n.jsxs("span", {
                    className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                    children: ["✓ เข้าเป้า ", hitCount2D, " ชุด"]
                  }) : null
                ]
              }),
              n.jsx("button", {
                onClick: (e) => {},
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
                className: "px-2.5 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                  (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse" : "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"),
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
                  hitCount3D > 0 ? n.jsxs("span", {
                    className: "bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm animate-pulse ml-1.5",
                    children: ["✓ เข้าเป้า ", hitCount3D, " ชุด"]
                  }) : null
                ]
              }),
              n.jsx("button", {
                onClick: (e) => {},
                className: "text-[10px] bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm active:scale-95",
                children: "📋 คัดลอก 3 ตัว"
              })
            ]
          }),
          n.jsx("div", {
            className: "flex flex-wrap gap-1.5",
            children: triples3D.map(t => {
              const isHit = win3D.has(t) || win3D.has(t.split('').sort().join(''));
              return n.jsx("span", {
                key: t,
                className: "px-3 py-1 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider transition-all " +
                  (isHit ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black shadow-glow-gold border-2 border-white scale-110 ring-2 ring-yellow-400 animate-pulse" : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"),
                children: t
              });
            })
          })
        ]
      })
    ]
  });
}

console.log('Rendering for Saturday:');
const boxMorning = renderSessionBox('Sat', 'vip', 'Morning');
const boxAfternoon = renderSessionBox('Sat', 'vip', 'Afternoon');
console.log('Morning box type:', boxMorning.type, 'children count:', boxMorning.props.children.length);
console.log('Afternoon box type:', boxAfternoon.type, 'children count:', boxAfternoon.props.children.length);
console.log('All functions rendered without any error!');
