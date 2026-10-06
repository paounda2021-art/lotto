import React, { useState } from 'react';
import { generateWinCombinations } from '../utils/calculator';
import { Layers, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinGeneratorProps {
  initialDigits: number[];
}

export const WinGenerator: React.FC<WinGeneratorProps> = ({ initialDigits }) => {
  const [selectedDigits, setSelectedDigits] = useState<number[]>(initialDigits.slice(0, 5));
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const winData = generateWinCombinations(selectedDigits);

  const toggleDigit = (digit: number) => {
    if (selectedDigits.includes(digit)) {
      if (selectedDigits.length <= 2) {
        alert('ควรเลือกเลขอย่างน้อย 2 ตัวสำหรับการจับคู่');
        return;
      }
      setSelectedDigits(selectedDigits.filter((d) => d !== digit));
    } else {
      if (selectedDigits.length >= 8) {
        alert('เลือกสูงสุด 8 ตัวเลขเพื่อป้องกันจำนวนชุดที่มากเกินไป');
        return;
      }
      setSelectedDigits([...selectedDigits, digit].sort((a, b) => a - b));
    }
  };

  const handleCopy = (text: string, typeName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeName);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="bg-nikkei-card border border-nikkei-border rounded-2xl p-6 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nikkei-border">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-extrabold text-white">
              เครื่องมือสร้างชุดเลขวิน (Win Number Combination Generator)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            เลือกชุดเลขเด่น 0-9 เพื่อสร้างชุดเลขวิน 2 ตัว บน-ล่าง, ชุด 3 ตัว และเลข 19 ประตูอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setSelectedDigits(initialDigits.slice(0, 5))}
          className="bg-nikkei-dark hover:bg-nikkei-cardHover border border-nikkei-border text-xs text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ใช้เลขเด่นจากระบบทำนาย</span>
        </button>
      </div>

      {/* Digit Selector Grid 0-9 */}
      <div className="my-5">
        <label className="text-xs font-semibold text-gray-300 block mb-2">
          เลือกตัวเลขเด่นเพื่อนำมาจับวิน (เลือกแล้ว {selectedDigits.length} ตัว):
        </label>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
            const isSelected = selectedDigits.includes(digit);
            return (
              <button
                key={digit}
                onClick={() => toggleDigit(digit)}
                className={`w-11 h-11 rounded-xl font-extrabold text-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-glow-gold scale-105'
                    : 'bg-nikkei-dark hover:bg-gray-800 text-gray-400 border border-nikkei-border'
                }`}
              >
                {digit}
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        
        {/* 2D Win Output */}
        <div className="bg-nikkei-dark/60 border border-nikkei-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> ชุดเลขวิน 2 ตัว บน-ล่าง ({winData.pairs2DCount} ชุด)
              </span>
              <button
                onClick={() => handleCopy(winData.pairs2D.join(', '), '2D')}
                className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                {copiedType === '2D' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === '2D' ? 'คัดลอกแล้ว' : 'คัดลอก 2 ตัว'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-300 font-mono leading-relaxed bg-nikkei-dark p-3 rounded-lg border border-gray-800 max-h-32 overflow-y-auto">
              {winData.pairs2D.join(' , ')}
            </p>
          </div>
        </div>

        {/* 3D Win Output */}
        <div className="bg-nikkei-dark/60 border border-nikkei-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> ชุดเลขวิน 3 ตัว ({winData.triples3DCount} ชุด)
              </span>
              <button
                onClick={() => handleCopy(winData.triples3D.join(', '), '3D')}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                {copiedType === '3D' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === '3D' ? 'คัดลอกแล้ว' : 'คัดลอก 3 ตัว'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-300 font-mono leading-relaxed bg-nikkei-dark p-3 rounded-lg border border-gray-800 max-h-32 overflow-y-auto">
              {winData.triples3D.length > 0 ? winData.triples3D.join(' , ') : 'เลือกตัวเลขอย่างน้อย 3 ตัวเพื่อสร้างชุด 3 ตัว'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
