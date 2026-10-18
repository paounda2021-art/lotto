const fs = require('fs');
const js = fs.readFileSync('downloaded_target_worker/assets/index-CN-5_2d9.js', 'utf8');

console.log('Has Card 1 (เอนจินสถิติ):', js.includes('🔥 ชุดคัดเน้นพิเศษ') && js.includes('(เอนจินสถิติ)'));
console.log('Has Card 2 (สูตรไร้พ่าย 100%):', js.includes('ชุดเลขวินเน้น 4 ตัว ล่า 3 รอบ (ฮานอยพิเศษ ➔ ปกติ ➔ VIP)'));
console.log('Has WIN4_HANOI_MAP:', js.includes('WIN4_HANOI_MAP'));
console.log('Has 3-Step Chase items:', js.includes('🟠 ฮานอยพิเศษ (17:30)') && js.includes('🔴 ฮานอยปกติ (18:30)') && js.includes('🟣 ฮานอย VIP (19:30)'));
console.log('Has Weekday selector in Hanoi Card 2:', js.includes('ย้อนดูวัน (วัน') && js.includes('คลิกเพื่อย้อนดูสถิติและชุดวินเด่น วัน'));
console.log('Has both card1 and card2 returned in space-y-4:', js.includes('className:"space-y-4",children:[card1,card2]'));
