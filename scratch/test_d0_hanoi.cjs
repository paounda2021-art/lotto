const fs = require('fs');

const special = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_special.json', 'utf8'));
const normal = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi.json', 'utf8'));
const vip = JSON.parse(fs.readFileSync('downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json', 'utf8'));

special.forEach(d => d.session = d.session || 'HANOI_SPECIAL');
normal.forEach(d => d.session = d.session || 'HANOI_EVENING');
vip.forEach(d => d.session = d.session || 'HANOI_VIP');

const allHanoi = [...special, ...normal, ...vip];
// Sort by date descending
allHanoi.sort((a,b) => (b.date || '').localeCompare(a.date || ''));

const d0 = (e, t, o) => {
  if (!e || e.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
  const a = e[0].date;
  if (t === "ALL") return { draws: e.filter(N => N.date === a), isFuture: false, isAllRecorded: true };
  if (o && t === o) {
    const s = e[0];
    if (s.dayOfWeek !== t || !s.top3 || s.top3.trim() === "") return { draws: [], isFuture: true, isAllRecorded: false };
  }
  const i = Array.from(new Set(e.filter(s => s.dayOfWeek === t && !!(s.top3 && s.top3.trim() !== "")).map(s => s.date)));
  if (i.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
  const r = i[0], d = e.filter(s => s.date === r), l = d.length > 0 && d.every(s => !!(s.top3 && s.top3.trim() !== ""));
  return { draws: d, isFuture: false, isAllRecorded: l };
};

['Sat', 'Fri', 'Thu', 'Wed'].forEach(day => {
  const { draws: O, isFuture: g } = d0(allHanoi, day, 'Sat');
  console.log(`\nDay ${day}: isFuture=${g}, draws count=${O.length}`);
  O.forEach(dr => {
    console.log(`  date: ${dr.date}, session: ${dr.session}, top3: ${dr.top3}, top2: ${dr.top2}, bottom2: ${dr.bottom2}`);
  });
});
