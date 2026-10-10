import React, { useState, useEffect, useMemo } from 'react';
import { DrawResult, LotteryType } from '../types';
import { analyzeDayOfWeekStats } from '../utils/calculator';
import { Calendar, Flame, Zap, Award, CheckCircle2, Copy, Check, Trophy, XCircle, Download } from 'lucide-react';
import { getPerMarketStatusBreakdown } from '../data/marketHolidays';
import confetti from 'canvas-confetti';
import { ExportPredictionModal } from './ExportPredictionModal';

interface DayOfWeekAnalyzerProps {
  data: DrawResult[];
  allData?: DrawResult[];
  lotteryType: LotteryType;
  selectedSession?: string;
  allDatasets?: any;
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

const MATH_BOLD_MAP: Record<string, string> = {
  '0': '𝟘',
  '1': '𝟙',
  '2': '𝟚',
  '3': '𝟛',
  '4': '𝟜',
  '5': '𝟝',
  '6': '𝟞',
  '7': '𝟟',
  '8': '𝟠',
  '9': '𝟡',
};

const toMathBoldDigits = (str: string): string => {
  return str.replace(/[0-9]/g, (char) => MATH_BOLD_MAP[char] || char);
};

const getLotteryCopyMetadata = (lotteryType: LotteryType, selectedSession?: string) => {
  const typeStr = String(lotteryType);
  const sessStr = String(selectedSession || (typeof localStorage !== 'undefined' ? localStorage.getItem('lotto_selected_session') || '' : ''));

  let setInfo = '-';

  if (typeStr === 'HANOI') {
    if (sessStr === 'HANOI_SPECIAL') setInfo = 'พิเศษ (17:30)';
    else if (sessStr === 'HANOI_EVENING') setInfo = 'ปกติ (18:30)';
    else if (sessStr === 'HANOI_VIP') setInfo = 'VIP (19:30)';
    else setInfo = 'รวม 3 ฮานอย';
    return { lotteryName: 'หวยฮานอย (ปกติ)', sessionName: 'รวม 3 ฮานอย (17:30 / 18:30 / 19:30)', setInfo };
  }

  if (typeStr === 'STOCKS_VIP' || typeStr === 'STOCK_VIP') {
    if (sessStr === 'NIKKEI_VIP_BOTH') setInfo = 'นิเคอิ VIP (เช้า-บ่าย)';
    else if (sessStr === 'NIKKEI_VIP_MORNING') setInfo = 'นิเคอิ VIP เช้า 09:30';
    else if (sessStr === 'NIKKEI_VIP_AFTERNOON') setInfo = 'นิเคอิ VIP บ่าย 13:00';
    else if (sessStr === 'CHINA_VIP_BOTH') setInfo = 'จีน VIP (เช้า-บ่าย)';
    else if (sessStr === 'CHINA_VIP_MORNING') setInfo = 'จีน VIP เช้า 09:30';
    else if (sessStr === 'CHINA_VIP_AFTERNOON') setInfo = 'จีน VIP บ่าย 14:00';
    else if (sessStr === 'HANGSENG_VIP_BOTH') setInfo = 'ฮั่งเส็ง VIP (เช้า-บ่าย)';
    else if (sessStr === 'HANGSENG_VIP_MORNING') setInfo = 'ฮั่งเส็ง VIP เช้า 11:00';
    else if (sessStr === 'HANGSENG_VIP_AFTERNOON') setInfo = 'ฮั่งเส็ง VIP บ่าย 15:30';
    else if (sessStr === 'STOCKS_VIP_ALL_3') setInfo = 'รวมทุกหุ้น VIP (6 รอบ)';
    else if (sessStr.includes('AFTERNOON')) setInfo = 'บ่าย';
    else if (sessStr.includes('MORNING')) setInfo = 'เช้า';
    else setInfo = 'รวมทุกหุ้น VIP (6 รอบ)';
    return { lotteryName: 'หุ้น VIP', sessionName: 'รวมหุ้น VIP', setInfo };
  }

  if (typeStr === 'NIKKEI') {
    if (sessStr === 'NIKKEI_BOTH' || sessStr === 'BOTH') setInfo = 'นิเคอิ (เช้า-บ่าย)';
    else if (sessStr === 'NIKKEI_MORNING' || sessStr === 'MORNING') setInfo = 'นิเคอิ เช้า 09:30';
    else if (sessStr === 'NIKKEI_AFTERNOON' || sessStr === 'AFTERNOON') setInfo = 'นิเคอิ บ่าย 13:00';
    else if (sessStr === 'CHINA_BOTH') setInfo = 'จีน (เช้า-บ่าย)';
    else if (sessStr === 'CHINA_MORNING') setInfo = 'จีน เช้า 10:35';
    else if (sessStr === 'CHINA_AFTERNOON') setInfo = 'จีน บ่าย 14:00';
    else if (sessStr === 'HANGSENG_BOTH') setInfo = 'ฮั่งเส็ง (เช้า-บ่าย)';
    else if (sessStr === 'HANGSENG_MORNING') setInfo = 'ฮั่งเส็ง เช้า 11:00';
    else if (sessStr === 'HANGSENG_AFTERNOON') setInfo = 'ฮั่งเส็ง บ่าย 15:00';
    else if (sessStr === 'STOCKS_ALL_3') setInfo = 'รวม 6 รอบหุ้น (เช้า / บ่าย)';
    else if (sessStr.includes('AFTERNOON')) setInfo = 'บ่าย';
    else if (sessStr.includes('MORNING')) setInfo = 'เช้า';
    else setInfo = 'รวม 6 รอบหุ้น (เช้า / บ่าย)';
    return { lotteryName: 'หุ้นนิเคอิ-จีน-ฮั่งเส็ง (ปกติ)', sessionName: 'รวม 6 รอบหุ้น (เช้า / บ่าย)', setInfo };
  }

  if (typeStr === 'MALAY') {
    return { lotteryName: 'หวยมาเลย์ (Magnum 4D)', sessionName: 'รอบเย็น 18:30 น.', setInfo: 'รอบเย็น 18:30 น.' };
  }
  if (typeStr === 'LAOS') {
    return { lotteryName: 'หวยลาวพัฒนา', sessionName: 'รอบ 20:30 น. (จันทร์ - ศุกร์)', setInfo: 'รอบ 20:30 น.' };
  }
  if (typeStr === 'DOWJONES') {
    return { lotteryName: 'ดาวโจนส์', sessionName: 'ดาวโจนส์ VIP / Star', setInfo: 'ดาวโจนส์' };
  }
  return { lotteryName: 'LOTTO289', sessionName: 'สรุปผลสถิติ', setInfo: '-' };
};

const getHeaderBadgeText = (lotteryType: LotteryType, selectedSession?: string) => {
  const typeStr = String(lotteryType);
  const sessStr = String(selectedSession || (typeof localStorage !== 'undefined' ? localStorage.getItem('lotto_selected_session') || '' : ''));

  if (typeStr === 'HANOI') {
    if (sessStr === 'HANOI_SPECIAL') return 'วิเคราะห์รอบ พิเศษ (17:30)';
    if (sessStr === 'HANOI_EVENING') return 'วิเคราะห์รอบ ปกติ (18:30)';
    if (sessStr === 'HANOI_VIP') return 'วิเคราะห์รอบ VIP (19:30)';
    return 'วิเคราะห์รวม 3 รอบฮานอย (17:30 / 18:30 / 19:30)';
  }

  if (typeStr === 'STOCKS_VIP' || typeStr === 'STOCK_VIP') {
    if (sessStr === 'NIKKEI_VIP_BOTH') return 'วิเคราะห์รอบ นิเคอิ VIP (เช้า-บ่าย)';
    if (sessStr === 'NIKKEI_VIP_MORNING') return 'วิเคราะห์รอบ นิเคอิ VIP เช้า 09:30';
    if (sessStr === 'NIKKEI_VIP_AFTERNOON') return 'วิเคราะห์รอบ นิเคอิ VIP บ่าย 13:00';
    if (sessStr === 'CHINA_VIP_BOTH') return 'วิเคราะห์รอบ จีน VIP (เช้า-บ่าย)';
    if (sessStr === 'CHINA_VIP_MORNING') return 'วิเคราะห์รอบ จีน VIP เช้า 09:30';
    if (sessStr === 'CHINA_VIP_AFTERNOON') return 'วิเคราะห์รอบ จีน VIP บ่าย 14:00';
    if (sessStr === 'HANGSENG_VIP_BOTH') return 'วิเคราะห์รอบ ฮั่งเส็ง VIP (เช้า-บ่าย)';
    if (sessStr === 'HANGSENG_VIP_MORNING') return 'วิเคราะห์รอบ ฮั่งเส็ง VIP เช้า 11:00';
    if (sessStr === 'HANGSENG_VIP_AFTERNOON') return 'วิเคราะห์รอบ ฮั่งเส็ง VIP บ่าย 15:30';
    if (sessStr === 'STOCKS_VIP_ALL_3') return 'วิเคราะห์รวมหุ้น VIP (6 รอบ)';
    if (sessStr.includes('AFTERNOON')) return 'วิเคราะห์รอบ บ่าย';
    if (sessStr.includes('MORNING')) return 'วิเคราะห์รอบ เช้า';
    return 'วิเคราะห์รวมหุ้น VIP (6 รอบ)';
  }

  if (typeStr === 'NIKKEI') {
    if (sessStr === 'NIKKEI_BOTH' || sessStr === 'BOTH') return 'วิเคราะห์รอบ นิเคอิ (เช้า-บ่าย)';
    if (sessStr === 'NIKKEI_MORNING' || sessStr === 'MORNING') return 'วิเคราะห์รอบ นิเคอิ เช้า 09:30';
    if (sessStr === 'NIKKEI_AFTERNOON' || sessStr === 'AFTERNOON') return 'วิเคราะห์รอบ นิเคอิ บ่าย 13:00';
    if (sessStr === 'CHINA_BOTH') return 'วิเคราะห์รอบ จีน (เช้า-บ่าย)';
    if (sessStr === 'CHINA_MORNING') return 'วิเคราะห์รอบ จีน เช้า 10:35';
    if (sessStr === 'CHINA_AFTERNOON') return 'วิเคราะห์รอบ จีน บ่าย 14:00';
    if (sessStr === 'HANGSENG_BOTH') return 'วิเคราะห์รอบ ฮั่งเส็ง (เช้า-บ่าย)';
    if (sessStr === 'HANGSENG_MORNING') return 'วิเคราะห์รอบ ฮั่งเส็ง เช้า 11:00';
    if (sessStr === 'HANGSENG_AFTERNOON') return 'วิเคราะห์รอบ ฮั่งเส็ง บ่าย 15:00';
    if (sessStr === 'STOCKS_ALL_3') return 'วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)';
    if (sessStr.includes('AFTERNOON')) return 'วิเคราะห์รอบ บ่าย';
    if (sessStr.includes('MORNING')) return 'วิเคราะห์รอบ เช้า';
    return 'วิเคราะห์รวม 6 รอบหุ้น (เช้า / บ่าย)';
  }

  return '';
};

const getNextTargetDayCode = (allData: DrawResult[], lotteryType?: LotteryType): string => {
  const fallbackDay = lotteryType === 'NIKKEI' ? 'Mon' : lotteryType === 'MALAY' ? 'Wed' : 'Sat';
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
    } else if (lotteryType === 'MALAY') {
      while (![0, 3, 6].includes(targetDateObj.getDay())) {
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
const STOCK_REGULAR_SESSIONS = [
  { key: 'NIKKEI_MORNING', altKeys: ['MORNING'], label: '☀️ นิเคอิ เช้า' },
  { key: 'CHINA_MORNING', altKeys: [], label: '🧧 จีน เช้า' },
  { key: 'HANGSENG_MORNING', altKeys: [], label: '🐉 ฮั่งเส็ง เช้า' },
  { key: 'NIKKEI_AFTERNOON', altKeys: ['AFTERNOON'], label: '🌤️ นิเคอิ บ่าย' },
  { key: 'CHINA_AFTERNOON', altKeys: [], label: '🏮 จีน บ่าย' },
  { key: 'HANGSENG_AFTERNOON', altKeys: [], label: '🏛️ ฮั่งเส็ง บ่าย' },
];

const STOCK_VIP_SESSIONS = [
  { key: 'NIKKEI_VIP_MORNING', altKeys: [], label: '💎 นิเคอิ VIP เช้า' },
  { key: 'CHINA_VIP_MORNING', altKeys: [], label: '🏮 จีน VIP เช้า' },
  { key: 'HANGSENG_VIP_MORNING', altKeys: [], label: '🏛️ ฮั่งเส็ง VIP เช้า' },
  { key: 'NIKKEI_VIP_AFTERNOON', altKeys: [], label: '💎 นิเคอิ VIP บ่าย' },
  { key: 'CHINA_VIP_AFTERNOON', altKeys: [], label: '🏮 จีน VIP บ่าย' },
  { key: 'HANGSENG_VIP_AFTERNOON', altKeys: [], label: '🏛️ ฮั่งเส็ง VIP บ่าย' },
];

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
  HANGSENG_VIP_AFTERNOON: { label: '🐉 ฮั่งเส็ง VIP บ่าย', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
};

const getThaiSessionLabel = (s?: string): string => {
  if (!s) return '';
  if (STOCK_SESSION_MAP[s]) return STOCK_SESSION_MAP[s].label;
  const map: Record<string, string> = {
    HANGSENG_VIP_AFTERNOON: '🐉 ฮั่งเส็ง VIP บ่าย',
    CHINA_VIP_AFTERNOON: '🏮 จีน VIP บ่าย',
    NIKKEI_VIP_AFTERNOON: '💎 นิเคอิ VIP บ่าย',
    HANGSENG_VIP_MORNING: '🏛️ ฮั่งเส็ง VIP เช้า',
    CHINA_VIP_MORNING: '🏮 จีน VIP เช้า',
    NIKKEI_VIP_MORNING: '💎 นิเคอิ VIP เช้า',
    HANGSENG_MORNING: '🐉 ฮั่งเส็ง เช้า',
    HANGSENG_AFTERNOON: '🏛️ ฮั่งเส็ง บ่าย',
    CHINA_MORNING: '🧧 จีน เช้า',
    CHINA_AFTERNOON: '🏮 จีน บ่าย',
    NIKKEI_MORNING: '☀️ นิเคอิ เช้า',
    MORNING: '☀️ นิเคอิ เช้า',
    NIKKEI_AFTERNOON: '🌤️ นิเคอิ บ่าย',
    AFTERNOON: '🌤️ นิเคอิ บ่าย',
  };
  if (map[s]) return map[s];
  return s
    .replace(/HANGSENG/g, 'ฮั่งเส็ง')
    .replace(/CHINA/g, 'จีน')
    .replace(/NIKKEI/g, 'นิเคอิ')
    .replace(/MORNING/g, 'เช้า')
    .replace(/AFTERNOON/g, 'บ่าย')
    .replace(/_/g, ' ');
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
  const pairStr = String(pair);
  const rev = pairStr.split('').reverse().join('');
  const hits: { session: string; shortLabel: string; position: string; badgeColor: string }[] = [];

  targetDraws.forEach((d) => {
    const matched: string[] = [];
    if (d.top2 === pairStr || d.top2 === rev) matched.push('บน');
    if (d.bottom2 === pairStr || d.bottom2 === rev) matched.push('ล่าง');

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

export const DayOfWeekAnalyzer: React.FC<DayOfWeekAnalyzerProps> = ({ data, allData, lotteryType, selectedSession, allDatasets }) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
  ] : (lotteryType === 'MALAY') ? [
    { code: 'Wed', label: 'วันพุธ', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400' },
    { code: 'Sat', label: 'วันเสาร์', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400' },
    { code: 'Sun', label: 'วันอาทิตย์', color: 'from-red-500/20 to-rose-500/20 text-red-300 border-red-500/40 hover:border-red-400' },
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

  const [copied, setCopied] = useState(false);

  const getDigitHitInfo = (digit?: number | string): { isHit: boolean; text: string } => {
    if (digit === undefined || digit === null) return { isHit: false, text: '' };
    if (isFuture || targetDraws.length === 0 || viewMode === 'NEXT') {
      return { isHit: false, text: '⏳ รอผล' };
    }
    const digitStr = String(digit);

    if (lotteryType === 'HANOI') {
      const hits = getHanoiHitsForDigit(digitStr, targetDraws);
      if (hits.length === 0) return { isHit: false, text: isHanoiAllRecorded ? '❌ ไม่เข้า' : '⏳ รอผล' };
      return { isHit: true, text: hits.map((h) => `✓ ${h.shortLabel} [${h.winningNumbers}]`).join('\n') };
    } else {
      const hits = getNikkeiHitsForDigit(digitStr, targetDraws);
      if (hits.length === 0) return { isHit: false, text: isNikkeiAllRecorded ? '❌ ไม่เข้า' : '⏳ รอผล' };
      return { isHit: true, text: hits.map((h) => `✓ ${h.shortLabel} [${h.winningNumbers}]`).join('\n') };
    }
  };

  const getPairHitsInfo = (): { isHit: boolean; text: string } => {
    if (isFuture || targetDraws.length === 0 || viewMode === 'NEXT') {
      return { isHit: false, text: 'ผล ⏳ รอผล' };
    }

    const top6Pairs = report.top2DPairs.slice(0, 6);
    const allHits: string[] = [];

    top6Pairs.forEach((item) => {
      const pairHits =
        lotteryType === 'HANOI'
          ? getHanoiHitsForPair(item.pair, targetDraws)
          : getStockHitsForPair(item.pair, targetDraws);
      
      pairHits.forEach((h) => {
        const rev = item.pair.split('').reverse().join('');
        const posText = h.position.includes(item.pair) || h.position.includes(rev)
          ? h.position
          : `${h.position} ${item.pair}`;
        allHits.push(`✓ ${h.shortLabel} [${posText}]`);
      });
    });

    if (allHits.length > 0) {
      const uniqueHits = Array.from(new Set(allHits));
      return { isHit: true, text: uniqueHits.join('\n') };
    }

    const isRec = lotteryType === 'HANOI' ? isHanoiAllRecorded : isNikkeiAllRecorded;
    return { isHit: false, text: isRec ? 'ผล ❌ ไม่เข้า' : 'ผล ⏳ รอผล' };
  };

  const handleCopyGuide = () => {
    const dayNameThai = report.dayName || activeDay;

    const mainDigit = report.topSingleDigits[0]?.digit !== undefined ? String(report.topSingleDigits[0].digit) : '-';
    const subDigit = report.topSingleDigits[1]?.digit !== undefined ? String(report.topSingleDigits[1].digit) : '-';

    const mainHitInfo = getDigitHitInfo(report.topSingleDigits[0]?.digit);
    const subHitInfo = getDigitHitInfo(report.topSingleDigits[1]?.digit);
    const pairHitsInfo = getPairHitsInfo();

    const mainHitStr = mainHitInfo.isHit ? `\n${mainHitInfo.text}` : ` ผล ${mainHitInfo.text}`;
    const subHitStr = subHitInfo.isHit ? `\n${subHitInfo.text}` : ` ผล ${subHitInfo.text}`;
    const pairHitStr = pairHitsInfo.isHit ? `\n${pairHitsInfo.text}` : `\n${pairHitsInfo.text}`;

    const pairs = report.top2DPairs.slice(0, 6).map((p) => p.pair);
    const pairsStr = pairs.join(' , ');

    const { lotteryName, sessionName, setInfo } = getLotteryCopyMetadata(lotteryType, selectedSession);

    const copyText = `📊 [แนวทางสถิติเลขรายวัน]
🎯 หวย: ${lotteryName}
📌 รอบ: ${sessionName}
🗓️ สถิติประจำ: วัน${dayNameThai}
🏷️ ชุดเลข: ${setInfo}
--------------------------
🔥 ฟันเด่น วิ่ง-รูด 19 ประตู:
⭐ เด่นหลัก: ${mainDigit}${mainHitStr}

✨ เด่นรอง: ${subDigit}${subHitStr}

💎 TOP 6 เลข 2 ตัว เน้น:
 ${pairsStr}${pairHitStr}
----------------------------
🤖 วิเคราะห์อัตโนมัติตามสถิติ LOTTO289`;

    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {}
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-black border border-emerald-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald"
            title="ดาวน์โหลดสรุปฟันธงเป็น Excel / CSV"
          >
            <Download className="w-4 h-4 text-black stroke-[2.5]" />
            <span>📥 ดาวน์โหลด Excel / CSV</span>
          </button>

          <button
            onClick={handleCopyGuide}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg ${
              copied
                ? 'bg-emerald-500 text-black border border-emerald-300 scale-105 shadow-glow-emerald'
                : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black border border-amber-200 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-gold'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[3]" />}
            <span>{copied ? '✓ คัดลอกแนวทางแล้ว!' : '📋 คัดลอกแนวทาง'}</span>
          </button>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-amber-300 font-bold text-xs">
            จำนวนงวดที่สแกน: <span className="text-white font-black text-sm">{report.totalDrawsOnDay}</span> งวด ({report.dayName})
          </div>
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
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
          {daysList.map((item) => {
            const isNextTarget = item.code === nextTargetDay;
            const isActive = activeDay === item.code;

            return (
              <div key={item.code} className="relative">
                {isNextTarget && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-2 py-0.5 rounded-full border border-yellow-100 shadow-md whitespace-nowrap animate-bounce">
                    ✨ งวดถัดไป
                  </span>
                )}
                <button
                  onClick={() => handleSelectDay(item.code)}
                  className={`w-full relative py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm border transition-all duration-300 bg-gradient-to-br shadow-sm cursor-pointer ${
                    item.color
                  } ${
                    isNextTarget
                      ? 'ring-4 ring-amber-400 border-2 border-yellow-300 shadow-[0_0_25px_rgba(251,191,36,0.95)] animate-pulse scale-[1.05] z-10 font-black'
                      : isActive
                      ? 'ring-2 ring-amber-400 scale-[1.02] shadow-glow-gold brightness-125 font-black'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="bg-[#0b0603] border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>📌 เลือกโหมดสลับคำนวณ (Mode Switcher Bar):</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {targetRecordedDate && (
            <button
              onClick={() => setViewMode('VERIFY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'VERIFY'
                  ? 'bg-emerald-500 text-black shadow-glow-emerald border border-emerald-300 scale-[1.02]'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <span>✓ ตรวจผลสถิติงวดล่าสุด ({formatIsoDateToThai(targetRecordedDate)})</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('NEXT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'NEXT' || !targetRecordedDate
                ? 'bg-cyan-400 text-black shadow-glow-cyan border border-cyan-300 scale-[1.02]'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <span>🔮 คาดการณ์งวดถัดไป (รวมผลวันนี้แล้ว)</span>
          </button>
        </div>
      </div>

      {/* 1 การ์ดใหญ่ (Outer Golden Card) ที่มี 2 การ์ดหลักขนานกันซ้าย-ขวา ตามรูปตัวอย่าง */}
      {report.topSingleDigits.length >= 2 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border-2 border-amber-400 rounded-2xl p-5 shadow-glow-gold space-y-4">
          
          {/* Top Main Banner Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black text-2xl shadow-glow-gold shrink-0">
                <Award className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-black text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-1">
                    🎯 {viewMode === 'VERIFY' && targetRecordedDate ? `สรุปผลสถิติที่ใช้ทำนายงวด ${formatIsoDateToThai(targetRecordedDate)}` : `สรุปฟันธงเลขเด่นรูดประจำวัน${report.dayName}`}
                  </span>
                  {getHeaderBadgeText(lotteryType, selectedSession) && (
                    <span className="bg-emerald-500 text-black text-[11px] font-black px-2 py-0.5 rounded-md">
                      {getHeaderBadgeText(lotteryType, selectedSession)}
                    </span>
                  )}
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  ฟันเด่นวิ่ง-รูด 19 ประตู: <span className="text-amber-400">{report.topSingleDigits[0]?.digit}</span> และ <span className="text-cyan-400">{report.topSingleDigits[1]?.digit}</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-gray-300 mt-0.5">
                  จากสถิติสแกน {report.totalDrawsOnDay} งวด (วัน{report.dayName}) เลข <strong className="text-amber-300">{report.topSingleDigits[0]?.digit}</strong> ออกบ่อยสุด {report.topSingleDigits[0]?.count} ครั้ง ({report.topSingleDigits[0]?.percent}%) และ เลข <strong className="text-cyan-300">{report.topSingleDigits[1]?.digit}</strong> ออก {report.topSingleDigits[1]?.count} ครั้ง ({report.topSingleDigits[1]?.percent}%)
                </p>
              </div>
            </div>

            {/* Action Buttons: Download + Copy */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-black border border-emerald-300 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-emerald"
                title="ดาวน์โหลดสรุปฟันธงเป็น Excel / CSV"
              >
                <Download className="w-4 h-4 text-black stroke-[2.5]" />
                <span>📥 ดาวน์โหลด Excel / CSV</span>
              </button>

              <button
                onClick={handleCopyGuide}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer shadow-lg ${
                  copied
                    ? 'bg-emerald-500 text-black border border-emerald-300 scale-105 shadow-glow-emerald'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border border-amber-200 hover:brightness-110 hover:scale-105 active:scale-95 shadow-glow-gold'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-black stroke-[3]" />}
                <span>{copied ? '✓ คัดลอกแนวทางแล้ว!' : 'คัดลอกแนวทาง'}</span>
              </button>
            </div>
          </div>

          {/* THREE SIDE-BY-SIDE CARDS (👈 กล่อง 1: เด่น/รอง [แคบลง] | 🤛 กล่อง 2: ชุด TOP 6 คู่เน้น | 👉 กล่อง 3: เปรียบเทียบผล) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            
            {/* CARD 1 (LEFT - Amber Theme): 1 🎯 ฟันเด่น วิ่ง-รูด 19 ประตู [ปรับเล็กลง-แคบลง] */}
            <div className="bg-nikkei-dark/90 border border-amber-500/40 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 py-0.5 rounded">1</span>
                  🎯 ฟันเด่น วิ่ง-รูด 19 ประตู
                </span>
                <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
                  เด่น - รอง
                </span>
              </div>

              {/* 2 Inner Rounded Card Boxes (Compact horizontal fit) */}
              <div className="grid grid-cols-2 gap-2 my-auto py-0.5">
                
                {/* Inner Box 1: 🔥 เด่นหลัก (รูดตัวเดียว) */}
                <div className="bg-nikkei-card/90 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-1.5 relative shadow-sm">
                  
                  {/* Header Row */}
                  <div className="w-full flex items-center justify-between gap-0.5">
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate">
                      🔥 เด่นหลัก
                    </span>
                    <span className="text-[9px] font-black text-amber-300 shrink-0">
                      {report.topSingleDigits[0]?.percent ?? (report.topSingleDigits[0] as any)?.percentage ?? 80}%
                    </span>
                  </div>

                  {/* Center Exact Inspect Digit Badge (2x larger) */}
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-black font-black text-5xl sm:text-6xl shadow-glow-gold transform hover:scale-110 transition-transform duration-300 select-none shrink-0 my-1">
                    {report.topSingleDigits[0]?.digit !== undefined ? report.topSingleDigits[0].digit : '-'}
                  </div>

                  {/* Probability Subtitle */}
                  <span className="text-[10px] text-gray-300 font-bold">
                    โอกาส <strong className="text-amber-300 font-black">{report.topSingleDigits[0]?.percent ?? (report.topSingleDigits[0] as any)?.percentage ?? 80}%</strong>
                  </span>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, report.topSingleDigits[0]?.percent ?? (report.topSingleDigits[0] as any)?.percentage ?? 80))}%` }}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="mt-0.5">
                    {renderDigitHits(report.topSingleDigits[0]?.digit)}
                  </div>
                </div>

                {/* Inner Box 2: ★ เลขรอง */}
                <div className="bg-nikkei-card/90 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col items-center justify-between text-center space-y-1.5 relative shadow-sm">
                  
                  {/* Header Row */}
                  <div className="w-full flex items-center justify-between gap-0.5">
                    <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate">
                      ★ เลขรอง
                    </span>
                    <span className="text-[9px] font-black text-cyan-300 shrink-0">
                      {report.topSingleDigits[1]?.percent ?? (report.topSingleDigits[1] as any)?.percentage ?? 66.7}%
                    </span>
                  </div>

                  {/* Center Exact Inspect Digit Badge (2x larger) */}
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-200 text-black font-black text-5xl sm:text-6xl shadow-glow-cyan transform hover:scale-110 transition-transform duration-300 select-none shrink-0 my-1">
                    {report.topSingleDigits[1]?.digit !== undefined ? report.topSingleDigits[1].digit : '-'}
                  </div>

                  {/* Probability Subtitle */}
                  <span className="text-[10px] text-gray-300 font-bold">
                    โอกาส <strong className="text-cyan-300 font-black">{report.topSingleDigits[1]?.percent ?? (report.topSingleDigits[1] as any)?.percentage ?? 66.7}%</strong>
                  </span>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, report.topSingleDigits[1]?.percent ?? (report.topSingleDigits[1] as any)?.percentage ?? 66.7))}%` }}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="mt-0.5">
                    {renderDigitHits(report.topSingleDigits[1]?.digit)}
                  </div>
                </div>

              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">รูดประจำวัน{report.dayName} เน้น {report.topSingleDigits[0]?.digit} - {report.topSingleDigits[1]?.digit}</span>
              </div>
            </div>

            {/* CARD 2 (MIDDLE - Cyan Theme): ✨ ชุดเจาะ 2 ตัวบน-ล่าง (TOP 6 คู่เน้น) */}
            <div className="bg-nikkei-dark/90 border border-cyan-500/40 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 truncate">
                  <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ✨ ชุดเจาะ 2 ตัว (เน้นประจำวัน{report.dayName})
                </span>
                <span className="text-[9px] text-cyan-300 font-extrabold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded shrink-0">
                  เน้น 6 ชุด
                </span>
              </div>

              {/* TOP 6 Pairs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 my-auto py-0.5">
                {report.top2DPairs.slice(0, 6).map((item, idx) => {
                  const isMainPair = idx < 3;
                  const pairHits =
                    lotteryType === 'HANOI'
                      ? getHanoiHitsForPair(item.pair, targetDraws)
                      : getStockHitsForPair(item.pair, targetDraws);
                  const isAllRec = lotteryType === 'HANOI' ? isHanoiAllRecorded : isNikkeiAllRecorded;

                  return (
                    <div
                      key={item.pair}
                      className={`border rounded-xl p-1.5 text-center flex flex-col items-center justify-between min-h-[68px] transition-all duration-300 ${
                        isMainPair
                          ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                          : 'bg-cyan-500/10 border-cyan-500/40 hover:border-cyan-400'
                      }`}
                    >
                      <div className="w-full">
                        <span className={`text-[8px] font-extrabold block text-center ${isMainPair ? 'text-amber-400' : 'text-cyan-300'}`}>
                          {isMainPair ? '★ เด่น' : '✨ รอง'}
                        </span>
                        <span className={`text-base font-black font-mono tracking-wider block my-0.5 ${isMainPair ? 'text-amber-300' : 'text-cyan-300'}`}>
                          {item.pair}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 block">
                          ออก {item.count} ครั้ง
                        </span>
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center justify-center gap-0.5 w-full">
                        {isFuture || targetDraws.length === 0 || viewMode === 'NEXT' ? (
                          <span className="text-[8px] text-amber-400/80 font-bold">
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
                          <span className="text-[8px] text-amber-400/80 font-bold">
                            ⏳ รอผล
                          </span>
                        ) : (
                          <span className="text-[8px] text-red-400/70 font-semibold">
                            ❌ ไม่เข้า
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-cyan-300 truncate">
                ⚡ สแกนสถิติออกซ้ำ 2 ตัวประจำวัน{report.dayName} (3 เด่นหลัก / 3 เด่นรอง)
              </div>
            </div>

            {/* CARD 3 (RIGHT - Amber/Emerald Theme): 🏆 เปรียบเทียบผล */}
            <div className="bg-nikkei-dark/90 border border-amber-500/50 hover:border-amber-400 p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-glow-gold">
              <div>
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> เปรียบเทียบผล
                  </span>
                  <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {targetRecordedDate ? formatIsoDateToThai(targetRecordedDate) : report.dayName}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Row 2: Actual Result (ผลออกจริง) */}
                  {lotteryType === 'HANOI' ? (() => {
                    const specialDraw = targetDraws.find((d) => d.session === 'HANOI_SPECIAL');
                    const eveningDraw = targetDraws.find((d) => d.session === 'HANOI_EVENING');
                    const vipDraw = targetDraws.find((d) => d.session === 'HANOI_VIP');

                    const sessions = [
                      { label: '🟠 ฮานอยพิเศษ (17:30)', draw: specialDraw },
                      { label: '🔴 ฮานอยปกติ (18:30)', draw: eveningDraw },
                      { label: '🟣 ฮานอย VIP (19:30)', draw: vipDraw },
                    ];

                    return (
                      <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1">
                        <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-emerald-400" /> 🏆 ผลออกจริง 3 ฮานอย:</span>
                          <span className="text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse">3 รอบ</span>
                        </span>
                        {sessions.map(({ label, draw }, idx) => (
                          <div key={idx} className="bg-black/50 p-1 rounded-lg border border-emerald-500/30">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[10px] font-bold text-amber-300">{label}</span>
                            </div>
                            {draw && draw.top3 ? (
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-300">3 บน: <strong className="text-yellow-300 text-base font-black font-mono tracking-wider">{draw.top3}</strong></span>
                                <span className="text-gray-300">2 บน: <strong className="text-amber-300 text-base font-black font-mono tracking-wider">{draw.top2 || draw.top3.slice(1)}</strong></span>
                                <span className="text-gray-300">2 ล่าง: <strong className="text-cyan-300 text-base font-black font-mono tracking-wider">{draw.bottom2}</strong></span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-300/80 font-semibold italic">⏳ รอประกาศผล</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })() : (lotteryType === 'NIKKEI' || lotteryType === 'STOCKS_VIP') ? (() => {
                    const stockSessions = lotteryType === 'STOCKS_VIP' ? STOCK_VIP_SESSIONS : STOCK_REGULAR_SESSIONS;
                    return (
                      <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-emerald-400" /> 🏆 ผลออกจริง 6 รอบหุ้น:</span>
                          <span className="text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse">6 รอบ</span>
                        </span>
                        {stockSessions.map((s, idx) => {
                          const draw = targetDraws.find((d) => d.session === s.key || (s.altKeys && s.altKeys.includes(d.session)));
                          return (
                            <div key={idx} className="bg-black/50 p-1 rounded-lg border border-emerald-500/30">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-bold text-amber-300">{s.label}</span>
                              </div>
                              {draw && draw.top3 ? (
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-300">3 บน: <strong className="text-yellow-300 text-base font-black font-mono tracking-wider">{draw.top3}</strong></span>
                                  <span className="text-gray-300">2 บน: <strong className="text-amber-300 text-base font-black font-mono tracking-wider">{draw.top2 || draw.top3.slice(1)}</strong></span>
                                  <span className="text-gray-300">2 ล่าง: <strong className="text-cyan-300 text-base font-black font-mono tracking-wider">{draw.bottom2}</strong></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-300/80 font-semibold italic">⏳ รอประกาศผล</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : targetDraws.length > 1 ? (() => {
                    const sortedDraws = [...targetDraws].sort((a, b) => (SESSION_CHRONO_ORDER[a.session] || 99) - (SESSION_CHRONO_ORDER[b.session] || 99));
                    return (
                      <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2 shadow-glow-emerald space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-emerald-400" /> 🏆 ผลออกจริง ({sortedDraws.length} รอบ):</span>
                          <span className="text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse">{sortedDraws.length} รอบ</span>
                        </span>
                        {sortedDraws.map((d, idx) => {
                          const sessLabel = getThaiSessionLabel(d.session);
                          return (
                            <div key={idx} className="bg-black/50 p-1 rounded-lg border border-emerald-500/30">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-bold text-amber-300">{sessLabel}</span>
                              </div>
                              {d && d.top3 ? (
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-300">3 บน: <strong className="text-yellow-300 text-base font-black font-mono tracking-wider">{d.top3}</strong></span>
                                  <span className="text-gray-300">2 บน: <strong className="text-amber-300 text-base font-black font-mono tracking-wider">{d.top2 || d.top3.slice(1)}</strong></span>
                                  <span className="text-gray-300">2 ล่าง: <strong className="text-cyan-300 text-base font-black font-mono tracking-wider">{d.bottom2}</strong></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-300/80 font-semibold italic">⏳ รอประกาศผล</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : (() => {
                    const latest = targetDraws[0];
                    return (
                      <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-2.5 shadow-glow-emerald space-y-1">
                        <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-emerald-400" /> 🏆 ผลออกจริง:</span>
                          <span className="text-[9px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-pulse">ผลรางวัล</span>
                        </span>
                        {latest && latest.top3 ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                              <span className="text-[10px] text-gray-300 font-extrabold">3 ตัวบน:</span>
                              <strong className="text-yellow-300 text-base font-black font-mono tracking-wider">{latest.top3}</strong>
                            </div>
                            <div className="flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                              <span className="text-[10px] text-gray-300 font-extrabold">2 ตัวบน:</span>
                              <strong className="text-amber-300 text-base font-black font-mono tracking-wider">{latest.top2 || latest.top3.slice(1)}</strong>
                            </div>
                            <div className="flex justify-between items-center bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                              <span className="text-[10px] text-gray-300 font-extrabold">2 ตัวล่าง:</span>
                              <strong className="text-cyan-300 text-base font-black font-mono tracking-wider">{latest.bottom2}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-black/50 p-2 rounded-lg text-center">
                            <span className="text-[10px] text-amber-300/80 font-semibold italic">⏳ รอประกาศผล</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Status Footer Badge matching screenshot */}
              <div className="pt-2 border-t border-gray-800 text-center flex items-center justify-center">
                {(() => {
                  if (isFuture || targetDraws.length === 0 || viewMode === 'NEXT') {
                    return (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 inline-flex items-center gap-1">
                        ⏳ รอประกาศผล
                      </span>
                    );
                  }
                  
                  const d0 = report.topSingleDigits[0]?.digit;
                  const d1 = report.topSingleDigits[1]?.digit;
                  
                  const d0Hits = d0 !== undefined ? (lotteryType === 'HANOI' ? getHanoiHitsForDigit(d0, targetDraws) : getNikkeiHitsForDigit(d0, targetDraws)) : [];
                  const d1Hits = d1 !== undefined ? (lotteryType === 'HANOI' ? getHanoiHitsForDigit(d1, targetDraws) : getNikkeiHitsForDigit(d1, targetDraws)) : [];
                  
                  const isHit = d0Hits.length > 0 || d1Hits.length > 0;
                  const isRec = lotteryType === 'HANOI' ? isHanoiAllRecorded : isNikkeiAllRecorded;

                  if (isHit) {
                    return (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/40 inline-flex items-center gap-1 shadow-glow-emerald">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> ✓ เข้าเป้าตามสูตร
                      </span>
                    );
                  } else if (isRec) {
                    return (
                      <span className="bg-red-500/20 text-red-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-red-500/40 inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> ❌ ไม่เข้าเป้า
                      </span>
                    );
                  } else {
                    return (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 inline-flex items-center gap-1">
                        ⏳ รอประกาศผล
                      </span>
                    );
                  }
                })()}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal ดาวน์โหลด Excel / CSV สรุปฟันธงเด่นรูด */}
      <ExportPredictionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentLotteryType={lotteryType}
        currentSession={selectedSession}
        allDatasets={allDatasets || { activeDataset: fullDataset }}
      />

    </div>
  );
};
