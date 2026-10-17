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
        if (res && res.success) {
          const kvD = res.datasets || res.data || {};
          window.__KV_DRAWS__ = kvD;
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

          <!-- Special Comprehensive Analysis Report Download Card -->
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(16,185,129,0.15));border:1px solid rgba(245,158,11,0.5);border-radius:14px;padding:14px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span style="font-size:20px;">🏆</span>
              <div>
                <h4 style="margin:0;font-size:13px;font-weight:900;color:#fef08a;">รายงานสถิติการมาของเลข & วิเคราะห์ความแม่นยำ (เจาะลึก 15 รอบ)</h4>
                <p style="margin:2px 0 0;font-size:11px;color:#d1d5db;">วิเคราะห์ เด่น รอง และชุดเจาะ Top 6 คู่ หวยหุ้นปกติ / VIP / ฮานอย แยกเช้า-บ่าย</p>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
              <a href="/assets/lotto_position_chase_daily.csv" download="lotto_position_chase_daily.csv" style="grid-column: span 2; text-decoration:none;background:linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.3));border:1px solid #60a5fa;color:#bfdbfe;padding:11px 14px;border-radius:10px;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;text-align:center;box-shadow: 0 4px 12px rgba(59,130,246,0.2);">
                🔢 ดาวน์โหลดชีทแยกหลักสิบ-หน่วย (บน/ล่าง เช้า-บ่าย) CSV
              </a>
              <a href="/assets/lotto_chase_strategy_daily.csv" download="lotto_chase_strategy_daily.csv" style="grid-column: span 2; text-decoration:none;background:linear-gradient(135deg, rgba(234,179,8,0.3), rgba(245,158,11,0.3));border:1px solid #facc15;color:#fef08a;padding:11px 14px;border-radius:10px;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;text-align:center;box-shadow: 0 4px 12px rgba(234,179,8,0.2);">
                🎯 ดาวน์โหลดตารางสูตรล่า 2 หวย (รายวัน จันทร์-ศุกร์) CSV
              </a>
              <a href="/assets/lotto_hit_rate_summary.csv" download="lotto_hit_rate_summary.csv" style="text-decoration:none;background:rgba(245,158,11,0.2);border:1px solid #f59e0b;color:#fcd34d;padding:9px 12px;border-radius:10px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;text-align:center;">
                📊 สรุปอันดับความแม่นยำ (Summary CSV)
              </a>
              <a href="/assets/lotto_hit_rate_details.csv" download="lotto_hit_rate_details.csv" style="text-decoration:none;background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:9px 12px;border-radius:10px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;text-align:center;">
                📑 ประวัติย้อนหลัง 1,500 งวด (Details CSV)
              </a>
            </div>
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

    const chaseBtn = document.createElement('a');
    chaseBtn.id = 'btn-download-chase-strategy-ui';
    chaseBtn.href = '/assets/lotto_chase_strategy_daily.csv';
    chaseBtn.download = 'lotto_chase_strategy_daily.csv';
    chaseBtn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black border border-amber-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-amber mr-2 no-underline';
    chaseBtn.title = 'ดาวน์โหลดตารางสรุปสูตรล่า 2 หวย (เข้าแล้วหยุด/หลุดตามทบ) รายวัน จันทร์-ศุกร์';
    chaseBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-black">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
      <span>🎯 ดาวน์โหลดสูตรล่า 2 หวย (CSV)</span>
    `;

    const posBtn = document.createElement('a');
    posBtn.id = 'btn-download-position-chase-ui';
    posBtn.href = '/assets/lotto_position_chase_daily.csv';
    posBtn.download = 'lotto_position_chase_daily.csv';
    posBtn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400 hover:brightness-110 hover:scale-105 active:scale-95 mr-2 no-underline';
    posBtn.title = 'ดาวน์โหลดชีทแยกหลักสิบ-หน่วย (บน/ล่าง เช้า-บ่าย) พร้อมเช็คเป้า';
    posBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
      <span>🔢 ชีทแยกหลักสิบ-หน่วย (CSV)</span>
    `;

    const lineSlipBtn = document.createElement('button');
    lineSlipBtn.id = 'btn-copy-chase-line-ui';
    lineSlipBtn.type = 'button';
    lineSlipBtn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 text-white border border-green-400 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald mr-2';
    lineSlipBtn.title = 'เปิดสรุปโพยล่า 3 หวย เพื่อคัดลอกไปวางในแชท LINE ได้ทันที';
    lineSlipBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span>📋 สรุปโพยล่า 3 หวย (ส่ง LINE)</span>
    `;
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
  }


  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
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
        runDigits: '1 - 4',
        bestDigit: '1',
        top6: '51 - 60 - 61 - 64 - 86 - 11',
        winPairs: '51 - 60 - 61 - 64 - 86 - 11 - 14 - 18'
      },
      regAfternoon: {
        cardName: 'จีน (บ่าย)',
        runDigits: '9 - 0',
        bestDigit: '9',
        top6: '29 - 65 - 80 - 87 - 96 - 11',
        winPairs: '29 - 65 - 80 - 87 - 96 - 11 - 20 - 24'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า)',
        runDigits: '6 - 8',
        bestDigit: '6',
        top6: '49 - 76 - 86 - 93 - 96 - 10',
        winPairs: '49 - 76 - 86 - 93 - 96 - 10 - 18 - 26'
      },
      vipAfternoon: {
        cardName: 'จีน VIP (บ่าย)',
        runDigits: '8 - 4',
        bestDigit: '8',
        top6: '23 - 40 - 64 - 10 - 14 - 16',
        winPairs: '23 - 40 - 64 - 10 - 14 - 16 - 21 - 25'
      }
    },
    Tue: {
      dayTh: 'วันอังคาร',
      regMorning: {
        cardName: 'จีน (เช้า) [การ์ดฮั่งเส็ง 9-5 ไร้พ่าย 100%]',
        runDigits: '3 - 0',
        bestDigit: '3',
        top6: '11 - 20 - 39 - 63 - 03 - 06',
        winPairs: '11 - 20 - 39 - 63 - 03 - 06 - 08 - 23'
      },
      regAfternoon: {
        cardName: 'จีน (บ่าย) [การ์ดนิเคอิ 3-2 ไร้พ่าย 100%]',
        runDigits: '2 - 5',
        bestDigit: '2',
        top6: '20 - 42 - 52 - 69 - 71 - 77',
        winPairs: '20 - 42 - 52 - 69 - 71 - 77 - 92 - 93'
      },
      vipMorning: {
        cardName: 'ฮั่งเส็ง VIP (เช้า) 🥇',
        runDigits: '7 - 6',
        bestDigit: '7',
        top6: '12 - 29 - 60 - 65 - 74 - 78',
        winPairs: '12 - 29 - 60 - 65 - 74 - 78 - 80 - 81'
      },
      vipAfternoon: {
        cardName: 'นิเคอิ VIP (บ่าย) 🥇',
        runDigits: '2 - 0',
        bestDigit: '2',
        top6: '24 - 52 - 62 - 76 - 11 - 14',
        winPairs: '24 - 52 - 62 - 76 - 11 - 14 - 20 - 21'
      }
    },
    Wed: {
      dayTh: 'วันพุธ',
      regMorning: {
        cardName: 'จีน (เช้า) 🥇 แตกบ่อยสุด',
        runDigits: '3 - 6',
        bestDigit: '3',
        top6: '33 - 34 - 63 - 76 - 88 - 05',
        winPairs: '33 - 34 - 63 - 76 - 88 - 05 - 06 - 11'
      },
      regAfternoon: {
        cardName: 'นิเคอิ (บ่าย) 🥇 สถิติ 100% ไร้พ่าย',
        runDigits: '4 - 1',
        bestDigit: '4',
        top6: '27 - 64 - 73 - 91 - 13 - 16',
        winPairs: '27 - 64 - 73 - 91 - 13 - 16 - 17 - 20'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า) 🥇 แตก 01 สเต็ป 1',
        runDigits: '0 - 9',
        bestDigit: '0',
        top6: '60 - 79 - 85 - 01 - 03 - 09',
        winPairs: '60 - 79 - 85 - 01 - 03 - 09 - 13 - 18'
      },
      vipAfternoon: {
        cardName: 'จีน VIP (บ่าย) 🥇 สถิติ 100% ไร้พ่าย',
        runDigits: '2 - 3',
        bestDigit: '2',
        top6: '12 - 15 - 37 - 48 - 50 - 53',
        winPairs: '12 - 15 - 37 - 48 - 50 - 53 - 54 - 58'
      }
    },
    Thu: {
      dayTh: 'วันพฤหัสบดี',
      regMorning: {
        cardName: 'นิเคอิ (เช้า)',
        runDigits: '4 - 7',
        bestDigit: '4',
        top6: '19 - 30 - 41 - 46 - 75 - 83',
        winPairs: '19 - 30 - 41 - 46 - 75 - 83 - 87 - 94'
      },
      regAfternoon: {
        cardName: 'จีน (บ่าย)',
        runDigits: '8 - 7',
        bestDigit: '8',
        top6: '12 - 57 - 65 - 75 - 08 - 10',
        winPairs: '12 - 57 - 65 - 75 - 08 - 10 - 18 - 25'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า)',
        runDigits: '5 - 6',
        bestDigit: '5',
        top6: '32 - 45 - 60 - 61 - 79 - 85',
        winPairs: '32 - 45 - 60 - 61 - 79 - 85 - 90 - 92'
      },
      vipAfternoon: {
        cardName: 'จีน VIP (บ่าย)',
        runDigits: '2 - 4',
        bestDigit: '2',
        top6: '18 - 20 - 29 - 34 - 41 - 58',
        winPairs: '18 - 20 - 29 - 34 - 41 - 58 - 60 - 62'
      }
    },
    Fri: {
      dayTh: 'วันศุกร์',
      regMorning: {
        cardName: 'นิเคอิ (เช้า)',
        runDigits: '2 - 8',
        bestDigit: '2',
        top6: '68 - 72 - 10 - 11 - 14 - 15',
        winPairs: '68 - 72 - 10 - 11 - 14 - 15 - 16 - 18'
      },
      regAfternoon: {
        cardName: 'จีน (บ่าย)',
        runDigits: '1 - 6',
        bestDigit: '1',
        top6: '87 - 41 - 70 - 86 - 96 - 13',
        winPairs: '87 - 41 - 70 - 86 - 96 - 13 - 15 - 17'
      },
      vipMorning: {
        cardName: 'จีน VIP (เช้า)',
        runDigits: '1 - 3',
        bestDigit: '1',
        top6: '18 - 32 - 38 - 41 - 71 - 82',
        winPairs: '18 - 32 - 38 - 41 - 71 - 82 - 12 - 19'
      },
      vipAfternoon: {
        cardName: 'จีน VIP (บ่าย)',
        runDigits: '0 - 2',
        bestDigit: '0',
        top6: '06 - 23 - 31 - 37 - 59 - 09',
        winPairs: '06 - 23 - 31 - 37 - 59 - 09 - 18 - 19'
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

  const CHASE_CARD_KEYS = {
    Mon: {
      regMorning: 'lotto_data_nikkei_morning',
      regAfternoon: 'lotto_data_china_afternoon',
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: 'lotto_data_china_vip_afternoon'
    },
    Tue: {
      regMorning: 'lotto_data_china_morning',
      regAfternoon: 'lotto_data_china_afternoon',
      vipMorning: 'lotto_data_hangseng_vip_morning',
      vipAfternoon: 'lotto_data_nikkei_vip_afternoon'
    },
    Wed: {
      regMorning: 'lotto_data_china_morning',
      regAfternoon: 'lotto_data_nikkei_afternoon',
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: 'lotto_data_china_vip_afternoon'
    },
    Thu: {
      regMorning: 'lotto_data_nikkei_morning',
      regAfternoon: 'lotto_data_china_afternoon',
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: 'lotto_data_china_vip_afternoon'
    },
    Fri: {
      regMorning: 'lotto_data_nikkei_morning',
      regAfternoon: 'lotto_data_china_afternoon',
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: 'lotto_data_china_vip_afternoon'
    },
    Sat: {
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: null
    },
    Sun: {
      vipMorning: 'lotto_data_china_vip_morning',
      vipAfternoon: 'lotto_data_nikkei_vip_afternoon'
    }
  };

  function computeLiveCardStats(storageKey, dayCode) {
    if (!storageKey) return null;
    const draws = getStoredDraws(storageKey);
    if (!draws || !Array.isArray(draws) || draws.length === 0) return null;
    const filtered = draws.filter(d => dayCode === 'ALL' || d.dayOfWeek === dayCode);
    if (filtered.length === 0) return null;

    const digitCounts = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    const pairCounts = {};

    filtered.forEach(d => {
      const allDigits = (d.top3 || '') + (d.bottom2 || '');
      allDigits.split('').forEach(ch => {
        const n = parseInt(ch, 10);
        if (!isNaN(n)) digitCounts[n] = (digitCounts[n] || 0) + 1;
      });
      if (d.top2 && /^[0-9]{2}$/.test(d.top2)) pairCounts[d.top2] = (pairCounts[d.top2] || 0) + 1;
      if (d.bottom2 && /^[0-9]{2}$/.test(d.bottom2)) pairCounts[d.bottom2] = (pairCounts[d.bottom2] || 0) + 1;
    });

    const sortedDigits = Object.entries(digitCounts).map(([dig, count]) => {
      const digit = parseInt(dig, 10);
      return { digit, count };
    }).sort((a,b) => b.count - a.count);

    const sortedPairs = Object.entries(pairCounts).map(([pair, count]) => ({ pair, count }))
      .sort((a,b) => b.count - a.count);

    const d0 = sortedDigits[0]?.digit;
    const d1 = sortedDigits[1]?.digit;
    if (d0 === undefined || d1 === undefined) return null;

    return {
      runDigits: d0 + ' - ' + d1,
      bestDigit: String(d0),
      top6: sortedPairs.slice(0, 6).map(p => p.pair).join(' - '),
      winPairs: sortedPairs.slice(0, 8).map(p => p.pair).join(' - ')
    };
  }

  function getResolvedSessionData(dayCode, sessKey) {
    const cfg = CHASE_SLIPS_DATA[dayCode] || CHASE_SLIPS_DATA['Fri'];
    const fallback = cfg[sessKey];
    if (!fallback) return fallback;

    const storageKey = CHASE_CARD_KEYS[dayCode] && CHASE_CARD_KEYS[dayCode][sessKey];
    if (storageKey) {
      const live = computeLiveCardStats(storageKey, dayCode);
      if (live && live.top6) {
        return {
          cardName: fallback.cardName,
          runDigits: live.runDigits,
          bestDigit: live.bestDigit,
          top6: live.top6,
          winPairs: live.winPairs
        };
      }
    }
    return fallback;
  }

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

  const SESSION_WIN4_DATA = {
    Mon: {
      regMorning: [0, 1, 4, 8],
      regAfternoon: [0, 2, 5, 9],
      vipMorning: [1, 4, 8, 9],
      vipAfternoon: [1, 2, 4, 8]
    },
    Tue: {
      regMorning: [3, 5, 6, 9],
      regAfternoon: [0, 2, 3, 7],
      vipMorning: [3, 4, 7, 9],
      vipAfternoon: [0, 4, 6, 7]
    },
    Wed: {
      regMorning: [1, 2, 3, 6],
      regAfternoon: [0, 1, 7, 9],
      vipMorning: [0, 3, 7, 9],
      vipAfternoon: [2, 3, 4, 7]
    },
    Thu: {
      regMorning: [1, 3, 4, 9],
      regAfternoon: [1, 7, 8, 9],
      vipMorning: [1, 4, 6, 9],
      vipAfternoon: [0, 2, 4, 8]
    },
    Fri: {
      regMorning: [2, 6, 7, 8],
      regAfternoon: [1, 3, 4, 6],
      vipMorning: [0, 1, 5, 8],
      vipAfternoon: [0, 6, 7, 8]
    },
    Sat: {
      regMorning: null,
      regAfternoon: null,
      vipMorning: [0, 1, 2, 6],
      vipAfternoon: [0, 6, 8, 9]
    },
    Sun: {
      regMorning: null,
      regAfternoon: null,
      vipMorning: [0, 1, 5, 8],
      vipAfternoon: [1, 3, 7, 9]
    }
  };

  function computeSessionWin4(dayCode, sessKey, sessObj) {
    if (dayCode === 'Sat' || dayCode === 'Sun') {
      if (sessKey === 'regMorning' || sessKey === 'regAfternoon') return null;
    }

    let digits = null;
    const dayWin4 = SESSION_WIN4_DATA[dayCode] || SESSION_WIN4_DATA['Fri'];
    if (dayWin4 && dayWin4[sessKey] && Array.isArray(dayWin4[sessKey])) {
      digits = dayWin4[sessKey].slice();
    } else {
      const pool = [];
      if (sessObj && sessObj.runDigits && sessObj.runDigits !== '-') {
        const m = sessObj.runDigits.match(/d+/g);
        if (m) m.forEach(d => pool.push(parseInt(d, 10)));
      }
      if (sessObj && sessObj.top6 && sessObj.top6 !== '-') {
        const m2 = sessObj.top6.match(/d/g);
        if (m2) m2.forEach(d => pool.push(parseInt(d, 10)));
      }
      for (let i = 0; i <= 9; i++) pool.push(i);
      const seen = new Set();
      digits = [];
      for (const d of pool) {
        if (!seen.has(d)) {
          seen.add(d);
          digits.push(d);
          if (digits.length === 4) break;
        }
      }
    }

    digits.sort((a,b) => a - b);
    const pairs = [];
    const pairsFull = [];
    for (let i = 0; i < digits.length; i++) {
      for (let j = i + 1; j < digits.length; j++) {
        const p1 = String(digits[i]) + String(digits[j]);
        const p2 = String(digits[j]) + String(digits[i]);
        pairs.push(p1);
        pairsFull.push(p1, p2);
      }
    }
    const doubles = digits.map(d => String(d) + String(d));

    return {
      digits,
      digitsStr: digits.join(' - '),
      pairsStr: pairs.join(' - '),
      pairsFullStr: pairsFull.join(' - '),
      doublesStr: doubles.join(' - ')
    };
  }

  function buildChaseLineSlipText(dayCode, filter = 'ALL') {
    const cfg = CHASE_SLIPS_DATA[dayCode] || CHASE_SLIPS_DATA['Fri'];
    const dayName = cfg.dayTh;
    const dateFormatted = getDateForWeekday(dayCode);

    const regM = getResolvedSessionData(dayCode, 'regMorning');
    const regA = getResolvedSessionData(dayCode, 'regAfternoon');
    const vipM = getResolvedSessionData(dayCode, 'vipMorning');
    const vipA = getResolvedSessionData(dayCode, 'vipAfternoon');

    const win4RegM = computeSessionWin4(dayCode, 'regMorning', regM);
    const win4RegA = computeSessionWin4(dayCode, 'regAfternoon', regA);
    const win4VipM = computeSessionWin4(dayCode, 'vipMorning', vipM);
    const win4VipA = computeSessionWin4(dayCode, 'vipAfternoon', vipA);

    if (filter === 'WIN4') {
      let lines = [
        '================================',
        '🎲 สรุปวินเด่น 4 ตัว SystemLucky289',
        '🗓️ ประจำ: ' + dayName + 'ที่ ' + dateFormatted,
        '(สูตรคัดแยกเช้า-บ่าย หุ้นปกติ และ VIP อิสระไม่ปนกัน)',
        '================================'
      ];

      if (cfg.regClosed) {
        lines.push('');
        lines.push('🛑 [หมวดที่ 1] หุ้นปกติ (ตลาดหุ้นหลัก)');
        lines.push('• ตลาดหุ้นปกติ ปิดทำการวันเสาร์-อาทิตย์ (เปิดทำการจันทร์-ศุกร์)');
        lines.push('• มีเฉพาะตลาดหุ้น VIP ที่ออกรางวัลครบทุกวัน 7 วัน');
        lines.push('');
        lines.push('--------------------------------');
        lines.push('💎 [หมวดที่ 2] หุ้น VIP');
        lines.push('☀️ [1] ชุดวินเด่น 4 ตัว - หุ้น VIP รอบเช้า');
        lines.push('(นิเคอิ VIP 09:30 ➡️ จีน VIP 10:30 ➡️ ฮั่งเส็ง VIP 11:00)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4VipM.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4VipM.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4VipM.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4VipM.doublesStr);
        lines.push('');
        lines.push('🌙 [2] ชุดวินเด่น 4 ตัว - หุ้น VIP รอบบ่าย');
        lines.push('(นิเคอิ VIP 13:00 ➡️ จีน VIP 14:00 ➡️ ฮั่งเส็ง VIP 15:30)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4VipA.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4VipA.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4VipA.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4VipA.doublesStr);
      } else {
        lines.push('');
        lines.push('🎌 [หมวดที่ 1] หุ้นปกติ (ตลาดหุ้นหลัก)');
        lines.push('☀️ [1] ชุดวินเด่น 4 ตัว - หุ้นปกติ รอบเช้า');
        lines.push('(นิเคอิ 09:30 ➡️ จีน 10:30 ➡️ ฮั่งเส็ง 11:00)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4RegM.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4RegM.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4RegM.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4RegM.doublesStr);
        lines.push('');
        lines.push('🌙 [2] ชุดวินเด่น 4 ตัว - หุ้นปกติ รอบบ่าย');
        lines.push('(นิเคอิ 13:00 ➡️ จีน 14:00 ➡️ ฮั่งเส็ง 15:30)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4RegA.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4RegA.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4RegA.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4RegA.doublesStr);
        lines.push('');
        lines.push('--------------------------------');
        lines.push('💎 [หมวดที่ 2] หุ้น VIP');
        lines.push('☀️ [3] ชุดวินเด่น 4 ตัว - หุ้น VIP รอบเช้า');
        lines.push('(นิเคอิ VIP 09:30 ➡️ จีน VIP 10:30 ➡️ ฮั่งเส็ง VIP 11:00)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4VipM.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4VipM.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4VipM.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4VipM.doublesStr);
        lines.push('');
        lines.push('🌙 [4] ชุดวินเด่น 4 ตัว - หุ้น VIP รอบบ่าย');
        lines.push('(นิเคอิ VIP 13:00 ➡️ จีน VIP 14:00 ➡️ ฮั่งเส็ง VIP 15:30)');
        lines.push('• คัดเด่น 4 ตัววิน : ' + win4VipA.digitsStr);
        lines.push('• วิน 2 ตัว (6 คู่ตรง) : ' + win4VipA.pairsStr);
        lines.push('• วินไป-กลับ (12 ชุด) : ' + win4VipA.pairsFullStr);
        lines.push('• วินเบิ้ลกันหลุด (4 คู่) : ' + win4VipA.doublesStr);
      }

      lines.push('');
      lines.push('================================');
      lines.push('💡 วิธีเล่น: เล่นวิน 2 ตัวไป-กลับ เข้าสเต็ปไหนให้หยุดทันที!');
      lines.push('🤖 คำนวณอัตโนมัติด้วยระบบ LOTTO289');
      return lines.join('\n');
    }

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
        lines.push('👉 แนะนำเลือกแท็บ "💎 หุ้น VIP" หรือ "🎲 วินเด่น 4 ตัว" มีออกรางวัลครบทุกวัน 7 วันครับ');
      } else if (filter === 'ALL') {
        lines.push('');
        lines.push('📌 ตลาดหุ้นปกติ: ปิดทำการวันเสาร์-อาทิตย์ (เปิดทำการจันทร์-ศุกร์)');
      }
    } else {
      if (filter === 'ALL' || filter === 'REG_MORNING' || filter === 'MORNING' || filter === 'REGULAR') {
        lines.push('');
        lines.push('☀️ [1] หุ้นปกติ รอบเช้า');
        lines.push('(นิเคอิ 09:30 ➡️ จีน 10:30 ➡️ ฮั่งเส็ง 11:00)');
        lines.push('• การ์ดต้นทาง : ' + regM.cardName);
        lines.push('• ฟันเด่นรูด : ' + regM.runDigits + ' (เน้น ' + regM.bestDigit + ')');
        lines.push('• เจาะ Top 6 : ' + regM.top6);
        lines.push('• วินสิบ-หน่วย : ' + regM.winPairs);
        if (win4RegM) {
          lines.push('• 🎲 เด่น 4 ตัววิน : ' + win4RegM.digitsStr + ' (วิน 6 คู่: ' + win4RegM.pairsStr + ' | กลับด้วย)');
        }
      }

      if (filter === 'ALL' || filter === 'REG_AFTERNOON' || filter === 'AFTERNOON' || filter === 'REGULAR') {
        lines.push('');
        lines.push('🌙 [2] หุ้นปกติ รอบบ่าย');
        lines.push('(นิเคอิ 13:00 ➡️ จีน 14:00 ➡️ ฮั่งเส็ง 15:30)');
        lines.push('• การ์ดต้นทาง : ' + regA.cardName);
        lines.push('• ฟันเด่นรูด : ' + regA.runDigits + ' (เน้น ' + regA.bestDigit + ')');
        lines.push('• เจาะ Top 6 : ' + regA.top6);
        lines.push('• วินสิบ-หน่วย : ' + regA.winPairs);
        if (win4RegA) {
          lines.push('• 🎲 เด่น 4 ตัววิน : ' + win4RegA.digitsStr + ' (วิน 6 คู่: ' + win4RegA.pairsStr + ' | กลับด้วย)');
        }
      }
    }

    if (filter === 'ALL' || filter === 'VIP_MORNING' || filter === 'MORNING' || filter === 'VIP') {
      lines.push('');
      lines.push('☀️ ' + (cfg.regClosed ? '[1]' : '[3]') + ' หุ้น VIP รอบเช้า' + (cfg.regClosed ? ' (เปิดทำการปกติ)' : ''));
      lines.push('(นิเคอิ VIP 09:30 ➡️ จีน VIP 10:30 ➡️ ฮั่งเส็ง VIP 11:00)');
      lines.push('• การ์ดต้นทาง : ' + vipM.cardName);
      lines.push('• ฟันเด่นรูด : ' + vipM.runDigits + ' (เน้น ' + vipM.bestDigit + ')');
      lines.push('• เจาะ Top 6 : ' + vipM.top6);
      lines.push('• วินสิบ-หน่วย : ' + vipM.winPairs);
      if (win4VipM) {
        lines.push('• 🎲 เด่น 4 ตัววิน : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
      }
    }

    if (filter === 'ALL' || filter === 'VIP_AFTERNOON' || filter === 'AFTERNOON' || filter === 'VIP') {
      lines.push('');
      lines.push('🌙 ' + (cfg.regClosed ? '[2]' : '[4]') + ' หุ้น VIP รอบบ่าย' + (cfg.regClosed ? ' (เปิดทำการปกติ)' : ''));
      lines.push('(นิเคอิ VIP 13:00 ➡️ จีน VIP 14:00 ➡️ ฮั่งเส็ง VIP 15:30)');
      lines.push('• การ์ดต้นทาง : ' + vipA.cardName);
      lines.push('• ฟันเด่นรูด : ' + vipA.runDigits + ' (เน้น ' + vipA.bestDigit + ')');
      lines.push('• เจาะ Top 6 : ' + vipA.top6);
      lines.push('• วินสิบ-หน่วย : ' + vipA.winPairs);
      if (win4VipA) {
        lines.push('• 🎲 เด่น 4 ตัววิน : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
      }
    }

    if (filter === 'ALL') {
      lines.push('');
      lines.push('--------------------------------');
      lines.push('🎲 [⭐ สรุปชุดวินเด่น 4 ตัว (แยกปกติ และ VIP)]');
      if (cfg.regClosed) {
        lines.push('📌 ตลาดหุ้นปกติ: ปิดทำการเสาร์-อาทิตย์');
        lines.push('💎 หุ้น VIP:');
        lines.push('  ☀️ เช้า : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
        lines.push('  🌙 บ่าย : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
      } else {
        lines.push('🎌 หุ้นปกติ:');
        lines.push('  ☀️ เช้า : ' + win4RegM.digitsStr + ' (วิน 6 คู่: ' + win4RegM.pairsStr + ' | กลับด้วย)');
        lines.push('  🌙 บ่าย : ' + win4RegA.digitsStr + ' (วิน 6 คู่: ' + win4RegA.pairsStr + ' | กลับด้วย)');
        lines.push('💎 หุ้น VIP:');
        lines.push('  ☀️ เช้า : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
        lines.push('  🌙 บ่าย : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
      }
    } else if (filter === 'MORNING') {
      lines.push('');
      lines.push('--------------------------------');
      lines.push('🎲 [⭐ สรุปชุดวินเด่น 4 ตัว รอบเช้า (แยกปกติ และ VIP)]');
      if (cfg.regClosed) {
        lines.push('💎 หุ้น VIP (เช้า) : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
      } else {
        lines.push('🎌 หุ้นปกติ (เช้า) : ' + win4RegM.digitsStr + ' (วิน 6 คู่: ' + win4RegM.pairsStr + ' | กลับด้วย)');
        lines.push('💎 หุ้น VIP (เช้า) : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
      }
    } else if (filter === 'AFTERNOON') {
      lines.push('');
      lines.push('--------------------------------');
      lines.push('🎲 [⭐ สรุปชุดวินเด่น 4 ตัว รอบบ่าย (แยกปกติ และ VIP)]');
      if (cfg.regClosed) {
        lines.push('💎 หุ้น VIP (บ่าย) : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
      } else {
        lines.push('🎌 หุ้นปกติ (บ่าย) : ' + win4RegA.digitsStr + ' (วิน 6 คู่: ' + win4RegA.pairsStr + ' | กลับด้วย)');
        lines.push('💎 หุ้น VIP (บ่าย) : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
      }
    } else if (filter === 'REGULAR' && !cfg.regClosed) {
      lines.push('');
      lines.push('--------------------------------');
      lines.push('🎲 [⭐ สรุปชุดวินเด่น 4 ตัว หุ้นปกติ]');
      lines.push('☀️ เช้า : ' + win4RegM.digitsStr + ' (วิน 6 คู่: ' + win4RegM.pairsStr + ' | กลับด้วย)');
      lines.push('🌙 บ่าย : ' + win4RegA.digitsStr + ' (วิน 6 คู่: ' + win4RegA.pairsStr + ' | กลับด้วย)');
    } else if (filter === 'VIP') {
      lines.push('');
      lines.push('--------------------------------');
      lines.push('🎲 [⭐ สรุปชุดวินเด่น 4 ตัว หุ้น VIP]');
      lines.push('☀️ เช้า : ' + win4VipM.digitsStr + ' (วิน 6 คู่: ' + win4VipM.pairsStr + ' | กลับด้วย)');
      lines.push('🌙 บ่าย : ' + win4VipA.digitsStr + ' (วิน 6 คู่: ' + win4VipA.pairsStr + ' | กลับด้วย)');
    }

    lines.push('');
    lines.push('================================');
    lines.push('💡 กฎเหล็ก: เข้าเป้าสเต็ปไหนให้หยุดทันที!');
    lines.push('🤖 คำนวณอัตโนมัติด้วยระบบ LOTTO289');

    return lines.join('\n');
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

      const regM = getResolvedSessionData(currentDay, 'regMorning');
      const regA = getResolvedSessionData(currentDay, 'regAfternoon');
      const vipM = getResolvedSessionData(currentDay, 'vipMorning');
      const vipA = getResolvedSessionData(currentDay, 'vipAfternoon');
      const win4RegM = computeSessionWin4(currentDay, 'regMorning', regM);
      const win4RegA = computeSessionWin4(currentDay, 'regAfternoon', regA);
      const win4VipM = computeSessionWin4(currentDay, 'vipMorning', vipM);
      const win4VipA = computeSessionWin4(currentDay, 'vipAfternoon', vipA);
      const dayCfg = CHASE_SLIPS_DATA[currentDay] || CHASE_SLIPS_DATA['Fri'];

      chaseSlipModalOverlay.innerHTML = `
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
                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `
                  <button type="button" class="day-tab-btn ${currentDay === d ? 'active' : ''}" data-day="${d}" style="padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.1)'}; background: ${currentDay === d ? '#10b981' : 'rgba(255,255,255,0.05)'}; color: ${currentDay === d ? '#000000' : '#d1d5db'}; transition: all 0.2s;">
                    ${dayNames[d]} (${getDateForWeekday(d).split(' ')[0]} ${getDateForWeekday(d).split(' ')[1]})
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filter Tabs -->
            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
              ${[
                { id: 'ALL', label: '🌟 ทั้งหมด (4 รอบ)' },
                { id: 'WIN4', label: '🎲 วินเด่น 4 ตัว (เช้า-บ่าย)' },
                { id: 'MORNING', label: '☀️ รอบเช้า (ปกติ+VIP)' },
                { id: 'AFTERNOON', label: '🌙 รอบบ่าย (ปกติ+VIP)' },
                { id: 'REGULAR', label: '🎌 หุ้นปกติ' },
                { id: 'VIP', label: '💎 หุ้น VIP' }
              ].map(f => `
                <button type="button" class="filter-tab-btn ${currentFilter === f.id ? 'active' : ''}" data-filter="${f.id}" style="padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; border: 1px solid ${currentFilter === f.id ? '#06c755' : 'rgba(255,255,255,0.1)'}; background: ${currentFilter === f.id ? 'rgba(6, 199, 85, 0.2)' : 'rgba(0,0,0,0.4)'}; color: ${currentFilter === f.id ? '#34d399' : '#9ca3af'};">
                  ${f.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Visual Quick Win4 Banner -->
          <div style="margin: 12px 20px 0 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12)); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 4px;">
                🎲 ชุดวินเด่น 4 ตัว (แยกปกติ และ VIP อิสระ):
              </span>
              <span style="font-size: 10px; color: #9ca3af; font-weight: 600;">(คัดจากตัวรูดเด่น-รอง สเต็ป 1 ➡️ 2 ➡️ 3)</span>
            </div>
            ${dayCfg.regClosed ? `
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 11px; font-weight: 800; color: #c084fc;">💎 หุ้น VIP:</span>
                <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                  ☀️ เช้า: ${win4VipM ? win4VipM.digitsStr : '-'}
                </span>
                <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                  🌙 บ่าย: ${win4VipA ? win4VipA.digitsStr : '-'}
                </span>
                <span style="font-size: 10px; color: #ef4444; font-weight: 700;">(🛑 ตลาดปกติปิดเสาร์-อาทิตย์)</span>
              </div>
            ` : `
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-weight: 800; color: #34d399;">🎌 หุ้นปกติ:</span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; font-weight: 800;">
                    ☀️ เช้า: ${win4RegM ? win4RegM.digitsStr : '-'}
                  </span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; font-weight: 800;">
                    🌙 บ่าย: ${win4RegA ? win4RegA.digitsStr : '-'}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-weight: 800; color: #c084fc;">💎 หุ้น VIP:</span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                    ☀️ เช้า: ${win4VipM ? win4VipM.digitsStr : '-'}
                  </span>
                  <span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(192, 132, 252, 0.4); color: #e9d5ff; font-weight: 800;">
                    🌙 บ่าย: ${win4VipA ? win4VipA.digitsStr : '-'}
                  </span>
                </div>
              </div>
            `}
          </div>

          <!-- Body Textarea Preview -->
          <div style="padding: 16px 20px; flex: 1; overflow-y: auto;">
            <div style="position: relative;">
              <textarea id="chase-slip-textarea" readonly style="width: 100%; box-sizing: border-box; height: 260px; background: rgba(0,0,0,0.6); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px; color: #a7f3d0; font-family: monospace, system-ui; font-size: 12px; line-height: 1.5; resize: none; outline: none; box-shadow: inset 0 2px 8px rgba(0,0,0,0.6); user-select: all;">${slipText}</textarea>
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
      `;

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
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>📋 คัดลอกโพยไปวางใน LINE</span>
            `;
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
          alert('❌ การส่งล้มเหลว: ' + err.message + '\n\nท่านสามารถกดปุ่ม "📋 คัดลอกโพย" เพื่อนำไปวางใน LINE ด้วยตนเองได้ครับ');
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

      lineModalContainer.innerHTML = `
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
      `;

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

          const testMsg = '🔔 ทดสอบการแจ้งเตือนผล SystemLucky289\n\nเชื่อมต่อระบบแจ้งเตือนผลหวยเข้ากลุ่ม LINE สำเร็จเรียบร้อยแล้วครับ! 🎉🎉🎉🎉';
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
          alert('❌ การทดสอบล้มเหลว: ' + err.message + '\n\nกรุณาตรวจสอบว่าบอทถูกเชิญเข้ากลุ่มแล้ว หรือ Token ถูกต้อง');
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

    // 1. Settings button (hidden per user request: "ซ่อนเฉพาะปุ่มแจ้งไลน์ ส่งไลน์")
    const existingSettings = document.getElementById('btn-line-settings-ui');
    if (existingSettings && existingSettings.parentElement) existingSettings.remove();
    const existingSettingsJsx = document.getElementById('btn-line-settings-jsx');
    if (existingSettingsJsx && existingSettingsJsx.parentElement) existingSettingsJsx.remove();

    // 2. Chase slip button on navbar (ปุ่มโพยล่า ให้ยังคงอยู่)
    if (!document.getElementById('btn-chase-slip-nav-ui')) {
      const slipNavBtn = document.createElement('button');
      slipNavBtn.id = 'btn-chase-slip-nav-ui';
      slipNavBtn.title = 'คลิกเพื่อเปิดสรุปโพยล่า 3 หวย และคัดลอก';
      slipNavBtn.className = 'btn-line-slip-nav';
      slipNavBtn.style.cssText = 'background: linear-gradient(135deg, #10b981, #059669) !important; color: #ffffff !important; border: 1px solid #34d399 !important; font-weight: 800 !important; font-size: 12px !important; padding: 6px 14px !important; border-radius: 8px !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; cursor: pointer !important; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4) !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; transition: all 0.2s ease !important;';
      slipNavBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: #ffffff; flex-shrink: 0;">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span style="color: #ffffff !important; font-weight: 800 !important; font-size: 12px !important;">📋 โพยล่า 3 หวย</span>
      `;
      slipNavBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.openChaseSlipModal();
      };
      syncBtn.parentElement.insertBefore(slipNavBtn, syncBtn.nextSibling);
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

})();
