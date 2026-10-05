import React, { useState } from 'react';
import { DrawResult, SessionType, LotteryType } from '../types';
import { Table, Calendar, Search, Filter, PlusCircle, Sparkles, X, Sun, Sunset, Landmark, Edit3, Trash2 } from 'lucide-react';

interface HistoryTableProps {
  data: DrawResult[];
  lotteryType: LotteryType;
  selectedSession?: SessionType;
  onAddDraw: (newDraw: Omit<DrawResult, 'id'>) => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (draw: DrawResult) => void;
  onDeleteDraw?: (drawId: string, drawDate: string, lottery: LotteryType) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, lotteryType, selectedSession, onAddDraw, onOpenAddModal, onOpenEditModal, onDeleteDraw }) => {
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<SessionType>('BOTH');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [highlightDigit, setHighlightDigit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Data
  const filteredData = data.filter((item) => {
    if (lotteryType === 'STOCK_VIP' && selectedSessionFilter !== 'BOTH') {
      if (item.session !== selectedSessionFilter) return false;
    }
    if (lotteryType === 'NIKKEI' && selectedSessionFilter !== 'BOTH') {
      if (selectedSessionFilter === 'MORNING') {
        if (item.session !== 'MORNING' && item.session !== 'NIKKEI_MORNING') return false;
      } else if (selectedSessionFilter === 'AFTERNOON') {
        if (item.session !== 'AFTERNOON' && item.session !== 'NIKKEI_AFTERNOON') return false;
      } else {
        if (item.session !== selectedSessionFilter) return false;
      }
    }
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

  return (
    <div className="bg-nikkei-card border border-nikkei-border rounded-2xl p-6 shadow-lg">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-nikkei-border">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-extrabold text-white">
              ตารางสถิติผลการออกรางวัล {
                lotteryType === 'STOCK_VIP'
                  ? selectedSession?.startsWith('CHINA_VIP')
                    ? '💎🇨🇳 หุ้นจีน VIP (เช้า 09:30 / บ่าย 13:00 น.)'
                    : selectedSession?.startsWith('HANGSENG_VIP')
                    ? '💎🇭🇰 หุ้นฮั่งเส็ง VIP (เช้า 10:55 / บ่าย 14:55 น.)'
                    : selectedSession === 'STOCKS_VIP_ALL_3'
                    ? '💎⭐ รวมทุกหุ้น VIP (นิเคอิ / จีน / ฮั่งเส็ง)'
                    : '💎🎌 หุ้นนิเคอิ VIP (เช้า 08:30 / บ่าย 12:00 น.)'
                  : lotteryType === 'NIKKEI'
                  ? selectedSession?.startsWith('CHINA')
                    ? '🇨🇳 หุ้นจีน (เช้า 10:35 / บ่าย 14:00 น.)'
                    : selectedSession?.startsWith('HANGSENG')
                    ? '🇭🇰 หุ้นฮั่งเส็ง (เช้า 11:00 / บ่าย 15:00 น.)'
                    : selectedSession === 'STOCKS_ALL_3'
                    ? '⭐ รวมทุกหุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง)'
                    : '🎌 หุ้นนิเคอิ (เช้า 09:30 / บ่าย 13:00 น.)'
                  : lotteryType === 'DOWJONES'
                  ? '🇺🇸 หุ้นดาวโจนส์ (เช้ามืด 04:00 น.)'
                  : lotteryType === 'LAOS'
                  ? '🇱🇦 ลาวพัฒนา (รอบ 20:30 น.)'
                  : lotteryType === 'HANOI'
                  ? '🇻🇳 ฮานอย (รอบ 18:30 น.)'
                  : lotteryType === 'GSB'
                  ? '🏦 ออมสิน (ย้อนหลัง 6 เดือน)'
                  : '🇹🇭 รัฐบาลไทย (ย้อนหลัง 6 เดือน)'
              }
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {lotteryType === 'STOCK_VIP'
              ? selectedSession?.startsWith('CHINA_VIP')
                ? 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ของหุ้นจีน VIP แยกตามรอบเช้า 09:30 น. และรอบบ่าย 13:00 น. ออกผลทุกวัน'
                : selectedSession?.startsWith('HANGSENG_VIP')
                ? 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ของหุ้นฮั่งเส็ง VIP แยกตามรอบเช้า 10:55 น. และรอบบ่าย 14:55 น. ออกผลทุกวัน'
                : selectedSession === 'STOCKS_VIP_ALL_3'
                ? 'แสดงผลย้อนหลังรวมทุกหุ้น VIP 3 ตลาด (นิเคอิ VIP, จีน VIP, ฮั่งเส็ง VIP รวม 6 รอบ)'
                : 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ของหุ้นนิเคอิ VIP แยกตามรอบเช้า 08:30 น. และรอบบ่าย 12:00 น. ออกผลทุกวัน'
              : lotteryType === 'NIKKEI'
              ? selectedSession?.startsWith('CHINA')
                ? 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ของหุ้นจีน แยกตามรอบเช้า 10:35 น. และรอบบ่าย 14:00 น.'
                : selectedSession?.startsWith('HANGSENG')
                ? 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ของหุ้นฮั่งเส็ง แยกตามรอบเช้า 11:00 น. และรอบบ่าย 15:00 น.'
                : selectedSession === 'STOCKS_ALL_3'
                ? 'แสดงผลย้อนหลังรวมทุกหุ้นปกติ 3 ตลาด (นิเคอิ, จีน, ฮั่งเส็ง รวม 6 รอบ)'
                : 'แสดงผลย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง แยกตามรอบการปิดตลาด (เช้า 09:30 น. / บ่าย 13:00 น.)'
              : lotteryType === 'DOWJONES'
              ? 'แสดงผลหวยหุ้นดาวโจนส์ย้อนหลัง ดัชนีปิดตลาดสหรัฐฯ อ้างอิง exphuay'
              : lotteryType === 'LAOS'
              ? 'แสดงผลหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง อ้างอิง LottoTH'
              : lotteryType === 'HANOI'
              ? 'แสดงผลหวยฮานอยปกติ ย้อนหลัง 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง อ้างอิง exphuay (Minh Ngoc)'
              : lotteryType === 'GSB'
              ? 'แสดงผลหวยออมสิน 6 ตัว, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ย้อนหลัง 6 เดือนเต็ม อ้างอิง exphuay (GSB)'
              : 'แสดงผลสลากกินแบ่งรัฐบาลไทย รางวัลที่ 1, 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ย้อนหลัง 6 เดือนเต็ม อ้างอิง GLO'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Highlight Buttons */}
          <div className="flex items-center gap-1 bg-nikkei-dark/80 border border-nikkei-border p-1 rounded-xl">
            <span className="text-[10px] text-gray-400 px-2 font-medium">ไฮไลท์เลข:</span>
            {[0,1,2,3,4,5,6,7,8,9].map((num) => (
              <button
                key={num}
                onClick={() => setHighlightDigit(highlightDigit === num ? null : num)}
                className={`w-6 h-6 rounded-md font-bold text-xs transition-all ${
                  highlightDigit === num
                    ? 'bg-amber-400 text-black shadow-glow-gold scale-110'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
            {highlightDigit !== null && (
              <button
                onClick={() => setHighlightDigit(null)}
                className="text-[10px] text-red-400 hover:text-red-300 px-1.5 font-bold"
              >
                ล้าง
              </button>
            )}
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-glow-gold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ป้อนผลรางวัลใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-4">
        
        {/* Session Filter for Nikkei, VIP Stocks & Hanoi */}
        {lotteryType === 'STOCK_VIP' ? (
          <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              {selectedSession?.startsWith('CHINA_VIP') ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">💎🇨🇳 รวมหุ้นจีน VIP (เช้า+บ่าย)</option>
                  <option value="CHINA_VIP_MORNING" className="bg-nikkei-card">🇨🇳 เฉพาะรอบเช้า (09:30 น.)</option>
                  <option value="CHINA_VIP_AFTERNOON" className="bg-nikkei-card">🇨🇳 เฉพาะรอบบ่าย (13:00 น.)</option>
                </>
              ) : selectedSession?.startsWith('HANGSENG_VIP') ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">💎🇭🇰 รวมหุ้นฮั่งเส็ง VIP (เช้า+บ่าย)</option>
                  <option value="HANGSENG_VIP_MORNING" className="bg-nikkei-card">🇭🇰 เฉพาะรอบเช้า (10:55 น.)</option>
                  <option value="HANGSENG_VIP_AFTERNOON" className="bg-nikkei-card">🇭🇰 เฉพาะรอบบ่าย (14:55 น.)</option>
                </>
              ) : selectedSession === 'STOCKS_VIP_ALL_3' ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">💎⭐ รวมทุกหุ้น VIP (6 รอบ)</option>
                  <option value="NIKKEI_VIP_MORNING" className="bg-nikkei-card">💎🎌 นิเคอิ VIP เช้า (08:30 น.)</option>
                  <option value="NIKKEI_VIP_AFTERNOON" className="bg-nikkei-card">💎🎌 นิเคอิ VIP บ่าย (12:00 น.)</option>
                  <option value="CHINA_VIP_MORNING" className="bg-nikkei-card">💎🇨🇳 จีน VIP เช้า (09:30 น.)</option>
                  <option value="CHINA_VIP_AFTERNOON" className="bg-nikkei-card">💎🇨🇳 จีน VIP บ่าย (13:00 น.)</option>
                  <option value="HANGSENG_VIP_MORNING" className="bg-nikkei-card">💎🇭🇰 ฮั่งเส็ง VIP เช้า (10:55 น.)</option>
                  <option value="HANGSENG_VIP_AFTERNOON" className="bg-nikkei-card">💎🇭🇰 ฮั่งเส็ง VIP บ่าย (14:55 น.)</option>
                </>
              ) : (
                <>
                  <option value="BOTH" className="bg-nikkei-card">💎🎌 ทั้ง 2 รอบ (เช้า+บ่าย)</option>
                  <option value="NIKKEI_VIP_MORNING" className="bg-nikkei-card">🎌 เฉพาะรอบเช้า (08:30 น.)</option>
                  <option value="NIKKEI_VIP_AFTERNOON" className="bg-nikkei-card">🎌 เฉพาะรอบบ่าย (12:00 น.)</option>
                </>
              )}
            </select>
          </div>
        ) : lotteryType === 'NIKKEI' ? (
          <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              {selectedSession?.startsWith('CHINA') ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">🇨🇳 รวมหุ้นจีน (เช้า+บ่าย)</option>
                  <option value="CHINA_MORNING" className="bg-nikkei-card">🇨🇳 เฉพาะรอบเช้า (10:35 น.)</option>
                  <option value="CHINA_AFTERNOON" className="bg-nikkei-card">🇨🇳 เฉพาะรอบบ่าย (14:00 น.)</option>
                </>
              ) : selectedSession?.startsWith('HANGSENG') ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">🇭🇰 รวมหุ้นฮั่งเส็ง (เช้า+บ่าย)</option>
                  <option value="HANGSENG_MORNING" className="bg-nikkei-card">🇭🇰 เฉพาะรอบเช้า (11:00 น.)</option>
                  <option value="HANGSENG_AFTERNOON" className="bg-nikkei-card">🇭🇰 เฉพาะรอบบ่าย (15:00 น.)</option>
                </>
              ) : selectedSession === 'STOCKS_ALL_3' ? (
                <>
                  <option value="BOTH" className="bg-nikkei-card">⭐ รวมทุกหุ้นปกติ (6 รอบ)</option>
                  <option value="NIKKEI_MORNING" className="bg-nikkei-card">🎌 นิเคอิ เช้า (09:30 น.)</option>
                  <option value="NIKKEI_AFTERNOON" className="bg-nikkei-card">🎌 นิเคอิ บ่าย (13:00 น.)</option>
                  <option value="CHINA_MORNING" className="bg-nikkei-card">🇨🇳 จีน เช้า (10:35 น.)</option>
                  <option value="CHINA_AFTERNOON" className="bg-nikkei-card">🇨🇳 จีน บ่าย (14:00 น.)</option>
                  <option value="HANGSENG_MORNING" className="bg-nikkei-card">🇭🇰 ฮั่งเส็ง เช้า (11:00 น.)</option>
                  <option value="HANGSENG_AFTERNOON" className="bg-nikkei-card">🇭🇰 ฮั่งเส็ง บ่าย (15:00 น.)</option>
                </>
              ) : (
                <>
                  <option value="BOTH" className="bg-nikkei-card">🎌 ทั้ง 2 รอบ (เช้า+บ่าย)</option>
                  <option value="MORNING" className="bg-nikkei-card">🎌 เฉพาะรอบเช้า (09:30 น.)</option>
                  <option value="AFTERNOON" className="bg-nikkei-card">🎌 เฉพาะรอบบ่าย (13:00 น.)</option>
                </>
              )}
            </select>
          </div>
        ) : lotteryType === 'HANOI' ? (
          <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-400 shrink-0">รอบ:</span>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="BOTH" className="bg-nikkei-card">รวมทั้ง 3 ฮานอย (17:30 / 18:30 / 19:30)</option>
              <option value="HANOI_SPECIAL" className="bg-nikkei-card">เฉพาะฮานอยพิเศษ (17:30)</option>
              <option value="HANOI_EVENING" className="bg-nikkei-card">เฉพาะฮานอยปกติ (18:30)</option>
              <option value="HANOI_VIP" className="bg-nikkei-card">เฉพาะฮานอย VIP (19:30)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
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
        <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-gray-400 font-medium">เดือน:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-amber-300 font-bold focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-nikkei-card">ทั้งหมด 3 เดือนเต็ม (60+ งวด)</option>
            <option value="OCT" className="bg-nikkei-card">ตุลาคม 2569</option>
            <option value="SEP" className="bg-nikkei-card">กันยายน 2569</option>
            <option value="AUG" className="bg-nikkei-card">สิงหาคม 2569</option>
            <option value="JUL" className="bg-nikkei-card">กรกฎาคม 2569</option>
            <option value="JUN" className="bg-nikkei-card">มิถุนายน 2569</option>
          </select>
        </div>

        {/* Day of Week Filter */}
        <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-gray-400 shrink-0">วัน:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-transparent text-gray-200 font-semibold focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-nikkei-card">ทุกวันทำการ</option>
            <option value="Mon" className="bg-nikkei-card">วันจันทร์</option>
            <option value="Tue" className="bg-nikkei-card">วันอังคาร</option>
            <option value="Wed" className="bg-nikkei-card">วันพุธ</option>
            <option value="Thu" className="bg-nikkei-card">วันพฤหัสบดี</option>
            <option value="Fri" className="bg-nikkei-card">วันศุกร์</option>
            <option value="Sat" className="bg-nikkei-card">วันเสาร์</option>
            <option value="Sun" className="bg-nikkei-card">วันอาทิตย์</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-nikkei-dark/60 border border-nikkei-border px-3 py-2 rounded-xl text-xs">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="ค้นหา เช่น 677..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none w-full"
          />
        </div>

      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-xl border border-nikkei-border/80">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-nikkei-dark text-gray-400 text-xs uppercase tracking-wider border-b border-nikkei-border">
              <th className="py-3 px-4">รอบ / หวย</th>
              <th className="py-3 px-4">วันที่ / วันประจำสัปดาห์</th>
              {(lotteryType === 'LAOS' || lotteryType === 'GSB' || lotteryType === 'GOVERNMENT') && (
                <th className="py-3 px-4 text-center">รางวัลเต็ม 6 หลัก</th>
              )}
              <th className="py-3 px-4 text-center">3 ตัวบน</th>
              <th className="py-3 px-4 text-center">2 ตัวบน</th>
              <th className="py-3 px-4 text-center">2 ตัวล่าง</th>
              <th className="py-3 px-4 text-center">รูปแบบ</th>
              <th className="py-3 px-4 text-center">แก้ไข / ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nikkei-border/50 text-gray-300">
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
                    className="hover:bg-nikkei-cardHover/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-xs">
                      {lotteryType === 'STOCK_VIP' ? (
                        item.session === 'CHINA_VIP_MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-extrabold">
                            💎🇨🇳 จีน VIP เช้า (09:30)
                          </span>
                        ) : item.session === 'CHINA_VIP_AFTERNOON' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-extrabold">
                            💎🇨🇳 จีน VIP บ่าย (13:00)
                          </span>
                        ) : item.session === 'HANGSENG_VIP_MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-extrabold">
                            💎🇭🇰 ฮั่งเส็ง VIP เช้า (10:55)
                          </span>
                        ) : item.session === 'HANGSENG_VIP_AFTERNOON' ? (
                          <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-extrabold">
                            💎🇭🇰 ฮั่งเส็ง VIP บ่าย (14:55)
                          </span>
                        ) : item.session === 'NIKKEI_VIP_MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-extrabold">
                            <Sun className="w-3 h-3 text-purple-400" /> นิเคอิ VIP เช้า (08:30)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-300 border border-purple-600/30 px-2 py-0.5 rounded font-extrabold">
                            <Sunset className="w-3 h-3 text-purple-400" /> นิเคอิ VIP บ่าย (12:00)
                          </span>
                        )
                      ) : lotteryType === 'NIKKEI' ? (
                        item.session === 'CHINA_MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-extrabold">
                            🇨🇳 จีน เช้า (10:35)
                          </span>
                        ) : item.session === 'CHINA_AFTERNOON' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-extrabold">
                            🇨🇳 จีน บ่าย (14:00)
                          </span>
                        ) : item.session === 'HANGSENG_MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-extrabold">
                            🇭🇰 ฮั่งเส็ง เช้า (11:00)
                          </span>
                        ) : item.session === 'HANGSENG_AFTERNOON' ? (
                          <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-extrabold">
                            🇭🇰 ฮั่งเส็ง บ่าย (15:00)
                          </span>
                        ) : item.session === 'NIKKEI_MORNING' || item.session === 'MORNING' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold">
                            <Sun className="w-3 h-3 text-amber-400" /> นิเคอิ เช้า (09:30)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-600/20 text-amber-300 border border-amber-600/30 px-2 py-0.5 rounded font-extrabold">
                            <Sunset className="w-3 h-3 text-amber-400" /> นิเคอิ บ่าย (13:00)
                          </span>
                        )
                      ) : lotteryType === 'DOWJONES' ? (
                        <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                          🇺🇸 ดาวโจนส์ (04:00)
                        </span>
                      ) : lotteryType === 'LAOS' ? (
                        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded">
                          🇱🇦 ลาวพัฒนา (20:30)
                        </span>
                      ) : lotteryType === 'HANOI' ? (
                        item.session === 'HANOI_SPECIAL' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-extrabold">
                            🟠 ฮานอยพิเศษ (17:30)
                          </span>
                        ) : item.session === 'HANOI_VIP' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded font-extrabold">
                            🟣 ฮานอย VIP (19:30)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded font-extrabold">
                            🔴 ฮานอยปกติ (18:30)
                          </span>
                        )
                      ) : lotteryType === 'GSB' ? (
                        <span className="inline-flex items-center gap-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2.5 py-0.5 rounded">
                          🏦 ออมสิน (13:00)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded">
                          🇹🇭 รัฐบาลไทย (15:30)
                        </span>
                      )}
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
                      </div>
                    </td>
                    {(lotteryType === 'LAOS' || lotteryType === 'GSB' || lotteryType === 'GOVERNMENT') && (
                      <td className="py-3 px-4 text-center font-extrabold text-amber-300 tracking-widest font-mono">
                        {renderHighlightedDigits(item.full6D || '-')}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center font-extrabold text-amber-300 text-lg tracking-wider">
                      {renderHighlightedDigits(item.top3)}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-amber-400 tracking-wider">
                      {renderHighlightedDigits(item.top2)}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-cyan-300 tracking-wider">
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
                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="แก้ไขผลรางวัล"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                          </button>
                        )}
                        {onDeleteDraw && (
                          <button
                            onClick={() => onDeleteDraw(item.id, item.dateFormatted, lotteryType)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="ลบผลรางวัล"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ลบ
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

    </div>
  );
};
