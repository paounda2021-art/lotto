import React, { useState } from 'react';
import { DrawResult, SessionType, LotteryType } from '../types';
import { Table, Calendar, Search, Filter, PlusCircle, Sparkles, X, Sun, Sunset, Landmark, Edit3, Trash2, LayoutGrid, List, Gem } from 'lucide-react';

interface HistoryTableProps {
  data: DrawResult[];
  lotteryType: LotteryType;
  onAddDraw: (newDraw: Omit<DrawResult, 'id'>) => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (draw: DrawResult) => void;
  onDeleteDraw?: (drawId: string, drawDate: string, lottery: LotteryType) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  lotteryType,
  onAddDraw,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteDraw
}) => {
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<SessionType>('BOTH');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [highlightDigit, setHighlightDigit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'AUTO' | 'TABLE' | 'CARDS'>('AUTO');

  // Filter Data
  const filteredData = data.filter((item) => {
    if (lotteryType === 'NIKKEI' && selectedSessionFilter !== 'BOTH' && item.session !== selectedSessionFilter) return false;
    if (lotteryType === 'STOCKS_VIP' && selectedSessionFilter !== 'BOTH' && item.session !== selectedSessionFilter) return false;
    if (lotteryType === 'HANOI' && selectedSessionFilter !== 'BOTH' && item.session !== selectedSessionFilter) return false;
    if (selectedMonth === 'OCT' && !item.dateFormatted.includes('ต.ค.')) return false;
    if (selectedMonth === 'SEP' && !item.dateFormatted.includes('ก.ย.')) return false;
    if (selectedMonth === 'AUG' && !item.dateFormatted.includes('ส.ค.')) return false;
    if (selectedMonth === 'JUL' && !item.dateFormatted.includes('ก.ค.')) return false;
    if (selectedMonth === 'JUN' && !item.dateFormatted.includes('มิ.ย.')) return false;
    if (selectedDay !== 'ALL' && item.dayOfWeek !== selectedDay) return false;

    if (searchQuery) {
      const q = searchQuery.trim();
      return (
        item.dateFormatted.includes(q) ||
        item.top3.includes(q) ||
        item.bottom2.includes(q) ||
        (item.full6D && item.full6D.includes(q))
      );
    }
    return true;
  });

  const renderHighlightedDigits = (str: string) => {
    if (highlightDigit === null) return <span>{str}</span>;
    const digitChar = highlightDigit.toString();
    return (
      <span>
        {str.split('').map((ch, idx) => (
          <span
            key={idx}
            className={
              ch === digitChar
                ? 'bg-amber-400 text-black font-extrabold px-1 rounded shadow-glow-gold'
                : ''
            }
          >
            {ch}
          </span>
        ))}
      </span>
    );
  };

  const renderSessionBadge = (item: DrawResult) => {
    if (lotteryType === 'STOCKS_VIP') {
      if (item.session === 'NIKKEI_VIP_MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🎌 นิคเคอิ VIP เช้า (09:30)
          </span>
        );
      }
      if (item.session === 'NIKKEI_VIP_AFTERNOON') {
        return (
          <span className="inline-flex items-center gap-1 bg-amber-600/20 text-amber-300 border border-amber-600/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🎌 นิคเคอิ VIP บ่าย (13:00)
          </span>
        );
      }
      if (item.session === 'CHINA_VIP_MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇨🇳 จีน VIP เช้า (09:30)
          </span>
        );
      }
      if (item.session === 'CHINA_VIP_AFTERNOON') {
        return (
          <span className="inline-flex items-center gap-1 bg-red-600/20 text-red-300 border border-red-600/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇨🇳 จีน VIP บ่าย (14:00)
          </span>
        );
      }
      if (item.session === 'HANGSENG_VIP_MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇭🇰 ฮั่งเส็ง VIP เช้า (11:00)
          </span>
        );
      }
      if (item.session === 'HANGSENG_VIP_AFTERNOON') {
        return (
          <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 border border-blue-600/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇭🇰 ฮั่งเส็ง VIP บ่าย (15:30)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
          💎 หุ้น VIP
        </span>
      );
    }

    if (lotteryType === 'NIKKEI') {
      if (item.session === 'CHINA_MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇨🇳 จีน เช้า (10:35)
          </span>
        );
      }
      if (item.session === 'CHINA_AFTERNOON') {
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇨🇳 จีน บ่าย (14:00)
          </span>
        );
      }
      if (item.session === 'HANGSENG_MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇭🇰 ฮั่งเส็ง เช้า (11:00)
          </span>
        );
      }
      if (item.session === 'HANGSENG_AFTERNOON') {
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            🇭🇰 ฮั่งเส็ง บ่าย (15:00)
          </span>
        );
      }
      if (item.session === 'NIKKEI_MORNING' || item.session === 'MORNING') {
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
            <Sun className="w-3 h-3 text-amber-400" /> นิเคอิ เช้า (09:30)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 bg-amber-600/20 text-amber-300 border border-amber-600/30 px-2 py-0.5 rounded-lg font-bold text-[11px]">
          <Sunset className="w-3 h-3 text-amber-400" /> นิเคอิ บ่าย (13:00)
        </span>
      );
    }

    if (lotteryType === 'DOWJONES') {
      return (
        <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
          🇺🇸 ดาวโจนส์ (04:00)
        </span>
      );
    }
    if (lotteryType === 'LAOS') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
          🇱🇦 ลาวพัฒนา (20:30)
        </span>
      );
    }

    if (lotteryType === 'MALAY') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
          🇲🇾 หวยมาเลย์ (18:30)
        </span>
      );
    }
    if (lotteryType === 'HANOI') {
      if (item.session === 'HANOI_SPECIAL') {
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
            🟠 ฮานอยพิเศษ (17:30)
          </span>
        );
      }
      if (item.session === 'HANOI_VIP') {
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
            🟣 ฮานอย VIP (19:30)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
          🔴 ฮานอยปกติ (18:30)
        </span>
      );
    }
    if (lotteryType === 'GSB') {
      return (
        <span className="inline-flex items-center gap-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
          🏦 ออมสิน (13:00)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
        🇹🇭 รัฐบาลไทย (15:30)
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a]/85 via-[#111c33]/80 to-[#182338]/90 backdrop-blur-xl border border-white/10 p-3 sm:p-6 shadow-2xl shadow-black/40">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            {lotteryType === 'STOCKS_VIP' ? (
              <Gem className="w-5 h-5 text-cyan-400" />
            ) : (
              <Table className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              ตารางสถิติผลการออกรางวัล {
                lotteryType === 'STOCKS_VIP'
                  ? '💎 หวยหุ้น VIP (นิคเคอิ / จีน / ฮั่งเส็ง)'
                  : lotteryType === 'NIKKEI'
                  ? '📈 หุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง)'
                  : lotteryType === 'DOWJONES'
                  ? '🇺🇸 หุ้นดาวโจนส์ (เช้ามืด 04:00 น.)'
                  : lotteryType === 'LAOS'
                  ? '🇱🇦 ลาวพัฒนา (รอบ 20:30 น.)'
                  : lotteryType === 'MALAY'
                  ? '🇲🇾 หวยมาเลย์ (Magnum 4D รอบ 18:30 น.)'
                  : lotteryType === 'HANOI'
                  ? '🇻🇳 ฮานอย (รอบ 18:30 น.)'
                  : lotteryType === 'GSB'
                  ? '🏦 ออมสิน (ย้อนหลัง 6 เดือน)'
                  : '🇹🇭 รัฐบาลไทย (ย้อนหลัง 6 เดือน)'
              }
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {lotteryType === 'STOCKS_VIP'
              ? 'แสดงผลสถิติย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง รวมกว่า 120+ งวด อ้างอิงสถิติ VIP'
              : lotteryType === 'NIKKEI'
              ? 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง แยกตามรอบการปิดตลาด (เช้า 09:30 น. / บ่าย 13:00 น.)'
              : lotteryType === 'DOWJONES'
              ? 'แสดงผลหวยหุ้นดาวโจนส์ย้อนหลัง ดัชนีปิดตลาดสหรัฐฯ อ้างอิง exphuay'
              : lotteryType === 'LAOS'
              ? 'แสดงผลหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง อ้างอิง LottoTH'
              : lotteryType === 'MALAY'
              ? 'แสดงผลหวยมาเลย์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง (Magnum 4D) ย้อนหลัง'
              : lotteryType === 'HANOI'
              ? 'แสดงผลหวยฮานอยปกติ ย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง'
              : lotteryType === 'GSB'
              ? 'แสดงผลหวยออมสิน 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ย้อนหลัง 6 เดือนเต็ม'
              : 'แสดงผลสลากกินแบ่งรัฐบาลไทย รางวัลที่ 1, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ย้อนหลัง 6 เดือนเต็ม'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle (Cards vs Table) for Mobile */}
          <div className="flex items-center backdrop-blur-md bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('TABLE')}
              title="มุมมองตารางเต็ม"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-amber-400 text-black shadow-glow-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              title="มุมมองการ์ด (ดูง่ายบนมือถือ)"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-amber-400 text-black shadow-glow-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ดมือถือ</span>
            </button>
          </div>

          {/* Quick Highlight Buttons */}
          <div className="flex items-center gap-1 backdrop-blur-md bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-gray-400 px-1 font-medium whitespace-nowrap">ไฮไลท์:</span>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setHighlightDigit(highlightDigit === num ? null : num)}
                className={`w-6 h-6 rounded-md font-bold text-xs transition-all shrink-0 ${
                  highlightDigit === num
                    ? 'bg-amber-400 text-black shadow-glow-gold scale-110'
                    : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.12]'
                }`}
              >
                {num}
              </button>
            ))}
            {highlightDigit !== null && (
              <button
                onClick={() => setHighlightDigit(null)}
                className="text-[10px] text-red-400 hover:text-red-300 px-1.5 font-bold whitespace-nowrap"
              >
                ล้าง
              </button>
            )}
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-glow-gold cursor-pointer whitespace-nowrap ml-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มผลใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 my-3 sm:my-4">
        
        {/* Session Filter */}
        {lotteryType === 'STOCKS_VIP' ? (
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ VIP:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="BOTH" className="bg-[#0f172a]">รวมทุกหุ้น VIP (6 รอบ)</option>
              <option value="NIKKEI_VIP_MORNING" className="bg-[#0f172a]">🎌 นิคเคอิ VIP เช้า (09:30)</option>
              <option value="NIKKEI_VIP_AFTERNOON" className="bg-[#0f172a]">🎌 นิคเคอิ VIP บ่าย (13:00)</option>
              <option value="CHINA_VIP_MORNING" className="bg-[#0f172a]">🇨🇳 จีน VIP เช้า (09:30)</option>
              <option value="CHINA_VIP_AFTERNOON" className="bg-[#0f172a]">🇨🇳 จีน VIP บ่าย (14:00)</option>
              <option value="HANGSENG_VIP_MORNING" className="bg-[#0f172a]">🇭🇰 ฮั่งเส็ง VIP เช้า (11:00)</option>
              <option value="HANGSENG_VIP_AFTERNOON" className="bg-[#0f172a]">🇭🇰 ฮั่งเส็ง VIP บ่าย (15:30)</option>
            </select>
          </div>
        ) : lotteryType === 'NIKKEI' ? (
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="BOTH" className="bg-[#0f172a]">ทั้ง 2 รอบ (เช้า+บ่าย)</option>
              <option value="MORNING" className="bg-[#0f172a]">เฉพาะรอบเช้า (09:30)</option>
              <option value="AFTERNOON" className="bg-[#0f172a]">เฉพาะรอบบ่าย (13:00)</option>
            </select>
          </div>
        ) : lotteryType === 'HANOI' ? (
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="BOTH" className="bg-[#0f172a]">รวมทั้ง 3 ฮานอย (17:30 / 18:30 / 19:30)</option>
              <option value="HANOI_SPECIAL" className="bg-[#0f172a]">เฉพาะฮานอยพิเศษ (17:30)</option>
              <option value="HANOI_EVENING" className="bg-[#0f172a]">เฉพาะฮานอยปกติ (18:30)</option>
              <option value="HANOI_VIP" className="bg-[#0f172a]">เฉพาะฮานอย VIP (19:30)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
            <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-300 font-bold">
              {
                lotteryType === 'DOWJONES' ? '🇺🇸 หุ้นดาวโจนส์ (04:00)'
                : lotteryType === 'LAOS' ? '🇱🇦 ลาวพัฒนา (20:30)'
                : lotteryType === 'GSB' ? '🏦 ออมสิน (13:00)'
                : '🇹🇭 รัฐบาลไทย (15:30)'
              }
            </span>
          </div>
        )}

        {/* Month Filter */}
        <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-gray-400 font-medium shrink-0">เดือน:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-amber-300 font-bold focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-[#0f172a]">ทั้งหมดทุกเดือน ({filteredData.length} งวด)</option>
            <option value="OCT" className="bg-[#0f172a]">ตุลาคม 2569</option>
            <option value="SEP" className="bg-[#0f172a]">กันยายน 2569</option>
            <option value="AUG" className="bg-[#0f172a]">สิงหาคม 2569</option>
            <option value="JUL" className="bg-[#0f172a]">กรกฎาคม 2569</option>
            <option value="JUN" className="bg-[#0f172a]">มิถุนายน 2569</option>
          </select>
        </div>

        {/* Day of Week Filter */}
        <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-gray-400 font-medium shrink-0">วัน:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-transparent text-cyan-300 font-bold focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-[#0f172a]">ทุกวัน (จันทร์-อาทิตย์)</option>
            <option value="Mon" className="bg-[#0f172a]">วันจันทร์</option>
            <option value="Tue" className="bg-[#0f172a]">วันอังคาร</option>
            <option value="Wed" className="bg-[#0f172a]">วันพุธ</option>
            <option value="Thu" className="bg-[#0f172a]">วันพฤหัสบดี</option>
            <option value="Fri" className="bg-[#0f172a]">วันศุกร์</option>
            <option value="Sat" className="bg-[#0f172a]">วันเสาร์</option>
            <option value="Sun" className="bg-[#0f172a]">วันอาทิตย์</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-3 py-2 rounded-xl text-xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา เช่น 672, 72, 02 ต.ค."
            className="bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Mobile Card View (shown when viewMode === 'CARDS' or on small screens if AUTO) */}
      {(viewMode === 'CARDS' || (viewMode === 'AUTO')) && (
        <div className={`space-y-2.5 ${viewMode === 'AUTO' ? 'block md:hidden' : 'block'}`}>
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 backdrop-blur-md bg-white/[0.02] rounded-xl border border-white/[0.06]">
              ไม่พบข้อมูลสถิติที่ตรงกับเงื่อนไข
            </div>
          ) : (
            filteredData.map((item) => {
              const isTwinTop = item.top3[0] === item.top3[1] || item.top3[1] === item.top3[2] || item.top3[0] === item.top3[2];
              const isTwinBottom = item.bottom2[0] === item.bottom2[1];

              return (
                <div
                  key={item.id}
                  className="backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl p-3 transition-all space-y-2 shadow-md"
                >
                  {/* Card Header: Session Badge & Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderSessionBadge(item)}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.dayOfWeek === 'Mon' ? 'bg-yellow-500/20 text-yellow-300' :
                        item.dayOfWeek === 'Tue' ? 'bg-pink-500/20 text-pink-300' :
                        item.dayOfWeek === 'Wed' ? 'bg-emerald-500/20 text-emerald-300' :
                        item.dayOfWeek === 'Thu' ? 'bg-orange-500/20 text-orange-300' :
                        item.dayOfWeek === 'Fri' ? 'bg-cyan-500/20 text-cyan-300' :
                        item.dayOfWeek === 'Sat' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {item.dayNameThai ? `วัน${item.dayNameThai}` : item.dayOfWeek}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isManual && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-0.5 shadow-sm">
                          ✏️ บันทึกเอง
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-300">{item.dateFormatted}</span>
                      <div className="flex items-center gap-1">
                        {onOpenEditModal && (
                          <button
                            onClick={() => onOpenEditModal(item)}
                            title="แก้ไข"
                            className="p-1 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteDraw && (
                          <button
                            onClick={() => onDeleteDraw(item.id, item.dateFormatted, lotteryType)}
                            title="ลบ"
                            className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-black/30 p-2.5 rounded-xl border border-white/[0.05]">
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">3 ตัวบน</span>
                      <span className="text-xl font-black text-amber-300 tracking-wider">
                        {renderHighlightedDigits(item.top3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">2 ตัวบน</span>
                      <span className="text-xl font-black text-amber-400 tracking-wider">
                        {renderHighlightedDigits(item.top2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">2 ตัวล่าง</span>
                      <span className="text-xl font-black text-cyan-300 tracking-wider">
                        {renderHighlightedDigits(item.bottom2)}
                      </span>
                    </div>
                  </div>

                  {/* Extra info: 6D or Twins */}
                  {(item.full6D || isTwinTop || isTwinBottom) && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
                      {item.full6D && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-[11px]">เต็ม 6 หลัก:</span>
                          <span className="font-mono font-bold text-amber-300">{item.full6D}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        {isTwinTop && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.2 rounded text-[10px] font-bold">
                            เบิ้ลบน
                          </span>
                        )}
                        {isTwinBottom && (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.2 rounded text-[10px] font-bold">
                            เบิ้ลล่าง
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Desktop & Tablet Table View */}
      {(viewMode === 'TABLE' || (viewMode === 'AUTO')) && (
        <div className={`overflow-x-auto no-scrollbar scrollbar-none rounded-xl border border-white/[0.08] ${viewMode === 'AUTO' ? 'hidden md:block' : 'block'}`}>
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-4">รอบ / ตลาด</th>
                <th className="py-3 px-4">งวดประจำวันที่</th>
                {(lotteryType === 'LAOS' || lotteryType === 'GSB' || lotteryType === 'GOVERNMENT') && (
                  <th className="py-3 px-4 text-center">รางวัลเต็ม 6 หลัก</th>
                )}
                <th className="py-3 px-4 text-center">3 ตัวบน</th>
                <th className="py-3 px-4 text-center">2 ตัวบน</th>
                <th className="py-3 px-4 text-center">2 ตัวล่าง</th>
                <th className="py-3 px-4 text-center">รูปแบบ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-gray-300">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูลสถิติที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isTwinTop = item.top3[0] === item.top3[1] || item.top3[1] === item.top3[2] || item.top3[0] === item.top3[2];
                  const isTwinBottom = item.bottom2[0] === item.bottom2[1];

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-xs">
                        {renderSessionBadge(item)}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-200">
                        <div className="flex items-center gap-2">
                          <span>{item.dateFormatted}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.dayOfWeek === 'Mon' ? 'bg-yellow-500/20 text-yellow-300' :
                            item.dayOfWeek === 'Tue' ? 'bg-pink-500/20 text-pink-300' :
                            item.dayOfWeek === 'Wed' ? 'bg-emerald-500/20 text-emerald-300' :
                            item.dayOfWeek === 'Thu' ? 'bg-orange-500/20 text-orange-300' :
                            item.dayOfWeek === 'Fri' ? 'bg-cyan-500/20 text-cyan-300' :
                            item.dayOfWeek === 'Sat' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            วัน{item.dayNameThai}
                          </span>
                          {item.isManual && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-0.5 shadow-sm">
                              ✏️ บันทึกเอง
                            </span>
                          )}
                        </div>
                      </td>
                      {(lotteryType === 'LAOS' || lotteryType === 'GSB' || lotteryType === 'GOVERNMENT') && (
                        <td className="py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono">
                          {renderHighlightedDigits(item.full6D || '-')}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center font-extrabold text-amber-300 text-base tracking-wider">
                        {renderHighlightedDigits(item.top3)}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-amber-400 text-base tracking-wider">
                        {renderHighlightedDigits(item.top2)}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-cyan-300 text-base tracking-wider">
                        {renderHighlightedDigits(item.bottom2)}
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        {isTwinTop && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold mr-1">
                            เบิ้ลบน
                          </span>
                        )}
                        {isTwinBottom && (
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            เบิ้ลล่าง
                          </span>
                        )}
                        {!isTwinTop && !isTwinBottom && (
                          <span className="text-gray-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          {onOpenEditModal && (
                            <button
                              onClick={() => onOpenEditModal(item)}
                              title="แก้ไขข้อมูลผลรางวัลนี้"
                              className="p-1 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteDraw && (
                            <button
                              onClick={() => onDeleteDraw(item.id, item.dateFormatted, lotteryType)}
                              title="ลบผลรางวัลนี้"
                              className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 mt-4 pt-3 border-t border-white/[0.08]">
        <div>
          แสดง <strong className="text-amber-300">{filteredData.length}</strong> จากทั้งหมด <strong className="text-gray-200">{data.length}</strong> งวด
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-glow-gold"></span>
            <span>3 ตัวบน / 2 ตัวบน</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-glow-cyan"></span>
            <span>2 ตัวล่าง</span>
          </span>
        </div>
      </div>

    </div>
  );
};
