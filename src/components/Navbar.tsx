import { LotteryType, SessionType, ThemeMode } from '../types';
import { TrendingUp, Calendar, ExternalLink, RefreshCw, Award, Sun, Sunset, RefreshCcw, Landmark, RotateCcw, Moon, Sliders } from 'lucide-react';

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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-nikkei-dark/80 border-b border-nikkei-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo & Main Lottery Selector */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              lotteryType === 'NIKKEI'
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-glow-gold'
                : lotteryType === 'HANOI'
                ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-glow-emerald'
                : lotteryType === 'LAOS'
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-glow-gold'
                : lotteryType === 'DOWJONES'
                ? 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-glow-cyan'
                : lotteryType === 'GSB'
                ? 'bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 shadow-glow-pink'
                : 'bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-700 shadow-glow-purple'
            }`}>
              <TrendingUp className="w-6 h-6 text-black font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* Main Lottery Type Switcher Tabs */}
                <div className="flex items-center bg-nikkei-card border border-amber-500/40 p-1 rounded-xl shadow-inner flex-wrap sm:flex-nowrap gap-1">
                  <button
                    onClick={() => onSelectLotteryType('NIKKEI')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'NIKKEI'
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📈 หุ้นปกติ
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('STOCK_VIP')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'STOCK_VIP'
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    💎 หุ้น VIP
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('HANOI')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'HANOI'
                        ? 'bg-emerald-500 text-black shadow-glow-emerald font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🇻🇳 ฮานอย
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('LAOS')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'LAOS'
                        ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🇱🇦 ลาวพัฒนา
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('DOWJONES')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'DOWJONES'
                        ? 'bg-cyan-500 text-black shadow-glow-cyan font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🇺🇸 หุ้นดาวโจนส์
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('GSB')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'GSB'
                        ? 'bg-pink-500 text-white shadow-glow-pink font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🏦 ออมสิน
                  </button>

                  <button
                    onClick={() => onSelectLotteryType('GOVERNMENT')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lotteryType === 'GOVERNMENT'
                        ? 'bg-purple-500 text-white shadow-glow-purple font-extrabold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🇹🇭 รัฐบาลไทย
                  </button>
                </div>

                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {lotteryType === 'GSB' || lotteryType === 'GOVERNMENT' ? 'สถิติ 6 เดือน' : lotteryType === 'STOCK_VIP' ? 'สถิติ 4 เดือน' : 'สถิติ 3 เดือน'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {lotteryType === 'NIKKEI'
                  ? 'วิเคราะห์สถิติหุ้นปกติย้อนหลัง (นิเคอิ, จีน, ฮั่งเส็ง รวม 6 รอบ) อ้างอิง exphuay'
                  : lotteryType === 'STOCK_VIP'
                  ? 'วิเคราะห์สถิติหวยหุ้น VIP ย้อนหลัง 4 เดือน (นิคเคอิ VIP, จีน VIP, ฮั่งเส็ง VIP รวม 6 รอบ ออกทุกวัน 7 วัน)'
                  : lotteryType === 'LAOS'
                  ? 'วิเคราะห์สถิติหวยลาวพัฒนาย้อนหลัง (ออกทุกวัน รอบ 20:30 น.) อ้างอิง LottoTH'
                  : lotteryType === 'DOWJONES'
                  ? 'วิเคราะห์สถิติหวยหุ้นดาวโจนส์ย้อนหลัง (รอบ 04:00 น. เช้ามืด) อ้างอิง exphuay'
                  : lotteryType === 'HANOI'
                  ? 'วิเคราะห์สถิติหวยฮานอยปกติย้อนหลัง (ออกทุกวัน รอบ 18:30 น.) อ้างอิง exphuay (Minh Ngoc)'
                  : lotteryType === 'GSB'
                  ? 'วิเคราะห์สถิติหวยออมสินย้อนหลัง 6 เดือน (ออกวันที่ 1 และ 16 เวลา 13:00 น. - อ้างอิง GSB)'
                  : 'วิเคราะห์สถิติหวยรัฐบาลไทยย้อนหลัง 6 เดือน (ออกวันที่ 1 และ 16 เวลา 15:30 น. - อ้างอิง GLO)'}
              </p>
            </div>
          </div>

          {/* Session Switcher & Metadata */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Session Switcher Buttons for Stock Lotteries (หุ้นปกติ) */}
            {lotteryType === 'NIKKEI' && (
              <div className="flex items-center bg-nikkei-card border border-nikkei-border p-1 rounded-xl flex-wrap sm:flex-nowrap gap-1">
                <button
                  onClick={() => onSelectSession('NIKKEI_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['NIKKEI_BOTH', 'NIKKEI_MORNING', 'NIKKEI_AFTERNOON', 'MORNING', 'AFTERNOON', 'BOTH'].includes(selectedSession)
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🎌 นิเคอิ (เช้า-บ่าย)</span>
                </button>

                <button
                  onClick={() => onSelectSession('CHINA_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['CHINA_BOTH', 'CHINA_MORNING', 'CHINA_AFTERNOON'].includes(selectedSession)
                      ? 'bg-red-500 text-white shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🇨🇳 จีน (เช้า-บ่าย)</span>
                </button>

                <button
                  onClick={() => onSelectSession('HANGSENG_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['HANGSENG_BOTH', 'HANGSENG_MORNING', 'HANGSENG_AFTERNOON'].includes(selectedSession)
                      ? 'bg-blue-500 text-white shadow-glow-cyan'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🇭🇰 ฮั่งเส็ง (เช้า-บ่าย)</span>
                </button>

                <button
                  onClick={() => onSelectSession('STOCKS_ALL_3')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'STOCKS_ALL_3'
                      ? 'bg-gradient-to-r from-amber-400 via-red-500 to-blue-500 text-white shadow-glow-gold font-black'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <span>⭐ รวมทุกหุ้นปกติ (6 รอบ)</span>
                </button>
              </div>
            )}

            {/* Session Switcher Buttons for Stock VIP Lotteries (หุ้น VIP) */}
            {lotteryType === 'STOCK_VIP' && (
              <div className="flex items-center bg-nikkei-card border border-amber-500/40 p-1 rounded-xl flex-wrap sm:flex-nowrap gap-1">
                <button
                  onClick={() => onSelectSession('NIKKEI_VIP_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['NIKKEI_VIP_BOTH', 'NIKKEI_VIP_MORNING', 'NIKKEI_VIP_AFTERNOON'].includes(selectedSession)
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🎌 นิคเคอิ VIP</span>
                </button>

                <button
                  onClick={() => onSelectSession('CHINA_VIP_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['CHINA_VIP_BOTH', 'CHINA_VIP_MORNING', 'CHINA_VIP_AFTERNOON'].includes(selectedSession)
                      ? 'bg-red-500 text-white shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🇨🇳 จีน VIP</span>
                </button>

                <button
                  onClick={() => onSelectSession('HANGSENG_VIP_BOTH')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    ['HANGSENG_VIP_BOTH', 'HANGSENG_VIP_MORNING', 'HANGSENG_VIP_AFTERNOON'].includes(selectedSession)
                      ? 'bg-blue-500 text-white shadow-glow-cyan'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🇭🇰 ฮั่งเส็ง VIP</span>
                </button>

                <button
                  onClick={() => onSelectSession('STOCKS_VIP_ALL_3')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'STOCKS_VIP_ALL_3'
                      ? 'bg-gradient-to-r from-amber-400 via-red-500 to-blue-500 text-white shadow-glow-gold font-black'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <span>⭐ รวมทุกหุ้น VIP (6 รอบ)</span>
                </button>
              </div>
            )}

            {/* Laos Evening Session Indicator */}
            {lotteryType === 'LAOS' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-red-400" />
                <span>รอบ 20:30 น. (ออกทุกวันจันทร์ - ศุกร์)</span>
              </div>
            )}

            {/* Dow Jones Session Indicator */}
            {lotteryType === 'DOWJONES' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>รอบ 03:00 / 04:00 น. (ออกทุกวันจันทร์ - ศุกร์)</span>
              </div>
            )}

            {/* Session Switcher Buttons for Hanoi */}
            {lotteryType === 'HANOI' && (
              <div className="flex items-center bg-nikkei-card border border-nikkei-border p-1 rounded-xl flex-wrap sm:flex-nowrap gap-1">
                <button
                  onClick={() => onSelectSession('HANOI_SPECIAL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'HANOI_SPECIAL'
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🟠 พิเศษ (17:30)</span>
                </button>

                <button
                  onClick={() => onSelectSession('HANOI_EVENING')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'HANOI_EVENING' || selectedSession === 'AFTERNOON' || selectedSession === 'MORNING'
                      ? 'bg-emerald-400 text-black shadow-glow-emerald'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🔴 ปกติ (18:30)</span>
                </button>

                <button
                  onClick={() => onSelectSession('HANOI_VIP')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'HANOI_VIP'
                      ? 'bg-purple-400 text-white shadow-glow-purple'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🟣 VIP (19:30)</span>
                </button>

                <button
                  onClick={() => onSelectSession('HANOI_ALL_3')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSession === 'HANOI_ALL_3'
                      ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-purple-400 text-black shadow-glow-gold font-black'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <span>⭐ รวม 3 ฮานอย (เด่นรูด)</span>
                </button>
              </div>
            )}

            {/* GSB Session Indicator */}
            {lotteryType === 'GSB' && (
              <div className="bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-pink-400" />
                <span>รอบ 13:00 น. (ออกวันที่ 1 และ 16 ของทุกเดือน - ออมสิน)</span>
              </div>
            )}

            {/* Government Session Indicator */}
            {lotteryType === 'GOVERNMENT' && (
              <div className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-purple-400" />
                <span>รอบ 15:30 น. (ออกวันที่ 1 และ 16 ของทุกเดือน - รัฐบาลไทย)</span>
              </div>
            )}

            <div className="bg-nikkei-card border border-nikkei-border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>ผลล่าสุด: <strong className="text-amber-300 font-semibold">{latestDate}</strong></span>
            </div>

            <div className="bg-nikkei-card border border-nikkei-border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{drawCount} งวด</span>
            </div>

            <a
              href="https://exphuay.com/result"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              title="รวมผลหวยล่าสุดทุกหวย exphuay.com/result"
            >
              <span>exphuay (รวมผล)</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>

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
              className="bg-nikkei-card hover:bg-nikkei-cardHover border border-nikkei-border text-xs text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <span>{lotteryType === 'LAOS' ? 'สถิติ LottoTH' : 'สถิติ exphuay'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Theme Switcher Buttons (Dark / Light) */}
            <div className="flex items-center bg-nikkei-card border border-nikkei-border p-1 rounded-xl">
              <button
                onClick={() => onSelectThemeMode('DARK')}
                title="โหมดมืด (Dark Mode)"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
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
                title="โหมดสว่าง (Light Mode)"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  themeMode === 'LIGHT'
                    ? 'bg-amber-400 text-black shadow-glow-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>สว่าง</span>
              </button>
            </div>

            <button
              onClick={() => onAutoFetch?.()}
              title="ดึงผลรางวัลล่าสุดให้อัตโนมัติ"
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-glow-emerald"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>🔄 ดึงผลรางวัลด่วน (Auto-Sync)</span>
            </button>

            <button
              onClick={onResetData}
              title="รีเซ็ตกลับเป็นข้อมูลเริ่มต้น 2 เดือน"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
