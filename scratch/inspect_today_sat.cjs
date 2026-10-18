const fs = require("fs");

const hanoi = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi.json"));
const spc = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_special.json"));
const vip = JSON.parse(fs.readFileSync("downloaded_target_worker/kv_data/lotto_data_hanoi_vip.json"));

console.log("=== Hanoi Regular top 3 ===");
console.log(hanoi.slice(0, 3));

console.log("=== Hanoi Special top 3 ===");
console.log(spc.slice(0, 3));

console.log("=== Hanoi VIP top 3 ===");
console.log(vip.slice(0, 3));

// Check date for Saturday
const allSessions = [...hanoi, ...spc, ...vip];
const saturdays = allSessions.filter(s => s.dayOfWeek === "Sat" || (new Date(s.date).getDay() === 6));
console.log("=== Saturdays found ===");
const satDates = [...new Set(saturdays.map(s => s.date))];
console.log("Saturday dates:", satDates);

satDates.slice(0, 5).forEach(dt => {
  const sess = allSessions.filter(s => s.date === dt);
  console.log(`Date: ${dt}`);
  sess.forEach(s => console.log(`  ${s.session || 'regular'}: top3=${s.top3}, top2=${s.top2}, bottom2=${s.bottom2}`));
});
