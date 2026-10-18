const fs = require('fs');

async function testRenderAllDays() {
  const res = await fetch('https://lotto289.paounda2021.workers.dev/api/draws');
  const json = await res.json();
  const ds = json.datasets;

  const a = [
    ...(ds['lotto_data_nikkei_vip_morning'] || []),
    ...(ds['lotto_data_china_vip_morning'] || []),
    ...(ds['lotto_data_hangseng_vip_morning'] || []),
    ...(ds['lotto_data_nikkei_vip_afternoon'] || []),
    ...(ds['lotto_data_china_vip_afternoon'] || []),
    ...(ds['lotto_data_hangseng_vip_afternoon'] || [])
  ];

  const x = P => P === "HANGSENG_VIP_AFTERNOON" ? 6 : P === "CHINA_VIP_AFTERNOON" ? 5 : P === "NIKKEI_VIP_AFTERNOON" ? 4 : P === "HANGSENG_VIP_MORNING" ? 3 : P === "CHINA_VIP_MORNING" ? 2 : P === "NIKKEI_VIP_MORNING" ? 1 : 99;
  a.sort((P, B) => {
    const C = B.date.localeCompare(P.date);
    return C !== 0 ? C : x(P.session) - x(B.session);
  });

  const N = a.find(b => !!(b.top3 && b.top3.trim() !== ""));
  const i = "Sun"; // active day

  const d0 = (e, t, o) => {
    if (!e || e.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
    const a = e[0].date;
    if (t === "ALL") return { draws: e.filter(N => N.date === a), isFuture: false, isAllRecorded: true };
    if (o && t === o) {
      const s = e[0];
      if (s.dayOfWeek !== t || !s.top3 || s.top3.trim() === "") return { draws: [], isFuture: true, isAllRecorded: false };
    }
    const i = Array.from(new Set(e.filter(s => s.dayOfWeek === t && !!(s.top3 && s.top3.trim() !== "")).map(s => s.date)));
    if (i.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };
    const r = i[0], d = e.filter(s => s.date === r), l = d.length > 0 && d.every(s => !!(s.top3 && s.top3.trim() !== ""));
    return { draws: d, isFuture: false, isAllRecorded: l };
  };

  // Test when user clicks each day
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(dayCode => {
    // When user clicks dayCode, p(dayCode):
    const r = dayCode;
    let l = "NEXT";
    if (dayCode === i) l = "NEXT";
    else if (N && N.dayOfWeek && dayCode === N.dayOfWeek) l = "VERIFY";

    const { draws: O, isFuture: g } = d0(a, r, i);

    // Run getWinningSetsHelper logic
    const isGlobalNext = (l === "NEXT") || (typeof g !== "undefined" && g === true);

    let targetDate = null;
    if (l === "VERIFY" && N && N.date) {
      targetDate = N.date;
    } else if (!isGlobalNext && O && O.length > 0 && O[0]?.date) {
      const oMatchesDay = O.some(d => d && (d.dayOfWeek === dayCode || (d.date && !d.dayOfWeek)));
      if (oMatchesDay) {
        targetDate = O[0].date;
      }
    }

    console.log(`\n--- Day: ${dayCode} ---`);
    console.log(`l=${l}, g=${g}, O.len=${O.length}, targetDate=${targetDate}`);

    ['Morning', 'Afternoon'].forEach(time => {
      let isWaiting = false;
      const win2D = new Set();
      const win3D = new Set();
      if (!targetDate) {
        isWaiting = true;
      } else {
        let hasActualResultsForSession = false;
        const allDraws = (O || []).concat(a || []);
        allDraws.forEach(dr => {
          if (!dr || dr.date !== targetDate) return;
          const isVip = dr.session?.includes("VIP") || dr.lotteryType?.includes("VIP");
          const isM = dr.session?.includes("MORNING") || dr.session === "MORNING";
          const isA = dr.session?.includes("AFTERNOON") || dr.session === "AFTERNOON";
          if (isVip && (time === "Morning" ? isM : isA)) {
            if (dr.top3 && !dr.top3.includes("งด") && dr.top3 !== "กผล" && dr.top3.trim() !== "") {
              hasActualResultsForSession = true;
              win3D.add(dr.top3); win3D.add(dr.top3.split("").sort().join(""));
              const t2 = dr.top2 || (dr.top3.length >= 2 ? dr.top3.slice(-2) : "");
              if (t2) win2D.add(t2);
            }
            if (dr.bottom2 && !dr.bottom2.includes("งด") && dr.bottom2.trim() !== "") {
              win2D.add(dr.bottom2);
            }
          }
        });
        isWaiting = !hasActualResultsForSession;
      }
      console.log(`  ${time}: isWaiting=${isWaiting}, win2D=[${Array.from(win2D).join(', ')}]`);
    });
  });
}

testRenderAllDays();
