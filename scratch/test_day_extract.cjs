const sampleText1 = "⭐ สรุปฟันธงเลขเด่นงวดประจำวันอังคาร (วิเคราะห์รอบ นิเคอิ (เช้า-บ่าย)) ฟันเด่นวิ่ง-รูด 19 ประตู: 3 และ 2";
const sampleText2 = "✨ ชุดเจาะ 2 ตัว (เน้นประจำวันอังคาร) เน้น 6 ชุด";

function extractDayName(text) {
  const m1 = text.match(/สรุปฟันธงเลขเด่นงวดประจำวัน([^\s():]+)/);
  if (m1) return m1[1];
  const m2 = text.match(/ชุดเจาะ 2 ตัว\s*\(เน้นประจำวัน([^\s():]+)\)/);
  if (m2) return m2[1];
  return null;
}

console.log('Sample 1 extracted:', extractDayName(sampleText1));
console.log('Sample 2 extracted:', extractDayName(sampleText2));
