import React, { useState, useEffect } from 'react';
import { X, Send, Save, CheckCircle2, AlertCircle, MessageSquare, Bell, Shield, ExternalLink, HelpCircle } from 'lucide-react';
import { LineBotConfig, DEFAULT_LINE_CONFIG, getLocalLineConfig, saveLocalLineConfig, sendLineNotification } from '../utils/lineNotifier';

interface LineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const LineSettingsModal: React.FC<LineSettingsModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const [config, setConfig] = useState<LineBotConfig>(DEFAULT_LINE_CONFIG);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // โหลดการตั้งค่าจาก Server หรือ localStorage
      const local = getLocalLineConfig();
      setConfig(local);

      fetch('/api/line/config')
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.config && res.config.channelAccessToken) {
            setConfig((prev) => ({ ...prev, ...res.config }));
            saveLocalLineConfig({ ...local, ...res.config });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveLocalLineConfig(config);
      await fetch('/api/line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      onToast('success', 'บันทึกสำเร็จ ✅', 'บันทึกการตั้งค่า LINE Bot เรียบร้อยแล้ว');
    } catch (err: any) {
      onToast('error', 'บันทึกไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const samplePreviewMessage = `นิเคอิ-ปก (เช้า)
177-22

🌼 นิเคอิ ปก-เช้า เด่น 2 [ล่าง 2 2]
🌼 นิเคอิ ปก-เช้า รอง 7 [บน 7 7]
🏷️ รวมทุกหุ้นปกติ 6 รอบ [บน 7 7]

🎉🎉🎉🎉`;

  const handleTestSend = async () => {
    if (!config.channelAccessToken) {
      onToast('error', 'กรุณาระบุ Token', 'กรุณากรอก Channel Access Token ก่อนกดทดสอบส่ง');
      return;
    }
    setIsTesting(true);
    try {
      // บันทึกก่อนทดสอบ
      saveLocalLineConfig(config);
      await fetch('/api/line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const res = await sendLineNotification(samplePreviewMessage, config.targetId);
      if (res.success) {
        onToast('success', 'ส่งข้อความสำเร็จ! 📲', `ส่งแจ้งเตือนตัวอย่างไปยัง ${config.targetId} เรียบร้อยแล้ว เช็คใน LINE ได้เลยครับ`);
      } else {
        onToast('error', 'ส่งไม่สำเร็จ ⚠️', res.error || 'โปรดตรวจสอบความถูกต้องของ Token และ User/Group ID');
      }
    } catch (err: any) {
      onToast('error', 'เกิดข้อผิดพลาด', err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0c121e]/95 border border-[#06c755]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#06c755]/20 via-emerald-950/20 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06c755] flex items-center justify-center shadow-lg shadow-[#06c755]/30 shrink-0">
              <MessageSquare className="w-6 h-6 text-white font-extrabold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>ตั้งค่าแจ้งเตือนผลหวยเข้า LINE</span>
                </h3>
                <span className="bg-[#06c755]/20 text-[#06c755] border border-[#06c755]/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Messaging API
                </span>
              </div>
              <p className="text-xs text-gray-400">
                แจ้งเตือนผลออกแต่ละรอบ พร้อมสรุปชุดเลขที่เข้าเป้าอัตโนมัติ
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar text-xs sm:text-sm text-gray-200">
          
          {/* Status & Auto-notification Toggle */}
          <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-700/30 text-gray-400'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white text-sm">
                  ระบบแจ้งเตือนอัตโนมัติ
                </div>
                <div className="text-[11px] text-gray-400">
                  ส่งทันทีเมื่อมีผลออกใหม่ (ทั้งจากการซิงค์อัตโนมัติและป้อนผลเอง)
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06c755]"></div>
            </label>
          </div>

          {/* Target ID (User ID or Group ID) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              🎯 ผู้รับข้อความ (Target ID):
            </label>
            <input
              type="text"
              value={config.targetId}
              onChange={(e) => setConfig({ ...config, targetId: e.target.value.trim() })}
              placeholder="เช่น U3a7529a26c7c9a1a06d4cd374349a33c หรือรหัสกลุ่ม C..."
              className="w-full bg-[#131b2e] border border-gray-700 focus:border-[#06c755] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">
              * ปัจจุบันกำหนดให้ส่งมาที่ User ID: <code className="text-emerald-400 font-bold bg-black/40 px-1 py-0.5 rounded">U3a7529a26c7c9a1a06d4cd374349a33c</code> (เมื่อทดสอบผ่านแล้ว สามารถเปลี่ยนเป็น Group ID ของกลุ่ม LINE ได้)
            </p>
          </div>

          {/* Channel Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-300">
                🔑 Channel Access Token (Long-lived):
              </label>
              <button
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="text-[11px] text-[#06c755] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>วิธีขอ Token</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={config.channelAccessToken}
              onChange={(e) => setConfig({ ...config, channelAccessToken: e.target.value.trim() })}
              placeholder="วาง Channel Access Token ที่ได้จาก LINE Developers Console ที่นี่..."
              className="w-full bg-[#131b2e] border border-gray-700 focus:border-[#06c755] rounded-xl p-3 text-white font-mono text-xs focus:outline-none transition-colors"
            />
            {showTokenHelp && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5 text-[11px] text-emerald-200 animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <Shield className="w-3.5 h-3.5" />
                  ขั้นตอนการรับ Token จาก LINE:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-300">
                  <li>เข้าเว็บ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-[#06c755] underline inline-flex items-center gap-0.5">LINE Developers Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>เลือก Provider และ Channel (Messaging API) ของคุณ</li>
                  <li>ไปที่แท็บ <strong>Messaging API</strong> เลื่อนลงล่างสุดที่หัวข้อ <strong>Channel access token (long-lived)</strong></li>
                  <li>กดปุ่ม <strong>Issue</strong> แล้วคัดลอก Token มาวางในช่องนี้</li>
                  <li>อย่าลืมดึงบอทเข้ากลุ่ม LINE ที่ต้องการรับแจ้งเตือนด้วยครับ</li>
                </ol>
              </div>
            )}
          </div>

          {/* Sample Format Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              📱 ตัวอย่างรูปแบบข้อความที่จะส่งเข้า LINE:
            </label>
            <div className="p-3.5 bg-[#b7ec93]/90 text-gray-900 rounded-2xl shadow-inner font-sans text-xs leading-relaxed border border-emerald-400/30 max-w-xs whitespace-pre-line">
              {samplePreviewMessage}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] flex items-center justify-between gap-3 bg-[#0c121e]">
          <button
            onClick={handleTestSend}
            disabled={isTesting || !config.channelAccessToken}
            className="px-4 py-2.5 rounded-xl bg-[#06c755] hover:bg-[#05b54d] active:scale-95 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
            <span>{isTesting ? 'กำลังทดสอบส่ง...' : '🔔 ทดสอบส่งเข้า LINE ทันที'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] text-xs font-bold transition-all"
            >
              ปิด
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-glow-gold"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
