const fs = require('fs');

fetch('https://lotto289.paounda2021.workers.dev/api/draws')
  .then(r => r.json())
  .then(d => {
    const ds = d.datasets;

    function getWinningSetsHelperClean(dayCode, cat, time, O, a, g) {
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

      // If targetDate not in O, find from stock datasets directly
      if (!targetDate) {
        const probeKey = cat === "vip" ? ("lotto_data_nikkei_vip_" + timeStr) : ("lotto_data_nikkei_" + timeStr);
        const probeList = ds[probeKey] || [];
        const match = probeList.find(x => x && x.dayOfWeek === dayCode);
        if (match) targetDate = match.date;
      }

      if (!targetDate || (typeof g !== "undefined" && g === true)) {
        return { win2D, win3D, win2DRounds, win3DRounds, isWaiting: true };
      }

      let hasActualResultsForSession = false;

      // Strictly check ONLY the specified session (Morning or Afternoon)
      ["nikkei", "china", "hangseng"].forEach(stk => {
        const key = cat === "vip" ? ("lotto_data_" + stk + "_vip_" + timeStr) : ("lotto_data_" + stk + "_" + timeStr);
        const list = ds[key];
        if (Array.isArray(list)) {
          const match = list.find(d => d && d.date === targetDate);
          if (match && match.top3 && !match.top3.includes("งด") && match.top3 !== "กผล" && match.top3.trim() !== "") {
            hasActualResultsForSession = true;
            const stkName = (stk === "china" ? "จีน" : stk === "nikkei" ? "นิเคอิ" : (cat === "vip" ? "ฮั่งวี" : "ฮั่งเส็ง"));
            const sessName = (time === "Morning" ? "เช้า" : "บ่าย");
            const stkLabel = cat === "vip" 
              ? (stk === "hangseng" ? "ฮั่งวี" + sessName : (stk === "china" ? "จีนวี" + sessName : "นิเคอิวี" + sessName))
              : (stkName + sessName);

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
    }

    console.log('Testing Sun 18 Oct VIP Morning:');
    const vmSun = getWinningSetsHelperClean('Sun', 'vip', 'Morning', null, null, false);
    for (const [k, v] of vmSun.win2DRounds) {
      console.log('Sun VIP Morning 2D', k, '->', Array.from(v));
    }

    console.log('\nTesting Sun 18 Oct VIP Afternoon:');
    const vaSun = getWinningSetsHelperClean('Sun', 'vip', 'Afternoon', null, null, false);
    for (const [k, v] of vaSun.win2DRounds) {
      console.log('Sun VIP Afternoon 2D', k, '->', Array.from(v));
    }

    console.log('\nTesting Fri 16 Oct Regular Morning:');
    const rmFri = getWinningSetsHelperClean('Fri', 'reg', 'Morning', null, null, false);
    for (const [k, v] of rmFri.win2DRounds) {
      console.log('Fri Reg Morning 2D', k, '->', Array.from(v));
    }

    console.log('\nTesting Fri 16 Oct Regular Afternoon:');
    const raFri = getWinningSetsHelperClean('Fri', 'reg', 'Afternoon', null, null, false);
    for (const [k, v] of raFri.win2DRounds) {
      console.log('Fri Reg Afternoon 2D', k, '->', Array.from(v));
    }
  });
