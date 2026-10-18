const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
let code = fs.readFileSync(targetFile, 'utf8');

const pStart = code.indexOf('const getWinningSetsHelper = (dayCode, cat, time) => {');
const pEnd = code.indexOf('const renderStockSession = (dayCode, cat, time) => {');

if (pStart === -1 || pEnd === -1) {
  console.error('getWinningSetsHelper bounds not found!');
  process.exit(1);
}

const cleanHelper = `const getWinningSetsHelper = (dayCode, cat, time) => {
    const win2D = new Set();
    const win3D = new Set();
    const win2DRounds = new Map();
    const win3DRounds = new Map();

    const timeStr = time.toLowerCase(); // "morning" or "afternoon"

    // 1. Determine targetDate for this dayCode
    let targetDate = null;
    if (O && O.length > 0 && O[0]?.date) {
      const oMatchesDay = O.some(d => d && (d.dayOfWeek === dayCode || !d.dayOfWeek));
      if (oMatchesDay) {
        targetDate = O[0].date;
      }
    }

    // Fallback: If targetDate not in O, inspect stock datasets directly for this dayCode
    if (!targetDate) {
      const probeKey = cat === "vip" ? ("lotto_data_nikkei_vip_" + timeStr) : ("lotto_data_nikkei_" + timeStr);
      let probeList = null;
      if (typeof window !== "undefined" && window.__KV_DRAWS__ && window.__KV_DRAWS__[probeKey]) {
        probeList = window.__KV_DRAWS__[probeKey];
      } else if (typeof localStorage !== "undefined") {
        try {
          const raw = localStorage.getItem(probeKey);
          if (raw) probeList = JSON.parse(raw);
        } catch(e){}
      }
      if (Array.isArray(probeList)) {
        const match = probeList.find(x => x && x.dayOfWeek === dayCode);
        if (match) targetDate = match.date;
      }
    }

    if (!targetDate || (typeof g !== "undefined" && g === true)) {
      return { win2D, win3D, win2DRounds, win3DRounds, isWaiting: true };
    }

    let hasActualResultsForSession = false;

    // Strictly check ONLY the specified session (รอบเช้า เช็คเฉพาะเช้า / รอบบ่าย เช็คเฉพาะบ่าย - ไม่ปนกัน 100%)
    ["nikkei", "china", "hangseng"].forEach(stk => {
      const key = cat === "vip" ? ("lotto_data_" + stk + "_vip_" + timeStr) : ("lotto_data_" + stk + "_" + timeStr);
      let list = null;
      if (typeof window !== "undefined" && window.__KV_DRAWS__ && window.__KV_DRAWS__[key]) {
        list = window.__KV_DRAWS__[key];
      } else if (typeof localStorage !== "undefined") {
        try {
          const raw = localStorage.getItem(key);
          if (raw) list = JSON.parse(raw);
        } catch(e){}
      }
      if (Array.isArray(list)) {
        const match = list.find(d => d && d.date === targetDate);
        if (match && match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล" && match.top3.trim() !== "") {
          hasActualResultsForSession = true;
          const sessName = (time === "Morning" ? "เช้า" : "บ่าย");
          const stkLabel = cat === "vip"
            ? (stk === "hangseng" ? "ฮั่งวี" + sessName : (stk === "china" ? "จีนวี" + sessName : "นิเคอิวี" + sessName))
            : ((stk === "china" ? "จีน" : stk === "nikkei" ? "นิเคอิ" : "ฮั่งเส็ง") + sessName);

          const m3 = match.top3.trim();
          const s3 = m3.split("").sort().join("");
          win3D.add(m3); win3D.add(s3);
          if (!win3DRounds.has(m3)) win3DRounds.set(m3, new Set());
          win3DRounds.get(m3).add(stkLabel);
          if (!win3DRounds.has(s3)) win3DRounds.set(s3, new Set());
          win3DRounds.get(s3).add(stkLabel);

          const t2 = match.top2 || (m3.length >= 2 ? m3.slice(-2) : "");
          if (t2) {
            win2D.add(t2);
            if (!win2DRounds.has(t2)) win2DRounds.set(t2, new Set());
            win2DRounds.get(t2).add(stkLabel);
          }
          if (match.bottom2 && !match.bottom2.includes("งด") && match.bottom2.trim() !== "") {
            const b2 = match.bottom2.trim();
            win2D.add(b2);
            if (!win2DRounds.has(b2)) win2DRounds.set(b2, new Set());
            win2DRounds.get(b2).add(stkLabel);
          }
        }
      }
    });

    const isWaiting = !hasActualResultsForSession;
    if (isWaiting) {
      win2D.clear();
      win3D.clear();
      win2DRounds.clear();
      win3DRounds.clear();
    }

    return { win2D, win3D, win2DRounds, win3DRounds, isWaiting };
  };

  `;

code = code.substring(0, pStart) + cleanHelper + code.substring(pEnd);
fs.writeFileSync(targetFile, code, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CN-5_2d9.js'), code, 'utf8');

console.log('Successfully replaced getWinningSetsHelper with strictly separated non-mixing logic in downloaded_target_worker and dist!');
