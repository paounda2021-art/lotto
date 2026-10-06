import React from 'react';
import { LotteryType, SessionType, ThemeMode } from '../types';
import { TrendingUp, Calendar, ExternalLink, RefreshCw, Award, Sun, Sunset, RefreshCcw, Landmark, RotateCcw, Moon, Sparkles, Gem, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  lotteryType: LotteryType;
  onSelectLotteryType: (type: LotteryType) => void;
  drawCount: number;
  latestDate: string;
  selectedSession: SessionType;
  onSelectSession: (session: SessionType) => void;
  onResetData: () => void;
  onAutoFetch?: () => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (theme: ThemeMode) => void;
  manualCount?: number;
  onOpenManualModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lotteryType,
  onSelectLotteryType,
  drawCount,
  latestDate,
  selectedSession,
  onSelectSession,
  onResetData,
  onAutoFetch,
  themeMode,
  onSelectThemeMode,
  manualCount = 0,
  onOpenManualModal
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080d16]/85 border-b border-white/[0.08] shadow-xl shadow-black/30 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 space-y-2 sm:space-y-3">
        
        {/* Top Bar: Brand, Quick Status, Theme & Actions */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg ${
              lotteryType === 'NIKKEI'
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-amber-500/25'
                : lotteryType === 'STOCKS_VIP'
                ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/30 ring-1 ring-cyan-300/40'
                : lotteryType === 'HANOI'
                ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-emerald-500/25'
                : lotteryType === 'LAOS'
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-red-500/25'
                : lotteryType === 'DOWJONES'
                ? 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-cyan-500/25'
                : lotteryType === 'GSB'
                ? 'bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 shadow-pink-500/25'
                : 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-700 shadow-purple-500/25'
            }`}>
              {lotteryType === 'STOCKS_VIP' ? (
                <Gem className="w-5 h-5 text-white animate-pulse" />
              ) : (
                <TrendingUp className="w-5 h-5 text-black font-bold" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  LOTTO<span className="text-amber-400">289</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-white/[0.08] text-gray-300 border border-white/10 hidden xs:inline-block">
                  PRO AI
                </span>
                {lotteryType === 'STOCKS_VIP' && (
                  <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    ✨ VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-1 hidden sm:block">
                {lotteryType === 'STOCKS_VIP'
                  ? 'ระบบสถิติหวยหุ้น VIP ย้อนหลัง (นิคเคอิ VIP, จีน VIP, ฮั่งเส็ง VIP รวม 6 รอบ 120+ งวด)'
                  : lotteryType === 'NIKKEI'
                  ? 'วิเคราะห์สถิติหุ้นปกติย้อนหลัง (นิเคอิ, จีน, ฮั่งเส็ง รวม 6 รอบ) อ้างอิง exphuay'
                  : lotteryType === 'LAOS'
                  ? 'วิเคราะห์สถิติหวยลาวพัฒนาย้อนหลัง (รอบ 20:30 น.) อ้างอิง LottoTH'
                  : lotteryType === 'DOWJONES'
                  ? 'วิเคราะห์สถิติหวยหุ้นดาวโจนส์ย้อนหลัง (รอบ 04:00 น.) อ้างอิง exphuay'
                  : lotteryType === 'HANOI'
                  ? 'วิเคราะห์สถิติหวยฮานอยพิเศษ / ปกติ / VIP ย้อนหลัง 3 เดือน'
                  : lotteryType === 'GSB'
                  ? 'วิเคราะห์สถิติหวยออมสินย้อนหลัง 6 เดือน (วันที่ 1 และ 16)'
                  : 'วิเคราะห์สถิติหวยรัฐบาลไทยย้อนหลัง 6 เดือน (วันที่ 1 และ 16)'}
              </p>
            </div>
          </div>

          {/* Quick Header Indicators & Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Latest draw badge */}
            <div className="backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[11px] text-gray-300 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">งวดล่าสุด:</span>
              <strong className="text-amber-300 font-bold whitespace-nowrap">{latestDate}</strong>
            </div>

            {/* Total draws badge */}
            <div className="backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1 flex items-center gap-1 text-[11px] text-gray-300 shadow-inner hidden md:flex">
              <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-300">{drawCount}</span>
              <span>งวด</span>
            </div>

            {/* Auto Sync Button */}
            <button
              onClick={() => onAutoFetch?.()}
              title="ดึงผลรางวัลล่าสุดให้อัตโนมัติ"
              className="backdrop-blur-md bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <RefreshCcw className="w-3 h-3 text-emerald-400 animate-spin-slow shrink-0" />
              <span className="hidden xs:inline">อัปเดตผล</span>
            </button>

            {/* Manual Records Check & Protection Status Button */}
            <button
              onClick={() => onOpenManualModal?.()}
              title="ตรวจสอบผลที่บันทึกเองและระบบคุ้มครองข้อมูล"
              className={`backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
                manualCount > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.08]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">ผลบันทึกเอง</span>
              {manualCount > 0 ? (
                <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
                  {manualCount}
                </span>
              ) : null}
            </button>

            {/* Theme Switcher */}
            <div className="flex items-center backdrop-blur-md bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-xl">
              <button
                onClick={() => onSelectThemeMode('DARK')}
                title="โหมดมืดแบบกลาส (Dark Glass)"
                className={`p-1.5 rounded-lg transition-all ${
                  themeMode === 'DARK'
                    ? 'bg-amber-400 text-black shadow-glow-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectThemeMode('LIGHT')}
                title="โหมดสว่าง (Light Mode)"
                className={`p-1.5 rounded-lg transition-all ${
                  themeMode === 'LIGHT'
                    ? 'bg-amber-400 text-black shadow-glow-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              title="รีเซ็ตกลับเป็นข้อมูลเริ่มต้น"
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 backdrop-blur-md bg-white/[0.03] hover:bg-red-500/15 border border-white/[0.06] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Lottery Type Horizontal Scroll Strip (Mobile-First / Swipeable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center backdrop-blur-md bg-white/[0.03] border border-white/[0.08] p-1 rounded-2xl gap-1 shrink-0 shadow-lg">
            
            {/* 1. หุ้นปกติ */}
            <button
              onClick={() => onSelectLotteryType('NIKKEI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'NIKKEI'
                  ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold ring-1 ring-amber-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>📈 หุ้นปกติ</span>
            </button>

            {/* 2. หวยหุ้น VIP (New!) */}
            <button
              onClick={() => onSelectLotteryType('STOCKS_VIP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'STOCKS_VIP'
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white font-black shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Gem className="w-3.5 h-3.5 text-cyan-300" />
              <span>💎 หวยหุ้น VIP</span>
              <span className="text-[9px] bg-cyan-400/20 text-cyan-200 px-1 py-0.2 rounded-full border border-cyan-400/30 font-extrabold">NEW</span>
            </button>

            {/* 3. ฮานอย */}
            <button
              onClick={() => onSelectLotteryType('HANOI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'HANOI'
                  ? 'bg-emerald-500 text-black shadow-glow-emerald font-extrabold ring-1 ring-emerald-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>🇻🇳 ฮานอย</span>
            </button>

            {/* 4. ลาวพัฒนา */}
            <button
              onClick={() => onSelectLotteryType('LAOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'LAOS'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 font-extrabold ring-1 ring-red-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>🇱🇦 ลาวพัฒนา</span>
            </button>

            {/* 5. หุ้นดาวโจนส์ */}
            <button
              onClick={() => onSelectLotteryType('DOWJONES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'DOWJONES'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan font-extrabold ring-1 ring-cyan-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>🇺🇸 ดาวโจนส์</span>
            </button>

            {/* 6. ออมสิน */}
            <button
              onClick={() => onSelectLotteryType('GSB')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'GSB'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 font-extrabold ring-1 ring-pink-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>🏦 ออมสิน</span>
            </button>

            {/* 7. รัฐบาลไทย */}
            <button
              onClick={() => onSelectLotteryType('GOVERNMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                lotteryType === 'GOVERNMENT'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 font-extrabold ring-1 ring-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>🇹🇭 รัฐบาลไทย</span>
            </button>

          </div>
        </div>

        {/* Row 3: Sub-Session Switcher (Interactive Pills) */}
        {(lotteryType === 'NIKKEI' || lotteryType === 'STOCKS_VIP' || lotteryType === 'HANOI') && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex items-center backdrop-blur-md bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl gap-1 shrink-0 shadow-inner">
              
              {/* STOCKS_VIP Sessions */}
              {lotteryType === 'STOCKS_VIP' && (
                <>
                  <button
                    onClick={() => onSelectSession('NIKKEI_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['NIKKEI_VIP_BOTH', 'NIKKEI_VIP_MORNING', 'NIKKEI_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🎌 นิคเคอิ VIP (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('CHINA_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['CHINA_VIP_BOTH', 'CHINA_VIP_MORNING', 'CHINA_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🇨🇳 จีน VIP (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANGSENG_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['HANGSENG_VIP_BOTH', 'HANGSENG_VIP_MORNING', 'HANGSENG_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🇭🇰 ฮั่งเส็ง VIP (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('STOCKS_VIP_ALL_3')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'STOCKS_VIP_ALL_3'
                        ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 text-black shadow-glow-gold'
                        : 'text-amber-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>⭐ รวมทุกหุ้น VIP (6 รอบ)</span>
                  </button>
                </>
              )}

              {/* NIKKEI Sessions */}
              {lotteryType === 'NIKKEI' && (
                <>
                  <button
                    onClick={() => onSelectSession('NIKKEI_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['NIKKEI_BOTH', 'NIKKEI_MORNING', 'NIKKEI_AFTERNOON', 'MORNING', 'AFTERNOON', 'BOTH'].includes(selectedSession)
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🎌 นิเคอิ (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('CHINA_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['CHINA_BOTH', 'CHINA_MORNING', 'CHINA_AFTERNOON'].includes(selectedSession)
                        ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🇨🇳 จีน (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANGSENG_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      ['HANGSENG_BOTH', 'HANGSENG_MORNING', 'HANGSENG_AFTERNOON'].includes(selectedSession)
                        ? 'bg-blue-500 text-white shadow-glow-cyan font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🇭🇰 ฮั่งเส็ง (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('STOCKS_ALL_3')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'STOCKS_ALL_3'
                        ? 'bg-gradient-to-r from-amber-400 via-red-500 to-blue-500 text-white shadow-glow-gold'
                        : 'text-amber-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>⭐ รวมทุกหุ้นปกติ (6 รอบ)</span>
                  </button>
                </>
              )}

              {/* HANOI Sessions */}
              {lotteryType === 'HANOI' && (
                <>
                  <button
                    onClick={() => onSelectSession('HANOI_SPECIAL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'HANOI_SPECIAL'
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🟠 พิเศษ (17:30)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANOI_EVENING')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'HANOI_EVENING' || selectedSession === 'AFTERNOON' || selectedSession === 'MORNING'
                        ? 'bg-emerald-400 text-black shadow-glow-emerald font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🔴 ปกติ (18:30)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANOI_VIP')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'HANOI_VIP'
                        ? 'bg-purple-400 text-white shadow-glow-purple font-extrabold'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>🟣 VIP (19:30)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANOI_ALL_3')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all shrink-0 whitespace-nowrap ${
                      selectedSession === 'HANOI_ALL_3'
                        ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-purple-400 text-black shadow-glow-gold'
                        : 'text-amber-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>⭐ รวม 3 ฮานอย</span>
                  </button>
                </>
              )}

            </div>
          </div>
        )}

        {/* Other Fixed Time Sessions Banners */}
        {lotteryType === 'LAOS' && (
          <div className="backdrop-blur-md bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-red-400" />
            <span>หวยลาวพัฒนา: รอบ 20:30 น. (ออกทุกวันจันทร์ - พุธ - ศุกร์)</span>
          </div>
        )}

        {lotteryType === 'DOWJONES' && (
          <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>หวยหุ้นดาวโจนส์: รอบ 04:00 น. เช้ามืด (วันจันทร์ - ศุกร์)</span>
          </div>
        )}

        {lotteryType === 'GSB' && (
          <div className="backdrop-blur-md bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-pink-400" />
            <span>หวยออมสิน: รอบ 13:00 น. (ออกวันที่ 1 และ 16 ของทุกเดือน)</span>
          </div>
        )}

        {lotteryType === 'GOVERNMENT' && (
          <div className="backdrop-blur-md bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-purple-400" />
            <span>สลากกินแบ่งรัฐบาลไทย: รอบ 15:30 น. (ออกวันที่ 1 และ 16 ของทุกเดือน)</span>
          </div>
        )}

      </div>
    </header>
  );
};
