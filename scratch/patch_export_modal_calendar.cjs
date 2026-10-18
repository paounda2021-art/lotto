const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'export_modal.js');
const distFile = path.join(__dirname, '..', 'dist', 'assets', 'export_modal.js');

let code = fs.readFileSync(targetFile, 'utf8');

// 1. Update buildChaseLineSlipText definition to accept customDateFormatted
const oldBuildFn = "function buildChaseLineSlipText(dayCode, filter = 'ALL') {\n    const cfg = CHASE_SLIPS_DATA[dayCode] || CHASE_SLIPS_DATA['Fri'];\n    const dayName = cfg.dayTh;\n    const dateFormatted = getDateForWeekday(dayCode);";
const newBuildFn = "function buildChaseLineSlipText(dayCode, filter = 'ALL', customDateFormatted = null) {\n    const cfg = CHASE_SLIPS_DATA[dayCode] || CHASE_SLIPS_DATA['Fri'];\n    const dayName = cfg.dayTh;\n    const dateFormatted = customDateFormatted || getDateForWeekday(dayCode);";

if (code.includes(oldBuildFn)) {
  code = code.replace(oldBuildFn, newBuildFn);
  console.log('1. buildChaseLineSlipText parameter updated to accept customDateFormatted!');
} else {
  console.warn('1. oldBuildFn pattern not found!');
}

// 2. Locate openChaseSlipModal
const modalStartMarker = 'window.openChaseSlipModal = function() {';
const mIdx = code.indexOf(modalStartMarker);

if (mIdx === -1) {
  console.error('modalStartMarker not found!');
  process.exit(1);
}

// Let's replace the whole openChaseSlipModal implementation with the calendar-enhanced version
const oldModalSection = code.substring(mIdx);
// Find where openChaseSlipModal ends (before next function or end of file)
// Let's find: window.openChaseSlipModal = function() { ... }
function findMatchingEnd(str, startIdx) {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const fnBraceIdx = code.indexOf('{', mIdx);
const fnEndIdx = findMatchingEnd(code, fnBraceIdx);

if (fnEndIdx === -1) {
  console.error('Could not find matching brace for openChaseSlipModal!');
  process.exit(1);
}

const newOpenChaseSlipModal = `window.openChaseSlipModal = function() {
    let selectedDateStr = getBangkokTodayDate(); // e.g. "2026-10-18"
    let currentDay = getBangkokDayCode();
    if (!CHASE_SLIPS_DATA[currentDay]) currentDay = 'Sun';
    let currentFilter = 'ALL';

    function formatThaiDate(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const yTh = y + 543;
      return d + ' ' + thMonths[m] + ' ' + yTh;
    }

    if (!chaseSlipModalOverlay) {
      chaseSlipModalOverlay = document.createElement('div');
      chaseSlipModalOverlay.id = 'chase-slip-modal-overlay';
      chaseSlipModalOverlay.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; font-family: system-ui, -apple-system, sans-serif;';
      document.body.appendChild(chaseSlipModalOverlay);
    }

    function renderModalContent() {
      const formattedThaiDate = formatThaiDate(selectedDateStr);
      const slipText = buildChaseLineSlipText(currentDay, currentFilter, formattedThaiDate);
      const dayNames = { Mon: 'จันทร์', Tue: 'อังคาร', Wed: 'พุธ', Thu: 'พฤหัสฯ', Fri: 'ศุกร์', Sat: 'เสาร์', Sun: 'อาทิตย์' };

      const regM = getResolvedSessionData(currentDay, 'regMorning');
      const regA = getResolvedSessionData(currentDay, 'regAfternoon');
      const vipM = getResolvedSessionData(currentDay, 'vipMorning');
      const vipA = getResolvedSessionData(currentDay, 'vipAfternoon');
      const win4RegM = computeSessionWin4(currentDay, 'regMorning', regM);
      const win4RegA = computeSessionWin4(currentDay, 'regAfternoon', regA);
      const win4VipM = computeSessionWin4(currentDay, 'vipMorning', vipM);
      const win4VipA = computeSessionWin4(currentDay, 'vipAfternoon', vipA);
      const dayCfg = CHASE_SLIPS_DATA[currentDay] || CHASE_SLIPS_DATA['Fri'];

      chaseSlipModalOverlay.innerHTML = \`
        <div style="background: #111827; border: 1.5px solid #10b981; border-radius: 20px; width: 100%; max-width: 620px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(16, 185, 129, 0.25); overflow: hidden; color: #f3f4f6;">
          
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
            <button id="chase-modal-close" style="background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer; padding: 4px; line-height: 1;" title="ปิดหน้าต่าง">✕</button>
          </div>

          <!-- Controls: Calendar Date Picker + Quick Day Selector + Filter Tabs -->
          <div style="padding: 12px 20px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px;">
            
            <!-- Calendar Picker Section (แบบปฏิทินเลือกสะดวก) -->
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 8px 12px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                <span style="font-size: 12px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 6px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  เลือกวันที่จากปฏิทิน:
                </span>
                <span style="font-size: 11px; font-weight: 800; color: #fde047; background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.35); padding: 2px 8px; border-radius: 6px;">
                  📍 วัน\${dayNames[currentDay]}ที่ \${formattedThaiDate}
                </span>
              </div>

              <!-- Date Picker Input with Native Picker Button -->
              <div style="position: relative; display: flex; align-items: center; width: 100%;">
                <input type="date" id="chase-slip-date-picker" value="\${selectedDateStr}" style="width: 100%; box-sizing: border-box; background: rgba(17, 24, 39, 0.95); border: 1.5px solid #10b981; border-radius: 10px; padding: 8px 115px 8px 12px; color: #6ee7b7; font-weight: 800; font-size: 13px; outline: none; cursor: pointer; box-shadow: 0 0 12px rgba(16, 185, 129, 0.12) inset;" />
                <button type="button" id="chase-slip-calendar-btn" style="position: absolute; right: 5px; background: linear-gradient(135deg, #10b981, #059669); border: 1px solid rgba(255,255,255,0.4); color: #000000; padding: 5px 10px; border-radius: 7px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 800; font-size: 11px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);" title="คลิกเปิดปฏิทิน">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  <span>เปิดปฏิทิน 📅</span>
                </button>
              </div>
            </div>

            <!-- Quick Day Shortcuts (Mon - Sun) -->
            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 700; color: #9ca3af; margin-right: 2px;">ลัดเลือกวัน:</span>
              \${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => \`
                <button type="button" class="day-tab-btn \${currentDay === d ? 'active' : ''}" data-day="\${d}" style="padding: 3px 8px; border-radius: 7px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid \${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.1)'}; background: \${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.05)'}; color: \${currentDay === d ? '#000000' : '#d1d5db'}; transition: all 0.2s;">
                  \${dayNames[d]}
                </button>
              \`).join('')}
            </div>

            <!-- Filter Tabs -->
            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
              \${[
                { id: 'ALL', label: '🌟 ทั้งหมด (4 รอบ)' },
                { id: 'WIN4', label: '🎲 วินเด่น 4 ตัว (เช้า-บ่าย)' },
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

          <!-- Visual Quick Win4 Banner -->
          <div style="margin: 10px 20px 0 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12)); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 4px;">
                🎲 ชุดวินเด่น 4 ตัว (ประจำวัน\${dayNames[currentDay]}ที่ \${formattedThaiDate}):
              </span>
              <span style="font-size: 10px; color: #9ca3af; font-weight: 600;">(คัดจากตัวรูดเด่น-รอง สเต็ป 1 ➡️ 2 ➡️ 3)</span>
            </div>
            \${dayCfg.regClosed ? \`
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 11px; font-weight: 800; color: #c084fc;">💎 หุ้น VIP:</span>
                <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                  ☀️ เช้า: \${win4VipM ? win4VipM.digitsStr : '-'}
                </span>
                <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                  🌙 บ่าย: \${win4VipA ? win4VipA.digitsStr : '-'}
                </span>
                <span style="font-size: 10px; color: #f59e0b; font-weight: 700;">(🛑 ตลาดหุ้นปกติปิด เสาร์-อาทิตย์)</span>
              </div>
            \` : \`
              <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-weight: 800; color: #34d399;">🎌 หุ้นปกติ:</span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; font-weight: 800;">
                    ☀️ เช้า: \${win4RegM ? win4RegM.digitsStr : '-'}
                  </span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; font-weight: 800;">
                    🌙 บ่าย: \${win4RegA ? win4RegA.digitsStr : '-'}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-weight: 800; color: #c084fc;">💎 หุ้น VIP:</span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                    ☀️ เช้า: \${win4VipM ? win4VipM.digitsStr : '-'}
                  </span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                    🌙 บ่าย: \${win4VipA ? win4VipA.digitsStr : '-'}
                  </span>
                </div>
              </div>
            \`}
          </div>

          <!-- Body Textarea Preview -->
          <div style="padding: 12px 20px; flex: 1; overflow-y: auto;">
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

      // 1. Date Picker Event Listener
      const dateInput = chaseSlipModalOverlay.querySelector('#chase-slip-date-picker');
      if (dateInput) {
        dateInput.onchange = (e) => {
          if (e.target.value) {
            selectedDateStr = e.target.value;
            const parts = selectedDateStr.split('-');
            if (parts.length === 3) {
              const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
              const dayCodeMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              currentDay = dayCodeMap[dt.getDay()] || 'Sun';
            }
            renderModalContent();
          }
        };
      }

      // 2. Calendar Button Trigger
      const calBtn = chaseSlipModalOverlay.querySelector('#chase-slip-calendar-btn');
      if (calBtn && dateInput) {
        calBtn.onclick = () => {
          try {
            if (typeof dateInput.showPicker === 'function') {
              dateInput.showPicker();
            } else {
              dateInput.focus();
            }
          } catch(err) {
            dateInput.focus();
          }
        };
      }

      // 3. Quick Day Buttons
      chaseSlipModalOverlay.querySelectorAll('.day-tab-btn').forEach(btn => {
        btn.onclick = () => {
          currentDay = btn.getAttribute('data-day');
          const dayOffsets = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const bkk = new Date(utc + (3600000 * 7));
          const currentDayIndex = bkk.getDay();
          const daysFromMonday = (currentDayIndex === 0) ? 6 : (currentDayIndex - 1);
          const monday = new Date(bkk);
          monday.setDate(bkk.getDate() - daysFromMonday);
          const target = new Date(monday);
          const offset = dayOffsets[currentDay] !== undefined ? dayOffsets[currentDay] : 0;
          target.setDate(monday.getDate() + offset);

          const y = target.getFullYear();
          const m = String(target.getMonth() + 1).padStart(2, '0');
          const d = String(target.getDate()).padStart(2, '0');
          selectedDateStr = y + '-' + m + '-' + d;
          renderModalContent();
        };
      });

      // 4. Filter Tab Buttons
      chaseSlipModalOverlay.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.onclick = () => {
          currentFilter = btn.getAttribute('data-filter');
          renderModalContent();
        };
      });

      // 5. Copy Button
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

      // 6. Direct Send Button
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
            body: JSON.stringify({
              message: textToSend,
              to: target
            })
          });

          const data = await res.json();
          if (data.success) {
            directSendBtn.innerText = '✅ ส่งสำเร็จ!';
            showToast('ส่งสรุปโพยล่า 3 หวยเข้า LINE เรียบร้อยแล้ว! 🚀');
          } else {
            directSendBtn.innerText = '❌ ส่งไม่สำเร็จ';
            showToast('เกิดข้อผิดพลาด: ' + (data.error || 'กรุณาลองใหม่อีกครั้ง'), true);
          }
        } catch(err) {
          directSendBtn.innerText = '❌ ผิดพลาด';
          showToast('เชื่อมต่อ API ไม่สำเร็จ: ' + err.message, true);
        } finally {
          setTimeout(() => {
            directSendBtn.innerText = '📲 ส่งเข้า LINE ทันที';
            directSendBtn.disabled = false;
          }, 2500);
        }
      };
    }

    renderModalContent();
    chaseSlipModalOverlay.style.display = 'flex';
  };`;

code = code.substring(0, mIdx) + newOpenChaseSlipModal + code.substring(fnEndIdx + 1);

fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(distFile, code, 'utf8');
console.log('Successfully applied Calendar picker to export_modal.js in downloaded_target_worker and dist!');
