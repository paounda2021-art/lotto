const fs = require('fs');

// We simulate the message formatting logic
function buildLineResultMessage({ lotteryType, session, top3, bottom2, den1, den2, combinedHit }) {
  // Line 1: Header
  let header = '';
  if (lotteryType === 'NIKKEI') {
    header = session.includes('AFTERNOON') ? 'นิเคอิ-ปก (บ่าย)' : 'นิเคอิ-ปก (เช้า)';
  } else if (lotteryType === 'HANOI') {
    if (session === 'HANOI_SPECIAL') header = 'ฮานอยพิเศษ';
    else if (session === 'HANOI_VIP') header = 'ฮานอย VIP';
    else header = 'ฮานอยปกติ';
  } else {
    header = lotteryType;
  }

  // Line 2: 3 digits top - 2 digits bottom
  const resultLine = `${top3}-${bottom2}`;

  // Market short name
  const marketShort = lotteryType === 'NIKKEI'
    ? (session.includes('AFTERNOON') ? 'นิเคอิ ปก-บ่าย' : 'นิเคอิ ปก-เช้า')
    : lotteryType;

  const top2 = top3.slice(-2);
  const hitLines = [];

  // Check den 1
  if (den1 !== undefined) {
    const dStr = String(den1);
    if (bottom2.includes(dStr)) {
      hitLines.push(`🌼 ${marketShort} เด่น ${den1} [ล่าง ${bottom2.split('').join(' ')}]`);
    } else if (top2.includes(dStr)) {
      hitLines.push(`🌼 ${marketShort} เด่น ${den1} [บน ${top2.split('').join(' ')}]`);
    }
  }

  // Check den 2 (rong)
  if (den2 !== undefined) {
    const dStr = String(den2);
    if (top2.includes(dStr)) {
      hitLines.push(`🌼 ${marketShort} รอง ${den2} [บน ${top2.split('').join(' ')}]`);
    } else if (bottom2.includes(dStr)) {
      hitLines.push(`🌼 ${marketShort} รอง ${den2} [ล่าง ${bottom2.split('').join(' ')}]`);
    }
  }

  // Combined stocks
  if (combinedHit) {
    hitLines.push(combinedHit);
  }

  let msg = `${header}\n${resultLine}\n\n`;
  if (hitLines.length > 0) {
    msg += hitLines.join('\n') + '\n\n🎉🎉🎉🎉';
  } else {
    msg += '(รอบนี้เลขไม่เข้าเป้า)';
  }

  return msg;
}

const sampleMsg = buildLineResultMessage({
  lotteryType: 'NIKKEI',
  session: 'NIKKEI_MORNING',
  top3: '177',
  bottom2: '22',
  den1: 2,
  den2: 7,
  combinedHit: '🏷️ รวมทุกหุ้นปกติ 6 รอบ [บน 7 7]'
});

console.log('--- OUTPUT MESSAGE ---');
console.log(sampleMsg);
console.log('----------------------');
