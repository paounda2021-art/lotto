import React, { useState, useEffect, useMemo } from 'react';
import { DrawResult, LotteryType } from '../types';
import { analyzeDayOfWeekStats } from '../utils/calculator';
import { Calendar, Flame, Zap, Award, CheckCircle2 } from 'lucide-react';
import { getPerMarketStatusBreakdown } from '../data/marketHolidays';

interface DayOfWeekAnalyzerProps {
  data: DrawResult[];
  allData?: DrawResult[];
  lotteryType: LotteryType;
}

const formatIsoDateToThai = (isoDate: string): string => {
  if (!isoDate) return '';
  const monthNamesShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const parts = isoDate.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const day = String(parts[2]).padStart(2, '0');
    const month = monthNamesShort[parts[1] - 1] || '';
    const yearBE = parts[0] + 543;
    return `${day} ${month} ${yearBE}`;
  }
  return isoDate;
};

const getTargetIsoDateForDay = (allData: DrawResult[], activeDay: string): string => {
  if (!allData || allData.length === 0) return '2026-10-05';

  const latestDate = allData[0].date || '2026-10-02';
  const parts = latestDate.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return latestDate;
  }

  // Calculate upcoming target date starting from latest recorded date + 1 day
  const dObj = new Date(parts[0], parts[1] - 1, parts[2] + 1);
  const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 14; i++) {
    const code = dayCodes[dObj.getDay()];
    if (activeDay === 'ALL' || code === activeDay) {
      const y = dObj.getFullYear();
      const m = String(dObj.getMonth() + 1).padStart(2, '0');
      const d = String(dObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    dObj.setDate(dObj.getDate() + 1);
  }

  return latestDate;
};

const getNextTargetDayCode = (allData: DrawResult[], lotteryType?: LotteryType): string => {
  const fallbackDay = lotteryType === 'NIKKEI' ? 'Mon' : 'Sat';
  if (!allData || allData.length === 0) return fallbackDay;
  const latest = allData[0];
  if (!latest) return fallbackDay;

  const hasRecordedResult = Boolean(latest.top3 && latest.top3.trim() !== '');

  let targetDateObj: Date | null = null;

  if (latest.date) {
    const parts = latest.date.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      targetDateObj = new Date(parts[0], parts[1] - 1, parts[2] + (hasRecordedResult ? 1 : 0));
    }
  }

  if (targetDateObj) {
    if (lotteryType === 'NIKKEI' || lotteryType === 'LAOS' || lotteryType === 'DOWJONES') {
      while (targetDateObj.getDay() === 0 || targetDateObj.getDay() === 6) {
        targetDateObj.setDate(targetDateObj.getDate() + 1);
      }
    }
    const dayNum = targetDateObj.getDay();
    const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayCodes[dayNum] || fallbackDay;
  }

  if (latest.dayOfWeek) {
    return latest.dayOfWeek;
  }

  return fallbackDay;
};

const getTargetDayDraws = (
  allData: DrawResult[],
  targetDay: string,
  nextTargetDay?: string
) => {
  if (!allData || allData.length === 0) return { draws: [], isFuture: true, isAllRecorded: false };

  const latestRecordedDate = allData[0].date;

  if (targetDay === 'ALL') {
    const draws = allData.filter((d) => d.date === latestRecordedDate);
    return { draws, isFuture: false, isAllRecorded: true };
  }

  if (nextTargetDay && targetDay === nextTargetDay) {
    const latestDraw = allData[0];
    if (latestDraw.dayOfWeek !== targetDay || !latestDraw.top3 || latestDraw.top3.trim() === '') {
      return { draws: [], isFuture: true, isAllRecorded: false };
    }
  }

  const matchingDates = Array.from(
    new Set(
      allData
        .filter((d) => d.dayOfWeek === targetDay && Boolean(d.top3 && d.top3.trim() !== ''))
        .map((d) => d.date)
    )
  );

  if (matchingDates.length === 0) {
    return { draws: [], isFuture: true, isAllRecorded: false };
  }

  const targetDate = matchingDates[0];
  const draws = allData.filter((d) => d.date === targetDate);
  const isAllRecorded = draws.length > 0 && draws.every((d) => Boolean(d.top3 && d.top3.trim() !== ''));

  return { draws, isFuture: false, isAllRecorded };
};

const SESSION_CHRONO_ORDER: Record<string, number> = {
  NIKKEI_MORNING: 1,
  MORNING: 1,
  CHINA_MORNING: 2,
  HANGSENG_MORNING: 3,
  NIKKEI_AFTERNOON: 4,
  AFTERNOON: 4,
  CHINA_AFTERNOON: 5,
  HANGSENG_AFTERNOON: 6,
  NIKKEI_VIP_MORNING: 1,
  CHINA_VIP_MORNING: 2,
  HANGSENG_VIP_MORNING: 3,
  NIKKEI_VIP_AFTERNOON: 4,
  CHINA_VIP_AFTERNOON: 5,
  HANGSENG_VIP_AFTERNOON: 6,
  HANOI_SPECIAL: 10,
  HANOI_EVENING: 11,
  HANOI_VIP: 12,
};

const STOCK_SESSION_MAP: Record<string, { label: string; badgeColor: string }> = {
  NIKKEI_MORNING: { label: '☀️ นิเคอิ เช้า', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  MORNING: { label: '☀️ นิเคอิ เช้า', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  NIKKEI_AFTERNOON: { label: '🌤️ นิเคอิ บ่าย', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  AFTERNOON: { label: '🌤️ นิเคอิ บ่าย', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  CHINA_MORNING: { label: '🧧 จีน เช้า', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  CHINA_AFTERNOON: { label: '🏮 จีน บ่าย', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  HANGSENG_MORNING: { label: '🐉 ฮั่งเส็ง เช้า', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  HANGSENG_AFTERNOON: { label: '🏛️ ฮั่งเส็ง บ่าย', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  NIKKEI_VIP_MORNING: { label: '💎 นิเคอิ VIP เช้า', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  NIKKEI_VIP_AFTERNOON: { label: '💎 นิเคอิ VIP บ่าย', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  CHINA_VIP_MORNING: { label: '🏮 จีน VIP เช้า', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  CHINA_VIP_AFTERNOON: { label: '🏮 จีน VIP บ่าย', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  HANGSENG_VIP_MORNING: { label: '🏛️ ฮั่งเส็ง VIP เช้า', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  HANGSENG_VIP_AFTERNOON: { label: '🏛️ ฮั่งเส็ง VIP บ่าย', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
};

const getHanoiHitsForDigit = (digit: number | string, targetDraws: DrawResult[]) => {
  if (digit === undefined || digit === null || !targetDraws || targetDraws.length === 0) return [];
  const digitStr = digit.toString();
  const hits: { session: string; shortLabel: string; winningNumbers: string; badgeColor: string }[] = [];

  targetDraws.forEach((d) => {
    const top3Str = d.top3 || '';
    const top2Str = d.top2 || (d.top3 ? d.top3.slice(1) : '');
    const bottom2Str = d.bottom2 || '';
    const matched: string[] = [];
    if (top2Str && top2Str.includes(digitStr)) matched.push(`บน ${top2Str}`);
    if (bottom2Str && bottom2Str.includes(digitStr)) matched.push(`ล่าง ${bottom2Str}`);

    if (matched.length > 0) {
      const configMap: Record<string, { label: string; color: string }> = {
        HANOI_SPECIAL: { label: '🟠 พิเศษ', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
        HANOI_EVENING: { label: '🔴 ปกติ', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
        HANOI_VIP: { label: '🟣 VIP', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
      };
      const cfg = configMap[d.session] || { label: 'ฮานอย', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      hits.push({
        session: d.session || d.id,
        shortLabel: cfg.label,
        winningNumbers: matched.join(', '),
        badgeColor: cfg.color
      });
    }
  });

  hits.sort((a, b) => {
    const orderA = SESSION_CHRONO_ORDER[a.session] || 99;
    const orderB = SESSION_CHRONO_ORDER[b.session] || 99;
    return orderA - orderB;
  });

  return hits;
};

const getNikkeiHitsForDigit = (digit: number | string, targetDraws: DrawResult[]) => {
  if (digit === undefined || digit === null || !targetDraws || targetDraws.length === 0) return [];
  const digitStr = digit.toString();
  const hits: { session: string; shortLabel: string; winningNumbers: string; badgeColor: string }[] = [];

  targetDraws.forEach((d) => {
    const top3Str = d.top3 || '';
    const top2Str = d.top2 || (d.top3 ? d.top3.slice(1) : '');
    const bottom2Str = d.bottom2 || '';
    const matched: string[] = [];
    if (top2Str && top2Str.includes(digitStr)) matched.push(`บน ${top2Str}`);
    if (bottom2Str && bottom2Str.includes(digitStr)) matched.push(`ล่าง ${bottom2Str}`);

    if (matched.length > 0) {
      const sessConfig = (d.session && STOCK_SESSION_MAP[d.session]) || {
        label: 'หุ้น',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
      hits.push({
        session: d.session || d.id,
        shortLabel: sessConfig.label,
        winningNumbers: matched.join(', '),
        badgeColor: sessConfig.badgeColor
      });
    }
  });

  hits.sort((a, b) => {
    const orderA = SESSION_CHRONO_ORDER[a.session] || 99;
    const orderB = SESSION_CHRONO_ORDER[b.session] || 99;
    return orderA - orderB;
  });

  return hits;
};

const getHanoiHitsForPair = (pair: string, targetDraws: DrawResult[]) => {
  if (!pair || !targetDraws || targetDraws.length === 0) return [];
  const rev = pair.split('').reverse().join('');
  const hits: { session: string; shortLabel: string; position: string; badgeColor: string }[] = [];

  targetDraws.forEach((d) => {
    const matched: string[] = [];
    const top2Str = d.top2 || (d.top3 ? d.top3.slice(1) : '');
    const bottom2Str = d.bottom2 || '';

    if (top2Str === pair || top2Str === rev) matched.push(`บน ${top2Str}`);
    if (bottom2Str === pair || bottom2Str === rev) matched.push(`ล่าง ${bottom2Str}`);

    if (matched.length > 0) {
      const configMap: Record<string, { label: string; color: string }> = {
        HANOI_SPECIAL: { label: '🟠 พิเศษ', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
        HANOI_EVENING: { label: '🔴 ปกติ', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
        HANOI_VIP: { label: '🟣 VIP', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
      };
      const cfg = configMap[d.session] || { label: 'ฮานอย', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      hits.push({
        session: d.session || d.id,
        shortLabel: cfg.label,
        position: matched.join(', '),
        badgeColor: cfg.color
      });
    }
  });

  hits.sort((a, b) => {
    const orderA = SESSION_CHRONO_ORDER[a.session] || 99;
    const orderB = SESSION_CHRONO_ORDER[b.session] || 99;
    return orderA - orderB;
  });

  return hits;
};

const getStockHitsForPair = (pair: string, targetDraws: DrawResult[]) => {
  if (!pair || !targetDraws || targetDraws.length === 0) return [];
  const rev = pair.split('').reverse().join('');
  const hits: { session: string; shortLabel: string; position: string; badgeColor: string }[] = [];

  targetDraws.forEach((d) => {
    const matched: string[] = [];
    if (d.top2 === pair || d.top2 === rev) matched.push('บน');
    if (d.bottom2 === pair || d.bottom2 === rev) matched.push('ล่าง');

    if (matched.length > 0) {
      const sessConfig = (d.session && STOCK_SESSION_MAP[d.session]) || {
        label: 'หุ้น',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
      hits.push({
        session: d.session || d.id,
        shortLabel: sessConfig.label,
        position: matched.join(', '),
        badgeColor: sessConfig.badgeColor
      });
    }
  });

  hits.sort((a, b) => {
    const orderA = SESSION_CHRONO_ORDER[a.session] || 99;
    const orderB = SESSION_CHRONO_ORDER[b.session] || 99;
    return orderA - orderB;
  });

  return hits;
};

export const DayOfWeekAnalyzer: React.FC<DayOfWeekAnalyzerProps> = ({ data, allData, lotteryType }) => {
  const fullDataset = useMemo(() => allData || data, [allData, data]);

  const expectedSessionCount = useMemo(() => {
    if (lotteryType === 'HANOI') return 3;
    if (lotteryType === 'STOCKS_VIP') {
      const hasChina = fullDataset.some((d) => d.session === 'CHINA_VIP_MORNING' || d.session === 'CHINA_VIP_AFTERNOON');
      const hasHangseng = fullDataset.some((d) => d.session === 'HANGSENG_VIP_MORNING' || d.session === 'HANGSENG_VIP_AFTERNOON');
      if (hasChina && hasHangseng) return 6;
      return 2;
    }
    if (lotteryType === 'NIKKEI') {
      const hasChina = fullDataset.some((d) => d.session === 'CHINA_MORNING' || d.session === 'CHINA_AFTERNOON');
      const hasHangseng = fullDataset.some((d) => d.session === 'HANGSENG_MORNING' || d.session === 'HANGSENG_AFTERNOON');
      if (hasChina && hasHangseng) return 6;
      return 2;
    }
    return 1;
  }, [fullDataset, lotteryType]);

  const nextTargetDay = useMemo(() => getNextTargetDayCode(fullDataset, lotteryType), [fullDataset, lotteryType]);
  const [activeDay, setActiveDay] = useState<string>(nextTargetDay);
  const [viewMode, setViewMode] = useState<'VERIFY' | 'NEXT'>('VERIFY');

  // Draws on target date for hit verification fetched from fullDataset (includes all 3 Hanoi sessions on target date)!
  const { draws: targetDraws, isFuture, isAllRecorded } = getTargetDayDraws(fullDataset, activeDay, nextTargetDay);
  const targetRecordedDate = targetDraws.length > 0 && targetDraws.some(d => Boolean(d.top3 && d.top3.trim() !== '')) ? targetDraws[0].date : undefined;

  const handleSelectDay = (dayCode: string) => {
    setActiveDay(dayCode);
    const { draws } = getTargetDayDraws(fullDataset, dayCode, nextTargetDay);
    const hasRecorded = draws.length > 0 && draws.some((d) => Boolean(d.top3 && d.top3.trim() !== ''));
    setViewMode(hasRecorded ? 'VERIFY' : 'NEXT');
  };

  // Compute prediction dataset according to viewMode & targetRecordedDate
  const predictionData = useMemo(() => {
    if (targetRecordedDate && viewMode === 'VERIFY') {
      // Exclude targetRecordedDate so today's prediction is NOT contaminated by today's own results!
      return data.filter((d) => d.date !== targetRecordedDate);
    }
    return data;
  }, [data, targetRecordedDate, viewMode]);

  // Report (TOP 5 single digits and TOP 6 2D pairs) computed STRICTLY from predictionData!
  const report = useMemo(() => analyzeDayOfWeekStats(predictionData, activeDay), [predictionData, activeDay]);

  const isHanoiAllRecorded = targetDraws.length > 0 && targetDraws.every((d) => Boolean(d.top3 && d.top3.trim() !== ''));

  const isNikkeiAllRecorded = targetDraws.length > 0 && targetDraws.every((d) => Boolean(d.top3 && d.top3.trim() !== ''));

  const targetIsoDate = useMemo(() => getTargetIsoDateForDay(data, activeDay), [data, activeDay]);
  const targetDayOfWeekIdx = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(activeDay), [activeDay]);

  const closedMarkets = useMemo(() => {
    const drawsForDayMap = new Map<string, boolean>();
    targetDraws.forEach((dr) => {
      if (dr.session.includes('NIKKEI') || dr.session === 'MORNING' || dr.session === 'AFTERNOON') drawsForDayMap.set('NIKKEI', true);
      if (dr.session.includes('CHINA')) drawsForDayMap.set('CHINA', true);
      if (dr.session.includes('HANGSENG')) drawsForDayMap.set('HANGSENG', true);
    });
    const breakdown = getPerMarketStatusBreakdown(
      targetIsoDate,
      targetDayOfWeekIdx >= 0 ? targetDayOfWeekIdx : 1,
      lotteryType,
      drawsForDayMap,
      data[0]?.date || '2026-10-02'
    );
    return breakdown.filter((b) => b.status === 'CLOSED');
  }, [targetIsoDate, targetDayOfWeekIdx, lotteryType, targetDraws, data]);

  const daysList = (lotteryType === 'NIKKEI' || lotteryType === 'LAOS' || lotteryType === 'DOWJONES') ? [
    { code: 'Mon', label: 'วันจันทร์', color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 hover:border-yellow-400' },
    { code: 'Tue', label: 'วันอังคาร', color: 'from-pink-500/20 to-rose-400/20 text-pink-300 border-pink-500/40 hover:border-pink-400' },
    { code: 'Wed', label: 'วันพุธ', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400' },
    { code: 'Thu', label: 'วันพฤหัสบดี', color: 'from-orange-500/20 to-amber-600/20 text-orange-300 border-orange-500/40 hover:border-orange-400' },
    { code: 'Fri', label: 'วันศุกร์', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400' },
    { code: 'ALL', label: 'รวมทุกวัน', color: 'from-gray-700/40 to-gray-800/40 text-gray-200 border-gray-600/50 hover:border-gray-400' }
  ] : [
    { code: 'Sat', label: 'วันเสาร์', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400' },
    { code: 'Sun', label: 'วันอาทิตย์', color: 'from-red-500/20 to-rose-500/20 text-red-300 border-red-500/40 hover:border-red-400' },
    { code: 'Mon', label: 'วันจันทร์', color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 hover:border-yellow-400' },
    { code: 'Tue', label: 'วันอังคาร', color: 'from-pink-500/20 to-rose-400/20 text-pink-300 border-pink-500/40 hover:border-pink-400' },
    { code: 'Wed', label: 'วันพุธ', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400' },
    { code: 'Thu', label: 'วันพฤหัสบดี', color: 'from-orange-500/20 to-amber-600/20 text-orange-300 border-orange-500/40 hover:border-orange-400' },
    { code: 'Fri', label: 'วันศุกร์', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400' },
    { code: 'ALL', label: 'รวมทุกวัน', color: 'from-gray-700/40 to-gray-800/40 text-gray-200 border-gray-600/50 hover:border-gray-400' }
  ];

  const renderDigitHits = (digit?: number | string) => {
    if (digit === undefined || digit === null) return null;

    if (isFuture || targetDraws.length === 0 || viewMode === 'NEXT') {
      return (
        <span className="text-[9px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
          ⏳ รอผลออกรางวัล
        </span>
      );
    }

    if (lotteryType === 'HANOI') {
      const hits = getHanoiHitsForDigit(digit, targetDraws);
      if (hits.length === 0) {
        if (!isHanoiAllRecorded) {
          return (
            <span className="text-[9px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              ⏳ รอผล
            </span>
          );
        }
        return (
          <span className="text-[9px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
            ❌ ไม่เข้า
          </span>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          {hits.map((h) => (
            <span
              key={h.session}
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1 ${h.badgeColor}`}
            >
              ✓ {h.shortLabel} <strong className="text-white font-mono">[{h.winningNumbers}]</strong>
            </span>
          ))}
        </div>
      );
    } else if (lotteryType === 'NIKKEI' || lotteryType === 'STOCKS_VIP') {
      const hits = getNikkeiHitsForDigit(digit, targetDraws);
      if (hits.length === 0) {
        if (!isAllRecorded) {
          return (
            <span className="text-[9px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              ⏳ รอผล
            </span>
          );
        }
        return (
          <span className="text-[9px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
            ❌ ไม่เข้า
          </span>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center gap-1">
          {hits.map((h) => (
            <span
              key={h.session}
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1 ${h.badgeColor}`}
            >
              ✓ {h.shortLabel} <strong className="text-white font-mono">[{h.winningNumbers}]</strong>
            </span>
          ))}
        </div>
      );
    } else {
      const latest = targetDraws[0];
      const top2Str = latest ? (latest.top2 || (latest.top3 ? latest.top3.slice(1) : '')) : '';
      const bottom2Str = latest ? (latest.bottom2 || '') : '';
      const matched: string[] = [];
      if (latest) {
        if (top2Str && top2Str.includes(digit.toString())) matched.push(`บน ${top2Str}`);
        if (bottom2Str && bottom2Str.includes(digit.toString())) matched.push(`ล่าง ${bottom2Str}`);
      }
      return matched.length > 0 ? (
        <span className="text-[9px] text-emerald-300 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
          ✓ เข้าเป้าล่าสุด <strong className="text-white font-mono">[{matched.join(', ')}]</strong>
        </span>
      ) : (
        <span className="text-[9px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
          ❌ ไม่เข้า
        </span>
      );
    }
  };

  return (
    <div className="bg-nikkei-card border-2 border-amber-500/40 rounded-2xl p-5 shadow-glow-gold space-y-5">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nikkei-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              📊 สถิติเลขออกซ้ำรายวันสัปดาห์
            </span>
            <h3 className="text-lg font-extrabold text-white">
              สรุปสถิติเลข 1 ตัว และ 2 ตัวที่ออกซ้ำประจำวัน (ย้อนหลัง 3 เดือน)
            </h3>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            คัดกรองตัวเลขสถิติออกซ้ำเฉพาะวัน เช่น เลือก "วันเสาร์" ระบบจะประมวลผลสถิติเลข 1 ตัวและเลข 2 ตัวที่ออกบ่อยที่สุดในวันเสาร์ย้อนหลัง 3 เดือนให้ทันที
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs shrink-0 self-start sm:self-auto">
          จำนวนงวดที่สแกน: <span className="text-white font-black text-sm">{report.totalDrawsOnDay}</span> งวด ({report.dayName})
        </div>
      </div>

      {/* Day Selector Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            กดเลือกวันประจำสัปดาห์ที่ต้องการดูสถิติ:
          </label>
          <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1 animate-pulse">
            ✨ สแกนวันงวดถัดไปให้อัตโนมัติ ({daysList.find(d => d.code === nextTargetDay)?.label})
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
          {daysList.map((item) => {
            const isNextTarget = item.code === nextTargetDay;
            const isActive = activeDay === item.code;

            return (
              <button
                key={item.code}
                onClick={() => handleSelectDay(item.code)}
                className={`relative py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm border transition-all duration-300 bg-gradient-to-br shadow-sm cursor-pointer ${
                  item.color
                } ${
                  isNextTarget
                    ? 'ring-4 ring-amber-400 border-2 border-yellow-300 shadow-[0_0_25px_rgba(251,191,36,0.95)] animate-pulse scale-[1.05] z-10 font-black'
                    : isActive
                    ? 'ring-2 ring-amber-400 scale-[1.02] shadow-glow-gold brightness-125 font-black'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {isNextTarget && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-yellow-200 shadow-glow-gold uppercase tracking-tight flex items-center gap-0.5 whitespace-nowrap animate-bounce z-20">
                    ✨ งวดถัดไป
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher Bar when targetRecordedDate exists */}
      {targetRecordedDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-nikkei-dark/90 p-2.5 rounded-xl border border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              📌 เลือกโหมดแสดงสถิติล่าสุด / งวดถัดไป:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('VERIFY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                viewMode === 'VERIFY'
                  ? 'bg-amber-400 text-black border-yellow-200 shadow-glow-gold scale-[1.02]'
                  : 'bg-nikkei-card text-gray-300 border-gray-600/60 hover:text-white hover:border-amber-400/60'
              }`}
            >
              ✅ ตรวจผลสถิติงวดล่าสุด ({formatIsoDateToThai(targetRecordedDate)})
            </button>
            <button
              onClick={() => setViewMode('NEXT')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                viewMode === 'NEXT'
                  ? 'bg-cyan-400 text-black border-cyan-200 shadow-glow-gold scale-[1.02]'
                  : 'bg-nikkei-card text-gray-300 border-gray-600/60 hover:text-white hover:border-cyan-400/60'
              }`}
            >
              🔮 คาดการณ์งวดถัดไป (รวมผลวันนี้แล้ว)
            </button>
          </div>
        </div>
      )}

      {/* Recommended Single-Digit Run/Rood Banner */}
      {report.topSingleDigits.length >= 2 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border-2 border-amber-400 rounded-xl p-4 shadow-glow-gold flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-2xl shadow-glow-gold shrink-0">
              <Award className="w-7 h-7 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  {viewMode === 'VERIFY' && targetRecordedDate ? `🎯 สรุปผลสถิติที่ใช้ทำนายงวด ${formatIsoDateToThai(targetRecordedDate)}` : `🎯 สรุปฟันธงเลขเด่นรูดประจำวัน${report.dayName}`}
                </span>
                {lotteryType === 'HANOI' && (
                  <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded">
                    วิเคราะห์รวม 3 รอบฮานอย (17:30 / 18:30 / 19:30)
                  </span>
                )}
              </div>
              <h4 className="text-base font-extrabold text-white mt-1">
                ฟันเด่นวิ่ง-รูด 19 ประตู: <span className="text-amber-300 text-xl font-black">{report.topSingleDigits[0]?.digit}</span> และ <span className="text-cyan-300 text-xl font-black">{report.topSingleDigits[1]?.digit}</span>
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                จากสถิติสแกน {report.totalDrawsOnDay} งวด (วัน{report.dayName}{viewMode === 'VERIFY' && targetRecordedDate ? ' ก่อนออกผลวันนี้' : ' รวมผลวันนี้'}) เลข <span className="text-amber-400 font-bold">{report.topSingleDigits[0]?.digit}</span> ออกบ่อยสุด {report.topSingleDigits[0]?.count} ครั้ง ({report.topSingleDigits[0]?.percent}%) และ เลข <span className="text-cyan-400 font-bold">{report.topSingleDigits[1]?.digit}</span> ออก {report.topSingleDigits[1]?.count} ครั้ง ({report.topSingleDigits[1]?.percent}%)
              </p>

              {/* Closed Markets Notice Bar (Positioned directly under the red line sentence) */}
              {lotteryType === 'NIKKEI' && (
                closedMarkets.length > 0 ? (
                  <div className="mt-2 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/50 rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-2 shadow-sm">
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      📌 ตลาดปิดทำการงวดถัดไป ({formatIsoDateToThai(targetIsoDate)}):
                    </span>
                    {closedMarkets.map((m) => (
                      <span
                        key={m.key}
                        className="bg-rose-500/25 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1"
                      >
                        🔴 {m.shortClosedLabel} {m.holidayName ? `(${m.holidayName})` : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      🟢 ตลาดเปิดทำการทุกหุ้น ({formatIsoDateToThai(targetIsoDate)}: นิเคอิ, จีน, ฮั่งเส็ง)
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-nikkei-dark/90 border border-amber-500/40 p-3 rounded-2xl shrink-0">
            <div className="text-center px-3 border-r border-gray-700 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 block font-bold">เด่นหลัก (รูด 19)</span>
              <span className="text-3xl font-black text-amber-400">{report.topSingleDigits[0]?.digit}</span>
              <div className="mt-1 flex flex-col items-center justify-center gap-1">
                {renderDigitHits(report.topSingleDigits[0]?.digit)}
              </div>
            </div>

            <div className="text-center px-3 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 block font-bold">เด่นรอง (รูด 19)</span>
              <span className="text-3xl font-black text-cyan-400">{report.topSingleDigits[1]?.digit}</span>
              <div className="mt-1 flex flex-col items-center justify-center gap-1">
                {renderDigitHits(report.topSingleDigits[1]?.digit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Top 1-Digit Frequencies Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-nikkei-dark to-yellow-950/40 border border-amber-500/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              🔥 สถิติเลข 1 ตัว ออกบ่อยสูงสุด (วัน{report.dayName})
            </span>
            <span className="text-[10px] text-amber-200 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
              TOP 5 ตัวเด่น
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {report.topSingleDigits.map((item, idx) => (
              <div key={item.digit} className="flex flex-col items-center gap-1">
                <div className={`w-11 h-11 rounded-xl font-black text-2xl flex items-center justify-center shadow-md border ${
                  idx === 0
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-black border-yellow-100 shadow-glow-gold scale-110'
                    : idx === 1
                    ? 'bg-gradient-to-tr from-cyan-400 to-teal-200 text-black border-cyan-100'
                    : 'bg-nikkei-card text-gray-200 border-nikkei-border'
                }`}>
                  {item.digit}
                </div>
                <span className="text-[11px] font-extrabold text-amber-300">
                  {item.count} ครั้ง
                </span>
                <span className="text-[9px] text-gray-400">
                  ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 2-Digit Pairs Frequencies Card */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-nikkei-dark to-teal-950/40 border border-cyan-500/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-cyan-500/30 pb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              🔥 สถิติเลข 2 ตัว (บน-ล่าง) ออกซ้ำบ่อยสูงสุด (วัน{report.dayName})
            </span>
            <span className="text-[10px] text-cyan-200 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded">
              TOP 6 คู่เน้น
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {report.top2DPairs.map((item) => {
              const pairHits =
                lotteryType === 'HANOI'
                  ? getHanoiHitsForPair(item.pair, targetDraws)
                  : getStockHitsForPair(item.pair, targetDraws);
              const isAllRec = lotteryType === 'HANOI' ? isHanoiAllRecorded : isNikkeiAllRecorded;

              return (
                <div key={item.pair} className="bg-nikkei-dark border border-cyan-500/30 rounded-xl p-2 text-center flex flex-col items-center justify-between min-h-[72px]">
                  <div>
                    <span className="text-base font-black text-cyan-300 font-mono tracking-wider block">
                      {item.pair}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 block">
                      ออก {item.count} ครั้ง
                    </span>
                  </div>

                  {/* Hit Badges for Pair */}
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-0.5">
                    {isFuture || targetDraws.length === 0 || viewMode === 'NEXT' ? (
                      <span className="text-[9px] text-amber-400/80 font-bold">
                        ⏳ รอผล
                      </span>
                    ) : pairHits.length > 0 ? (
                      pairHits.map((h) => (
                        <span
                          key={h.session}
                          className={`text-[8px] font-black px-1 py-0.5 rounded border flex items-center justify-center gap-0.5 ${h.badgeColor}`}
                        >
                          ✓ {h.shortLabel} <span className="text-white font-bold">[{h.position}]</span>
                        </span>
                      ))
                    ) : !isAllRec ? (
                      <span className="text-[9px] text-amber-400/80 font-bold">
                        ⏳ รอผล
                      </span>
                    ) : (
                      <span className="text-[9px] text-red-400/70 font-semibold">
                        ❌ ไม่เข้า
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Matches List Preview */}
      <div className="bg-nikkei-dark/80 border border-nikkei-border rounded-xl p-3.5 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-gray-300">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            ตารางผลการออกรางวัลจริงย้อนหลังเฉพาะวัน{report.dayName} (รวม {report.totalDrawsOnDay} งวด):
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {report.matchingDraws.slice(0, 10).map((draw) => (
            <span key={draw.id} className="bg-nikkei-card border border-nikkei-border/80 px-2.5 py-1 rounded-lg text-gray-300 inline-flex items-center gap-1">
              <strong className="text-gray-400">{draw.dateFormatted}:</strong> บน <strong className="text-amber-300">{draw.top3}</strong> | ล่าง <strong className="text-cyan-300">{draw.bottom2}</strong>
            </span>
          ))}
          {report.matchingDraws.length > 10 && (
            <span className="text-gray-500 font-semibold px-2">
              ...และอีก {report.matchingDraws.length - 10} งวด
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
