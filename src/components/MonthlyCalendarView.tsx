import React, { useState, useMemo } from 'react';
import { DrawResult, LotteryType, SessionType } from '../types';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, PauseCircle, Clock, RotateCcw, Info } from 'lucide-react';
import { getMarketHolidayInfo, getPerMarketStatusBreakdown, MarketHoliday, MarketStatusBreakdown } from '../data/marketHolidays';

interface MonthlyCalendarViewProps {
  data: DrawResult[];
  lotteryType: LotteryType;
  selectedSession: SessionType;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAY_NAMES_THAI = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const WEEKDAY_NAMES_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  data,
  lotteryType,
  selectedSession
}) => {
  // Find latest date in data to set default active month/year
  const latestDateInfo = useMemo(() => {
    if (!data || data.length === 0) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), isoString: now.toISOString().split('T')[0] };
    }
    let maxDateStr = data[0].date;
    for (const d of data) {
      if (d.date && d.date > maxDateStr) {
        maxDateStr = d.date;
      }
    }
    const parts = (maxDateStr || '').split('-');
    const year = parseInt(parts[0], 10) || 2026;
    const month = (parseInt(parts[1], 10) || 10) - 1; // 0-indexed
    return { year, month, isoString: maxDateStr };
  }, [data]);

  const [currentYear, setCurrentYear] = useState<number>(latestDateInfo.year);
  const [currentMonth, setCurrentMonth] = useState<number>(latestDateInfo.month);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToLatest = () => {
    setCurrentYear(latestDateInfo.year);
    setCurrentMonth(latestDateInfo.month);
  };

  // Build dates matrix for the selected month
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Map dates to draw results
    const drawsByDateMap = new Map<string, DrawResult[]>();
    data.forEach((item) => {
      if (!item.date) return;
      const list = drawsByDateMap.get(item.date) || [];
      list.push(item);
      drawsByDateMap.set(item.date, list);
    });

    const isStockLottery = ['NIKKEI', 'CHINA', 'HANGSENG', 'DOWJONES'].includes(lotteryType) || 
      selectedSession.includes('NIKKEI') || selectedSession.includes('CHINA') || selectedSession.includes('HANGSENG');

    const days = [];
    let openCount = 0;
    let closedCount = 0;
    let weekendCount = 0;
    let futureCount = 0;

    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const isoDate = `${currentYear}-${monthStr}-${dayStr}`;
      const dayOfWeekIdx = (startDayOfWeek + (d - 1)) % 7;
      const isWeekend = (dayOfWeekIdx === 0 || dayOfWeekIdx === 6);

      const dayDraws = drawsByDateMap.get(isoDate) || [];
      const holidayInfo = getMarketHolidayInfo(isoDate, lotteryType, selectedSession);

      // Create map of draws per market
      const drawsForDayMap = new Map<string, boolean>();
      dayDraws.forEach(dr => {
        if (dr.session.includes('NIKKEI') || dr.session === 'MORNING' || dr.session === 'AFTERNOON') drawsForDayMap.set('NIKKEI', true);
        if (dr.session.includes('CHINA')) drawsForDayMap.set('CHINA', true);
        if (dr.session.includes('HANGSENG')) drawsForDayMap.set('HANGSENG', true);
      });

      const breakdown = getPerMarketStatusBreakdown(isoDate, dayOfWeekIdx, lotteryType, drawsForDayMap, latestDateInfo.isoString);

      const hasAnyOpen = breakdown.some(b => b.status === 'OPEN');
      const hasAnyClosed = breakdown.some(b => b.status === 'CLOSED');
      const isAllWeekend = breakdown.every(b => b.status === 'WEEKEND');

      let status: 'OPEN' | 'CLOSED' | 'WEEKEND' | 'FUTURE' = 'CLOSED';

      if (isAllWeekend) {
        status = 'WEEKEND';
        weekendCount++;
      } else if (hasAnyOpen && !hasAnyClosed) {
        status = 'OPEN';
        openCount++;
      } else if (hasAnyClosed) {
        status = 'CLOSED';
        closedCount++;
      } else if (isoDate > latestDateInfo.isoString) {
        status = 'FUTURE';
        futureCount++;
      } else {
        status = 'CLOSED';
        closedCount++;
      }

      days.push({
        dayNumber: d,
        isoDate,
        dayOfWeekIdx,
        dayNameThai: WEEKDAY_NAMES_THAI[dayOfWeekIdx],
        dayNameShort: WEEKDAY_NAMES_SHORT[dayOfWeekIdx],
        status,
        draws: dayDraws,
        holidayInfo,
        breakdown
      });
    }

    return {
      startDayOfWeek,
      totalDays,
      days,
      stats: {
        totalDays,
        openCount,
        closedCount,
        weekendCount,
        futureCount
      }
    };
  }, [currentYear, currentMonth, data, lotteryType, selectedSession, latestDateInfo.isoString]);

  // Session Thai title helper
  const getLotteryTitle = () => {
    switch (lotteryType) {
      case 'LAOS': return 'หวยลาวพัฒนา';
      case 'DOWJONES': return 'หวยหุ้นดาวโจนส์';
      case 'HANOI': return 'หวยฮานอย';
      case 'GSB': return 'หวยออมสิน';
      case 'GOVERNMENT': return 'หวยรัฐบาลไทย';
      default:
        if (selectedSession.includes('CHINA')) return 'หวยหุ้นจีน';
        if (selectedSession.includes('HANGSENG')) return 'หวยหุ้นฮั่งเส็ง';
        return 'หวยหุ้นนิคเคอิ';
    }
  };

  return (
    <div className="bg-nikkei-card border border-nikkei-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-nikkei-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              ปฏิทินวันเปิด-ปิดประจำเดือน
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                {getLotteryTitle()}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              แสดงสถานะการออกรางวัล วันเปิดทำการ วันหยุด ตลาดปิด และผลรางวัลย้อนหลังรายวัน
            </p>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-[#182234] hover:bg-slate-700 text-gray-200 rounded-xl border border-nikkei-border transition-all flex items-center justify-center"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 bg-[#182234] border border-nikkei-border rounded-xl px-3 py-1.5">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-extrabold text-sm focus:outline-none cursor-pointer"
            >
              {THAI_MONTHS.map((m, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-white font-extrabold text-sm focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y + 543} ({y})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 bg-[#182234] hover:bg-slate-700 text-gray-200 rounded-xl border border-nikkei-border transition-all flex items-center justify-center"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleResetToLatest}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 transition-all flex items-center gap-1"
            title="กลับไปยังเดือนปัจจุบันที่มีข้อมูล"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>เดือนปัจจุบัน</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101726] border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 font-semibold">วันเปิดออกรางวัล</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{calendarData.stats.openCount} วัน</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101726] border border-rose-500/20 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 font-semibold">วันงดออกผล / ตลาดปิด</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{calendarData.stats.closedCount} วัน</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101726] border border-slate-700 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 font-semibold">วันหยุดเสาร์-อาทิตย์</div>
            <div className="text-xl font-black text-slate-300 mt-0.5">{calendarData.stats.weekendCount} วัน</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101726] border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400 font-semibold">รอออกผลรางวัล</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{calendarData.stats.futureCount} วัน</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div>
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {WEEKDAY_NAMES_SHORT.map((dayName, idx) => (
            <div
              key={idx}
              className={`py-2 rounded-lg text-xs font-black uppercase border ${
                idx === 0 || idx === 6
                  ? 'bg-slate-900/80 text-rose-400 border-rose-950/40'
                  : 'bg-[#141c2e] text-gray-300 border-nikkei-border/40'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty Padding Cells Before 1st Day */}
          {Array.from({ length: calendarData.startDayOfWeek }).map((_, idx) => (
            <div
              key={`empty_${idx}`}
              className="min-h-[90px] sm:min-h-[105px] bg-[#0c121e]/40 border border-nikkei-border/20 rounded-xl opacity-20"
            />
          ))}

          {/* Actual Month Days */}
          {calendarData.days.map((day) => {
            const closedItems = (day.breakdown || []).filter((b) => b.status === 'CLOSED');
            const hasClosed = closedItems.length > 0;
            const isWeekend = day.status === 'WEEKEND';

            return (
              <div
                key={day.isoDate}
                onClick={() => setSelectedDayDetail(selectedDayDetail === day.isoDate ? null : day.isoDate)}
                className={`min-h-[90px] sm:min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  hasClosed
                    ? 'bg-[#1b1216] border-rose-500/40 hover:border-rose-400/70 shadow-sm'
                    : isWeekend
                    ? 'bg-[#0e1422] border-slate-800 text-gray-500 hover:border-slate-700'
                    : 'bg-[#0c121e] border-nikkei-border/40 hover:border-slate-700 text-gray-300'
                }`}
              >
                {/* Day Card Header */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs sm:text-sm font-black rounded-lg px-1.5 py-0.5 ${
                      hasClosed
                        ? 'bg-rose-500/20 text-rose-300'
                        : isWeekend
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-800/60 text-gray-300'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {isWeekend && !hasClosed && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 truncate">
                      ⏸️ หยุด
                    </span>
                  )}
                </div>

                {/* Day Card Body: Show ONLY concise Closed Badges like "จีนปิด", "นิเคอิปิด" */}
                <div className="mt-1 space-y-1 flex-1 flex flex-col justify-center">
                  {hasClosed ? (
                    closedItems.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-center text-[10px] sm:text-xs font-black px-1.5 py-1 rounded-lg border bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-sm"
                      >
                        <span>🔴 {item.shortClosedLabel}</span>
                      </div>
                    ))
                  ) : isWeekend ? (
                    <div className="text-center py-1">
                      <span className="text-[10px] font-medium text-slate-500 block">
                        วันหยุดเสาร์-อาทิตย์
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-1 opacity-0">
                      <span className="text-[10px] font-medium">เปิด</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Box */}
      {selectedDayDetail && (
        <div className="bg-[#0e1626] border border-amber-500/40 rounded-xl p-4 animate-fadeIn space-y-3">
          {(() => {
            const dayObj = calendarData.days.find((d) => d.isoDate === selectedDayDetail);
            if (!dayObj) return null;
            return (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-nikkei-border">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    สถานะเปิด-ปิดรายหวย ประจำวันที่ {dayObj.dayNumber} {THAI_MONTHS[currentMonth]} {currentYear + 543} ({dayObj.dayNameThai})
                  </h3>
                  <button
                    onClick={() => setSelectedDayDetail(null)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    ปิด [X]
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {dayObj.breakdown.map((item) => (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border space-y-1 ${
                        item.status === 'OPEN'
                          ? 'bg-emerald-950/30 border-emerald-500/30'
                          : item.status === 'CLOSED'
                          ? 'bg-rose-950/30 border-rose-500/30'
                          : 'bg-slate-900/50 border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black text-white flex items-center justify-between">
                        <span>{item.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.status === 'OPEN'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.status === 'CLOSED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.statusText}
                        </span>
                      </div>
                      {item.holidayName && (
                        <p className="text-[11px] text-amber-400 font-semibold mt-1">
                          📌 {item.holidayName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
