import React, { useState } from 'react';
import { DrawResult, LotteryType, SessionType } from '../types';
import { ShieldCheck, X, RefreshCw, Edit3, Trash2, CheckCircle2, Clock, AlertTriangle, PlusCircle, Sparkles } from 'lucide-react';

interface ManualRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualRecords: DrawResult[];
  onOpenEditModal: (draw: DrawResult) => void;
  onDeleteDraw: (id: string, date: string, lotteryType: LotteryType, session?: SessionType) => void;
  onOpenAddModal: () => void;
  onVerifyWithWeb?: () => Promise<void>;
  isVerifying?: boolean;
  lotteryType: LotteryType;
}

export const ManualRecordsModal: React.FC<ManualRecordsModalProps> = ({
  isOpen,
  onClose,
  manualRecords,
  onOpenEditModal,
  onDeleteDraw,
  onOpenAddModal,
  onVerifyWithWeb,
  isVerifying = false,
  lotteryType
}) => {
  const [filterSession, setFilterSession] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredRecords = filterSession === 'ALL'
    ? manualRecords
    : manualRecords.filter((r) => r.session === filterSession || r.lotteryType === filterSession);

  const getSessionBadgeText = (item: DrawResult) => {
    const s = item.session;
    if (s === 'NIKKEI_MORNING' || s === 'MORNING') return '🎌 นิคเคอิ เช้า (09:30)';
    if (s === 'NIKKEI_AFTERNOON' || s === 'AFTERNOON') return '🎌 นิคเคอิ บ่าย (13:00)';
    if (s === 'CHINA_MORNING') return '🇨🇳 จีน เช้า (10:35)';
    if (s === 'CHINA_AFTERNOON') return '🇨🇳 จีน บ่าย (14:00)';
    if (s === 'HANGSENG_MORNING') return '🇭🇰 ฮั่งเส็ง เช้า (11:00)';
    if (s === 'HANGSENG_AFTERNOON') return '🇭🇰 ฮั่งเส็ง บ่าย (15:30)';

    if (s === 'NIKKEI_VIP_MORNING') return '🎌 นิคเคอิ VIP เช้า (09:30)';
    if (s === 'NIKKEI_VIP_AFTERNOON') return '🎌 นิคเคอิ VIP บ่าย (13:00)';
    if (s === 'CHINA_VIP_MORNING') return '🇨🇳 จีน VIP เช้า (09:30)';
    if (s === 'CHINA_VIP_AFTERNOON') return '🇨🇳 จีน VIP บ่าย (14:00)';
    if (s === 'HANGSENG_VIP_MORNING') return '🇭🇰 ฮั่งเส็ง VIP เช้า (11:00)';
    if (s === 'HANGSENG_VIP_AFTERNOON') return '🇭🇰 ฮั่งเส็ง VIP บ่าย (15:30)';

    if (s === 'LAOS_EVENING') return '🇱🇦 ลาวพัฒนา (20:30)';
    if (s === 'DOWJONES_NIGHT') return '🇺🇸 ดาวโจนส์ (04:00)';
    if (s === 'HANOI_SPECIAL') return '🇻🇳 ฮานอยพิเศษ (17:30)';
    if (s === 'HANOI_EVENING') return '🇻🇳 ฮานอยปกติ (18:30)';
    if (s === 'HANOI_VIP') return '🇻🇳 ฮานอย VIP (19:30)';
    if (s === 'GSB_BIWEEKLY') return '🏦 ออมสิน (13:00)';
    if (s === 'GOV_BIWEEKLY') return '🇹🇭 รัฐบาลไทย (15:30)';
    return `${item.lotteryType} ${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c121e]/95 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-black font-extrabold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  ตรวจสอบผลรางวัลที่บันทึกเอง
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  🛡️ ระบบคุ้มครองทำงานอยู่
                </span>
              </div>
              <p className="text-xs text-gray-400">
                คุ้มครองผลที่คุณป้อนเอง ไม่ให้ถูกลบหรือเขียนทับ แม้เว็บยังไม่อัปเดตผลก็ตาม
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protection Info Banner */}
        <div className="px-4 sm:px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              ตรวจพบผลบันทึกเอง <strong>{manualRecords.length}</strong> งวด (จัดเก็บแยกใน Storage พิเศษ ปลอดภัย 100%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onVerifyWithWeb && (
              <button
                onClick={onVerifyWithWeb}
                disabled={isVerifying}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'กำลังตรวจสอบ...' : 'ตรวจสอบกับเว็บ'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3 h-3" />
              <span>+ บันทึกผลใหม่</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 no-scrollbar">
          {manualRecords.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500">
                <ShieldCheck className="w-7 h-7 text-emerald-400/60" />
              </div>
              <p className="text-sm font-bold text-gray-300">
                ยังไม่มีรายการผลที่บันทึกเอง
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                เมื่อคุณกด "+ ใส่ผลรางวัลใหม่" ระบบจะบันทึกผลพร้อมตราประทับ ✏️ บันทึกเอง และคุ้มครองไว้ในฐานข้อมูลนี้ ไม่ให้ถูกลบแม้เว็บยังไม่อัปเดต
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-glow-gold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ ทดลองบันทึกผลด้วยตนเอง</span>
              </button>
            </div>
          ) : (
            filteredRecords.map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5 transition-all"
              >
                {/* Header: Badge & Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg text-xs font-bold">
                      {getSessionBadgeText(item)}
                    </span>
                    <span className="text-xs font-bold text-gray-300">
                      {item.dateFormatted} ({item.dayNameThai ? `วัน${item.dayNameThai}` : item.dayOfWeek})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenEditModal(item);
                      }}
                      title="แก้ไขผลที่บันทึกเอง"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDraw(item.id, item.dateFormatted, item.lotteryType, item.session)}
                      title="ลบผลที่บันทึกเอง"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Number Display */}
                <div className="grid grid-cols-3 gap-2 text-center bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">3 ตัวบน</span>
                    <span className="text-lg font-black text-amber-300 font-mono tracking-wider">
                      {item.top3}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">2 ตัวบน</span>
                    <span className="text-lg font-black text-amber-400 font-mono tracking-wider">
                      {item.top2}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-0.5 font-medium">2 ตัวล่าง</span>
                    <span className="text-lg font-black text-cyan-300 font-mono tracking-wider">
                      {item.bottom2}
                    </span>
                  </div>
                </div>

                {/* Protection Status Footer */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ผลได้รับการคุ้มครอง — ป้องกันการเขียนทับเมื่อกด "ดึงผล" หรือรีเฟรชหน้า</span>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-black">
                    ✏️ บันทึกเอง
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/30 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            ระบบคำนวณสูตรและ AI นำผลที่บันทึกเองไปใช้ประมวลผลทันที
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-gray-200 text-xs font-bold transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
