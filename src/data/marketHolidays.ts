export interface MarketHoliday {
  date: string; // YYYY-MM-DD
  market: 'NIKKEI' | 'CHINA' | 'HANGSENG' | 'DOWJONES' | 'LAOS' | 'HANOI' | 'GSB' | 'GOVERNMENT';
  nameThai: string;
  nameEn: string;
  isClosed: boolean;
  note?: string;
}

export interface MarketStatusBreakdown {
  key: string;
  label: string;
  shortClosedLabel: string;
  status: 'OPEN' | 'CLOSED' | 'WEEKEND' | 'FUTURE';
  statusText: string;
  holidayName?: string;
}

export const KNOWN_MARKET_HOLIDAYS: MarketHoliday[] = [
  // 🇨🇳 จีน (SSE/SZSE) - Official Holiday Calendar 2026 (Golden Week & National Holidays)
  { date: '2026-10-01', market: 'CHINA', nameThai: 'วันชาติจีน (Golden Week)', nameEn: 'China National Day', isClosed: true },
  { date: '2026-10-02', market: 'CHINA', nameThai: 'วันชาติจีน (Golden Week)', nameEn: 'China National Day', isClosed: true },
  { date: '2026-10-05', market: 'CHINA', nameThai: 'วันชาติจีน (Golden Week)', nameEn: 'China National Day', isClosed: true },
  { date: '2026-10-06', market: 'CHINA', nameThai: 'วันชาติจีน (Golden Week)', nameEn: 'China National Day', isClosed: true },
  { date: '2026-10-07', market: 'CHINA', nameThai: 'วันชาติจีน (Golden Week)', nameEn: 'China National Day', isClosed: true },
  { date: '2026-12-31', market: 'CHINA', nameThai: 'วันหยุดตลาดหุ้นจีนส่งท้ายปี', nameEn: 'Year-end Closure', isClosed: true },

  // 🎌 นิคเคอิ (TSE Japan) - Official Tokyo Stock Exchange Holiday Calendar 2026
  { date: '2026-10-12', market: 'NIKKEI', nameThai: 'วันกีฬาแห่งชาติญี่ปุ่น (Sports Day)', nameEn: 'Sports Day Japan', isClosed: true },
  { date: '2026-11-03', market: 'NIKKEI', nameThai: 'วันวัฒนธรรมญี่ปุ่น (Culture Day)', nameEn: 'Culture Day Japan', isClosed: true },
  { date: '2026-11-23', market: 'NIKKEI', nameThai: 'วันขอบคุณแรงงานญี่ปุ่น (Labor Thanksgiving)', nameEn: 'Labor Thanksgiving Day', isClosed: true },
  { date: '2026-12-31', market: 'NIKKEI', nameThai: 'วันหยุดตลาดหุ้นญี่ปุ่นส่งท้ายปี', nameEn: 'Bank Holiday TSE', isClosed: true },

  // 🇭🇰 ฮั่งเส็ง (HKEX Hong Kong) - Official HKEX Holiday Calendar 2026
  { date: '2026-10-01', market: 'HANGSENG', nameThai: 'วันชาติฮ่องกง (National Day HK)', nameEn: 'National Day HKEX', isClosed: true },
  { date: '2026-10-19', market: 'HANGSENG', nameThai: 'เทศกาลชุงหยาง (Chung Yeung Festival)', nameEn: 'Chung Yeung Festival', isClosed: true },
  { date: '2026-12-25', market: 'HANGSENG', nameThai: 'วันคริสต์มาส (Christmas Day)', nameEn: 'Christmas Day', isClosed: true },
  { date: '2026-12-26', market: 'HANGSENG', nameThai: 'วัน Boxing Day', nameEn: 'Boxing Day', isClosed: true },

  // 🇺🇸 ดาวโจนส์ (NYSE US) - Official NYSE Holiday Calendar 2026
  { date: '2026-11-26', market: 'DOWJONES', nameThai: 'วันขอบคุณพระเจ้าสหรัฐฯ (Thanksgiving)', nameEn: 'Thanksgiving Day NYSE', isClosed: true },
  { date: '2026-12-25', market: 'DOWJONES', nameThai: 'วันคริสต์มาสสหรัฐฯ (Christmas Day)', nameEn: 'Christmas Day NYSE', isClosed: true }
];

export const getSpecificMarketHoliday = (isoDate: string, market: 'NIKKEI' | 'CHINA' | 'HANGSENG' | 'DOWJONES' | 'LAOS' | 'HANOI' | 'GSB' | 'GOVERNMENT'): MarketHoliday | undefined => {
  return KNOWN_MARKET_HOLIDAYS.find(h => h.date === isoDate && h.market === market);
};

export const getMarketHolidayInfo = (isoDate: string, lotteryType: string, session?: string): MarketHoliday | undefined => {
  let targetMarket: 'NIKKEI' | 'CHINA' | 'HANGSENG' | 'DOWJONES' | 'LAOS' | 'HANOI' | 'GSB' | 'GOVERNMENT' = 'NIKKEI';
  if (lotteryType === 'CHINA' || (session && session.includes('CHINA'))) {
    targetMarket = 'CHINA';
  } else if (lotteryType === 'HANGSENG' || (session && session.includes('HANGSENG'))) {
    targetMarket = 'HANGSENG';
  } else if (lotteryType === 'DOWJONES') {
    targetMarket = 'DOWJONES';
  } else if (lotteryType === 'LAOS') {
    targetMarket = 'LAOS';
  } else if (lotteryType === 'HANOI') {
    targetMarket = 'HANOI';
  } else if (lotteryType === 'GSB') {
    targetMarket = 'GSB';
  } else if (lotteryType === 'GOVERNMENT') {
    targetMarket = 'GOVERNMENT';
  } else {
    targetMarket = 'NIKKEI';
  }

  return KNOWN_MARKET_HOLIDAYS.find(h => h.date === isoDate && h.market === targetMarket);
};

export const getPerMarketStatusBreakdown = (
  isoDate: string,
  dayOfWeekIdx: number,
  lotteryType: string,
  drawsForDayMap: Map<string, boolean>,
  latestDataIsoDate: string = '2026-10-02'
): MarketStatusBreakdown[] => {
  const isWeekend = (dayOfWeekIdx === 0 || dayOfWeekIdx === 6);
  const dayNum = parseInt(isoDate.split('-')[2] || '0', 10);

  if (lotteryType === 'LAOS') {
    const isLaosDay = (dayOfWeekIdx >= 1 && dayOfWeekIdx <= 5);
    return [{
      key: 'LAOS',
      label: '🇱🇦 ลาวพัฒนา',
      shortClosedLabel: 'ลาวงดออกรางวัล',
      status: isLaosDay ? 'OPEN' : 'WEEKEND',
      statusText: isLaosDay ? '🟢 เปิดออกรางวัล (จ.-ศ.)' : '⏸️ วันหยุดเสาร์-อาทิตย์'
    }];
  }

  if (lotteryType === 'STOCK_VIP') {
    return [
      { key: 'NIKKEI_VIP', label: '💎🎌 นิเคอิ VIP', shortClosedLabel: 'นิเคอิ VIP ปิด', status: 'OPEN', statusText: '🟢 เปิดออกรางวัลทุกวัน' },
      { key: 'CHINA_VIP', label: '💎🇨🇳 จีน VIP', shortClosedLabel: 'จีน VIP ปิด', status: 'OPEN', statusText: '🟢 เปิดออกรางวัลทุกวัน' },
      { key: 'HANGSENG_VIP', label: '💎🇭🇰 ฮั่งเส็ง VIP', shortClosedLabel: 'ฮั่งเส็ง VIP ปิด', status: 'OPEN', statusText: '🟢 เปิดออกรางวัลทุกวัน' }
    ];
  }

  if (lotteryType === 'HANOI') {
    return [
      { key: 'HANOI_SPECIAL', label: '🇻🇳 พิเศษ (17:30)', shortClosedLabel: 'ฮานอยพิเศษปิด', status: 'OPEN', statusText: '🟢 เปิด' },
      { key: 'HANOI_EVENING', label: '🇻🇳 ปกติ (18:30)', shortClosedLabel: 'ฮานอยปกติต่างปิด', status: 'OPEN', statusText: '🟢 เปิด' },
      { key: 'HANOI_VIP', label: '🇻🇳 VIP (19:30)', shortClosedLabel: 'ฮานอย VIP ปิด', status: 'OPEN', statusText: '🟢 เปิด' }
    ];
  }

  if (lotteryType === 'DOWJONES') {
    const holiday = getSpecificMarketHoliday(isoDate, 'DOWJONES');
    if (isWeekend) {
      return [{ key: 'DOWJONES', label: '🇺🇸 ดาวโจนส์', shortClosedLabel: 'ดาวโจนส์ปิด', status: 'WEEKEND', statusText: '⏸️ วันหยุดเสาร์-อาทิตย์' }];
    }
    if (holiday) {
      return [{ key: 'DOWJONES', label: '🇺🇸 ดาวโจนส์', shortClosedLabel: 'ดาวโจนส์ปิด', status: 'CLOSED', statusText: `🔴 ปิด (${holiday.nameThai})`, holidayName: holiday.nameThai }];
    }
    return [{ key: 'DOWJONES', label: '🇺🇸 ดาวโจนส์', shortClosedLabel: 'ดาวโจนส์ปิด', status: 'OPEN', statusText: '🟢 เปิดทำการ' }];
  }

  if (lotteryType === 'GSB' || lotteryType === 'GOVERNMENT') {
    const isDrawDay = (dayNum === 1 || dayNum === 16);
    const label = lotteryType === 'GSB' ? '🏦 ออมสิน' : '🇹🇭 รัฐบาลไทย';
    const shortClosedLabel = lotteryType === 'GSB' ? 'ออมสินงดออกรางวัล' : 'รัฐบาลงดออกรางวัล';
    return [{
      key: lotteryType,
      label,
      shortClosedLabel,
      status: isDrawDay ? 'OPEN' : 'CLOSED',
      statusText: isDrawDay ? '🟢 เปิดออกรางวัล' : '⏸️ งดออกรางวัล'
    }];
  }

  // Stock lotteries: Nikkei, China, Hang Seng
  const markets: Array<{ key: 'NIKKEI' | 'CHINA' | 'HANGSENG'; label: string; shortClosedLabel: string }> = [
    { key: 'NIKKEI', label: '🎌 นิเคอิ', shortClosedLabel: 'นิเคอิปิด' },
    { key: 'CHINA', label: '🇨🇳 จีน', shortClosedLabel: 'จีนปิด' },
    { key: 'HANGSENG', label: '🇭🇰 ฮั่งเส็ง', shortClosedLabel: 'ฮั่งเส็งปิด' }
  ];

  return markets.map(m => {
    const holiday = getSpecificMarketHoliday(isoDate, m.key);
    const hasDraw = drawsForDayMap.get(m.key) || false;

    if (isWeekend) {
      return {
        key: m.key,
        label: m.label,
        shortClosedLabel: m.shortClosedLabel,
        status: 'WEEKEND',
        statusText: '⏸️ หยุด'
      };
    }

    if (holiday) {
      return {
        key: m.key,
        label: m.label,
        shortClosedLabel: m.shortClosedLabel,
        status: 'CLOSED',
        statusText: `🔴 ปิด (${holiday.nameThai})`,
        holidayName: holiday.nameThai
      };
    }

    if (hasDraw) {
      return {
        key: m.key,
        label: m.label,
        shortClosedLabel: m.shortClosedLabel,
        status: 'OPEN',
        statusText: '🟢 เปิด'
      };
    }

    // Past weekday without draw data (e.g. China on Oct 1 & Oct 2, Hang Seng on Oct 1)
    if (isoDate <= latestDataIsoDate) {
      return {
        key: m.key,
        label: m.label,
        shortClosedLabel: m.shortClosedLabel,
        status: 'CLOSED',
        statusText: '🔴 ปิด (งดออกผล)',
        holidayName: 'ตลาดปิดทำการ / งดออกผล'
      };
    }

    // Future weekday without holiday declaration
    return {
      key: m.key,
      label: m.label,
      shortClosedLabel: m.shortClosedLabel,
      status: 'OPEN',
      statusText: '🟢 เปิด'
    };
  });
};
