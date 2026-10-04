import React, { useState } from 'react';
import { FormulaResult } from '../types';
import { Cpu, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';

interface FormulaCalculatorProps {
  formulas: FormulaResult[];
}

export const FormulaCalculator: React.FC<FormulaCalculatorProps> = ({ formulas }) => {
  const [activeFormulaId, setActiveFormulaId] = useState<string>(formulas[0]?.formulaId || '');

  const activeFormula = formulas.find((f) => f.formulaId === activeFormulaId) || formulas[0];

  return (
    <div className="bg-nikkei-card border border-nikkei-border rounded-2xl p-6 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nikkei-border">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-extrabold text-white">
              สูตรวิเคราะห์และคำนวณสถิติ 5 มิติ (5 Proven Statistical Formulas)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            สลับเพื่อดูวิธีการคำนวณและชุดเลขเด็ดประจำแต่ละสูตร พร้อมอัตราความแม่นยำย้อนหลัง (Backtest Hit-Rate %)
          </p>
        </div>
      </div>

      {/* Formula Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar scrollbar-none border-b border-nikkei-border/60">
        {formulas.map((f) => (
          <button
            key={f.formulaId}
            onClick={() => setActiveFormulaId(f.formulaId)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              activeFormulaId === f.formulaId
                ? 'bg-amber-500 text-black shadow-glow-gold scale-105'
                : 'bg-nikkei-dark hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{f.formulaName.split('(')[0]}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
              activeFormulaId === f.formulaId ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {f.hitRatePercent}%
            </span>
          </button>
        ))}
      </div>

      {/* Active Formula Details */}
      {activeFormula && (
        <div className="mt-6 space-y-6">
          
          <div className="bg-nikkei-dark/60 border border-nikkei-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                สูตรที่เลือกใช้งาน
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {activeFormula.formulaName}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {activeFormula.description}
              </p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-400">อัตราเข้าเป้าย้อนหลัง 2 เดือน</span>
              <div className="flex items-center justify-end gap-1 text-emerald-300 font-extrabold text-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{activeFormula.hitRatePercent}%</span>
              </div>
            </div>
          </div>

          {/* Numbers grid for formula */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Top Picks */}
            <div className="bg-nikkei-dark/40 border border-amber-500/30 rounded-xl p-4">
              <span className="text-xs font-bold text-amber-400 block mb-2">
                🔥 เลขเด่นหลักประจำสูตร:
              </span>
              <div className="flex gap-3">
                {activeFormula.recommendedTopDigits.map((d) => (
                  <span
                    key={d}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-extrabold text-2xl flex items-center justify-center shadow-glow-gold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Picks */}
            <div className="bg-nikkei-dark/40 border border-cyan-500/30 rounded-xl p-4">
              <span className="text-xs font-bold text-cyan-400 block mb-2">
                ⭐ เลขรองประจำสูตร:
              </span>
              <div className="flex gap-3">
                {activeFormula.secondaryDigits.map((d) => (
                  <span
                    key={d}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 text-black font-extrabold text-2xl flex items-center justify-center shadow-glow-cyan"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* 2D & 3D Combinations */}
            <div className="bg-nikkei-dark/40 border border-nikkei-border rounded-xl p-4">
              <span className="text-xs font-bold text-emerald-400 block mb-2">
                🎯 ชุดเจาะเจาะจง 2 ตัว / 3 ตัว:
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">2 ตัว: </span>
                  <span className="text-amber-300 font-bold">{activeFormula.pairs2D.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">3 ตัว: </span>
                  <span className="text-cyan-300 font-bold">{activeFormula.triples3D.join(', ')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
