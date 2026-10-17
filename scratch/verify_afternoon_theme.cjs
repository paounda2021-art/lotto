const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

console.log('Has 🌙 รอบบ่าย:', js.includes('🌙 รอบบ่าย'));
console.log('Has purple glass balls gradient:', js.includes('from-purple-600 via-fuchsia-500 to-indigo-400'));
console.log('Has afternoon hit badge gradient:', js.includes('linear-gradient(90deg, #d946ef 0%, #a855f7 50%, #6366f1 100%)'));
console.log('Has afternoon chip hit class:', js.includes('win4-chip-afternoon-hit'));
console.log('Has afternoon chip default class:', js.includes('win4-chip-afternoon-default'));
console.log('Afternoon container uses bg-black/55 (original brown):', js.includes('className: "bg-black/55 border border-purple-500/40 rounded-2xl'));
console.log('Has old purple container gradient (250b38):', js.includes('250b38'));
