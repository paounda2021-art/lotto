const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'export_modal.js');
const baseCode = fs.readFileSync(srcPath, 'utf8');

const lineModuleCode = `
  /* ==========================================================================
     LINE NOTIFICATION SYSTEM (SystemLucky289 LINE Bot & Result Alerts)
     ========================================================================== */

  let lineModalContainer = null;
  let lineChoiceModalOverlay = null;

  function getBangkokTodayDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bkk = new Date(utc + (3600000 * 7));
    const y = bkk.getFullYear();
    const m = String(bkk.getMonth() + 1).padStart(2, '0');
    const d = String(bkk.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
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
      const raw = localStorage.getItem('lotto_line_bot_config');
      if (raw) config = { ...config, ...JSON.parse(raw) };
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
    } else if (type === 'DOWJONES') {
      title = 'ดาวโจนส์ (04:00)'; marketShort = 'ดาวโจนส์'; fullName = 'หวยหุ้นดาวโจนส์';
    } else if (type === 'GSB') {
      title = 'หวยออมสิน (13:00)'; marketShort = 'ออมสิน'; fullName = 'หวยออมสิน';
    } else if (type === 'GOVERNMENT') {
      title = 'หวยรัฐบาลไทย (15:30)'; marketShort = 'รัฐบาลไทย'; fullName = 'หวยรัฐบาลไทย';
    } else if (type === 'MALAY') {
      title = 'หวยมาเลย์ (18:30)'; marketShort = 'หวยมาเลย์'; fullName = 'หวยมาเลย์ (Magnum 4D)';
    }

    return { title, marketShort, fullName };
  }

  function buildLineResultMessage(draw, activeType, activeSess) {
    const info = getLotteryInfo(activeType, activeSess);
    const type = (activeType || '').toUpperCase();
    const top3 = String(draw.top3 || '').trim();
    const bottom2 = String(draw.bottom2 || '').trim();
    const top2 = draw.top2 || (top3.length >= 2 ? top3.slice(-2) : '');

    const draws = getDrawsForLottery('CURRENT');
    const pastDraws = draws.filter(d => d.date !== draw.date && isNumericResult(d));
    const counts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    pastDraws.forEach(d => {
      (String(d.top3 || '') + String(d.bottom2 || '')).split('').forEach(ch => {
        const n = parseInt(ch, 10);
        if (!isNaN(n)) counts[n] = (counts[n] || 0) + 1;
      });
    });
    const sortedDigits = Object.entries(counts).map(([d, c]) => ({ digit: parseInt(d, 10), c })).sort((a,b) => b.c - a.c);
    const primary = sortedDigits[0] ? sortedDigits[0].digit : 3;
    const secondary = sortedDigits[1] ? sortedDigits[1].digit : 2;

    const lines = [];
    lines.push(info.title);
    if (draw.dateFormatted) {
      lines.push('(งวด ' + draw.dateFormatted + ')');
    }
    lines.push('ผล ' + top3 + '-' + bottom2);
    lines.push('');

    let hasHits = false;
    if (bottom2.includes(String(primary))) {
      lines.push('🌼 ' + info.marketShort + ' เด่น ' + primary + ' [ล่าง ' + bottom2.split('').join(' ') + ']');
      hasHits = true;
    }
    if (top2.includes(String(primary))) {
      lines.push('🌼 ' + info.marketShort + ' เด่น ' + primary + ' [บน ' + top2.split('').join(' ') + ']');
      hasHits = true;
    }
    if (bottom2.includes(String(secondary))) {
      lines.push('🌼 ' + info.marketShort + ' รอง ' + secondary + ' [ล่าง ' + bottom2.split('').join(' ') + ']');
      hasHits = true;
    }
    if (top2.includes(String(secondary))) {
      lines.push('🌼 ' + info.marketShort + ' รอง ' + secondary + ' [บน ' + top2.split('').join(' ') + ']');
      hasHits = true;
    }

    if (type === 'HANOI') {
      lines.push('🏷️ รวม 3 ฮานอย [บน ' + top2.split('').join(' ') + ']');
    } else if (type === 'NIKKEI') {
      lines.push('🏷️ รวมทุกหุ้นปกติ 6 รอบ [บน ' + top2.split('').join(' ') + ']');
    } else if (type === 'STOCK_VIP' || type === 'STOCKS_VIP') {
      lines.push('🏷️ รวมทุกหุ้น VIP 6 รอบ [บน ' + top2.split('').join(' ') + ']');
    }

    lines.push('');
    lines.push('🎉🎉🎉🎉');
    return lines.join('\\n');
  }

  function buildDailyPredictionGuide(activeType, activeSess) {
    const info = getLotteryInfo(activeType, activeSess);

    let dayName = '';
    let dayCode = '';
    const dayNameMap = { Mon: 'จันทร์', Tue: 'อังคาร', Wed: 'พุธ', Thu: 'พฤหัสบดี', Fri: 'ศุกร์', Sat: 'เสาร์', Sun: 'อาทิตย์', ALL: 'ทุกวันทำการ' };
    const revDayMap = { 'จันทร์': 'Mon', 'อังคาร': 'Tue', 'พุธ': 'Wed', 'พฤหัสบดี': 'Thu', 'ศุกร์': 'Fri', 'เสาร์': 'Sat', 'อาทิตย์': 'Sun', 'ทุกวันทำการ': 'ALL' };

    // 1. From window.__CURRENT_STAT_H__
    if (typeof window !== 'undefined' && window.__CURRENT_STAT_H__ && window.__CURRENT_STAT_H__.dayName) {
      dayName = window.__CURRENT_STAT_H__.dayName;
      dayCode = window.__CURRENT_STAT_H__.dayOfWeek || revDayMap[dayName] || '';
    }

    // 2. From DOM
    if (!dayName && typeof document !== 'undefined') {
      try {
        const bodyText = document.body ? document.body.innerText : '';
        const m1 = bodyText.match(/สรุปฟันธงเลขเด่น(?:รูด)?(?:งวด)?ประจำวัน([^\\s():]+)/);
        if (m1) {
          dayName = m1[1].replace(/[():]/g, '').trim();
        } else {
          const m2 = bodyText.match(/จากสถิติสแกน\\s*\\d+\\s*งวด\\s*\\(วัน([^\\s():]+)\\)/);
          if (m2) {
            dayName = m2[1].replace(/[():]/g, '').trim();
          } else {
            const m3 = bodyText.match(/ชุดเจาะ 2 ตัว\\s*\\(เน้นประจำวัน([^\\s():]+)\\)/);
            if (m3) {
              dayName = m3[1].replace(/[():]/g, '').trim();
            }
          }
        }
      } catch(e) {}
    }

    // 3. From window.__CURRENT_ACTIVE_DAY__ or localStorage
    if (!dayName) {
      const activeDay = (typeof window !== 'undefined' ? window.__CURRENT_ACTIVE_DAY__ : null) || 
                        (typeof localStorage !== 'undefined' ? localStorage.getItem('lotto_selected_day') : null);
      if (activeDay && dayNameMap[activeDay]) {
        dayName = dayNameMap[activeDay];
        dayCode = activeDay;
      }
    }

    if (!dayName) {
      dayName = 'จันทร์';
    }
    dayName = dayName.replace(/^วัน/, '').trim();
    if (!dayCode) {
      dayCode = revDayMap[dayName] || 'Mon';
    }

    // Extract d0 and d1
    let d0 = '', d1 = '';
    if (typeof window !== 'undefined' && window.__CURRENT_STAT_H__ && window.__CURRENT_STAT_H__.topSingleDigits && window.__CURRENT_STAT_H__.topSingleDigits.length >= 2) {
      d0 = String(window.__CURRENT_STAT_H__.topSingleDigits[0].digit);
      d1 = String(window.__CURRENT_STAT_H__.topSingleDigits[1].digit);
    }

    if ((!d0 || !d1) && typeof document !== 'undefined') {
      try {
        const bodyText = document.body ? document.body.innerText : '';
        const funMatch = bodyText.match(/ฟันเด่นวิ่ง-รูด\\s*19\\s*ประตู:\\s*([0-9])\\s*และ\\s*([0-9])/);
        if (funMatch) {
          d0 = funMatch[1];
          d1 = funMatch[2];
        }
      } catch(e) {}
    }

    // Extract 6 pairs
    let topPairs = [];
    if (typeof window !== 'undefined' && window.__CURRENT_STAT_H__ && window.__CURRENT_STAT_H__.top2DPairs && window.__CURRENT_STAT_H__.top2DPairs.length > 0) {
      topPairs = window.__CURRENT_STAT_H__.top2DPairs.slice(0, 6).map(x => String(x.pair));
    }

    if (!d0 || !d1 || topPairs.length < 6) {
      try {
        const draws = getDrawsForLottery('CURRENT');
        const dayDraws = draws.filter(d => isNumericResult(d) && (dayCode === 'ALL' || d.dayOfWeek === dayCode));
        const counts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
        const pairCounts = {};
        const targetDraws = dayDraws.length > 0 ? dayDraws : draws.filter(isNumericResult);

        targetDraws.forEach(d => {
          (String(d.top3 || '') + String(d.bottom2 || '')).split('').forEach(ch => {
            const n = parseInt(ch, 10);
            if (!isNaN(n)) counts[n] = (counts[n] || 0) + 1;
          });
          if (d.top2 && /^[0-9]{2}$/.test(d.top2)) pairCounts[d.top2] = (pairCounts[d.top2] || 0) + 1;
          if (d.bottom2 && /^[0-9]{2}$/.test(d.bottom2)) pairCounts[d.bottom2] = (pairCounts[d.bottom2] || 0) + 1;
        });

        if (!d0 || !d1) {
          const sorted = Object.entries(counts).map(([d, c]) => ({ digit: parseInt(d, 10), c })).sort((a,b) => b.c - a.c);
          if (!d0 && sorted[0]) d0 = String(sorted[0].digit);
          if (!d1 && sorted[1]) d1 = String(sorted[1].digit);
        }

        if (topPairs.length < 6) {
          const sortedPairs = Object.entries(pairCounts).sort((a,b) => b[1] - a[1]).slice(0, 6).map(p => p[0]);
          if (sortedPairs.length > 0) {
            topPairs = sortedPairs;
          }
        }
      } catch(e) {}
    }

    if (!d0) d0 = '9';
    if (!d1) d1 = '0';

    if (topPairs.length < 6) {
      topPairs = [d0 + d1, d0 + '5', d0 + '8', d1 + '4', d1 + '7', d1 + '9'];
    }
    const finalPairs = topPairs.slice(0, 6).join(' ');

    const lines = [
      '📊 [แนวทางสถิติเลขรายวัน] SystemLucky289',
      '🎯 หวย: ' + info.fullName,
      '📌 รอบ: ' + info.title,
      '🗓️ ประจำ: วัน' + dayName,
      '--------------------------',
      '🔥 ฟันเด่น วิ่ง-รูด 19 ประตู: ',
      '⭐ เด่นหลัก: ' + d0,
      '✨ เด่นรอง: ' + d1,
      '',
      '💎 ชุดเจาะ 2 ตัว (เน้นประจำวัน' + dayName + '):',
      ' ' + finalPairs,
      '--------------------------',
      '🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289'
    ];
    return lines.join('\\n');
  }

  function showNoResultChoiceModal({ title, statusText, validDraw, onSendGuide, onSendLastResult }) {
    if (!lineChoiceModalOverlay) {
      lineChoiceModalOverlay = document.createElement('div');
      lineChoiceModalOverlay.id = 'line-no-result-modal-overlay';
      lineChoiceModalOverlay.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px;';
      document.body.appendChild(lineChoiceModalOverlay);
    }

    const lastDateStr = validDraw ? (validDraw.dateFormatted || validDraw.date) : '';
    const lastResultStr = validDraw ? (validDraw.top3 + '-' + validDraw.bottom2) : '';

    lineChoiceModalOverlay.innerHTML = \`
      <div style="background: #18110b; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 16px; padding: 22px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); color: #fffbeb; text-align: center;">
        <div style="width: 46px; height: 46px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <span style="font-size: 22px;">📢</span>
        </div>
        <h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #fbbf24;">
          📢 รอบนี้ยังไม่มีผลหวยออก (สถานะ: \${statusText})
        </h3>
        <p style="margin: 0 0 16px; font-size: 12px; color: #d4d4d8; line-height: 1.5;">
          <b>\${title}</b> ของรอบปัจจุบันยังไม่ออกผลรางวัล<br>
          <span style="color: #a1a1aa;">พร้อม 2 ตัวเลือกให้กดส่งเข้ากลุ่ม LINE ได้ทันที:</span>
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Option 1: Send Prediction Guide -->
          <button id="no-res-send-guide-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: 1px solid #fbbf24; color: #000; font-weight: 800; padding: 14px 16px; border-radius: 12px; cursor: pointer; text-align: left; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35); transition: all 0.2s;">
            <div style="font-size: 14px; font-weight: 800; color: #000; display: flex; align-items: center; gap: 6px;">
              <span>📊 ส่งแนวทางฟันเด่นงวดนี้เข้า LINE</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #262626; margin-top: 4px; line-height: 1.4;">
              ส่งชุดเลขฟันเด่นวิ่ง-รูด 19 ประตู และชุดเจาะ 2 ตัวประจำวันนี้เข้ากลุ่ม LINE
            </div>
          </button>

          <!-- Option 2: Send Last Valid Result -->
          \${validDraw ? \`
          <button id="no-res-send-last-btn" style="background: rgba(6, 199, 85, 0.12); border: 1px solid #06c755; color: #34d399; font-weight: 800; padding: 14px 16px; border-radius: 12px; cursor: pointer; text-align: left; box-shadow: 0 4px 12px rgba(6, 199, 85, 0.2); transition: all 0.2s;">
            <div style="font-size: 14px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 6px;">
              <span>🎯 ส่งผลรางวัลงวดล่าสุดที่มีผลจริง</span>
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #a7f3d0; margin-top: 4px; line-height: 1.4;">
              ดึงผลรางวัลงวดจริงล่าสุดก่อนหน้า (เช่น งวดวันที่ \${lastDateStr}: ผล \${lastResultStr}) โดยระบุวันที่ชัดเจน เพื่อไม่ให้เกิดความสับสน
            </div>
          </button>
          \` : ''}

          <!-- Option 3: Cancel -->
          <button id="no-res-cancel-btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #a1a1aa; font-weight: 600; padding: 9px 14px; border-radius: 10px; font-size: 12px; cursor: pointer; margin-top: 2px;">
            ✕ ยกเลิก
          </button>
        </div>
      </div>
    \`;

    lineChoiceModalOverlay.style.display = 'flex';

    lineChoiceModalOverlay.querySelector('#no-res-send-guide-btn').onclick = () => {
      lineChoiceModalOverlay.style.display = 'none';
      onSendGuide();
    };

    const lastBtn = lineChoiceModalOverlay.querySelector('#no-res-send-last-btn');
    if (lastBtn) {
      lastBtn.onclick = () => {
        lineChoiceModalOverlay.style.display = 'none';
        onSendLastResult();
      };
    }

    lineChoiceModalOverlay.querySelector('#no-res-cancel-btn').onclick = () => {
      lineChoiceModalOverlay.style.display = 'none';
    };
    lineChoiceModalOverlay.onclick = (e) => {
      if (e.target === lineChoiceModalOverlay) lineChoiceModalOverlay.style.display = 'none';
    };
  }

  async function postLineMessage(messageText, targetId, triggerBtn) {
    let originalHtml = '';
    if (triggerBtn) {
      originalHtml = triggerBtn.innerHTML;
      triggerBtn.innerHTML = '<span style="color: #ffffff !important; font-weight: 800;">⏳ กำลังส่งเข้า LINE...</span>';
      triggerBtn.disabled = true;
    }

    try {
      const res = await fetch('/api/line/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, targetId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🎉 ส่งแจ้งเตือนเข้า LINE สำเร็จเรียบร้อยแล้ว!');
        if (triggerBtn) {
          triggerBtn.innerHTML = '<span style="color: #ffffff !important; font-weight: 800;">✓ ส่งเข้า LINE สำเร็จ!</span>';
          setTimeout(() => {
            triggerBtn.innerHTML = originalHtml;
            triggerBtn.disabled = false;
          }, 2500);
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch(err) {
      showToast('ส่งไม่สำเร็จ: ' + err.message, true);
      alert('❌ ส่งข้อมูลเข้า LINE ไม่สำเร็จ: ' + err.message);
      if (triggerBtn) {
        triggerBtn.innerHTML = originalHtml;
        triggerBtn.disabled = false;
      }
    }
  }

  // Main Send Function
  window.sendCurrentResultToLine = async function(triggerBtn) {
    const config = await getLineConfig();

    if (!config.channelAccessToken) {
      alert('กรุณาตั้งค่า LINE Channel Access Token ก่อนใช้งาน');
      window.openLineSettingsModal();
      return;
    }

    const activeType = (typeof localStorage !== 'undefined' ? localStorage.getItem('lotto_active_lottery_type') : '') || 'NIKKEI';
    const activeSess = (typeof localStorage !== 'undefined' ? localStorage.getItem('lotto_selected_session') : '') || '';
    const info = getLotteryInfo(activeType, activeSess);

    const draws = getDrawsForLottery('CURRENT');
    const latestDraw = draws[0];
    const validDraw = draws.find(isNumericResult);
    const todayStr = getBangkokTodayDate();

    // Condition: Check if today's result is actually out and numeric
    const isTodayResultOut = latestDraw && latestDraw.date === todayStr && isNumericResult(latestDraw);

    // If today's result is NOT out yet (waiting, holiday/closed, or newest is from previous day)
    // DO NOT send old result automatically! Show the Smart Choice Modal!
    if (!isTodayResultOut) {
      let statusText = 'รอผล';
      if (latestDraw) {
        const rawText = (latestDraw.full6D || '') + (latestDraw.top3 || '') + (latestDraw.bottom2 || '');
        if (rawText.includes('งด')) {
          statusText = 'งดออกผล';
        } else if (rawText.includes('รอ')) {
          statusText = 'รอผล';
        } else if (latestDraw.date !== todayStr) {
          statusText = 'รอผล';
        }
      }

      showNoResultChoiceModal({
        title: info.title,
        statusText,
        validDraw,
        onSendGuide: () => {
          const guideMsg = buildDailyPredictionGuide(activeType, activeSess);
          postLineMessage(guideMsg, config.targetId, triggerBtn);
        },
        onSendLastResult: () => {
          if (validDraw) {
            const resMsg = buildLineResultMessage(validDraw, activeType, activeSess);
            postLineMessage(resMsg, config.targetId, triggerBtn);
          }
        }
      });
      return;
    }

    // Has valid result drawn TODAY
    const messageText = buildLineResultMessage(latestDraw, activeType, activeSess);
    postLineMessage(messageText, config.targetId, triggerBtn);
  };

  // Open LINE Settings Modal
  window.openLineSettingsModal = async function() {
    const config = await getLineConfig();

    if (!lineModalContainer) {
      lineModalContainer = document.createElement('div');
      lineModalContainer.id = 'line-settings-modal-overlay';
      lineModalContainer.style.cssText = 'position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px;';

      lineModalContainer.innerHTML = \`
        <div style="background: #18110b; border: 1px solid rgba(6, 199, 85, 0.5); border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); color: #fffbeb; position: relative; max-height: 92vh; overflow-y: auto;">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(6, 199, 85, 0.3); padding-bottom: 14px; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(6, 199, 85, 0.15); border: 1px solid rgba(6, 199, 85, 0.4); display: flex; align-items: center; justify-content: center;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#06c755">
                  <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.94 1.77 5.53 4.45 6.99-.2.72-.77 2.65-.89 3.06-.15.52.19.51.4.38.16-.1 2.22-1.51 3.12-2.13.94.26 1.92.4 2.92.4 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ffffff;">ตั้งค่าแจ้งเตือนผลเข้ากลุ่ม LINE</h3>
                <p style="margin: 2px 0 0; font-size: 11px; color: #a1a1aa;">ส่งผลรางวัลและเลขเด่น-รองเข้า LINE Messaging API / Group อัตโนมัติ</p>
              </div>
            </div>
            <button id="line-modal-close-btn" style="background: none; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 4px; line-height: 1;" title="ปิดหน้าต่าง">&times;</button>
          </div>

          <!-- Body Fields -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Channel Access Token -->
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

            <!-- Target ID -->
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

            <!-- Auto alert checkbox -->
            <label style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); cursor: pointer;">
              <input type="checkbox" id="line-enabled-input" style="width: 16px; height: 16px; accent-color: #06c755; cursor: pointer;" />
              <span style="font-size: 12px; font-weight: 600; color: #e4e4e7;">
                🔔 ส่งแจ้งเตือนผลอัตโนมัติเมื่อกด Auto-Sync แล้วพบงวดใหม่ (เฉพาะงวดที่มีผลออกจริง)
              </span>
            </label>

            <!-- Guide Box for Group ID -->
            <div style="background: rgba(6, 199, 85, 0.05); border: 1px solid rgba(6, 199, 85, 0.2); border-radius: 10px; padding: 12px; font-size: 11px; line-height: 1.6; color: #d1fae5;">
              <div style="font-weight: 800; color: #34d399; margin-bottom: 4px; display: flex; items-center; gap: 6px;">
                💡 วิธีดูรหัสกลุ่ม LINE (Group ID ขึ้นต้นด้วย C...):
              </div>
              <div>1. ดึง LINE Bot ของท่านเข้ากลุ่ม LINE ที่ต้องการรับการแจ้งเตือน</div>
              <div>2. ใน LINE Developers ให้ตั้งค่า <b>Webhook URL</b> เป็น:</div>
              <div style="background: rgba(0,0,0,0.5); padding: 5px 8px; border-radius: 6px; font-family: monospace; color: #a7f3d0; margin: 4px 0; word-break: break-all; user-select: all;">
                https://lotto289.paounda2021.workers.dev/api/line/webhook
              </div>
              <div>3. เปิดสวิตช์ <b>Use Webhook</b> เป็น <b>On</b></div>
              <div>4. พิมพ์ข้อความอะไรก็ได้ในกลุ่ม บอทจะตอบกลับเป็นรหัสกลุ่ม <b>C...</b> และบันทึกเข้าระบบให้อัตโนมัติทันที!</div>
            </div>

            <!-- Action Buttons -->
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
    if (document.getElementById('btn-line-settings-ui') || document.getElementById('btn-line-settings-jsx')) return;
    const allButtons = Array.from(document.querySelectorAll('button'));
    const syncBtn = allButtons.find(b => b.innerText && (b.innerText.includes('Auto-Sync') || b.innerText.includes('ดึงผลรางวัลด่วน')));
    if (!syncBtn || !syncBtn.parentElement) return;

    const btn = document.createElement('button');
    btn.id = 'btn-line-settings-ui';
    btn.title = 'ตั้งค่าแจ้งเตือนผลเข้ากลุ่ม LINE';
    btn.className = 'btn-line-nav';
    btn.style.cssText = 'background-color: #06c755 !important; color: #ffffff !important; border: 1px solid #05a043 !important; font-weight: 800 !important; font-size: 12px !important; padding: 6px 14px !important; border-radius: 8px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; box-shadow: 0 2px 10px rgba(6, 199, 85, 0.5) !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; transition: all 0.2s ease !important;';
    btn.innerHTML = \`
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" style="width: 15px; height: 15px; fill: #ffffff; flex-shrink: 0; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));">
        <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.94 1.77 5.53 4.45 6.99-.2.72-.77 2.65-.89 3.06-.15.52.19.51.4.38.16-.1 2.22-1.51 3.12-2.13.94.26 1.92.4 2.92.4 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/>
      </svg>
      <span style="color: #ffffff !important; font-weight: 800 !important; font-size: 12px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;">💬 แจ้งเตือน LINE</span>
    \`;
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.openLineSettingsModal();
    };

    syncBtn.parentElement.insertBefore(btn, syncBtn.nextSibling);
  }

  function injectLineSendButton() {
    // Hidden per user request: "ขอซ่อนปุ่มไลน์ในการ์ดด้านล่างไว้ก่อน ให้เหลือไว้เฉพาะบนหัวเว็บ"
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

// Extract clean base of export_modal.js
let base = baseCode;
const lineIdx = base.indexOf('/* ==========================================================================');
if (lineIdx !== -1) {
  base = base.substring(0, lineIdx);
}
const cutoff = base.indexOf('  // Periodic and reactive checks');
if (cutoff !== -1) {
  base = base.substring(0, cutoff);
}

// Fix res.datasets in background fetch in base if present
base = base.replace('if (res && res.success && res.data) {', 'if (res && res.success) {\n          const kvD = res.datasets || res.data || {};\n          window.__KV_DRAWS__ = kvD;');

const newContent = base + lineModuleCode + '\n})();\n';

fs.writeFileSync('scratch/export_modal_combined.js', newContent, 'utf8');
console.log('Successfully generated scratch/export_modal_combined.js, total lines:', newContent.split('\n').length);
