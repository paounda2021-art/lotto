const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('Includes new WIN4_LAOS_MAP?', code.includes('Mon:[2,5,7,9]'));
console.log('Includes updated card title?', code.includes('ชุดเลขวินเน้น 4 ตัว รอบต่อรอบ (หวยลาวพัฒนา เข้าเป้า 100%)'));
console.log('Includes updated badge?', code.includes('🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรคำนวณเลขชุด 6 ตัว 100%)'));
console.log('Includes updated description?', code.includes('เน้นตัดตรง 4 เลขเด่นคัดพิเศษ จากเลขชุด 6 ตัวประจำงวด (สูตรไร้พ่าย เข้าเป้า 100% รอบต่อรอบ)'));
