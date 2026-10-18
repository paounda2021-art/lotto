const fs = require('fs');

const d0 = (e, t, o) => {
  if (!e || e.length === 0) return { draws: [], isFuture: !0, isAllRecorded: !1 };
  const a = e[0].date;
  if (t === "ALL") return { draws: e.filter(N => N.date === a), isFuture: !1, isAllRecorded: !0 };
  if (o && t === o) {
    const s = e[0];
    if (s.dayOfWeek !== t || !s.top3 || s.top3.trim() === "") return { draws: [], isFuture: !0, isAllRecorded: !1 };
  }
  const i = Array.from(new Set(e.filter(s => s.dayOfWeek === t && !!(s.top3 && s.top3.trim() !== "")).map(s => s.date)));
  if (i.length === 0) return { draws: [], isFuture: !0, isAllRecorded: !1 };
  const r = i[0], d = e.filter(s => s.date === r), l = d.length > 0 && d.every(s => !!(s.top3 && s.top3.trim() !== ""));
  return { draws: d, isFuture: !1, isAllRecorded: l };
};

const hanoi = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi.json"));
const spc = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_special.json"));
const vip = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json"));

console.log("d0 for hanoi Sat:", d0(hanoi, "Sat", "Sat"));
console.log("d0 for allDraws Sat:", d0([...hanoi, ...spc, ...vip], "Sat", "Sat"));
console.log("d0 for hanoi Sat (o=Mon):", d0(hanoi, "Sat", "Mon"));
