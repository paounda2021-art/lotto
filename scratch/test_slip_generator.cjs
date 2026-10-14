const fs = require('fs');
const path = require('path');

// Let's create the master slip generator for all weekdays (Mon-Fri)
const CHASE_SLIPS_CONFIG = {
  Mon: {
    dayTh: 'วันจันทร์',
    regMorning: {
      cardName: 'นิเคอิ (เช้า)',
      runDigits: '4 - 6',
      bestDigit: '4',
      top6: '41 - 40 - 49 - 42 - 61 - 60 - 69 - 62',
      winPairs: '41 - 40 - 49 - 42 - 61 - 60 - 69 - 62'
    },
    regAfternoon: {
      cardName: 'จีน (บ่าย)',
      runDigits: '2 - 1',
      bestDigit: '2',
      top6: '20 - 29 - 22 - 23 - 10 - 19 - 12 - 13',
      winPairs: '20 - 29 - 22 - 23 - 10 - 19 - 12 - 13'
    },
    vipMorning: {
      cardName: 'จีน VIP (เช้า)',
      runDigits: '8 - 0',
      bestDigit: '8',
      top6: '81 - 84 - 83 - 89 - 01 - 04 - 03 - 09',
      winPairs: '81 - 84 - 83 - 89 - 01 - 04 - 03 - 09'
    },
    vipAfternoon: {
      cardName: 'จีน VIP (บ่าย)',
      runDigits: '8 - 2',
      bestDigit: '8',
      top6: '84 - 81 - 85 - 88 - 24 - 21 - 25 - 28',
      winPairs: '84 - 81 - 85 - 88 - 24 - 21 - 25 - 28'
    }
  },
  Tue: {
    dayTh: 'วันอังคาร',
    regMorning: {
      cardName: 'จีน (เช้า) [การ์ดฮั่งเส็ง 9-5 ไร้พ่าย 100%]',
      runDigits: '3 - 0',
      bestDigit: '3',
      top6: '11 - 20 - 39 - 63 - 03 - 06',
      winPairs: '45 - 43 - 40 - 46 - 35 - 33 - 30 - 36'
    },
    regAfternoon: {
      cardName: 'จีน (บ่าย) [การ์ดนิเคอิ 3-2 ไร้พ่าย 100%]',
      runDigits: '2 - 5',
      bestDigit: '2',
      top6: '20 - 42 - 52 - 69 - 71 - 77',
      winPairs: '23 - 20 - 22 - 25 - 93 - 90 - 92 - 95'
    },
    vipMorning: {
      cardName: 'ฮั่งเส็ง VIP (เช้า)',
      runDigits: '7 - 6',
      bestDigit: '7',
      top6: '12 - 29 - 60 - 65 - 74 - 78',
      winPairs: '82 - 84 - 80 - 81 - 62 - 64 - 60 - 61'
    },
    vipAfternoon: {
      cardName: 'นิเคอิ VIP (บ่าย)',
      runDigits: '2 - 0',
      bestDigit: '2',
      top6: '24 - 52 - 62 - 76 - 11 - 14',
      winPairs: '60 - 61 - 69 - 62 - 20 - 21 - 29 - 22'
    }
  },
  Wed: {
    dayTh: 'วันพุธ',
    regMorning: {
      cardName: 'จีน (เช้า)',
      runDigits: '3 - 6',
      bestDigit: '3',
      top6: '33 - 34 - 63 - 76 - 88 - 05',
      winPairs: '05 - 00 - 06 - 03 - 25 - 20 - 26 - 23'
    },
    regAfternoon: {
      cardName: 'นิเคอิ (บ่าย) [สถิติ 100% ไร้พ่าย]',
      runDigits: '4 - 1',
      bestDigit: '4',
      top6: '27 - 64 - 73 - 91 - 13 - 16',
      winPairs: '12 - 16 - 17 - 10 - 42 - 46 - 47 - 40'
    },
    vipMorning: {
      cardName: 'จีน VIP (เช้า)',
      runDigits: '0 - 9',
      bestDigit: '0',
      top6: '60 - 79 - 85 - 01 - 03 - 09',
      winPairs: '60 - 61 - 65 - 63 - 00 - 01 - 05 - 03'
    },
    vipAfternoon: {
      cardName: 'จีน VIP (บ่าย) [สถิติ 100% ไร้พ่าย]',
      runDigits: '2 - 3',
      bestDigit: '2',
      top6: '12 - 15 - 37 - 48 - 50 - 53',
      winPairs: '52 - 54 - 58 - 59 - 32 - 34 - 38 - 39'
    }
  },
  Thu: {
    dayTh: 'วันพฤหัสบดี',
    regMorning: {
      cardName: 'นิเคอิ (เช้า)',
      runDigits: '4 - 8',
      bestDigit: '4',
      top6: '41 - 43 - 47 - 49 - 81 - 83 - 87 - 89',
      winPairs: '41 - 43 - 47 - 49 - 81 - 83 - 87 - 89'
    },
    regAfternoon: {
      cardName: 'จีน (บ่าย)',
      runDigits: '9 - 4',
      bestDigit: '9',
      top6: '91 - 98 - 99 - 90 - 41 - 48 - 49 - 40',
      winPairs: '91 - 98 - 99 - 90 - 41 - 48 - 49 - 40'
    },
    vipMorning: {
      cardName: 'จีน VIP (เช้า)',
      runDigits: '4 - 6',
      bestDigit: '4',
      top6: '44 - 45 - 49 - 41 - 64 - 65 - 69 - 61',
      winPairs: '44 - 45 - 49 - 41 - 64 - 65 - 69 - 61'
    },
    vipAfternoon: {
      cardName: 'จีน VIP (บ่าย)',
      runDigits: '4 - 1',
      bestDigit: '4',
      top6: '48 - 47 - 40 - 43 - 18 - 17 - 10 - 13',
      winPairs: '48 - 47 - 40 - 43 - 18 - 17 - 10 - 13'
    }
  },
  Fri: {
    dayTh: 'วันศุกร์',
    regMorning: {
      cardName: 'นิเคอิ (เช้า)',
      runDigits: '4 - 7',
      bestDigit: '4',
      top6: '48 - 45 - 49 - 44 - 78 - 75 - 79 - 74',
      winPairs: '48 - 45 - 49 - 44 - 78 - 75 - 79 - 74'
    },
    regAfternoon: {
      cardName: 'จีน (บ่าย)',
      runDigits: '0 - 8',
      bestDigit: '0',
      top6: '06 - 03 - 07 - 02 - 86 - 83 - 87 - 82',
      winPairs: '06 - 03 - 07 - 02 - 86 - 83 - 87 - 82'
    },
    vipMorning: {
      cardName: 'จีน VIP (เช้า)',
      runDigits: '0 - 4',
      bestDigit: '0',
      top6: '01 - 03 - 05 - 09 - 41 - 43 - 45 - 49',
      winPairs: '01 - 03 - 05 - 09 - 41 - 43 - 45 - 49'
    },
    vipAfternoon: {
      cardName: 'จีน VIP (บ่าย)',
      runDigits: '2 - 1',
      bestDigit: '2',
      top6: '27 - 28 - 20 - 29 - 17 - 18 - 10 - 19',
      winPairs: '27 - 28 - 20 - 29 - 17 - 18 - 10 - 19'
    }
  }
};

function generateLineSlip(dayCode, filter = 'ALL', dateFormatted = '') {
  const cfg = CHASE_SLIPS_CONFIG[dayCode] || CHASE_SLIPS_CONFIG['Wed'];
  const dayName = cfg.dayTh;
  const dateStr = dateFormatted || '14 ต.ค. 2569';

  let lines = [
    '================================',
    '🎯 โพยล่า 3 หวยหุ้น SystemLucky289',
    '🗓️ ประจำ: ' + dayName + 'ที่ ' + dateStr,
    '(สูตรล่าสเต็ป 1 ➡️ 2 ➡️ 3 เข้าแล้วหยุดทันที)',
    '================================'
  ];

  if (filter === 'ALL' || filter === 'REG_MORNING' || filter === 'MORNING' || filter === 'REGULAR') {
    lines.push('');
    lines.push('☀️ [1] หุ้นปกติ รอบเช้า');
    lines.push('(นิเคอิ 09:30 ➡️ จีน 10:30 ➡️ ฮั่งเส็ง 11:00)');
    lines.push('• การ์ดต้นทาง : ' + cfg.regMorning.cardName);
    lines.push('• ฟันเด่นรูด : ' + cfg.regMorning.runDigits + ' (เน้น ' + cfg.regMorning.bestDigit + ')');
    lines.push('• เจาะ Top 6 : ' + cfg.regMorning.top6);
    lines.push('• วินสิบ-หน่วย : ' + cfg.regMorning.winPairs);
  }

  if (filter === 'ALL' || filter === 'REG_AFTERNOON' || filter === 'AFTERNOON' || filter === 'REGULAR') {
    lines.push('');
    lines.push('🌙 [2] หุ้นปกติ รอบบ่าย');
    lines.push('(นิเคอิ 13:00 ➡️ จีน 14:00 ➡️ ฮั่งเส็ง 15:30)');
    lines.push('• การ์ดต้นทาง : ' + cfg.regAfternoon.cardName);
    lines.push('• ฟันเด่นรูด : ' + cfg.regAfternoon.runDigits + ' (เน้น ' + cfg.regAfternoon.bestDigit + ')');
    lines.push('• เจาะ Top 6 : ' + cfg.regAfternoon.top6);
    lines.push('• วินสิบ-หน่วย : ' + cfg.regAfternoon.winPairs);
  }

  if (filter === 'ALL' || filter === 'VIP_MORNING' || filter === 'MORNING' || filter === 'VIP') {
    lines.push('');
    lines.push('☀️ [3] หุ้น VIP รอบเช้า');
    lines.push('(นิเคอิ VIP 09:30 ➡️ จีน VIP 10:30 ➡️ ฮั่งเส็ง VIP 11:00)');
    lines.push('• การ์ดต้นทาง : ' + cfg.vipMorning.cardName);
    lines.push('• ฟันเด่นรูด : ' + cfg.vipMorning.runDigits + ' (เน้น ' + cfg.vipMorning.bestDigit + ')');
    lines.push('• เจาะ Top 6 : ' + cfg.vipMorning.top6);
    lines.push('• วินสิบ-หน่วย : ' + cfg.vipMorning.winPairs);
  }

  if (filter === 'ALL' || filter === 'VIP_AFTERNOON' || filter === 'AFTERNOON' || filter === 'VIP') {
    lines.push('');
    lines.push('🌙 [4] หุ้น VIP รอบบ่าย');
    lines.push('(นิเคอิ VIP 13:00 ➡️ จีน VIP 14:00 ➡️ ฮั่งเส็ง VIP 15:30)');
    lines.push('• การ์ดต้นทาง : ' + cfg.vipAfternoon.cardName);
    lines.push('• ฟันเด่นรูด : ' + cfg.vipAfternoon.runDigits + ' (เน้น ' + cfg.vipAfternoon.bestDigit + ')');
    lines.push('• เจาะ Top 6 : ' + cfg.vipAfternoon.top6);
    lines.push('• วินสิบ-หน่วย : ' + cfg.vipAfternoon.winPairs);
  }

  lines.push('');
  lines.push('================================');
  lines.push('💡 กฎเหล็ก: เข้าเป้าสเต็ปไหนให้หยุดทันที!');
  lines.push('🤖 คำนวณอัตโนมัติด้วยระบบ LOTTO289');

  return lines.join('\n');
}

console.log('Sample Wed All:\n' + generateLineSlip('Wed', 'ALL', '14 ต.ค. 2569'));
