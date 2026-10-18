const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');

console.log('1. Card 3 glowing title:', code.includes('textShadow:"0 0 14px rgba(192, 132, 252, 0.9)'));
console.log('2. Card 3 3D matching border:', code.includes('style:{border:"1px solid rgba(168, 85, 247, 0.4)"},className:"bg-black/40 border border-purple-500/40 rounded-xl p-3 space-y-2"'));
console.log('3. Card 3 3D bright text (#d8b4fe):', code.includes('style:{color:"#d8b4fe"},className:"text-xs font-bold text-purple-300 flex items-center gap-1.5"'));
console.log('4. MM card black text (#000000):', code.includes('color: "#000000"'));
