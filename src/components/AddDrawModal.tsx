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
  const [stockMarket, setStockMarket] = useState<'NIKKEI' | 'CHINA' | 'HANGSENG'>('NIKKEI');
  const [stockRound, setStockRound] = useState<'MORNING' | 'AFTERNOON'>('MORNING');
  const [newDate, setNewDate] = useState('');
  const [newDayName, setNewDayName] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [newFull6D, setNewFull6D] = useState('');
  const [newTop3, setNewTop3] = useState('');
  const [newBottom2, setNewBottom2] = useState('');
  const [pickerDate, setPickerDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const dayCodes: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'> = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleSelectStock = (market: 'NIKKEI' | 'CHINA' | 'HANGSENG', round: 'MORNING' | 'AFTERNOON') => {
    setStockMarket(market);
    setStockRound(round);
    if (lotteryType === 'STOCK_VIP') {
      if (market === 'CHINA') {
        setNewSession(round === 'MORNING' ? 'CHINA_VIP_MORNING' : 'CHINA_VIP_AFTERNOON');
      } else if (market === 'HANGSENG') {
        setNewSession(round === 'MORNING' ? 'HANGSENG_VIP_MORNING' : 'HANGSENG_VIP_AFTERNOON');
      } else {
        setNewSession(round === 'MORNING' ? 'NIKKEI_VIP_MORNING' : 'NIKKEI_VIP_AFTERNOON');
      }
    } else {
      if (market === 'CHINA') {
        setNewSession(round === 'MORNING' ? 'CHINA_MORNING' : 'CHINA_AFTERNOON');
      } else if (market === 'HANGSENG') {
        setNewSession(round === 'MORNING' ? 'HANGSENG_MORNING' : 'HANGSENG_AFTERNOON');
      } else {
        setNewSession(round === 'MORNING' ? 'NIKKEI_MORNING' : 'NIKKEI_AFTERNOON');
      }
    }
  };

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

      if (initialData.session === 'CHINA_VIP_MORNING') {
        setStockMarket('CHINA');
        setStockRound('MORNING');
      } else if (initialData.session === 'CHINA_VIP_AFTERNOON') {
        setStockMarket('CHINA');
        setStockRound('AFTERNOON');
      } else if (initialData.session === 'HANGSENG_VIP_MORNING') {
        setStockMarket('HANGSENG');
        setStockRound('MORNING');
      } else if (initialData.session === 'HANGSENG_VIP_AFTERNOON') {
        setStockMarket('HANGSENG');
        setStockRound('AFTERNOON');
      } else if (initialData.session === 'NIKKEI_VIP_AFTERNOON') {
        setStockMarket('NIKKEI');
        setStockRound('AFTERNOON');
      } else if (initialData.session === 'NIKKEI_VIP_MORNING') {
        setStockMarket('NIKKEI');
        setStockRound('MORNING');
      } else if (initialData.session === 'CHINA_MORNING') {
        setStockMarket('CHINA');
        setStockRound('MORNING');
      } else if (initialData.session === 'CHINA_AFTERNOON') {
        setStockMarket('CHINA');
        setStockRound('AFTERNOON');
      } else if (initialData.session === 'HANGSENG_MORNING') {
        setStockMarket('HANGSENG');
        setStockRound('MORNING');
      } else if (initialData.session === 'HANGSENG_AFTERNOON') {
        setStockMarket('HANGSENG');
        setStockRound('AFTERNOON');
      } else if (initialData.session === 'NIKKEI_AFTERNOON' || initialData.session === 'AFTERNOON') {
        setStockMarket('NIKKEI');
        setStockRound('AFTERNOON');
      } else {
        setStockMarket('NIKKEI');
        setStockRound('MORNING');
      }
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setPickerDate(todayStr);
      handlePickerDateChange(todayStr);

      if (lotteryType === 'HANOI') {
        setNewSession(
          selectedSession === 'HANOI_SPECIAL'
            ? 'HANOI_SPECIAL'
            : selectedSession === 'HANOI_VIP'
            ? 'HANOI_VIP'
            : 'HANOI_EVENING'
        );
      } else if (lotteryType === 'STOCK_VIP') {
        if (selectedSession === 'CHINA_VIP_MORNING') {
          setStockMarket('CHINA');
          setStockRound('MORNING');
          setNewSession('CHINA_VIP_MORNING');
        } else if (selectedSession === 'CHINA_VIP_AFTERNOON') {
          setStockMarket('CHINA');
          setStockRound('AFTERNOON');
          setNewSession('CHINA_VIP_AFTERNOON');
        } else if (selectedSession === 'CHINA_VIP_BOTH') {
          setStockMarket('CHINA');
          setStockRound('MORNING');
          setNewSession('CHINA_VIP_MORNING');
        } else if (selectedSession === 'HANGSENG_VIP_MORNING') {
          setStockMarket('HANGSENG');
          setStockRound('MORNING');
          setNewSession('HANGSENG_VIP_MORNING');
        } else if (selectedSession === 'HANGSENG_VIP_AFTERNOON') {
          setStockMarket('HANGSENG');
          setStockRound('AFTERNOON');
          setNewSession('HANGSENG_VIP_AFTERNOON');
        } else if (selectedSession === 'HANGSENG_VIP_BOTH') {
          setStockMarket('HANGSENG');
          setStockRound('MORNING');
          setNewSession('HANGSENG_VIP_MORNING');
        } else if (selectedSession === 'NIKKEI_VIP_AFTERNOON') {
          setStockMarket('NIKKEI');
          setStockRound('AFTERNOON');
          setNewSession('NIKKEI_VIP_AFTERNOON');
        } else {
          setStockMarket('NIKKEI');
          setStockRound('MORNING');
          setNewSession('NIKKEI_VIP_MORNING');
        }
      } else if (lotteryType === 'NIKKEI') {
        if (selectedSession === 'CHINA_MORNING') {
          setStockMarket('CHINA');
          setStockRound('MORNING');
          setNewSession('CHINA_MORNING');
        } else if (selectedSession === 'CHINA_AFTERNOON') {
          setStockMarket('CHINA');
          setStockRound('AFTERNOON');
          setNewSession('CHINA_AFTERNOON');
        } else if (selectedSession === 'CHINA_BOTH') {
          setStockMarket('CHINA');
          setStockRound('MORNING');
          setNewSession('CHINA_MORNING');
        } else if (selectedSession === 'HANGSENG_MORNING') {
          setStockMarket('HANGSENG');
          setStockRound('MORNING');
          setNewSession('HANGSENG_MORNING');
        } else if (selectedSession === 'HANGSENG_AFTERNOON') {
          setStockMarket('HANGSENG');
          setStockRound('AFTERNOON');
          setNewSession('HANGSENG_AFTERNOON');
        } else if (selectedSession === 'HANGSENG_BOTH') {
          setStockMarket('HANGSENG');
          setStockRound('MORNING');
          setNewSession('HANGSENG_MORNING');
        } else if (selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON') {
          setStockMarket('NIKKEI');
          setStockRound('AFTERNOON');
          setNewSession('NIKKEI_AFTERNOON');
        } else {
          setStockMarket('NIKKEI');
          setStockRound('MORNING');
          setNewSession('NIKKEI_MORNING');
        }
      } else if (lotteryType === 'LAOS') {
        setNewSession('LAOS_EVENING');
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

    const targetSession =
      lotteryType === 'LAOS'
        ? 'LAOS_EVENING'
        : lotteryType === 'DOWJONES'
        ? 'DOWJONES_NIGHT'
        : lotteryType === 'GSB'
        ? 'GSB_BIWEEKLY'
        : lotteryType === 'GOVERNMENT'
        ? 'GOV_BIWEEKLY'
        : newSession;

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
        bottom2: newBottom2
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
        bottom2: newBottom2
      });
    }

    onClose();
    setNewTop3('');
    setNewBottom2('');
    setNewFull6D('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-nikkei-card border border-amber-500/50 rounded-2xl p-6 w-full max-w-md shadow-glow-gold relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          {initialData ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
          {initialData ? 'แก้ไขผลรางวัลที่ป้อนไว้' : 'เพิ่มผลการออกรางวัล'} {
            lotteryType === 'STOCK_VIP'
              ? stockMarket === 'CHINA'
                ? '💎🇨🇳 หุ้นจีน VIP'
                : stockMarket === 'HANGSENG'
                ? '💎🇭🇰 หุ้นฮั่งเส็ง VIP'
                : '💎🎌 หุ้นนิเคอิ VIP'
              : lotteryType === 'NIKKEI'
              ? stockMarket === 'CHINA'
                ? '🇨🇳 หุ้นจีน'
                : stockMarket === 'HANGSENG'
                ? '🇭🇰 หุ้นฮั่งเส็ง'
                : '🎌 หุ้นนิเคอิ'
              : lotteryType === 'DOWJONES' ? '🇺🇸 หุ้นดาวโจนส์'
              : lotteryType === 'LAOS' ? '🇱🇦 ลาวพัฒนา'
              : lotteryType === 'HANOI' ? '🇻🇳 ฮานอย'
              : lotteryType === 'GSB' ? '🏦 ออมสิน'
              : '🇹🇭 รัฐบาลไทย'
          }
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {lotteryType === 'NIKKEI' || lotteryType === 'STOCK_VIP' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>เลือกตลาดหุ้น:</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {lotteryType === 'STOCK_VIP' ? 'นิเคอิ VIP / จีน VIP / ฮั่งเส็ง VIP' : 'นิเคอิ / จีน / ฮั่งเส็ง'}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectStock('NIKKEI', stockRound)}
                    className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      stockMarket === 'NIKKEI'
                        ? 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                    }`}
                  >
                    <span>🎌</span>
                    <span>{lotteryType === 'STOCK_VIP' ? 'นิเคอิ VIP' : 'นิเคอิ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStock('CHINA', stockRound)}
                    className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      stockMarket === 'CHINA'
                        ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                        : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                    }`}
                  >
                    <span>🇨🇳</span>
                    <span>{lotteryType === 'STOCK_VIP' ? 'จีน VIP' : 'หุ้นจีน'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStock('HANGSENG', stockRound)}
                    className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      stockMarket === 'HANGSENG'
                        ? 'bg-blue-500 text-white shadow-glow-cyan font-extrabold'
                        : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                    }`}
                  >
                    <span>🇭🇰</span>
                    <span>{lotteryType === 'STOCK_VIP' ? 'ฮั่งเส็ง VIP' : 'ฮั่งเส็ง'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">เลือกรอบการออกรางวัล:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStock(stockMarket, 'MORNING')}
                    className={`py-2.5 px-2 rounded-xl font-bold transition-all text-xs flex flex-col items-center justify-center gap-0.5 ${
                      stockRound === 'MORNING'
                        ? stockMarket === 'CHINA'
                          ? 'bg-red-500 text-white shadow-glow-gold font-extrabold'
                          : stockMarket === 'HANGSENG'
                          ? 'bg-blue-500 text-white shadow-glow-cyan font-extrabold'
                          : 'bg-amber-400 text-black shadow-glow-gold font-extrabold'
                        : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                    }`}
                  >
                    <span>☀️ รอบเช้า</span>
                    <span className="text-[10px] opacity-85">
                      {lotteryType === 'STOCK_VIP'
                        ? stockMarket === 'CHINA'
                          ? '09:30 น.'
                          : stockMarket === 'HANGSENG'
                          ? '10:55 น.'
                          : '08:30 น.'
                        : stockMarket === 'CHINA'
                        ? '10:35 น.'
                        : stockMarket === 'HANGSENG'
                        ? '11:00 น.'
                        : '09:30 น.'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStock(stockRound === 'MORNING' ? stockMarket : stockMarket, 'AFTERNOON')}
                    className={`py-2.5 px-2 rounded-xl font-bold transition-all text-xs flex flex-col items-center justify-center gap-0.5 ${
                      stockRound === 'AFTERNOON'
                        ? stockMarket === 'CHINA'
                          ? 'bg-rose-500 text-white shadow-glow-gold font-extrabold'
                          : stockMarket === 'HANGSENG'
                          ? 'bg-indigo-500 text-white shadow-glow-cyan font-extrabold'
                          : 'bg-cyan-400 text-black shadow-glow-cyan font-extrabold'
                        : 'bg-nikkei-dark text-gray-400 border border-nikkei-border hover:text-white'
                    }`}
                  >
                    <span>🌤️ รอบบ่าย</span>
                    <span className="text-[10px] opacity-85">
                      {lotteryType === 'STOCK_VIP'
                        ? stockMarket === 'CHINA'
                          ? '13:00 น.'
                          : stockMarket === 'HANGSENG'
                          ? '14:55 น.'
                          : '12:00 น.'
                        : stockMarket === 'CHINA'
                        ? '14:00 น.'
                        : stockMarket === 'HANGSENG'
                        ? '15:00 น.'
                        : '13:00 น.'}
                    </span>
                  </button>
                </div>
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
