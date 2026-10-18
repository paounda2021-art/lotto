const fs = require('fs');
const allResults = JSON.parse(fs.readFileSync('scratch/all_stocks_ey_results.json', 'utf8'));

const checks = [
  { day: 'Mon', type: 'regMorning', cardKey: 'nk_m', name: 'นิเคอิ (เช้า)' },
  { day: 'Mon', type: 'regAfternoon', cardKey: 'cn_a', name: 'จีน (บ่าย)' },
  { day: 'Mon', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Mon', type: 'vipAfternoon', cardKey: 'cn_vip_a', name: 'จีน VIP (บ่าย)' },

  { day: 'Tue', type: 'regMorning', cardKey: 'cn_m', name: 'จีน (เช้า)' },
  { day: 'Tue', type: 'regAfternoon', cardKey: 'cn_a', name: 'จีน (บ่าย)' },
  { day: 'Tue', type: 'vipMorning', cardKey: 'hs_vip_m', name: 'ฮั่งเส็ง VIP (เช้า)' },
  { day: 'Tue', type: 'vipAfternoon', cardKey: 'nk_vip_a', name: 'นิเคอิ VIP (บ่าย)' },

  { day: 'Wed', type: 'regMorning', cardKey: 'cn_m', name: 'จีน (เช้า)' },
  { day: 'Wed', type: 'regAfternoon', cardKey: 'nk_a', name: 'นิเคอิ (บ่าย)' },
  { day: 'Wed', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Wed', type: 'vipAfternoon', cardKey: 'cn_vip_a', name: 'จีน VIP (บ่าย)' },

  { day: 'Thu', type: 'regMorning', cardKey: 'nk_m', name: 'นิเคอิ (เช้า)' },
  { day: 'Thu', type: 'regAfternoon', cardKey: 'cn_a', name: 'จีน (บ่าย)' },
  { day: 'Thu', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Thu', type: 'vipAfternoon', cardKey: 'cn_vip_a', name: 'จีน VIP (บ่าย)' },

  { day: 'Fri', type: 'regMorning', cardKey: 'nk_m', name: 'นิเคอิ (เช้า)' },
  { day: 'Fri', type: 'regAfternoon', cardKey: 'cn_a', name: 'จีน (บ่าย)' },
  { day: 'Fri', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Fri', type: 'vipAfternoon', cardKey: 'cn_vip_a', name: 'จีน VIP (บ่าย)' },

  { day: 'Sat', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Sat', type: 'vipAfternoon', cardKey: 'cn_vip_a', name: 'จีน VIP (บ่าย)' },

  { day: 'Sun', type: 'vipMorning', cardKey: 'cn_vip_m', name: 'จีน VIP (เช้า)' },
  { day: 'Sun', type: 'vipAfternoon', cardKey: 'nk_vip_a', name: 'นิเคอิ VIP (บ่าย)' },
];

console.log('=== สถิติการ์ดจริงจากฐานข้อมูล (คำนวณสดด้วย Ey) ===');
checks.forEach(c => {
  const d = allResults[c.day][c.cardKey];
  if (!d) return;
  console.log(`[${c.day}] ${c.type.padEnd(12)} (${c.name.padEnd(16)}): เด่น ${d.d0} - ${d.d1} (เน้น ${d.d0}) | Top6: ${d.topPairs.slice(0, 6).join(' ')}`);
});
