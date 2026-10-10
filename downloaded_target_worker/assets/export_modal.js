/**
 * Export Prediction Modal for SystemLucky289
 * Supports exporting summary predictions as Excel (.xlsx) and CSV (.csv)
 * with lottery selection and date range filtering (Daily, Weekly, Monthly).
 */
(function() {
  let modalContainer = null;
  let activeLottery = 'CURRENT';
  let activeRangeType = 'DAILY';
  let activeDay = 'ALL';
  let activeWeeks = 4;
  let activeMonths = 3;
  window.__KV_DRAWS__ = window.__KV_DRAWS__ || {};

  // Background fetch fallback for draws
  try {
    fetch('/api/draws')
      .then(r => r.json())
      .then(res => {
        if (res && res.success && res.data) {
          window.__KV_DRAWS__ = res.data;
        }
      })
      .catch(() => {});
  } catch(e) {}

  const LOTTERY_CONFIG = [
    { id: 'CURRENT', label: '⭐ หวยที่กำลังวิเคราะห์อยู่', keys: [] },
    { id: 'NIKKEI_ALL', label: '🎌 หุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง 6 รอบ)', keys: ['lotto_data_nikkei_morning', 'lotto_data_nikkei_afternoon', 'lotto_data_china_morning', 'lotto_data_china_afternoon', 'lotto_data_hangseng_morning', 'lotto_data_hangseng_afternoon'] },
    { id: 'NIKKEI', label: '☀️ นิเคอิ (เช้า-บ่าย)', keys: ['lotto_data_nikkei_morning', 'lotto_data_nikkei_afternoon'] },
    { id: 'CHINA', label: '🇨🇳 จีน (เช้า-บ่าย)', keys: ['lotto_data_china_morning', 'lotto_data_china_afternoon'] },
    { id: 'HANGSENG', label: '🇭🇰 ฮั่งเส็ง (เช้า-บ่าย)', keys: ['lotto_data_hangseng_morning', 'lotto_data_hangseng_afternoon'] },
    { id: 'STOCKS_VIP_ALL', label: '💎 หุ้น VIP (นิเคอิ / จีน / ฮั่งเส็ง VIP 6 รอบ)', keys: ['lotto_data_nikkei_vip_morning', 'lotto_data_nikkei_vip_afternoon', 'lotto_data_china_vip_morning', 'lotto_data_china_vip_afternoon', 'lotto_data_hangseng_vip_morning', 'lotto_data_hangseng_vip_afternoon'] },
    { id: 'NIKKEI_VIP', label: '💎 นิเคอิ VIP (เช้า-บ่าย)', keys: ['lotto_data_nikkei_vip_morning', 'lotto_data_nikkei_vip_afternoon'] },
    { id: 'CHINA_VIP', label: '🏮 จีน VIP (เช้า-บ่าย)', keys: ['lotto_data_china_vip_morning', 'lotto_data_china_vip_afternoon'] },
    { id: 'HANGSENG_VIP', label: '🏛️ ฮั่งเส็ง VIP (เช้า-บ่าย)', keys: ['lotto_data_hangseng_vip_morning', 'lotto_data_hangseng_vip_afternoon'] },
    { id: 'HANOI_ALL', label: '🇻🇳 ฮานอย (รวม 3 รอบ: พิเศษ / ปกติ / VIP)', keys: ['lotto_data_hanoi_special', 'lotto_data_hanoi', 'lotto_data_hanoi_vip'] },
    { id: 'HANOI_SPECIAL', label: '🟠 ฮานอยพิเศษ (17:30)', keys: ['lotto_data_hanoi_special'] },
    { id: 'HANOI_EVENING', label: '🔴 ฮานอยปกติ (18:30)', keys: ['lotto_data_hanoi'] },
    { id: 'HANOI_VIP', label: '🟣 ฮานอย VIP (19:30)', keys: ['lotto_data_hanoi_vip'] },
    { id: 'LAOS', label: '🇱🇦 ลาวพัฒนา (20:30)', keys: ['lotto_data_laos'] },
    { id: 'MALAY', label: '🇲🇾 หวยมาเลย์ (Magnum 4D 18:30)', keys: ['lotto_data_malay'] },
    { id: 'DOWJONES', label: '🇺🇸 หวยหุ้นดาวโจนส์ (04:00)', keys: ['lotto_data_dowjones'] },
    { id: 'GSB', label: '🏦 หวยออมสิน (13:00)', keys: ['lotto_data_gsb'] },
    { id: 'GOVERNMENT', label: '🇹🇭 หวยรัฐบาลไทย (15:30)', keys: ['lotto_data_gov'] },
  ];

  const DAYS = [
    { code: 'ALL', label: 'ทุกวัน' },
    { code: 'Mon', label: 'วันจันทร์' },
    { code: 'Tue', label: 'วันอังคาร' },
    { code: 'Wed', label: 'วันพุธ' },
    { code: 'Thu', label: 'วันพฤหัสบดี' },
    { code: 'Fri', label: 'วันศุกร์' },
    { code: 'Sat', label: 'วันเสาร์' },
    { code: 'Sun', label: 'วันอาทิตย์' },
  ];

  function getStoredDraws(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    if (window.__KV_DRAWS__ && window.__KV_DRAWS__[storageKey] && Array.isArray(window.__KV_DRAWS__[storageKey])) {
      return window.__KV_DRAWS__[storageKey];
    }
    return [];
  }

  function getDrawsForLottery(lotteryId) {
    if (lotteryId === 'CURRENT') {
      const activeType = localStorage.getItem('lotto_active_lottery_type') || 'NIKKEI';
      const activeSess = localStorage.getItem('lotto_selected_session') || '';
      
      if (activeType === 'HANOI') {
        if (activeSess === 'HANOI_SPECIAL') return getStoredDraws('lotto_data_hanoi_special');
        if (activeSess === 'HANOI_EVENING') return getStoredDraws('lotto_data_hanoi');
        if (activeSess === 'HANOI_VIP') return getStoredDraws('lotto_data_hanoi_vip');
        return [...getStoredDraws('lotto_data_hanoi_special'), ...getStoredDraws('lotto_data_hanoi'), ...getStoredDraws('lotto_data_hanoi_vip')];
      }
      if (activeType === 'STOCKS_VIP') {
        if (activeSess === 'NIKKEI_VIP_BOTH') return [...getStoredDraws('lotto_data_nikkei_vip_morning'), ...getStoredDraws('lotto_data_nikkei_vip_afternoon')];
        if (activeSess === 'NIKKEI_VIP_MORNING') return getStoredDraws('lotto_data_nikkei_vip_morning');
        if (activeSess === 'NIKKEI_VIP_AFTERNOON') return getStoredDraws('lotto_data_nikkei_vip_afternoon');
        if (activeSess === 'CHINA_VIP_BOTH') return [...getStoredDraws('lotto_data_china_vip_morning'), ...getStoredDraws('lotto_data_china_vip_afternoon')];
        if (activeSess === 'CHINA_VIP_MORNING') return getStoredDraws('lotto_data_china_vip_morning');
        if (activeSess === 'CHINA_VIP_AFTERNOON') return getStoredDraws('lotto_data_china_vip_afternoon');
        if (activeSess === 'HANGSENG_VIP_BOTH') return [...getStoredDraws('lotto_data_hangseng_vip_morning'), ...getStoredDraws('lotto_data_hangseng_vip_afternoon')];
        if (activeSess === 'HANGSENG_VIP_MORNING') return getStoredDraws('lotto_data_hangseng_vip_morning');
        if (activeSess === 'HANGSENG_VIP_AFTERNOON') return getStoredDraws('lotto_data_hangseng_vip_afternoon');
        return [
          ...getStoredDraws('lotto_data_nikkei_vip_morning'), ...getStoredDraws('lotto_data_nikkei_vip_afternoon'),
          ...getStoredDraws('lotto_data_china_vip_morning'), ...getStoredDraws('lotto_data_china_vip_afternoon'),
          ...getStoredDraws('lotto_data_hangseng_vip_morning'), ...getStoredDraws('lotto_data_hangseng_vip_afternoon')
        ];
      }
      if (activeType === 'NIKKEI') {
        if (activeSess === 'NIKKEI_BOTH' || activeSess === 'BOTH') return [...getStoredDraws('lotto_data_nikkei_morning'), ...getStoredDraws('lotto_data_nikkei_afternoon')];
        if (activeSess === 'NIKKEI_MORNING' || activeSess === 'MORNING') return getStoredDraws('lotto_data_nikkei_morning');
        if (activeSess === 'NIKKEI_AFTERNOON' || activeSess === 'AFTERNOON') return getStoredDraws('lotto_data_nikkei_afternoon');
        if (activeSess === 'CHINA_BOTH') return [...getStoredDraws('lotto_data_china_morning'), ...getStoredDraws('lotto_data_china_afternoon')];
        if (activeSess === 'CHINA_MORNING') return getStoredDraws('lotto_data_china_morning');
        if (activeSess === 'CHINA_AFTERNOON') return getStoredDraws('lotto_data_china_afternoon');
        if (activeSess === 'HANGSENG_BOTH') return [...getStoredDraws('lotto_data_hangseng_morning'), ...getStoredDraws('lotto_data_hangseng_afternoon')];
        if (activeSess === 'HANGSENG_MORNING') return getStoredDraws('lotto_data_hangseng_morning');
        if (activeSess === 'HANGSENG_AFTERNOON') return getStoredDraws('lotto_data_hangseng_afternoon');
        return [
          ...getStoredDraws('lotto_data_nikkei_morning'), ...getStoredDraws('lotto_data_nikkei_afternoon'),
          ...getStoredDraws('lotto_data_china_morning'), ...getStoredDraws('lotto_data_china_afternoon'),
          ...getStoredDraws('lotto_data_hangseng_morning'), ...getStoredDraws('lotto_data_hangseng_afternoon')
        ];
      }
      if (activeType === 'LAOS') return getStoredDraws('lotto_data_laos');
      if (activeType === 'MALAY') return getStoredDraws('lotto_data_malay');
      if (activeType === 'DOWJONES') return getStoredDraws('lotto_data_dowjones');
      if (activeType === 'GSB') return getStoredDraws('lotto_data_gsb');
      if (activeType === 'GOVERNMENT') return getStoredDraws('lotto_data_gov');
      return getStoredDraws('lotto_data_nikkei_morning');
    }

    const cfg = LOTTERY_CONFIG.find(c => c.id === lotteryId);
    if (!cfg || !cfg.keys) return [];
    const all = [];
    for (const k of cfg.keys) {
      all.push(...getStoredDraws(k));
    }
    return all.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
  }

  function filterDrawsByRange(allDraws) {
    if (!allDraws || allDraws.length === 0) return [];
    const dateList = Array.from(new Set(allDraws.map(d => d.date))).filter(Boolean).sort().reverse();

    if (activeRangeType === 'DAILY') {
      if (activeDay === 'ALL') return allDraws;
      return allDraws.filter(d => d.dayOfWeek === activeDay);
    }
    if (activeRangeType === 'WEEKLY') {
      const takeDates = dateList.slice(0, activeWeeks * 7);
      const set = new Set(takeDates);
      return allDraws.filter(d => set.has(d.date));
    }
    if (activeRangeType === 'MONTHLY') {
      const takeDates = dateList.slice(0, activeMonths * 30);
      const set = new Set(takeDates);
      return allDraws.filter(d => set.has(d.date));
    }
    return allDraws;
  }

  function analyzeDigitsForSubset(draws) {
    const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    const pairCounts = {};

    draws.forEach(d => {
      const top3 = d.top3 || '';
      const b2 = d.bottom2 || '';
      const allD = top3 + b2;
      for (const ch of allD) {
        const n = parseInt(ch, 10);
        if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
      }
      const t2 = d.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
      if (t2) pairCounts[t2] = (pairCounts[t2] || 0) + 1;
      if (b2) pairCounts[b2] = (pairCounts[b2] || 0) + 1;
    });

    const sortedDigits = Object.entries(digitCounts)
      .map(([k, count]) => ({ digit: parseInt(k, 10), count }))
      .sort((a, b) => b.count - a.count);

    const sortedPairs = Object.entries(pairCounts)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      topDigits: sortedDigits,
      topPairs: sortedPairs
    };
  }

  function generateRows() {
    const allDraws = getDrawsForLottery(activeLottery);
    const filtered = filterDrawsByRange(allDraws);
    if (!filtered || filtered.length === 0) return [];

    const dateMap = new Map();
    filtered.forEach(d => {
      if (!dateMap.has(d.date)) dateMap.set(d.date, []);
      dateMap.get(d.date).push(d);
    });

    const dates = Array.from(dateMap.keys()).sort().reverse();
    const rows = [];
    let rowNum = 1;

    for (const dt of dates) {
      const dayDraws = dateMap.get(dt);
      const sample = dayDraws[0] || {};
      const dayOfWeek = sample.dayOfWeek || '';
      const dayName = sample.dayNameThai ? ('วัน' + sample.dayNameThai) : (dayOfWeek ? ('วัน' + dayOfWeek) : '-');
      const dateFormatted = sample.dateFormatted || dt;

      const past = allDraws.filter(d => (d.date || '') < dt);
      const subset = past.length > 5 ? past : allDraws;
      const analysis = analyzeDigitsForSubset(subset);

      const d0 = analysis.topDigits[0]?.digit ?? '-';
      const d1 = analysis.topDigits[1]?.digit ?? '-';
      const top6Pairs = analysis.topPairs.map(p => p.pair);
      const top6Str = top6Pairs.join(', ');

      for (const dr of dayDraws) {
        const top3 = dr.top3 || '';
        const top2 = dr.top2 || (top3.length >= 2 ? top3.slice(-2) : '');
        const b2 = dr.bottom2 || '';
        const sess = dr.session || dr.lotteryType || '';

        const hitMain = top2.includes(String(d0)) || b2.includes(String(d0));
        const hitSub = top2.includes(String(d1)) || b2.includes(String(d1));
        const hitPair = top6Pairs.includes(top2) || top6Pairs.includes(b2);

        let status = !top3 ? '⏳ รอผล' : (hitMain || hitSub || hitPair) ? '✓ เข้าเป้า' : '❌ ไม่เข้า';

        rows.push({
          'ลำดับ': rowNum++,
          'วันที่': dateFormatted,
          'วันประจำสัปดาห์': dayName,
          'ประเภทหวย': dr.lotteryType || activeLottery,
          'รอบออกรางวัล': sess,
          'เด่นหลัก (ฟันตัวเดียว)': d0,
          'เด่นรอง': d1,
          'TOP 6 เลข 2 ตัวเน้น': top6Str,
          'ผล 3 ตัวบน': top3 || '-',
          'ผล 2 ตัวบน': top2 || '-',
          'ผล 2 ตัวล่าง': b2 || '-',
          'วิ่ง-รูด เด่นหลัก': hitMain ? ('เข้า (' + (top2.includes(String(d0)) ? 'บน ' + top2 : '') + ' ' + (b2.includes(String(d0)) ? 'ล่าง ' + b2 : '') + ')').trim() : (top3 ? 'ไม่เข้า' : 'รอผล'),
          'วิ่ง-รูด เด่นรอง': hitSub ? ('เข้า (' + (top2.includes(String(d1)) ? 'บน ' + top2 : '') + ' ' + (b2.includes(String(d1)) ? 'ล่าง ' + b2 : '') + ')').trim() : (top3 ? 'ไม่เข้า' : 'รอผล'),
          'เข้า 2 ตัวเน้น': hitPair ? ('เข้า (' + (top6Pairs.includes(top2) ? 'บน ' + top2 : '') + ' ' + (top6Pairs.includes(b2) ? 'ล่าง ' + b2 : '') + ')').trim() : (top3 ? 'ไม่เข้า' : 'รอผล'),
          'สรุปผล': status
        });
      }
    }
    return rows;
  }

  function downloadCSV() {
    const rows = generateRows();
    if (rows.length === 0) {
      alert('ไม่พบข้อมูลงวดสำหรับดาวน์โหลดในช่วงที่เลือก');
      return;
    }
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(','),
      ...rows.map(r => headers.map(h => '"' + String(r[h] ?? '').replace(/"/g, '""') + '"').join(','))
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'สรุปฟันธงเด่นรูด_' + activeLottery + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadExcel() {
    const rows = generateRows();
    if (rows.length === 0) {
      alert('ไม่พบข้อมูลงวดสำหรับดาวน์โหลดในช่วงที่เลือก');
      return;
    }

    if (window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 6 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 20 },
        { wch: 18 }, { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }
      ];
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'สรุปฟันธงเด่นรูด');
      window.XLSX.writeFile(wb, 'สรุปฟันธงเด่นรูด_' + activeLottery + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    } else {
      downloadCSV();
    }
  }

  function updateModalUI() {
    if (!modalContainer) return;
    const dailySub = modalContainer.querySelector('#export-daily-sub');
    const weeklySub = modalContainer.querySelector('#export-weekly-sub');
    const monthlySub = modalContainer.querySelector('#export-monthly-sub');

    dailySub.style.display = activeRangeType === 'DAILY' ? 'block' : 'none';
    weeklySub.style.display = activeRangeType === 'WEEKLY' ? 'block' : 'none';
    monthlySub.style.display = activeRangeType === 'MONTHLY' ? 'block' : 'none';

    modalContainer.querySelectorAll('.export-range-btn').forEach(btn => {
      const r = btn.getAttribute('data-range');
      if (r === activeRangeType) {
        btn.style.background = 'linear-gradient(to right, #f59e0b, #d97706)';
        btn.style.color = '#000';
        btn.style.borderColor = '#fbbf24';
      } else {
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.style.color = '#d1d5db';
        btn.style.borderColor = 'rgba(255,255,255,0.15)';
      }
    });

    modalContainer.querySelectorAll('.export-day-btn').forEach(btn => {
      const d = btn.getAttribute('data-day');
      if (d === activeDay) {
        btn.style.background = '#f59e0b';
        btn.style.color = '#000';
      } else {
        btn.style.background = 'rgba(0,0,0,0.3)';
        btn.style.color = '#fff';
      }
    });

    const allDraws = getDrawsForLottery(activeLottery);
    const filtered = filterDrawsByRange(allDraws);
    const countDisplay = modalContainer.querySelector('#export-count-display');
    if (countDisplay) {
      countDisplay.innerText = filtered.length + ' งวด (' + (Array.from(new Set(filtered.map(d=>d.date))).length) + ' วัน)';
    }
  }

  window.openExportPredictionModal = function() {
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'export-prediction-modal';
      modalContainer.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Prompt,Inter,sans-serif;';
      
      const lottoOptions = LOTTERY_CONFIG.map(c => '<option value="' + c.id + '" style="background:#1e1006;color:#fff;">' + c.label + '</option>').join('');
      const dayOptions = DAYS.map(d => '<button class="export-day-btn" data-day="' + d.code + '" style="padding:6px;border-radius:8px;border:1px solid rgba(245,158,11,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">' + d.label + '</button>').join('');

      modalContainer.innerHTML = `
        <div style="background:linear-gradient(135deg,#1f1307,#140b04);border:2px solid rgba(245,158,11,0.5);border-radius:20px;max-width:540px;width:100%;padding:22px;box-shadow:0 15px 35px rgba(0,0,0,0.8), 0 0 25px rgba(245,158,11,0.2);color:#fff;position:relative;">
          
          <!-- Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(245,158,11,0.25);padding-bottom:12px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;">
                📥
              </div>
              <div>
                <h3 style="font-size:16px;font-weight:900;margin:0;color:#fcd34d;">ดาวน์โหลดข้อมูลสรุปฟันธงเด่นรูด</h3>
                <p style="font-size:11px;color:#9ca3af;margin:2px 0 0 0;">ส่งออกเป็นไฟล์ Excel หรือ CSV พร้อมตัวกรองหวยและช่วงเวลา</p>
              </div>
            </div>
            <button id="export-modal-close" style="background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:4px 8px;">✕</button>
          </div>

          <!-- Select Lottery -->
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:12px;font-weight:bold;color:#fcd34d;margin-bottom:6px;">🎯 เลือกประเภทหวย:</label>
            <select id="export-lottery-select" style="width:100%;background:rgba(0,0,0,0.5);border:1px solid rgba(245,158,11,0.4);border-radius:10px;padding:9px 12px;color:#fff;font-size:13px;font-weight:bold;outline:none;">
              ${lottoOptions}
            </select>
          </div>

          <!-- Select Range Type -->
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:12px;font-weight:bold;color:#fcd34d;margin-bottom:6px;">⏱️ เลือกรูปแบบช่วงเวลา:</label>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
              <button class="export-range-btn" data-range="DAILY" style="padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#d1d5db;font-size:12px;font-weight:bold;cursor:pointer;">🗓️ รายวัน</button>
              <button class="export-range-btn" data-range="WEEKLY" style="padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#d1d5db;font-size:12px;font-weight:bold;cursor:pointer;">📅 รายสัปดาห์</button>
              <button class="export-range-btn" data-range="MONTHLY" style="padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#d1d5db;font-size:12px;font-weight:bold;cursor:pointer;">📊 รายเดือน</button>
            </div>

            <!-- Daily Sub -->
            <div id="export-daily-sub" style="display:block;background:rgba(30,16,6,0.7);padding:10px;border-radius:12px;border:1px solid rgba(245,158,11,0.2);">
              <span style="font-size:11px;color:#d1d5db;font-weight:bold;display:block;margin-bottom:6px;">เลือกวันประจำสัปดาห์:</span>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                ${dayOptions}
              </div>
            </div>

            <!-- Weekly Sub -->
            <div id="export-weekly-sub" style="display:none;background:rgba(30,16,6,0.7);padding:10px;border-radius:12px;border:1px solid rgba(6,182,212,0.3);">
              <span style="font-size:11px;color:#d1d5db;font-weight:bold;display:block;margin-bottom:6px;">เลือกจำนวนสัปดาห์ล่าสุด:</span>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
                <button class="export-week-btn" data-weeks="1" style="padding:6px;border-radius:8px;border:1px solid rgba(6,182,212,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">1 สัปดาห์</button>
                <button class="export-week-btn" data-weeks="2" style="padding:6px;border-radius:8px;border:1px solid rgba(6,182,212,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">2 สัปดาห์</button>
                <button class="export-week-btn" data-weeks="4" style="padding:6px;border-radius:8px;border:1px solid rgba(6,182,212,0.3);background:#0891b2;color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">4 สัปดาห์ (1 เดือน)</button>
              </div>
            </div>

            <!-- Monthly Sub -->
            <div id="export-monthly-sub" style="display:none;background:rgba(30,16,6,0.7);padding:10px;border-radius:12px;border:1px solid rgba(16,185,129,0.3);">
              <span style="font-size:11px;color:#d1d5db;font-weight:bold;display:block;margin-bottom:6px;">เลือกจำนวนเดือนล่าสุด:</span>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
                <button class="export-month-btn" data-months="1" style="padding:6px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">1 เดือน</button>
                <button class="export-month-btn" data-months="2" style="padding:6px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">2 เดือน</button>
                <button class="export-month-btn" data-months="3" style="padding:6px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);background:#059669;color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">3 เดือน</button>
                <button class="export-month-btn" data-months="6" style="padding:6px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;font-weight:bold;cursor:pointer;">6 เดือน</button>
              </div>
            </div>
          </div>

          <!-- Preview Count -->
          <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#fcd34d;font-weight:bold;margin-bottom:16px;">
            <span>📊 จำนวนงวดผลรางวัลที่จะถูกประมวลผล:</span>
            <span id="export-count-display" style="background:rgba(245,158,11,0.2);padding:2px 8px;border-radius:6px;color:#fff;font-weight:900;">0 งวด</span>
          </div>

          <!-- Action Buttons -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button id="export-btn-excel" style="flex:1;min-width:160px;padding:12px;border-radius:12px;border:none;background:linear-gradient(to right,#10b981,#14b8a6);color:#000;font-weight:900;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 15px rgba(16,185,129,0.3);">
              📗 ดาวน์โหลด Excel (.xlsx)
            </button>
            <button id="export-btn-csv" style="flex:1;min-width:160px;padding:12px;border-radius:12px;border:none;background:linear-gradient(to right,#f59e0b,#fbbf24);color:#000;font-weight:900;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 15px rgba(245,158,11,0.3);">
              📄 ดาวน์โหลด CSV (.csv)
            </button>
            <button id="export-btn-cancel" style="padding:12px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#9ca3af;font-weight:bold;font-size:12px;cursor:pointer;">
              ยกเลิก
            </button>
          </div>

        </div>
      `;

      document.body.appendChild(modalContainer);

      // Event handlers
      modalContainer.querySelector('#export-modal-close').onclick = () => { modalContainer.style.display = 'none'; };
      modalContainer.querySelector('#export-btn-cancel').onclick = () => { modalContainer.style.display = 'none'; };
      
      modalContainer.querySelector('#export-lottery-select').onchange = (e) => {
        activeLottery = e.target.value;
        updateModalUI();
      };

      modalContainer.querySelectorAll('.export-range-btn').forEach(btn => {
        btn.onclick = () => {
          activeRangeType = btn.getAttribute('data-range');
          updateModalUI();
        };
      });

      modalContainer.querySelectorAll('.export-day-btn').forEach(btn => {
        btn.onclick = () => {
          activeDay = btn.getAttribute('data-day');
          updateModalUI();
        };
      });

      modalContainer.querySelectorAll('.export-week-btn').forEach(btn => {
        btn.onclick = () => {
          activeWeeks = parseInt(btn.getAttribute('data-weeks'), 10);
          modalContainer.querySelectorAll('.export-week-btn').forEach(b => {
            b.style.background = b === btn ? '#0891b2' : 'rgba(0,0,0,0.3)';
          });
          updateModalUI();
        };
      });

      modalContainer.querySelectorAll('.export-month-btn').forEach(btn => {
        btn.onclick = () => {
          activeMonths = parseInt(btn.getAttribute('data-months'), 10);
          modalContainer.querySelectorAll('.export-month-btn').forEach(b => {
            b.style.background = b === btn ? '#059669' : 'rgba(0,0,0,0.3)';
          });
          updateModalUI();
        };
      });

      modalContainer.querySelector('#export-btn-excel').onclick = downloadExcel;
      modalContainer.querySelector('#export-btn-csv').onclick = downloadCSV;
    }

    modalContainer.style.display = 'flex';
    updateModalUI();
  };

  // Safe Auto-Injector for the Download Button in DOM
  function injectDownloadButton() {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const copyBtns = allButtons.filter(b => b.innerText && b.innerText.includes('คัดลอกแนวทาง') && !b.id.includes('export'));
    if (copyBtns.length === 0) return;

    // Pick the copy button in the summary prediction card (usually the one with yellow/amber gradient or inside summary card)
    const targetBtn = copyBtns.find(b => b.className.includes('from-amber-400') || (b.parentElement && b.parentElement.innerHTML.includes('ฟันเด่น'))) || copyBtns[copyBtns.length - 1];
    if (!targetBtn || !targetBtn.parentElement) return;

    // Check if already injected
    if (targetBtn.parentElement.querySelector('#btn-export-prediction-ui') || targetBtn.parentElement.querySelector('#btn-export-prediction-jsx')) {
      return;
    }

    const btn = document.createElement('button');
    btn.id = 'btn-export-prediction-ui';
    btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black border border-emerald-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald mr-2';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-black">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>📥 ดาวน์โหลด Excel / CSV</span>
    `;
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.openExportPredictionModal();
    };

    targetBtn.parentElement.insertBefore(btn, targetBtn);
  }

  // Periodic and reactive checks
  setInterval(injectDownloadButton, 500);
  if (typeof document !== 'undefined') {
    if (document.body) {
      const observer = new MutationObserver(injectDownloadButton);
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        const observer = new MutationObserver(injectDownloadButton);
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

})();
