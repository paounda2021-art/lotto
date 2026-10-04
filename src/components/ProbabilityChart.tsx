import React from 'react';
import { DigitStat } from '../types';
import { BarChart2, Flame, AlertCircle, Sparkles } from 'lucide-react';

interface ProbabilityChartProps {
  stats: DigitStat[];
  totalDraws: number;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ stats, totalDraws }) => {
  // Find top hot digits
  const hotDigits = stats.filter((s) => s.status === 'HOT');
  const coldDigits = stats.filter((s) => s.status === 'COLD');

  return (
    <div className="bg-nikkei-card border border-nikkei-border rounded-2xl p-6 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nikkei-border">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-extrabold text-white">
              เปอร์เซ็นต์ความน่าจะเป็นรายตัวเลข (0-9 Probability % Matrix)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            เรียงลำดับโอกาสการออกรางวัลย้อนหลัง ({totalDraws} งวดล่าสุด)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> เด่นสถิติสูง: {hotDigits.map(h => h.digit).join(', ')}
          </span>
          {coldDigits.length > 0 && (
            <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
              <AlertCircle className="w-3.5 h-3.5" /> เลขหลุดนาน: {coldDigits.map(c => c.digit).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Grid of 0-9 digits */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3.5 mt-5">
        {stats.map((item) => {
          let badgeBg = 'bg-gray-800 text-gray-300 border-gray-700';
          let barGradient = 'from-gray-600 to-gray-400';
          let textColor = 'text-gray-200';

          if (item.status === 'HOT') {
            badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            barGradient = 'from-amber-500 via-yellow-400 to-amber-300';
            textColor = 'text-amber-300';
          } else if (item.status === 'WARM') {
            badgeBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
            barGradient = 'from-cyan-500 to-teal-300';
            textColor = 'text-cyan-200';
          }

          return (
            <div
              key={item.digit}
              className={`bg-nikkei-dark/70 hover:bg-nikkei-cardHover border rounded-xl p-3.5 transition-all duration-200 ${
                item.status === 'HOT' ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' : 'border-nikkei-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xl ${
                    item.status === 'HOT' ? 'bg-amber-500 text-black shadow-glow-gold' : 'bg-gray-800 text-white'
                  }`}>
                    {item.digit}
                  </span>
                  <div>
                    <span className="text-xs font-extrabold text-white block">
                      {item.probability}%
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ออกทั้งหมด {item.totalOccurrences} ครั้ง
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
                  {item.status}
                </span>
              </div>

              {/* Occurrences breakdown */}
              <div className="text-[10px] text-gray-400 flex justify-between my-2 border-t border-gray-800/80 pt-1.5">
                <span>3 ตัวบน: <strong className="text-gray-200">{item.countTop3}</strong></span>
                <span>2 บน: <strong className="text-gray-200">{item.countTop2}</strong></span>
                <span>2 ล่าง: <strong className="text-gray-200">{item.countBottom2}</strong></span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className={`bg-gradient-to-r ${barGradient} h-2 rounded-full transition-all duration-700`}
                  style={{ width: `${item.probability}%` }}
                />
              </div>

              <div className="text-[10px] text-gray-500 mt-1.5 text-right">
                {item.lastSeenDaysAgo === 0 ? (
                  <span className="text-emerald-400 font-semibold">เพิ่งออกงวดล่าสุด</span>
                ) : (
                  <span>หลุดไป {item.lastSeenDaysAgo} งวด</span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
