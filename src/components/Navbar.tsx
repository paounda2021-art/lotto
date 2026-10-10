import React from 'react';
import { LotteryType, SessionType, ThemeMode } from '../types';
import { TrendingUp, Calendar, ExternalLink, RefreshCcw, Award, Sun, Moon, Clock, RotateCcw } from 'lucide-react';

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
  onSelectThemeMode
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#1a0e05]/90 border-b border-amber-500/40 shadow-[0_4px_30px_rgba(245,158,11,0.2)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* LEFT SIDE: LOGO + VERTICAL BUTTON NAV + SUBTITLE */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              
              {/* Brand Logo Square Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-lg ${
                lotteryType === 'DOWJONES'
                  ? 'bg-cyan-400 text-black shadow-glow-cyan'
                  : lotteryType === 'NIKKEI'
                  ? 'bg-amber-400 text-black shadow-glow-gold'
                  : lotteryType === 'HANOI'
                  ? 'bg-emerald-400 text-black shadow-glow-emerald'
                  : lotteryType === 'LAOS'
                  ? 'bg-red-500 text-white shadow-glow-gold'
                  : lotteryType === 'GSB'
                  ? 'bg-pink-500 text-white shadow-glow-pink'
                  : 'bg-purple-500 text-white shadow-glow-purple'
              }`}>
                <TrendingUp className="w-7 h-7 font-bold stroke-[3]" />
              </div>

              {/* Main Button Group Container */}
              <div className="bg-[#0b0602] border border-amber-500/40 p-1.5 rounded-2xl flex items-center gap-1 flex-wrap sm:flex-nowrap shadow-inner">
                
                {/* 1. หุ้นปกติ */}
                <button
                  onClick={() => onSelectLotteryType('NIKKEI')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'NIKKEI'
                      ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-amber-500/10'
                  }`}
                >
                  <span className="text-xs">📈</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">หุ้นปกติ</span>
                </button>

                {/* 2. หุ้น VIP */}
                <button
                  onClick={() => onSelectLotteryType('STOCKS_VIP')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'STOCKS_VIP'
                      ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-black shadow-glow-gold font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-amber-500/10'
                  }`}
                >
                  <span className="text-xs">💎</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">หุ้น VIP</span>
                </button>

                {/* 3. ฮานอย */}
                <button
                  onClick={() => onSelectLotteryType('HANOI')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'HANOI'
                      ? 'bg-emerald-500 text-black shadow-glow-emerald font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-emerald-500/10'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">VN</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">ฮานอย</span>
                </button>

                {/* 4. ลาวพัฒนา */}
                <button
                  onClick={() => onSelectLotteryType('LAOS')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'LAOS'
                      ? 'bg-red-500 text-white shadow-glow-gold font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-red-500/10'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">LA</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">ลาวพัฒนา</span>
                </button>

                {/* 6. หวยมาเลย์ */}
                <button
                  onClick={() => onSelectLotteryType('MALAY')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'MALAY'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-blue-500/10'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">MY</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">หวยมาเลย์</span>
                </button>

                {/* 7. หุ้นดาวโจนส์ */}
                <button
                  onClick={() => onSelectLotteryType('DOWJONES')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'DOWJONES'
                      ? 'bg-cyan-400 text-black shadow-glow-cyan font-black scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-cyan-500/10'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">US</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">หุ้นดาวโจนส์</span>
                </button>

                {/* 8. ออมสิน */}
                <button
                  onClick={() => onSelectLotteryType('GSB')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'GSB'
                      ? 'bg-pink-500 text-white shadow-glow-pink font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-pink-500/10'
                  }`}
                >
                  <span className="text-xs">🏦</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">ออมสิน</span>
                </button>

                {/* 9. รัฐบาลไทย */}
                <button
                  onClick={() => onSelectLotteryType('GOVERNMENT')}
                  className={`px-3 py-1.5 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    lotteryType === 'GOVERNMENT'
                      ? 'bg-purple-500 text-white shadow-glow-purple font-extrabold scale-[1.02]'
                      : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">TH</span>
                  <span className="text-[11px] font-bold whitespace-nowrap">รัฐบาลไทย</span>
                </button>

              </div>

              {/* Gold Oval Badge "สถิติ 3 เดือน" */}
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/60 bg-amber-950/40 flex flex-col items-center justify-center text-center shrink-0 leading-tight p-1 shadow-sm">
                <span className="text-[9px] font-extrabold text-amber-400">สถิติ</span>
                <span className="text-[10px] font-black text-amber-300">
                  {lotteryType === 'GSB' || lotteryType === 'GOVERNMENT' ? '6 เดือน' : lotteryType === 'STOCKS_VIP' ? '4 เดือน' : '3 เดือน'}
                </span>
              </div>

            </div>

            {/* Subtitle text */}
            <p className="text-xs text-gray-300/90 pl-1">
              {lotteryType === 'NIKKEI'
                ? 'วิเคราะห์สถิติหุ้นปกติย้อนหลัง (นิเคอิ, จีน, ฮั่งเส็ง รวม 6 รอบ) อ้างอิง exphuay'
                : lotteryType === 'STOCKS_VIP'
                ? 'วิเคราะห์สถิติหวยหุ้น VIP ย้อนหลัง 4 เดือน (นิคเคอิ VIP, จีน VIP, ฮั่งเส็ง VIP รวม 6 รอบ)'
                : lotteryType === 'LAOS'
                ? 'วิเคราะห์สถิติหวยลาวพัฒนาย้อนหลัง (ออกทุกวัน รอบ 20:30 น.) อ้างอิง LottoTH'
                : lotteryType === 'MALAY'
                ? 'วิเคราะห์สถิติหวยมาเลย์ (Magnum 4D) ย้อนหลัง (รอบ 18:30 น.)'
                : lotteryType === 'DOWJONES'
                ? 'วิเคราะห์สถิติหวยหุ้นดาวโจนส์ย้อนหลัง (รอบ 04:00 น. เช้ามืด) อ้างอิง exphuay'
                : lotteryType === 'HANOI'
                ? 'วิเคราะห์สถิติหวยฮานอยปกติย้อนหลัง (ออกทุกวัน รอบ 18:30 น.) อ้างอิง exphuay (Minh Ngoc)'
                : lotteryType === 'GSB'
                ? 'วิเคราะห์สถิติหวยออมสินย้อนหลัง 6 เดือน (ออกวันที่ 1 และ 16 เวลา 13:00 น.)'
                : 'วิเคราะห์สถิติหวยรัฐบาลไทยย้อนหลัง 6 เดือน (ออกวันที่ 1 และ 16 เวลา 15:30 น.)'}
            </p>
          </div>

          {/* RIGHT SIDE: SESSION BADGES + STATUS INDICATORS + ACTIONS */}
          <div className="flex flex-col items-start lg:items-end space-y-2 shrink-0">
            
            {/* Top Right Badges: Schedule + Stock VIP / Stock Session Switcher + Latest Date */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Session Switcher Buttons for Stock VIP */}
              {lotteryType === 'STOCKS_VIP' && (
                <div className="flex items-center bg-[#0b0602] border border-amber-500/40 p-1 rounded-xl flex-wrap sm:flex-nowrap gap-1 shadow-inner">
                  <button
                    onClick={() => onSelectSession('NIKKEI_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['NIKKEI_VIP_BOTH', 'NIKKEI_VIP_MORNING', 'NIKKEI_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🔴 นิคเคอิ VIP</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('CHINA_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['CHINA_VIP_BOTH', 'CHINA_VIP_MORNING', 'CHINA_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>CN จีน VIP</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANGSENG_VIP_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['HANGSENG_VIP_BOTH', 'HANGSENG_VIP_MORNING', 'HANGSENG_VIP_AFTERNOON'].includes(selectedSession)
                        ? 'bg-blue-500 text-white shadow-glow-cyan font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>HK ฮั่งเส็ง VIP</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('STOCKS_VIP_ALL_3')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedSession === 'STOCKS_VIP_ALL_3'
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-glow-gold font-black'
                        : 'text-amber-300 hover:text-white'
                    }`}
                  >
                    <span>⭐ รวมทุกหุ้น VIP (6 รอบ)</span>
                  </button>
                </div>
              )}

              {/* Session Switcher Buttons for Stock Lotteries (หุ้นปกติ) */}
              {lotteryType === 'NIKKEI' && (
                <div className="flex items-center bg-[#0b0602] border border-amber-500/40 p-1 rounded-xl flex-wrap sm:flex-nowrap gap-1 shadow-inner">
                  <button
                    onClick={() => onSelectSession('NIKKEI_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['NIKKEI_BOTH', 'NIKKEI_MORNING', 'NIKKEI_AFTERNOON', 'MORNING', 'AFTERNOON', 'BOTH'].includes(selectedSession)
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🎌 นิเคอิ (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('CHINA_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['CHINA_BOTH', 'CHINA_MORNING', 'CHINA_AFTERNOON'].includes(selectedSession)
                        ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🇨🇳 จีน (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('HANGSENG_BOTH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      ['HANGSENG_BOTH', 'HANGSENG_MORNING', 'HANGSENG_AFTERNOON'].includes(selectedSession)
                        ? 'bg-blue-500 text-white shadow-glow-cyan font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>🇭🇰 ฮั่งเส็ง (เช้า-บ่าย)</span>
                  </button>

                  <button
                    onClick={() => onSelectSession('STOCKS_ALL_3')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedSession === 'STOCKS_ALL_3'
                        ? 'bg-gradient-to-r from-amber-400 via-red-500 to-blue-500 text-white shadow-glow-gold font-black'
                        : 'text-amber-300 hover:text-white'
                    }`}
                  >
                    <span>⭐ รวมทุกหุ้นปกติ (6 รอบ)</span>
                  </button>
                </div>
              )}

              {/* Session / Schedule Badge for non-stock lotteries */}
              {!['NIKKEI', 'STOCKS_VIP', 'HANOI'].includes(lotteryType) && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    {lotteryType === 'DOWJONES'
                      ? 'รอบ 03:00 / 04:00 น. (ออกทุกวันจันทร์ - ศุกร์)'
                      : lotteryType === 'LAOS'
                      ? 'รอบ 20:30 น. (ออกทุกวันจันทร์ - ศุกร์)'
                      : lotteryType === 'MALAY'
                      ? 'รอบ 18:30 น. (พุธ, เสาร์, อาทิตย์)'
                      : lotteryType === 'GSB'
                      ? 'รอบ 13:00 น. (วันที่ 1 และ 16)'
                      : 'รอบ 15:30 น. (วันที่ 1 และ 16)'}
                  </span>
                </div>
              )}

              {/* Latest Result Date Badge */}
              <div className="bg-[#1c1209] border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-amber-300 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ผลล่าสุด:</span>
                <strong className="text-amber-300 font-extrabold">{latestDate}</strong>
              </div>
            </div>

            {/* Bottom Right Tools: Count + Links + Theme + Sync */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Total draws count */}
              <div className="bg-[#1c1209] border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-300 shadow-sm">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-extrabold text-emerald-300">{drawCount}</span>
                <span>งวด</span>
              </div>

              {/* exphuay (รวมผล) Link */}
              <a
                href="https://exphuay.com/result"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                title="รวมผลหวยล่าสุดทุกหวย exphuay.com/result"
              >
                <span>exphuay (รวมผล)</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>

              {/* สถิติ exphuay Link */}
              <a
                href={
                  lotteryType === 'GSB'
                    ? 'https://exphuay.com/backward/gsb'
                    : lotteryType === 'GOVERNMENT'
                    ? 'https://exphuay.com/backward/goverment'
                    : lotteryType === 'HANOI'
                    ? 'https://exphuay.com/backward/minhngoc'
                    : lotteryType === 'DOWJONES'
                    ? 'https://exphuay.com/backward/dji'
                    : lotteryType === 'LAOS'
                    ? 'https://lottoth.co/lottery/laosdevelops/history'
                    : 'https://exphuay.com/backward/nikkei-morning'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1c1209] hover:bg-amber-500/10 border border-amber-500/40 text-xs text-amber-400 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
              >
                <span>{lotteryType === 'LAOS' ? 'สถิติ LottoTH' : 'สถิติ exphuay'}</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>

              {/* Theme Mode Switcher */}
              <div className="flex items-center bg-[#1c1209] border border-amber-500/30 p-1 rounded-xl">
                <button
                  onClick={() => onSelectThemeMode('DARK')}
                  title="โหมดมืด"
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                    themeMode === 'DARK'
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>มืด</span>
                </button>
                <button
                  onClick={() => onSelectThemeMode('LIGHT')}
                  title="โหมดสว่าง"
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                    themeMode === 'LIGHT'
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>สว่าง</span>
                </button>
              </div>

              {/* Auto Sync Button */}
              <button
                onClick={() => onAutoFetch?.()}
                title="ดึงผลรางวัลล่าสุดให้อัตโนมัติ"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow shrink-0" />
                <span>ดึงผลรางวัลด่วน (Auto-Sync)</span>
              </button>

              {/* Reset Data Button */}
              <button
                onClick={onResetData}
                title="รีเซ็ตข้อมูลเริ่มต้น"
                className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-amber-500/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
