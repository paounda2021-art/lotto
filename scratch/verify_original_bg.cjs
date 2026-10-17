const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

console.log('Has ☀️ รอบเช้า:', js.includes('☀️ รอบเช้า'));
console.log('Has 🌙 รอบบ่าย:', js.includes('🌙 รอบบ่าย'));
console.log('Has old purple background 250b38:', js.includes('250b38'));
console.log('Has old purple background 240b36:', js.includes('240b36'));
console.log('Has style with #ffffff and #000000:', js.includes('#ffffff') && js.includes('#000000'));
console.log('Has bg-black/55 for session boxes:', js.includes('bg-black/55 border '));
console.log('Has original bg-black/40 for 2D/3D boxes:', js.includes('bg-black/40 border border-amber-500/30'));
