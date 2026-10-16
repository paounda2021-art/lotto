const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'export_modal.js');
const baseCode = fs.readFileSync(srcPath, 'utf8');

// 1. Look for injectDownloadButton in baseCode to add the "📋 คัดลอกโพยล่า 3 หวย (ส่ง LINE)" button
let base = baseCode;
const lineIdx = base.indexOf('/* ==========================================================================');
if (lineIdx !== -1) {
  base = base.substring(0, lineIdx);
}
const cutoff = base.indexOf('  // Periodic and reactive checks');
if (cutoff !== -1) {
  base = base.substring(0, cutoff);
}

// Make sure injectDownloadButton inserts the new Line Chase Slip button
const oldInsertTarget = "targetBtn.parentElement.insertBefore(btn, chaseBtn);";
const newInsertCode = `
    const lineSlipBtn = document.createElement('button');
    lineSlipBtn.id = 'btn-copy-chase-line-ui';
    lineSlipBtn.type = 'button';
    lineSlipBtn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white border border-green-400 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald mr-2';
    lineSlipBtn.title = 'เปิดสรุปโพยล่า 3 หวย เพื่อคัดลอกไปวางในแชท LINE ได้ทันที';
    lineSlipBtn.innerHTML = \`
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span>📋 สรุปโพยล่า 3 หวย (ส่ง LINE)</span>
    \`;
    lineSlipBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openChaseSlipModal === 'function') {
        window.openChaseSlipModal();
      }
    };

    targetBtn.parentElement.insertBefore(lineSlipBtn, targetBtn);
    targetBtn.parentElement.insertBefore(posBtn, lineSlipBtn);
    targetBtn.parentElement.insertBefore(chaseBtn, posBtn);
    targetBtn.parentElement.insertBefore(btn, chaseBtn);
`;

if (base.includes(oldInsertTarget)) {
  base = base.replace(
    /targetBtn\.parentElement\.insertBefore\(posBtn,\s*targetBtn\);\s*targetBtn\.parentElement\.insertBefore\(chaseBtn,\s*posBtn\);\s*targetBtn\.parentElement\.insertBefore\(btn,\s*chaseBtn\);/,
    newInsertCode.trim()
  );
}

const lineModuleCode = `
  /* ==========================================================================
     LINE NOTIFICATION & CHASE SLIP SYSTEM (SystemLucky289)
     ========================================================================== */

  let lineModalContainer = null;
  let lineChoiceModalOverlay = null;
  let chaseSlipModalOverlay = null;

  const CHASE_SLIPS_DATA = {
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
        cardName: 'ฮั่งเส็ง VIP (เช้า) 🥇',
        runDigits: '7 - 6',
        bestDigit: '7',
        top6: '12 - 29 - 60 - 65 - 74 - 78',
        winPairs: '82 - 84 - 80 - 81 - 62 - 64 - 60 - 61'
      },
      vipAfternoon: {
        cardName: 'นิเคอิ VIP (บ่าย) 🥇',
        runDigits: '2 - 0',
        bestDigit: '2',
        top6: '24 - 52 - 62 - 76 - 11 - 14',
        winPairs: '60 - 61 - 69 - 62 - 20 - 21 - 29 - 22'
      }
    },
    Wed: {
      dayTh: 'วันพุธ',
      regMorning: {
        cardName: 'จีน (เช้า) 🥇 แตกบ่อยสุด',
        runDigits: '3 - 6',
        bestDigit: '3',
        top6: '33 - 34 - 63 - 76 - 88 - 05',
        winPairs: '05 - 00 - 06 - 03 - 25 - 20 - 26 - 23'
      },
      regAfternoon: {
        cardName: 'นิเคอิ (บ่าย) 🥇 สถิติ 100% ไร้พ่าย',
        runDigits: '4 - 1',
        bestDigit: '4',
        top6: '27 - 64 - 73 - 91 - 13 - 16',
        winPairs: '12 - 16 - 17 - 10 - 42 - 46 - 47 - 40'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า) 🥇 แตก 01 สเต็ป 1',
        runDigits: '0 - 9',
        bestDigit: '0',
        top6: '60 - 79 - 85 - 01 - 03 - 09',
        winPairs: '60 - 61 - 65 - 63 - 00 - 01 - 05 - 03'
      },
      vipAfternoon: {
        cardName: 'จีน VIP (บ่าย) 🥇 สถิติ 100% ไร้พ่าย',
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
    },
    Sat: {
      dayTh: 'วันเสาร์',
      regClosed: true,
      regMorning: {
        cardName: 'ตลาดหุ้นปกติ ปิดทำการ (เสาร์-อาทิตย์)',
        runDigits: '-',
        bestDigit: '-',
        top6: '-',
        winPairs: '-'
      },
      regAfternoon: {
        cardName: 'ตลาดหุ้นปกติ ปิดทำการ (เสาร์-อาทิตย์)',
        runDigits: '-',
        bestDigit: '-',
        top6: '-',
        winPairs: '-'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า) 🥇 ฟอร์มสด สเต็ป 1 แตก 5 ใน 6 วัน',
        runDigits: '1 - 2 (กัน 6)',
        bestDigit: '1',
        top6: '12 - 29 - 32 - 60 - 78 - 10',
        winPairs: '12 - 29 - 32 - 60 - 78 - 10 - 15 - 16'
      },
      vipAfternoon: {
        cardName: 'การ์ดรวม VIP บ่าย 👑 สูตรไร้พ่าย 100% (0 หลุด ต่อเนื่อง 112 วัน)',
        runDigits: '0 - 3 (กัน 2)',
        bestDigit: '0',
        top6: '02 - 03 - 08 - 32 - 38 - 28',
        winPairs: '02 - 03 - 08 - 32 - 38 - 28 - 07 - 37'
      }
    },
    Sun: {
      dayTh: 'วันอาทิตย์',
      regClosed: true,
      regMorning: {
        cardName: 'ตลาดหุ้นปกติ ปิดทำการ (เสาร์-อาทิตย์)',
        runDigits: '-',
        bestDigit: '-',
        top6: '-',
        winPairs: '-'
      },
      regAfternoon: {
        cardName: 'ตลาดหุ้นปกติ ปิดทำการ (เสาร์-อาทิตย์)',
        runDigits: '-',
        bestDigit: '-',
        top6: '-',
        winPairs: '-'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า) 🥇 สถิติไร้พ่าย (สเต็ป 1 แตก)',
        runDigits: '9 - 5 (กัน 4)',
        bestDigit: '9',
        top6: '15 - 20 - 36 - 39 - 50 - 79',
        winPairs: '15 - 20 - 36 - 39 - 50 - 79 - 80 - 91'
      },
      vipAfternoon: {
        cardName: 'นิเคอิ VIP (บ่าย) 👑 สถิติ 100% ไร้พ่าย (ไม่เคยหลุดเลย 0 วัน)',
        runDigits: '9 - 3',
        bestDigit: '9',
        top6: '19 - 72 - 03 - 10 - 13 - 16',
        winPairs: '19 - 72 - 03 - 10 - 13 - 16 - 24 - 26'
      }
    }
  };

  function getBangkokTodayDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bkk = new Date(utc + (3600000 * 7));
    const y = bkk.getFullYear();
    const m = String(bkk.getMonth() + 1).padStart(2, '0');
    const d = String(bkk.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getBangkokDayCode() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bkk = new Date(utc + (3600000 * 7));
    const dayIndex = bkk.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[dayIndex] || 'Wed';
  }

  function getDateForWeekday(targetDayCode) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bkk = new Date(utc + (3600000 * 7));

    const currentDayIndex = bkk.getDay(); // 0 Sun, 1 Mon ... 6 Sat
    // Days elapsed from Monday of current week (Mon=0, Tue=1, ..., Sun=6)
    const daysFromMonday = (currentDayIndex === 0) ? 6 : (currentDayIndex - 1);
    const monday = new Date(bkk);
    monday.setDate(bkk.getDate() - daysFromMonday);

    const dayOffsets = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
    const targetDate = new Date(monday);
    const offset = dayOffsets[targetDayCode] !== undefined ? dayOffsets[targetDayCode] : 0;
    targetDate.setDate(monday.getDate() + offset);

    const d = targetDate.getDate();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const m = thaiMonths[targetDate.getMonth()] || 'ต.ค.';
    const yThai = (targetDate.getFullYear() + 543).toString().slice(-2);
    return d + ' ' + m + ' ' + yThai;
  }

  function buildChaseLineSlipText(dayCode, filter = 'ALL') {
    const cfg = CHASE_SLIPS_DATA[dayCode] || CHASE_SLIPS_DATA['Wed'];
    const dayName = cfg.dayTh;
    const dateFormatted = getDateForWeekday(dayCode);

    let lines = [
      '================================',
      '🎯 โพยล่า 3 หวยหุ้น SystemLucky289',
      '🗓️ ประจำ: ' + dayName + 'ที่ ' + dateFormatted,
      '(สูตรล่าสเต็ป 1 ➡️ 2 ➡️ 3 เข้าแล้วหยุดทันที)',
      '================================'
    ];

    if (cfg.regClosed) {
      if (filter === 'REGULAR') {
        lines.push('');
        lines.push('🛑 ตลาดหุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง) ปิดทำการวันเสาร์-อาทิตย์');
        lines.push('👉 แนะนำเลือกแท็บ "💎 หุ้น VIP" มีออกรางวัลครบทุกวัน 7 วัน ทั้งเช้าและบ่ายครับ');
      } else if (filter === 'ALL') {
        lines.push('');
        lines.push('📌 ตลาดหุ้นปกติ: ปิดทำการวันเสาร์-อาทิตย์ (เปิดทำการจันทร์-ศุกร์)');
      }
    } else {
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
    }

    if (filter === 'ALL' || filter === 'VIP_MORNING' || filter === 'MORNING' || filter === 'VIP') {
      lines.push('');
      lines.push('☀️ ' + (cfg.regClosed ? '[1]' : '[3]') + ' หุ้น VIP รอบเช้า' + (cfg.regClosed ? ' (เปิดทำการปกติ)' : ''));
      lines.push('(นิเคอิ VIP 09:30 ➡️ จีน VIP 10:30 ➡️ ฮั่งเส็ง VIP 11:00)');
      lines.push('• การ์ดต้นทาง : ' + cfg.vipMorning.cardName);
      lines.push('• ฟันเด่นรูด : ' + cfg.vipMorning.runDigits + ' (เน้น ' + cfg.vipMorning.bestDigit + ')');
      lines.push('• เจาะ Top 6 : ' + cfg.vipMorning.top6);
      lines.push('• วินสิบ-หน่วย : ' + cfg.vipMorning.winPairs);
    }

    if (filter === 'ALL' || filter === 'VIP_AFTERNOON' || filter === 'AFTERNOON' || filter === 'VIP') {
      lines.push('');
      lines.push('🌙 ' + (cfg.regClosed ? '[2]' : '[4]') + ' หุ้น VIP รอบบ่าย' + (cfg.regClosed ? ' (เปิดทำการปกติ)' : ''));
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

    return lines.join('\\n');
  }

  function showToast(message, isError = false) {
    let toast = document.getElementById('lucky-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'lucky-toast-notification';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.zIndex = '99999';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '12px';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = '700';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      toast.style.transition = 'all 0.3s ease';
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.gap = '8px';
      document.body.appendChild(toast);
    }
    toast.style.background = isError ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #06c755, #05a043)';
    toast.style.color = '#ffffff';
    toast.style.border = isError ? '1px solid #f87171' : '1px solid #34d399';
    toast.innerHTML = (isError ? '⚠️ ' : '✅ ') + message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3500);
  }

  async function getLineConfig() {
    let config = { channelAccessToken: '', targetId: 'U3a7529a26c7c9a1a06d4cd374349a33c', enabled: true };
    try {
      const stored = localStorage.getItem('lotto_line_bot_config');
      if (stored) config = { ...config, ...JSON.parse(stored) };
    } catch(e) {}
    try {
      const res = await fetch('/api/line/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) config = { ...config, ...data.config };
      }
    } catch(e) {}
    return config;
  }

  async function saveLineConfig(config) {
    try {
      localStorage.setItem('lotto_line_bot_config', JSON.stringify(config));
    } catch(e) {}
    try {
      await fetch('/api/line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch(e) {}
  }

  function isNumericResult(draw) {
    if (!draw) return false;
    const top3 = String(draw.top3 || '').trim();
    const bottom2 = String(draw.bottom2 || '').trim();
    return /^[0-9]{2,3}$/.test(top3) && /^[0-9]{2}$/.test(bottom2);
  }

  function getLotteryInfo(activeType, activeSess) {
    const type = (activeType || 'NIKKEI').toUpperCase();
    const sess = (activeSess || '').toUpperCase();

    let title = 'นิเคอิ-ปก (เช้า)';
    let marketShort = 'นิเคอิ ปก-เช้า';
    let fullName = 'หุ้นนิเคอิ (ปกติ)';

    if (type === 'NIKKEI') {
      if (sess.includes('CHINA')) {
        if (sess.includes('AFTERNOON')) {
          title = 'จีน-ปก (บ่าย)'; marketShort = 'จีน ปก-บ่าย'; fullName = 'หุ้นจีน (ปกติ)';
        } else {
          title = 'จีน-ปก (เช้า)'; marketShort = 'จีน ปก-เช้า'; fullName = 'หุ้นจีน (ปกติ)';
        }
      } else if (sess.includes('HANGSENG')) {
        if (sess.includes('AFTERNOON')) {
          title = 'ฮั่งเส็ง-ปก (บ่าย)'; marketShort = 'ฮั่งเส็ง ปก-บ่าย'; fullName = 'หุ้นฮั่งเส็ง (ปกติ)';
        } else {
          title = 'ฮั่งเส็ง-ปก (เช้า)'; marketShort = 'ฮั่งเส็ง ปก-เช้า'; fullName = 'หุ้นฮั่งเส็ง (ปกติ)';
        }
      } else {
        if (sess.includes('AFTERNOON')) {
          title = 'นิเคอิ-ปก (บ่าย)'; marketShort = 'นิเคอิ ปก-บ่าย'; fullName = 'หุ้นนิเคอิ (ปกติ)';
        } else if (sess.includes('BOTH')) {
          title = 'นิเคอิ-ปก (เช้า-บ่าย)'; marketShort = 'นิเคอิ ปก'; fullName = 'หุ้นนิเคอิ (ปกติ)';
        } else {
          title = 'นิเคอิ-ปก (เช้า)'; marketShort = 'นิเคอิ ปก-เช้า'; fullName = 'หุ้นนิเคอิ (ปกติ)';
        }
      }
    } else if (type === 'STOCKS_VIP' || type === 'STOCK_VIP') {
      if (sess.includes('CHINA')) {
        if (sess.includes('AFTERNOON')) {
          title = 'จีน-VIP (บ่าย)'; marketShort = 'จีน VIP-บ่าย'; fullName = 'หุ้นจีน VIP';
        } else {
          title = 'จีน-VIP (เช้า)'; marketShort = 'จีน VIP-เช้า'; fullName = 'หุ้นจีน VIP';
        }
      } else if (sess.includes('HANGSENG')) {
        if (sess.includes('AFTERNOON')) {
          title = 'ฮั่งเส็ง-VIP (บ่าย)'; marketShort = 'ฮั่งเส็ง VIP-บ่าย'; fullName = 'หุ้นฮั่งเส็ง VIP';
        } else {
          title = 'ฮั่งเส็ง-VIP (เช้า)'; marketShort = 'ฮั่งเส็ง VIP-เช้า'; fullName = 'หุ้นฮั่งเส็ง VIP';
        }
      } else {
        if (sess.includes('AFTERNOON')) {
          title = 'นิเคอิ-VIP (บ่าย)'; marketShort = 'นิเคอิ VIP-บ่าย'; fullName = 'หุ้นนิเคอิ VIP';
        } else if (sess.includes('BOTH')) {
          title = 'นิเคอิ-VIP (เช้า-บ่าย)'; marketShort = 'นิเคอิ VIP'; fullName = 'หุ้นนิเคอิ VIP';
        } else {
          title = 'นิเคอิ-VIP (เช้า)'; marketShort = 'นิเคอิ VIP-เช้า'; fullName = 'หุ้นนิเคอิ VIP';
        }
      }
    } else if (type === 'HANOI') {
      if (sess === 'HANOI_SPECIAL') {
        title = 'ฮานอยพิเศษ (17:30)'; marketShort = 'ฮานอย พิเศษ'; fullName = 'หวยฮานอยพิเศษ';
      } else if (sess === 'HANOI_VIP') {
        title = 'ฮานอย VIP (19:30)'; marketShort = 'ฮานอย VIP'; fullName = 'หวยฮานอย VIP';
      } else {
        title = 'ฮานอยปกติ (18:30)'; marketShort = 'ฮานอย ปกติ'; fullName = 'หวยฮานอย (ปกติ)';
      }
    } else if (type === 'LAOS') {
      title = 'ลาวพัฒนา (20:30)'; marketShort = 'ลาวพัฒนา'; fullName = 'หวยลาวพัฒนา';
    }
    return { title, marketShort, fullName };
  }

  /* ==========================================================================
     CHASE SLIP MODAL FOR LINE (คัดลอกโพยล่า 3 หวย วางในแชท LINE)
     ========================================================================== */

  window.openChaseSlipModal = function() {
    let currentDay = getBangkokDayCode();
    if (!CHASE_SLIPS_DATA[currentDay]) currentDay = 'Mon';
    let currentFilter = 'ALL';

    if (!chaseSlipModalOverlay) {
      chaseSlipModalOverlay = document.createElement('div');
      chaseSlipModalOverlay.id = 'chase-slip-modal-overlay';
      chaseSlipModalOverlay.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: system-ui, -apple-system, sans-serif;';
      document.body.appendChild(chaseSlipModalOverlay);
    }

    function renderModalContent() {
      const slipText = buildChaseLineSlipText(currentDay, currentFilter);
      const dayNames = { Mon: 'จันทร์', Tue: 'อังคาร', Wed: 'พุธ', Thu: 'พฤหัสฯ', Fri: 'ศุกร์', Sat: 'เสาร์', Sun: 'อาทิตย์' };

      chaseSlipModalOverlay.innerHTML = \`
        <div style="background: #111827; border: 1px solid #10b981; border-radius: 20px; width: 100%; max-width: 620px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(16, 185, 129, 0.2); overflow: hidden; color: #f3f4f6;">
          
          <!-- Header -->
          <div style="padding: 16px 20px; background: linear-gradient(135deg, rgba(6, 199, 85, 0.2), rgba(16, 185, 129, 0.05)); border-bottom: 1px solid rgba(16, 185, 129, 0.3); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: #06c755; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(6, 199, 85, 0.4);">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.94 1.77 5.53 4.45 6.99-.2.72-.77 2.65-.89 3.06-.15.52.19.51.4.38.16-.1 2.22-1.51 3.12-2.13.94.26 1.92.4 2.92.4 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 6px;">
                  📋 สรุปโพยล่า 3 หวย (พร้อมส่งเข้า LINE)
                </h3>
                <span style="font-size: 11px; color: #9ca3af;">คัดลอกข้อความนำไปวางในแชท LINE ได้ทันที ฟอร์แมตสวยงามอ่านง่าย</span>
              </div>
            </div>
            <button id="chase-modal-close" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer; padding: 4px; line-height: 1;">✕</button>
          </div>

          <!-- Controls: Day Selector + Filter Tabs -->
          <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px;">
            <!-- Day Selection -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: #d1fae5;">🗓️ เลือกวันทำการ:</span>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                \${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => \`
                  <button type="button" class="day-tab-btn \${currentDay === d ? 'active' : ''}" data-day="\${d}" style="padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid \${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.1)'}; background: \${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.05)'}; color: \${currentDay === d ? '#000000' : '#d1d5db'}; transition: all 0.2s;">
                    \${dayNames[d]} (\${getDateForWeekday(d).split(' ')[0]} \${getDateForWeekday(d).split(' ')[1]})
                  </button>
                \`).join('')}
              </div>
            </div>

            <!-- Filter Tabs -->
            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
              \${[
                { id: 'ALL', label: '🌟 ทั้งหมด (4 รอบ)' },
                { id: 'MORNING', label: '☀️ รอบเช้า (ปกติ+VIP)' },
                { id: 'AFTERNOON', label: '🌙 รอบบ่าย (ปกติ+VIP)' },
                { id: 'REGULAR', label: '🎌 หุ้นปกติ' },
                { id: 'VIP', label: '💎 หุ้น VIP' }
              ].map(f => \`
                <button type="button" class="filter-tab-btn \${currentFilter === f.id ? 'active' : ''}" data-filter="\${f.id}" style="padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; border: 1px solid \${currentFilter === f.id ? '#06c755' : 'rgba(255,255,255,0.1)'}; background: \${currentFilter === f.id ? 'rgba(6, 199, 85, 0.2)' : 'rgba(0,0,0,0.4)'}; color: \${currentFilter === f.id ? '#34d399' : '#9ca3af'};">
                  \${f.label}
                </button>
              \`).join('')}
            </div>
          </div>

          <!-- Body Textarea Preview -->
          <div style="padding: 16px 20px; flex: 1; overflow-y: auto;">
            <div style="position: relative;">
              <textarea id="chase-slip-textarea" readonly style="width: 100%; box-sizing: border-box; height: 260px; background: rgba(0,0,0,0.6); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px; color: #a7f3d0; font-family: monospace, system-ui; font-size: 12px; line-height: 1.5; resize: none; outline: none; box-shadow: inset 0 2px 8px rgba(0,0,0,0.6); user-select: all;">\${slipText}</textarea>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-size: 11px; color: #6ee7b7;">💡 เคล็ดลับ: สามารถกดเลือกข้อความด้านบนเพื่อปรับแต่งก่อนก๊อปปี้ได้</span>
              <span style="font-size: 10px; color: #9ca3af;">รองรับแอป LINE ทั้งบนมือถือและ PC</span>
            </div>
          </div>

          <!-- Action Footer -->
          <div style="padding: 14px 20px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
            <button id="btn-copy-slip-action" type="button" style="flex: 2; background: linear-gradient(135deg, #06c755, #05a043); border: 1px solid #34d399; color: #ffffff; font-weight: 800; font-size: 13px; padding: 12px 18px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(6, 199, 85, 0.4); transition: all 0.2s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>📋 คัดลอกโพยไปวางใน LINE</span>
            </button>

            <button id="btn-direct-line-send" type="button" style="flex: 1; background: rgba(6, 199, 85, 0.15); border: 1px solid #06c755; color: #34d399; font-weight: 700; font-size: 12px; padding: 12px 14px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
              <span>📲 ส่งเข้า LINE ทันที</span>
            </button>
          </div>
        </div>
      \`;

      // Event Listeners
      chaseSlipModalOverlay.querySelector('#chase-modal-close').onclick = () => {
        chaseSlipModalOverlay.style.display = 'none';
      };

      chaseSlipModalOverlay.querySelectorAll('.day-tab-btn').forEach(btn => {
        btn.onclick = () => {
          currentDay = btn.getAttribute('data-day');
          renderModalContent();
        };
      });

      chaseSlipModalOverlay.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.onclick = () => {
          currentFilter = btn.getAttribute('data-filter');
          renderModalContent();
        };
      });

      // Copy Button
      const copyBtn = chaseSlipModalOverlay.querySelector('#btn-copy-slip-action');
      copyBtn.onclick = async () => {
        const textarea = chaseSlipModalOverlay.querySelector('#chase-slip-textarea');
        const textToCopy = textarea.value;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            textarea.select();
            document.execCommand('copy');
          }
          copyBtn.style.background = '#10b981';
          copyBtn.innerHTML = '<span>✅ คัดลอกเรียบร้อยแล้ว!</span>';
          showToast('คัดลอกโพยล่า 3 หวยเรียบร้อยแล้ว! นำไปวางในแชท LINE ได้ทันที 🎉');
          setTimeout(() => {
            copyBtn.style.background = 'linear-gradient(135deg, #06c755, #05a043)';
            copyBtn.innerHTML = \`
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>📋 คัดลอกโพยไปวางใน LINE</span>
            \`;
          }, 2000);
        } catch(err) {
          showToast('ไม่สามารถคัดลอกได้อัตโนมัติ กรุณากดเลือกข้อความและกด Ctrl+C', true);
        }
      };

      // Direct Send Button
      const directSendBtn = chaseSlipModalOverlay.querySelector('#btn-direct-line-send');
      directSendBtn.onclick = async () => {
        const textarea = chaseSlipModalOverlay.querySelector('#chase-slip-textarea');
        const textToSend = textarea.value;

        directSendBtn.innerText = '⏳ กำลังส่ง...';
        directSendBtn.disabled = true;

        try {
          const cfg = await getLineConfig();
          const target = cfg.targetId || 'U3a7529a26c7c9a1a06d4cd374349a33c';

          const res = await fetch('/api/line/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textToSend, targetId: target })
          });
          const json = await res.json();
          if (json.success) {
            showToast('ส่งโพยล่า 3 หวยเข้ากลุ่ม LINE สำเร็จเรียบร้อย! 🎉');
            alert('✅ ส่งโพยเข้ากลุ่ม LINE เรียบร้อยแล้ว!');
          } else {
            throw new Error(json.error || 'Failed to send message');
          }
        } catch(err) {
          showToast('เกิดข้อผิดพลาดในการส่ง: ' + err.message, true);
          alert('❌ การส่งล้มเหลว: ' + err.message + '\\n\\nท่านสามารถกดปุ่ม \"📋 คัดลอกโพย\" เพื่อนำไปวางใน LINE ด้วยตนเองได้ครับ');
        } finally {
          directSendBtn.innerText = '📲 ส่งเข้า LINE ทันที';
          directSendBtn.disabled = false;
        }
      };
    }

    renderModalContent();
    chaseSlipModalOverlay.style.display = 'flex';
  };

  /* ==========================================================================
     LINE SETTINGS MODAL & BUTTON INJECTORS
     ========================================================================== */

  window.openLineSettingsModal = async function() {
    const config = await getLineConfig();

    if (!lineModalContainer) {
      lineModalContainer = document.createElement('div');
      lineModalContainer.id = 'line-settings-modal-overlay';
      lineModalContainer.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: system-ui, -apple-system, sans-serif;';

      lineModalContainer.innerHTML = \`
        <div style="background: #18181b; border: 1px solid rgba(6, 199, 85, 0.4); border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), 0 0 25px rgba(6, 199, 85, 0.2); overflow: hidden; color: #f4f4f5;">
          <!-- Header -->
          <div style="padding: 16px 20px; background: rgba(6, 199, 85, 0.1); border-bottom: 1px solid rgba(6, 199, 85, 0.2); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">💬</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #34d399;">
                ตั้งค่าระบบแจ้งเตือนผลเข้ากลุ่ม LINE
              </h3>
            </div>
            <button id="line-modal-close-btn" style="background: none; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
          </div>

          <!-- Body Fields -->
          <div style="padding: 18px 20px; display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #d4d4d8; margin-bottom: 6px;">
                🔑 LINE Channel Access Token (Long-lived)
              </label>
              <input type="password" id="line-token-input" placeholder="วาง Channel Access Token จาก LINE Developers..." style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(6, 199, 85, 0.3); border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 13px; font-family: monospace; outline: none;" />
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 10px; color: #71717a;">รับได้จาก Messaging API > Channel access token</span>
                <button type="button" id="line-token-toggle" style="background: none; border: none; color: #06c755; font-size: 11px; cursor: pointer; text-decoration: underline;">แสดง Token</button>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #d4d4d8; margin-bottom: 6px;">
                🎯 Target ID (Group ID หรือ User ID)
              </label>
              <input type="text" id="line-target-input" placeholder="รหัสกลุ่ม (C...) หรือ User ID (U...)" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(6, 199, 85, 0.3); border-radius: 8px; padding: 10px 12px; color: #06c755; font-weight: 700; font-size: 13px; font-family: monospace; outline: none;" />
              <div style="display: flex; gap: 8px; margin-top: 5px;">
                <button type="button" id="line-use-personal-btn" style="background: rgba(6, 199, 85, 0.1); border: 1px solid rgba(6, 199, 85, 0.3); color: #86efac; border-radius: 6px; padding: 4px 8px; font-size: 10px; cursor: pointer;">
                  👤 ใช้รหัสส่วนตัว (U3a752...)
                </button>
              </div>
            </div>

            <label style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
              <input type="checkbox" id="line-enabled-input" style="width: 16px; height: 16px; accent-color: #06c755; cursor: pointer;" />
              <span style="font-size: 12px; font-weight: 600; color: #e4e4e7;">
                🔔 ส่งแจ้งเตือนผลอัตโนมัติเมื่อกด Auto-Sync แล้วพบงวดใหม่ (เฉพาะงวดที่มีผลออกจริง)
              </span>
            </label>

            <div style="background: rgba(6, 199, 85, 0.05); border: 1px solid rgba(6, 199, 85, 0.2); border-radius: 10px; padding: 12px; font-size: 11px; line-height: 1.6; color: #d1fae5;">
              <div style="font-weight: 800; color: #34d399; margin-bottom: 4px;">
                💡 วิธีดูรหัสกลุ่ม LINE (Group ID ขึ้นต้นด้วย C...):
              </div>
              <div>1. ดึง LINE Bot เข้ากลุ่มที่ต้องการรับการแจ้งเตือน</div>
              <div>2. ใน LINE Developers ตั้งค่า <b>Webhook URL</b> เป็น:</div>
              <div style="background: rgba(0,0,0,0.5); padding: 5px 8px; border-radius: 6px; font-family: monospace; color: #a7f3d0; margin: 4px 0; word-break: break-all; user-select: all;">
                https://lotto289.paounda2021.workers.dev/api/line/webhook
              </div>
              <div>3. เปิดสวิตช์ <b>Use Webhook</b> เป็น <b>On</b></div>
              <div>4. พิมพ์ข้อความในกลุ่ม บอทจะตอบกลับเป็นรหัสกลุ่ม <b>C...</b> ให้อัตโนมัติทันที</div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 6px;">
              <button type="button" id="line-test-send-btn" style="flex: 1; background: rgba(6, 199, 85, 0.15); border: 1px solid #06c755; color: #34d399; font-weight: 800; padding: 10px 14px; border-radius: 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                🧪 ทดสอบส่งเข้า LINE
              </button>
              <button type="button" id="line-save-btn" style="flex: 1; background: #06c755; border: 1px solid #05a043; color: #ffffff; font-weight: 800; padding: 10px 14px; border-radius: 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3); transition: all 0.2s;">
                💾 บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      \`;

      document.body.appendChild(lineModalContainer);

      lineModalContainer.querySelector('#line-modal-close-btn').onclick = () => {
        lineModalContainer.style.display = 'none';
      };
      lineModalContainer.onclick = (e) => {
        if (e.target === lineModalContainer) lineModalContainer.style.display = 'none';
      };

      const tokenInput = lineModalContainer.querySelector('#line-token-input');
      lineModalContainer.querySelector('#line-token-toggle').onclick = () => {
        tokenInput.type = tokenInput.type === 'password' ? 'text' : 'password';
      };
      lineModalContainer.querySelector('#line-use-personal-btn').onclick = () => {
        lineModalContainer.querySelector('#line-target-input').value = 'U3a7529a26c7c9a1a06d4cd374349a33c';
      };

      lineModalContainer.querySelector('#line-test-send-btn').onclick = async () => {
        const testBtn = lineModalContainer.querySelector('#line-test-send-btn');
        const tokenVal = tokenInput.value.trim();
        const targetVal = lineModalContainer.querySelector('#line-target-input').value.trim();

        if (!tokenVal) {
          alert('กรุณากรอก LINE Channel Access Token ก่อนกดทดสอบ');
          return;
        }
        if (!targetVal) {
          alert('กรุณากรอก Target ID (Group ID หรือ User ID) ก่อนกดทดสอบ');
          return;
        }

        testBtn.innerText = '⏳ กำลังทดสอบส่ง...';
        testBtn.disabled = true;

        try {
          await saveLineConfig({
            channelAccessToken: tokenVal,
            targetId: targetVal,
            enabled: lineModalContainer.querySelector('#line-enabled-input').checked
          });

          const testMsg = '🔔 ทดสอบการแจ้งเตือนผล SystemLucky289\\n\\nเชื่อมต่อระบบแจ้งเตือนผลหวยเข้ากลุ่ม LINE สำเร็จเรียบร้อยแล้วครับ! 🎉🎉🎉🎉';
          const res = await fetch('/api/line/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: testMsg, targetId: targetVal })
          });
          const json = await res.json();
          if (json.success) {
            showToast('ส่งข้อความทดสอบเข้า LINE สำเร็จเรียบร้อย! 🎉');
            alert('✅ ส่งข้อความทดสอบเข้า LINE เรียบร้อยแล้ว! กรุณาตรวจสอบในกลุ่ม LINE หรือแชทของคุณ');
          } else {
            throw new Error(json.error || 'Failed to send message');
          }
        } catch(err) {
          showToast('เกิดข้อผิดพลาด: ' + err.message, true);
          alert('❌ การทดสอบล้มเหลว: ' + err.message + '\\n\\nกรุณาตรวจสอบว่าบอทถูกเชิญเข้ากลุ่มแล้ว หรือ Token ถูกต้อง');
        } finally {
          testBtn.innerText = '🧪 ทดสอบส่งเข้า LINE';
          testBtn.disabled = false;
        }
      };

      lineModalContainer.querySelector('#line-save-btn').onclick = async () => {
        const tokenVal = tokenInput.value.trim();
        const targetVal = lineModalContainer.querySelector('#line-target-input').value.trim();
        const enabledVal = lineModalContainer.querySelector('#line-enabled-input').checked;

        await saveLineConfig({
          channelAccessToken: tokenVal,
          targetId: targetVal,
          enabled: enabledVal
        });

        showToast('บันทึกการตั้งค่า LINE เรียบร้อยแล้ว!');
        lineModalContainer.style.display = 'none';
      };
    }

    lineModalContainer.querySelector('#line-token-input').value = config.channelAccessToken || '';
    lineModalContainer.querySelector('#line-target-input').value = config.targetId || 'U3a7529a26c7c9a1a06d4cd374349a33c';
    lineModalContainer.querySelector('#line-enabled-input').checked = config.enabled !== false;

    lineModalContainer.style.display = 'flex';
  };

  function injectLineNavbarButton() {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const syncBtn = allButtons.find(b => b.innerText && (b.innerText.includes('Auto-Sync') || b.innerText.includes('ดึงผลรางวัลด่วน')));
    if (!syncBtn || !syncBtn.parentElement) return;

    // 1. Settings button
    if (!document.getElementById('btn-line-settings-ui')) {
      const btn = document.createElement('button');
      btn.id = 'btn-line-settings-ui';
      btn.title = 'ตั้งค่าแจ้งเตือนผลเข้ากลุ่ม LINE';
      btn.className = 'btn-line-nav';
      btn.style.cssText = 'background-color: #06c755 !important; color: #ffffff !important; border: 1px solid #05a043 !important; font-weight: 800 !important; font-size: 12px !important; padding: 6px 14px !important; border-radius: 8px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; box-shadow: 0 2px 10px rgba(6, 199, 85, 0.5) !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; transition: all 0.2s ease !important;';
      btn.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" style="width: 15px; height: 15px; fill: #ffffff; flex-shrink: 0;">
          <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.94 1.77 5.53 4.45 6.99-.2.72-.77 2.65-.89 3.06-.15.52.19.51.4.38.16-.1 2.22-1.51 3.12-2.13.94.26 1.92.4 2.92.4 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/>
        </svg>
        <span style="color: #ffffff !important; font-weight: 800 !important; font-size: 12px !important;">💬 แจ้งเตือน LINE</span>
      \`;
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.openLineSettingsModal();
      };
      syncBtn.parentElement.insertBefore(btn, syncBtn.nextSibling);
    }

    // 2. Chase slip button on navbar
    if (!document.getElementById('btn-chase-slip-nav-ui')) {
      const slipNavBtn = document.createElement('button');
      slipNavBtn.id = 'btn-chase-slip-nav-ui';
      slipNavBtn.title = 'คลิกเพื่อเปิดสรุปโพยล่า 3 หวย และคัดลอกส่ง LINE';
      slipNavBtn.className = 'btn-line-slip-nav';
      slipNavBtn.style.cssText = 'background: linear-gradient(135deg, #10b981, #059669) !important; color: #ffffff !important; border: 1px solid #34d399 !important; font-weight: 800 !important; font-size: 12px !important; padding: 6px 14px !important; border-radius: 8px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4) !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; transition: all 0.2s ease !important;';
      slipNavBtn.innerHTML = \`
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: #ffffff; flex-shrink: 0;">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span style="color: #ffffff !important; font-weight: 800 !important; font-size: 12px !important;">📋 โพยล่า 3 หวย (LINE)</span>
      \`;
      slipNavBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.openChaseSlipModal();
      };
      const settingsBtn = document.getElementById('btn-line-settings-ui');
      if (settingsBtn) {
        settingsBtn.parentElement.insertBefore(slipNavBtn, settingsBtn.nextSibling);
      } else {
        syncBtn.parentElement.insertBefore(slipNavBtn, syncBtn.nextSibling);
      }
    }
  }

  function injectLineSendButton() {
    const existing = document.getElementById('btn-line-send-result-ui');
    if (existing && existing.parentElement) existing.remove();
  }

  function runAllInjectors() {
    injectDownloadButton();
    injectLineNavbarButton();
    injectLineSendButton();
  }

  setInterval(runAllInjectors, 400);
  if (typeof document !== 'undefined') {
    if (document.body) {
      const observer = new MutationObserver(runAllInjectors);
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        const observer = new MutationObserver(runAllInjectors);
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }
`;

// Combine into scratch/export_modal_combined.js
const newContent = base + lineModuleCode + '\n})();\n';

fs.writeFileSync('scratch/export_modal_combined.js', newContent, 'utf8');
fs.writeFileSync('downloaded_target_worker/assets/export_modal.js', newContent, 'utf8');
fs.writeFileSync('dist/assets/export_modal.js', newContent, 'utf8');

console.log('Successfully generated and synced export_modal.js with Line Chase Slip Button!');
console.log('Total characters:', newContent.length);
