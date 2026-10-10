import React, { useState, useEffect } from 'react';
import { DrawResult, LotteryType, SessionType } from '../types';
import { Sparkles, X, Edit3, Calendar } from 'lucide-react';

interface AddDrawModalProps {
  isOpen: boolean;
  lotteryType: LotteryType;
  selectedSession?: SessionType;
  initialData?: DrawResult | null;
  onClose: () => void;
  onAddDraw: (newDraw: Omit<DrawResult, 'id'>) => void;
  onEditDraw?: (updatedDraw: DrawResult) => void;
}

export const AddDrawModal: React.FC<AddDrawModalProps> = ({
  isOpen,
  lotteryType,
  selectedSession,
  initialData,
  onClose,
  onAddDraw,
  onEditDraw
}) => {
  const [newSession, setNewSession] = useState<SessionType>('MORNING');
  const [newDate, setNewDate] = useState('');
  const [newDayName, setNewDayName] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [newFull6D, setNewFull6D] = useState('');
  const [newTop3, setNewTop3] = useState('');
  const [newBottom2, setNewBottom2] = useState('');
  const [pickerDate, setPickerDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const dayCodes: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePickerDateChange = (dateValStr: string) => {
    setPickerDate(dateValStr);
    if (!dateValStr) return;
    const parts = dateValStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        const dayOfWeekCode = dayCodes[d.getDay()];
        setNewDayName(dayOfWeekCode);

        const dayNum = String(d.getDate()).padStart(2, '0');
        const monthStr = monthNamesThai[d.getMonth()];
        const yearBE = d.getFullYear() + 543;
        setNewDate(`${dayNum} ${monthStr} ${yearBE}`);
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setNewSession(initialData.session || 'MORNING');
      setNewDate(initialData.dateFormatted || '');
      setNewDayName(initialData.dayOfWeek || 'Mon');
      setNewFull6D(initialData.full6D || '');
      setNewTop3(initialData.top3 || '');
      setNewBottom2(initialData.bottom2 || '');
      if (initialData.date) {
        setPickerDate(initialData.date);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setPickerDate(todayStr);
      }
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setPickerDate(todayStr);
      handlePickerDateChange(todayStr);

      if (lotteryType === 'STOCKS_VIP') {
        setNewSession(
          selectedSession === 'CHINA_VIP_MORNING' ? 'CHINA_VIP_MORNING' :
          selectedSession === 'CHINA_VIP_AFTERNOON' ? 'CHINA_VIP_AFTERNOON' :
          selectedSession === 'HANGSENG_VIP_MORNING' ? 'HANGSENG_VIP_MORNING' :
          selectedSession === 'HANGSENG_VIP_AFTERNOON' ? 'HANGSENG_VIP_AFTERNOON' :
          selectedSession === 'NIKKEI_VIP_AFTERNOON' ? 'NIKKEI_VIP_AFTERNOON' :
          'NIKKEI_VIP_MORNING'
        );
      } else if (lotteryType === 'HANOI') {
        setNewSession(
          selectedSession === 'HANOI_SPECIAL'
            ? 'HANOI_SPECIAL'
            : selectedSession === 'HANOI_VIP'
            ? 'HANOI_VIP'
            : 'HANOI_EVENING'
        );
      } else if (lotteryType === 'NIKKEI') {
        setNewSession(
          selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON' ? 'NIKKEI_AFTERNOON' :
          selectedSession === 'CHINA_MORNING' ? 'CHINA_MORNING' :
          selectedSession === 'CHINA_AFTERNOON' ? 'CHINA_AFTERNOON' :
          selectedSession === 'HANGSENG_MORNING' ? 'HANGSENG_MORNING' :
          selectedSession === 'HANGSENG_AFTERNOON' ? 'HANGSENG_AFTERNOON' :
          'NIKKEI_MORNING'
        );
      } else if (lotteryType === 'LAOS') {
        setNewSession('LAOS_EVENING');
      } else if (lotteryType === 'MALAY') {
        setNewSession('MALAY_EVENING');
      } else if (lotteryType === 'DOWJONES') {
        setNewSession('DOWJONES_NIGHT');
      } else if (lotteryType === 'GSB') {
        setNewSession('GSB_BIWEEKLY');
      } else {
        setNewSession('GOV_BIWEEKLY');
      }
      setNewFull6D('');
      setNewTop3('');
      setNewBottom2('');
    }
  }, [initialData, isOpen, lotteryType, selectedSession]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTop3 || newTop3.length !== 3 || !newBottom2 || newBottom2.length !== 2) {
      alert('กรุณากรอก 3 ตัวบน 3 หลัก และ 2 ตัวล่าง 2 หลักให้ถูกต้อง');
      return;
    }

    const dayNameMap: Record<string, string> = {
      Mon: 'จันทร์', Tue: 'อังคาร', Wed: 'พุธ', Thu: 'พฤหัสบดี', Fri: 'ศุกร์', Sat: 'เสาร์', Sun: 'อาทิตย์'
    };

    let targetSession =
      lotteryType === 'LAOS'
        ? 'LAOS_EVENING'
        : lotteryType === 'MALAY'
        ? 'MALAY_EVENING'
        : lotteryType === 'DOWJONES'
        ? 'DOWJONES_NIGHT'
        : lotteryType === 'GSB'
        ? 'GSB_BIWEEKLY'
        : lotteryType === 'GOVERNMENT'
        ? 'GOV_BIWEEKLY'
        : newSession;

    if (targetSession === 'AFTERNOON') targetSession = 'NIKKEI_AFTERNOON';
    if (targetSession === 'MORNING') targetSession = 'NIKKEI_MORNING';

    if (initialData && onEditDraw) {
      onEditDraw({
        ...initialData,
        session: targetSession,
        dateFormatted: newDate || initialData.dateFormatted,
        dayOfWeek: newDayName,
        dayNameThai: dayNameMap[newDayName] || initialData.dayNameThai,
        full6D: newFull6D || initialData.full6D,
        top3: newTop3,
        top2: newTop3.slice(1),
        bottom2: newBottom2,
        isManual: true
      });
    } else {
      onAddDraw({
        lotteryType,
        session: targetSession,
        date: pickerDate || new Date().toISOString().split('T')[0],
        dateFormatted: newDate || 'งวดป้อนใหม่',
        dayOfWeek: newDayName,
        dayNameThai: dayNameMap[newDayName] || 'วันทำการ',
        full6D: newFull6D || undefined,
        top3: newTop3,
        top2: newTop3.slice(1),
        bottom2: newBottom2,
        isManual: true
      });
    }

    onClose();
    setNewTop3('');
    setNewBottom2('');
    setNewFull6D('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-[#0f172a]/95 via-[#131f37]/90 to-[#182338]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl shadow-black/50 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          {initialData ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
          {initialData ? 'แก้ไขผลรางวัลที่ป้อนไว้' : 'เพิ่มผลการออกรางวัล'} {
            lotteryType === 'STOCKS_VIP' ? '💎 หวยหุ้น VIP'
            : lotteryType === 'NIKKEI' ? '🎌 หุ้นปกติ'
            : lotteryType === 'DOWJONES' ? '🇺🇸 หุ้นดาวโจนส์'
            : lotteryType === 'LAOS' ? '🇱🇦 ลาวพัฒนา'
            : lotteryType === 'MALAY' ? '🇲🇾 หวยมาเลย์'
            : lotteryType === 'HANOI' ? '🇻🇳 ฮานอย'
            : lotteryType === 'GSB' ? '🏦 ออมสิน'
            : '🇹🇭 รัฐบาลไทย'
          }
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {lotteryType === 'STOCKS_VIP' ? (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">เลือกรอบการออกรางวัลหุ้น VIP:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewSession('NIKKEI_VIP_MORNING')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'NIKKEI_VIP_MORNING'
                      ? 'bg-amber-400 text-black shadow-glow-gold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🎌 นิคเคอิ เช้า (09:30)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSession('NIKKEI_VIP_AFTERNOON')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'NIKKEI_VIP_AFTERNOON'
                      ? 'bg-amber-500 text-black shadow-glow-gold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🎌 นิคเคอิ บ่าย (13:00)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSession('CHINA_VIP_MORNING')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'CHINA_VIP_MORNING'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇨🇳 จีน เช้า (09:30)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSession('CHINA_VIP_AFTERNOON')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'CHINA_VIP_AFTERNOON'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇨🇳 จีน บ่าย (14:00)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSession('HANGSENG_VIP_MORNING')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'HANGSENG_VIP_MORNING'
                      ? 'bg-cyan-400 text-black shadow-glow-cyan'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇭🇰 ฮั่งเส็ง เช้า (11:00)
                </button>
                <button
                  type="button"
                  onClick={() => setNewSession('HANGSENG_VIP_AFTERNOON')}
                  className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'HANGSENG_VIP_AFTERNOON'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇭🇰 ฮั่งเส็ง บ่าย (15:30)
                </button>
              </div>
            </div>
          ) : lotteryType === 'NIKKEI' ? (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">เลือกรอบการออกรางวัลหุ้นปกติ:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewSession('NIKKEI_MORNING')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'NIKKEI_MORNING' || newSession === 'MORNING'
                      ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  ☀️ นิคเคอิ เช้า (09:30)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('NIKKEI_AFTERNOON')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'NIKKEI_AFTERNOON' || newSession === 'AFTERNOON'
                      ? 'bg-cyan-400 text-black shadow-glow-cyan font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🌤️ นิคเคอิ บ่าย (13:00)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('CHINA_MORNING')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'CHINA_MORNING'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇨🇳 จีน เช้า (10:35)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('CHINA_AFTERNOON')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'CHINA_AFTERNOON'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇨🇳 จีน บ่าย (14:00)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('HANGSENG_MORNING')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'HANGSENG_MORNING'
                      ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/30 font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇭🇰 ฮั่งเส็ง เช้า (11:00)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('HANGSENG_AFTERNOON')}
                  className={`py-2 px-1.5 rounded-xl font-bold text-xs transition-all ${
                    newSession === 'HANGSENG_AFTERNOON'
                      ? 'bg-teal-400 text-black shadow-lg shadow-teal-400/30 font-extrabold'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:text-white'
                  }`}
                >
                  🇭🇰 ฮั่งเส็ง บ่าย (15:00)
                </button>
              </div>
            </div>
          ) : lotteryType === 'HANOI' ? (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">เลือกรอบการออกรางวัลฮานอย:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewSession('HANOI_SPECIAL')}
                  className={`py-2 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'HANOI_SPECIAL'
                      ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                      : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                  }`}
                >
                  🟠 พิเศษ (17:30)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('HANOI_EVENING')}
                  className={`py-2 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'HANOI_EVENING'
                      ? 'bg-emerald-400 text-black shadow-glow-emerald font-extrabold'
                      : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                  }`}
                >
                  🔴 ปกติ (18:30)
                </button>

                <button
                  type="button"
                  onClick={() => setNewSession('HANOI_VIP')}
                  className={`py-2 rounded-xl font-bold text-[11px] transition-all ${
                    newSession === 'HANOI_VIP'
                      ? 'bg-purple-400 text-white shadow-glow-purple font-extrabold'
                      : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                  }`}
                >
                  🟣 VIP (19:30)
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">เลขรางวัล 6 ตัว (ถ้ามี):</label>
              <input
                type="text"
                maxLength={6}
                placeholder="197677"
                value={newFull6D}
                onChange={(e) => setNewFull6D(e.target.value)}
                className="w-full bg-nikkei-dark border border-nikkei-border rounded-xl px-3 py-2 text-red-300 font-bold text-center text-lg focus:outline-none focus:border-red-400"
              />
            </div>
          )}

          {/* Calendar Picker & Auto Date / Day of Week */}
          <div className="bg-nikkei-dark/80 border border-amber-500/40 p-3.5 rounded-xl space-y-3">
            <div>
              <label className="block text-amber-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  เลือกวันที่จากปฏิทิน:
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-bold">
                  คำนวณวันอัตโนมัติ ⚡
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={pickerDate}
                  onChange={(e) => handlePickerDateChange(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.currentTarget as any).showPicker?.();
                    } catch (err) {}
                  }}
                  className="w-full bg-nikkei-card border border-amber-500/50 rounded-xl px-3 py-2.5 text-amber-300 font-extrabold text-sm focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner pr-12"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const inputElem = e.currentTarget.previousElementSibling as HTMLInputElement;
                    try {
                      inputElem?.showPicker?.();
                      inputElem?.focus();
                    } catch (err) {}
                  }}
                  className="absolute right-2 bg-amber-400 hover:bg-amber-300 text-black p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold shadow-glow-gold"
                  title="คลิกเปิดปฏิทิน"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-700/60">
              <div>
                <label className="block text-gray-300 text-[11px] font-semibold mb-1">วันที่ออกผล (ข้อความ):</label>
                <input
                  type="text"
                  placeholder="03 ต.ค. 2569"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-nikkei-dark border border-nikkei-border rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-[11px] font-semibold mb-1">วันประจำสัปดาห์ (อัตโนมัติ):</label>
                <select
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value as any)}
                  className="w-full bg-nikkei-dark border border-nikkei-border rounded-lg px-2.5 py-1.5 text-amber-300 font-extrabold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Mon">วันจันทร์ (Mon)</option>
                  <option value="Tue">วันอังคาร (Tue)</option>
                  <option value="Wed">วันพุธ (Wed)</option>
                  <option value="Thu">วันพฤหัสบดี (Thu)</option>
                  <option value="Fri">วันศุกร์ (Fri)</option>
                  <option value="Sat">วันเสาร์ (Sat)</option>
                  <option value="Sun">วันอาทิตย์ (Sun)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">3 ตัวบน (3 หลัก):</label>
              <input
                type="text"
                maxLength={3}
                placeholder="677"
                value={newTop3}
                onChange={(e) => setNewTop3(e.target.value)}
                className="w-full bg-nikkei-dark border border-nikkei-border rounded-xl px-3 py-2 text-amber-300 font-bold text-center text-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">2 ตัวล่าง (2 หลัก):</label>
              <input
                type="text"
                maxLength={2}
                placeholder="76"
                value={newBottom2}
                onChange={(e) => setNewBottom2(e.target.value)}
                className="w-full bg-nikkei-dark border border-nikkei-border rounded-xl px-3 py-2 text-cyan-300 font-bold text-center text-lg focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold py-3 rounded-xl shadow-glow-gold transition-all duration-200 mt-2 text-sm"
          >
            ⚡ {initialData ? 'บันทึกแก้ไขผลรางวัล' : 'บันทึกผลรางวัลและอัปเดตคำนวณ Real-Time'}
          </button>
        </form>
      </div>
    </div>
  );
};
