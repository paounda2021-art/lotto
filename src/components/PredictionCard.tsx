import React, { useState } from 'react';
import { NextDrawPrediction, LotteryType, SessionType, DrawResult } from '../types';
import { Sparkles, Copy, Check, Target, Gauge, Zap, ShieldCheck, ArrowRightLeft, Activity, ChevronLeft, ChevronRight, History, Trophy, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PredictionCardProps {
  prediction: NextDrawPrediction;
  onOpenAddModal?: () => void;
  drawOffset?: number;
  totalDraws?: number;
  pastDrawResult?: DrawResult;
  latestDrawResult?: DrawResult;
  allHanoiData?: DrawResult[];
  prevDrawLabel?: string;
  nextDrawLabel?: string;
  onPrevDraw?: () => void;
  onNextDraw?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  onOpenAddModal,
  drawOffset = 0,
  totalDraws = 0,
  pastDrawResult,
  latestDrawResult,
  allHanoiData,
  prevDrawLabel,
  nextDrawLabel,
  onPrevDraw,
  onNextDraw
}) => {
  const [copied, setCopied] = useState(false);

  const getLotteryName = (type: LotteryType) => {
    switch (type) {
      case 'NIKKEI': return 'หุ้นปกติ';
      case 'STOCKS_VIP': return 'หวยหุ้น VIP';
      case 'DOWJONES': return 'หุ้นดาวโจนส์';
      case 'LAOS': return 'ลาวพัฒนา';
      case 'MALAY': return 'หวยมาเลย์';
      case 'HANOI': return 'ฮานอย';
      case 'GSB': return 'ออมสิน';
      case 'GOVERNMENT': return 'รัฐบาลไทย';
      default: return 'หุ้นปกติ';
    }
  };

  const getLotterySubtitle = (type: LotteryType, session?: SessionType) => {
    switch (type) {
      case 'STOCKS_VIP':
        if (session === 'CHINA_VIP_MORNING' || session === 'CHINA_VIP_AFTERNOON' || session === 'CHINA_VIP_BOTH') {
          return 'ประมวลผลสถิติหวยหุ้นจีน VIP (รอบเช้า 09:30 / บ่าย 14:00) วิเคราะห์ความสัมพันธ์ข้ามรอบ';
        }
        if (session === 'HANGSENG_VIP_MORNING' || session === 'HANGSENG_VIP_AFTERNOON' || session === 'HANGSENG_VIP_BOTH') {
          return 'ประมวลผลสถิติหวยหุ้นฮั่งเส็ง VIP (รอบเช้า 11:00 / บ่าย 15:30) วิเคราะห์ความสัมพันธ์ข้ามรอบ';
        }
        if (session === 'STOCKS_VIP_ALL_3') {
          return 'ประมวลผลสถิติรวม 3 หวยหุ้น VIP (นิคเคอิ, จีน, ฮั่งเส็ง รวม 6 รอบ 120+ งวด)';
        }
        return 'ประมวลผลสถิติหวยหุ้นนิคเคอิ VIP (รอบเช้า 09:30 / บ่าย 13:00) วิเคราะห์ความสัมพันธ์ Correlation Matrix';
      case 'NIKKEI': return 'ประมวลผลความสัมพันธ์ Correlation Matrix ระหว่างรอบเช้า (09:30) และรอบบ่าย (13:00)';
      case 'DOWJONES': return 'ประมวลผลสถิติดัชนีปิดตลาดหุ้นสหรัฐฯ ย้อนหลัง 3 เดือน อ้างอิง exphuay';
      case 'LAOS': return 'ประมวลผลสถิติหวยลาวพัฒนา ย้อนหลัง 3 เดือน อ้างอิง LottoTH';
      case 'MALAY': return 'ประมวลผลสถิติหวยมาเลย์ (Magnum 4D) ย้อนหลัง (รอบ 18:30 น.)';
      case 'HANOI':
        if (session === 'HANOI_SPECIAL') return 'ประมวลผลสถิติหวยฮานอยพิเศษ (รอบ 17:30 น.) ย้อนหลัง 3 เดือน อ้างอิง exphuay (xsthm)';
        if (session === 'HANOI_VIP') return 'ประมวลผลสถิติหวยฮานอย VIP (รอบ 19:30 น.) ย้อนหลัง 3 เดือน อ้างอิง exphuay (mlnhngo)';
        if (session === 'HANOI_EVENING') return 'ประมวลผลสถิติหวยฮานอยปกติ (รอบ 18:30 น.) ย้อนหลัง 3 เดือน อ้างอิง exphuay (Minh Ngoc)';
        return 'ประมวลผลสถิติรวม 3 รอบฮานอย (17:30 / 18:30 / 19:30) ดักทางเลขเด่นวิ่ง-รูด 3 รอบ';
      case 'GSB': return 'ประมวลผลสถิติหวยออมสินย้อนหลัง 6 เดือนเต็ม อ้างอิง exphuay (GSB)';
      case 'GOVERNMENT': return 'ประมวลผลสถิติหวยรัฐบาลไทยย้อนหลัง 6 เดือนเต็ม อ้างอิง สำนักงานสลากกินแบ่งรัฐบาล';
      default: return 'ประมวลผลสถิติตามระบบอัลกอริทึมวิเคราะห์ความน่าจะเป็น';
    }
  };

  const lotteryName = getLotteryName(prediction.lotteryType);

  const handleCopyText = () => {
    const textToCopy = `📌 [แนวทางคาดการณ์${lotteryName}]
🗓 งวดประจำวันที่: ${prediction.targetDate}
----------------------------------------
🔥 เลขเด่นหลัก (รูดตัวเดียว): ${prediction.topDigit} (สถิติจริง ${prediction.topDigitProb}%)
⭐ เลขรอง: ${prediction.secondaryDigit} (${prediction.secondaryDigitProb}%)
🛡 เลขกัน: ${prediction.supportingDigits.join(', ')}

⚡ วิ่ง/รูด 19 ประตู (เน้นตัวเดียว): ${prediction.topDigit} (โอกาสออก ${prediction.topDigitProb}%)
🏃‍♂️ สายวิ่ง/รูดสำรอง (2 ตัว): ${prediction.recommendedRun.join(' - ')}

👑 เลขวินบน (5 ตัว): ${(prediction.winTop5Digits || []).join(', ')}
💎 เลขวินล่าง (5 ตัว): ${(prediction.winBottom5Digits || []).join(', ')}

🎯 2 ตัวบน-ล่าง (เน้น 6 ชุด): ${prediction.pairs2D.top.slice(0, 6).join(' , ')}
✨ 3 ตัวตรง-โต๊ด (เน้น 4 ชุด): ${prediction.triples3D.slice(0, 4).join(' , ')}
----------------------------------------
🔄 หมายเหตุแนวทาง: ${prediction.crossSessionFlowNote || 'สถิติคำนวณจาก Supervised Optimization Model'}
📊 คะแนนความเชื่อมั่นโดยประมาณ: ${prediction.confidenceScore}%`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const getHanoiHitsForDigit = (digit: number | string, targetDraws: DrawResult[]) => {
    if (digit === undefined || digit === null || !targetDraws || targetDraws.length === 0) return [];
    const digitStr = digit.toString();

    const special = targetDraws.find((d) => d.session === 'HANOI_SPECIAL');
    const evening = targetDraws.find((d) => d.session === 'HANOI_EVENING');
    const vip = targetDraws.find((d) => d.session === 'HANOI_VIP');

    const hits: { session: string; shortLabel: string; winningNumbers: string; badgeColor: string }[] = [];

    const getMatchedNumbers = (d?: DrawResult) => {
      if (!d || !d.top3) return [];
      const top2Str = d.top2 || (d.top3 ? d.top3.slice(1) : '');
      const bottom2Str = d.bottom2 || '';
      const matched: string[] = [];
      if (top2Str && top2Str.includes(digitStr)) matched.push(`บน ${top2Str}`);
      if (bottom2Str && bottom2Str.includes(digitStr)) matched.push(`ล่าง ${bottom2Str}`);
      return matched;
    };

    const specialMatches = getMatchedNumbers(special);
    if (specialMatches.length > 0) {
      hits.push({
        session: 'HANOI_SPECIAL',
        shortLabel: '🟠 พิเศษ',
        winningNumbers: specialMatches.join(', '),
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      });
    }

    const eveningMatches = getMatchedNumbers(evening);
    if (eveningMatches.length > 0) {
      hits.push({
        session: 'HANOI_EVENING',
        shortLabel: '🔴 ปกติ',
        winningNumbers: eveningMatches.join(', '),
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40'
      });
    }

    const vipMatches = getMatchedNumbers(vip);
    if (vipMatches.length > 0) {
      hits.push({
        session: 'HANOI_VIP',
        shortLabel: '🟣 VIP',
        winningNumbers: vipMatches.join(', '),
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      });
    }

    return hits;
  };

  const renderDigitHitBadge = (digit: number | string) => {
    if (digit === undefined || digit === null) return null;

    if (drawOffset === 0) {
      return (
        <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-center">
          <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 inline-flex items-center gap-1">
            ⏳ รอผลออกรางวัล
          </span>
        </div>
      );
    }

    if (pastDrawResult) {
      if (prediction.lotteryType === 'HANOI' && prediction.session === 'HANOI_ALL_3' && allHanoiData) {
        const targetDraws = allHanoiData.filter((d) => (d.date === pastDrawResult.date || (d.dateFormatted && pastDrawResult.dateFormatted && d.dateFormatted === pastDrawResult.dateFormatted)) && d.top3);
        const hits = getHanoiHitsForDigit(digit, targetDraws);

        if (hits.length > 0) {
          return (
            <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-center flex flex-col items-center gap-1">
              {hits.map((h, idx) => (
                <span key={idx} className={`font-extrabold px-2 py-0.5 rounded border inline-flex items-center gap-1 shadow-glow-emerald ${h.badgeColor}`}>
                  ✓ {h.shortLabel} [{h.winningNumbers}]
                </span>
              ))}
            </div>
          );
        }

        return (
          <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-center">
            <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 inline-flex items-center gap-1">
              ❌ ไม่เข้า
            </span>
          </div>
        );
      }

      const digitStr = digit.toString();
      const top2Str = pastDrawResult.top2 || (pastDrawResult.top3 ? pastDrawResult.top3.slice(1) : '');
      const bottom2Str = pastDrawResult.bottom2 || '';
      const matched: string[] = [];

      if (top2Str && top2Str.includes(digitStr)) matched.push(`บน ${top2Str}`);
      if (bottom2Str && bottom2Str.includes(digitStr)) matched.push(`ล่าง ${bottom2Str}`);

      return (
        <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-center">
          {matched.length > 0 ? (
            <span className="font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-glow-emerald">
              ✓ เข้า [{matched.join(', ')}]
            </span>
          ) : (
            <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 inline-flex items-center gap-1">
              ❌ ไม่เข้า
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-center">
        <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 inline-flex items-center gap-1">
          ⏳ รอผลออกรางวัล
        </span>
      </div>
    );
  };

  const getHanoiHitsForPair = (pair: string, targetDraws: DrawResult[]) => {
    if (!pair || !targetDraws || targetDraws.length === 0) return [];
    const rev = pair.split('').reverse().join('');
    const hits: { session: string; shortLabel: string; position: string; badgeColor: string }[] = [];

    const special = targetDraws.find((d) => d.session === 'HANOI_SPECIAL');
    const evening = targetDraws.find((d) => d.session === 'HANOI_EVENING');
    const vip = targetDraws.find((d) => d.session === 'HANOI_VIP');

    const checkDraw = (d?: DrawResult, label?: string, badgeColor?: string) => {
      if (!d) return;
      const top2Str = d.top2 || (d.top3 ? d.top3.slice(1) : '');
      const bottom2Str = d.bottom2 || '';
      const matched: string[] = [];

      if (top2Str === pair || top2Str === rev) matched.push(`บน ${top2Str}`);
      if (bottom2Str === pair || bottom2Str === rev) matched.push(`ล่าง ${bottom2Str}`);

      if (matched.length > 0 && label && badgeColor) {
        hits.push({
          session: d.session || d.id,
          shortLabel: label,
          position: matched.join(', '),
          badgeColor: badgeColor
        });
      }
    };

    checkDraw(special, '🟠 พิเศษ', 'bg-amber-500/20 text-amber-300 border-amber-500/40');
    checkDraw(evening, '🔴 ปกติ', 'bg-red-500/20 text-red-300 border-red-500/40');
    checkDraw(vip, '🟣 VIP', 'bg-purple-500/20 text-purple-300 border-purple-500/40');

    return hits;
  };

  const renderPairHitBadge = (pair: string) => {
    if (!pair) return null;

    if (drawOffset === 0) {
      return (
        <span className="text-[9px] text-amber-300/70 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block text-center mt-1">
          ⏳ รอผล
        </span>
      );
    }

    if (pastDrawResult) {
      if (prediction.lotteryType === 'HANOI' && allHanoiData) {
        const targetDraws = allHanoiData.filter(
          (d) =>
            (d.date === pastDrawResult.date ||
              (d.dateFormatted && pastDrawResult.dateFormatted && d.dateFormatted === pastDrawResult.dateFormatted)) &&
            d.top3
        );
        const hits = getHanoiHitsForPair(pair, targetDraws);

        if (hits.length > 0) {
          return (
            <div className="mt-1 flex flex-col items-center gap-0.5 text-[9px]">
              {hits.map((h, idx) => (
                <span
                  key={idx}
                  className={`font-extrabold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 shadow-glow-emerald ${h.badgeColor}`}
                >
                  ✓ {h.shortLabel} [{h.position}]
                </span>
              ))}
            </div>
          );
        }

        return (
          <span className="text-[9px] text-red-400/80 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 block text-center mt-1">
            ❌ ไม่เข้า
          </span>
        );
      }

      const rev = pair.split('').reverse().join('');
      const top2Str = pastDrawResult.top2 || (pastDrawResult.top3 ? pastDrawResult.top3.slice(1) : '');
      const bottom2Str = pastDrawResult.bottom2 || '';
      const matched: string[] = [];

      if (top2Str === pair || top2Str === rev) matched.push(`บน ${top2Str}`);
      if (bottom2Str === pair || bottom2Str === rev) matched.push(`ล่าง ${bottom2Str}`);

      return (
        <div className="mt-1 text-[9px] text-center">
          {matched.length > 0 ? (
            <span className="font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded inline-flex items-center gap-1 shadow-glow-emerald">
              ✓ เข้า [{matched.join(', ')}]
            </span>
          ) : (
            <span className="text-red-400/80 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 block">
              ❌ ไม่เข้า
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="text-[9px] text-amber-300/70 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 block text-center mt-1">
        ⏳ รอผล
      </span>
    );
  };

  const getHanoiHitsForTriple = (triple: string, targetDraws: DrawResult[]) => {
    if (!triple || !targetDraws || targetDraws.length === 0) return [];
    const tripleSorted = triple.split('').sort().join('');
    const hits: { session: string; shortLabel: string; position: string; badgeColor: string }[] = [];

    const special = targetDraws.find((d) => d.session === 'HANOI_SPECIAL');
    const evening = targetDraws.find((d) => d.session === 'HANOI_EVENING');
    const vip = targetDraws.find((d) => d.session === 'HANOI_VIP');

    const checkDraw = (d?: DrawResult, label?: string, badgeColor?: string) => {
      if (!d || !d.top3) return;
      const top3 = d.top3;
      const top3Sorted = top3.split('').sort().join('');

      if (top3 === triple) {
        hits.push({ session: d.session || d.id, shortLabel: label || '', position: `3 บนตรง ${top3}`, badgeColor: badgeColor || '' });
      } else if (top3Sorted === tripleSorted) {
        hits.push({ session: d.session || d.id, shortLabel: label || '', position: `3 โต๊ด ${top3}`, badgeColor: badgeColor || '' });
      }
    };

    checkDraw(special, '🟠 พิเศษ', 'bg-amber-500/20 text-amber-300 border-amber-500/40');
    checkDraw(evening, '🔴 ปกติ', 'bg-red-500/20 text-red-300 border-red-500/40');
    checkDraw(vip, '🟣 VIP', 'bg-purple-500/20 text-purple-300 border-purple-500/40');

    return hits;
  };

  const renderTripleHitBadge = (triple: string) => {
    if (!triple) return null;

    if (drawOffset === 0) {
      return (
        <span className="text-[9px] text-cyan-300/70 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 block text-center mt-1">
          ⏳ รอผล
        </span>
      );
    }

    if (pastDrawResult) {
      if (prediction.lotteryType === 'HANOI' && allHanoiData) {
        const targetDraws = allHanoiData.filter(
          (d) =>
            (d.date === pastDrawResult.date ||
              (d.dateFormatted && pastDrawResult.dateFormatted && d.dateFormatted === pastDrawResult.dateFormatted)) &&
            d.top3
        );
        const hits = getHanoiHitsForTriple(triple, targetDraws);

        if (hits.length > 0) {
          return (
            <div className="mt-1 flex flex-col items-center gap-0.5 text-[9px]">
              {hits.map((h, idx) => (
                <span
                  key={idx}
                  className={`font-extrabold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 shadow-glow-emerald ${h.badgeColor}`}
                >
                  ✓ {h.shortLabel} [{h.position}]
                </span>
              ))}
            </div>
          );
        }

        return (
          <span className="text-[9px] text-red-400/80 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 block text-center mt-1">
            ❌ ไม่เข้า
          </span>
        );
      }

      const tripleSorted = triple.split('').sort().join('');
      const top3 = pastDrawResult.top3 || '';
      const top3Sorted = top3.split('').sort().join('');

      let hitText = '';
      if (top3 === triple) hitText = `3 บนตรง ${top3}`;
      else if (top3Sorted === tripleSorted) hitText = `3 โต๊ด ${top3}`;

      return (
        <div className="mt-1 text-[9px] text-center">
          {hitText ? (
            <span className="font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded inline-flex items-center gap-1 shadow-glow-emerald">
              ✓ เข้า [{hitText}]
            </span>
          ) : (
            <span className="text-red-400/80 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 block">
              ❌ ไม่เข้า
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="text-[9px] text-cyan-300/70 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 block text-center mt-1">
        ⏳ รอผล
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a]/85 via-[#111c33]/80 to-[#182338]/90 backdrop-blur-xl border border-white/10 p-4 sm:p-6 shadow-2xl shadow-black/40">
      
      {/* Background glow effects */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-nikkei-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              {drawOffset === 0 ? `ระบบทำนายคาดการณ์งวดถัดไป [${lotteryName}]` : `ย้อนสถิติทำนายในอดีต [${lotteryName}]`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 flex-wrap">
            {lotteryName} <span className="text-amber-400 font-semibold text-lg sm:text-2xl">{prediction.targetDate}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {getLotterySubtitle(prediction.lotteryType, prediction.session)}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-400">ความมั่นใจโดยรวม</span>
            <div className="flex items-center justify-end gap-1 text-amber-300 font-extrabold text-2xl">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>{prediction.confidenceScore}%</span>
            </div>
          </div>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="bg-nikkei-dark hover:bg-nikkei-cardHover border border-amber-500/40 text-amber-300 font-bold text-xs px-3 py-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>+ เพิ่มผลใหม่</span>
            </button>
          )}

          <button
            onClick={handleCopyText}
            className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 shadow-md ${
              copied
                ? 'bg-emerald-500 text-black shadow-glow-emerald scale-105'
                : 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black shadow-glow-gold'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>คัดลอกแนวทางแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกแนวทาง</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Draw Navigation Toolbar (ย้อนหลัง / งวดถัดไป) */}
      <div className="bg-nikkei-dark/80 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 my-4 shadow-inner">
        <button
          onClick={onPrevDraw}
          disabled={drawOffset >= totalDraws - 1}
          className="w-full sm:w-auto bg-nikkei-card hover:bg-nikkei-cardHover disabled:opacity-30 border border-amber-500/40 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400" />
          <span>⬅️ ดูงวดก่อนหน้า {prevDrawLabel ? `(${prevDrawLabel})` : ''}</span>
        </button>

        <div className="text-center flex flex-col items-center gap-1.5">
          {drawOffset === 0 ? (
            <div className="flex flex-col items-center gap-1">
              <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-500/40 inline-flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>กำลังแสดง: แนวทางงวดอนาคตถัดไป</span>
              </span>
              {latestDrawResult && latestDrawResult.top3 && (
                <div className="bg-gradient-to-r from-emerald-950/90 via-gray-900 to-emerald-950/90 border-2 border-emerald-500/60 px-3.5 py-1 rounded-xl shadow-glow-emerald flex items-center justify-center gap-2 flex-wrap text-xs text-gray-200">
                  <span className="font-black text-emerald-300 flex items-center gap-1">🏆 ผลออกจริงล่าสุด ({latestDrawResult.dateFormatted}) ➔</span>
                  <span className="font-bold text-gray-300">
                    3 ตัวบน: <strong className="text-yellow-300 text-sm sm:text-base font-black bg-black/70 border border-yellow-500/40 px-2 py-0.5 rounded-md shadow-sm">{latestDrawResult.top3}</strong>
                  </span>
                  <span className="font-bold text-gray-300">
                    2 ตัวบน: <strong className="text-amber-400 text-sm sm:text-base font-black bg-black/70 border border-amber-500/40 px-1.5 py-0.5 rounded-md shadow-sm">{latestDrawResult.top2}</strong>
                  </span>
                  <span className="font-bold text-gray-300">
                    2 ตัวล่าง: <strong className="text-cyan-300 text-sm sm:text-base font-black bg-black/70 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-sm">{latestDrawResult.bottom2}</strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="bg-amber-500/20 text-amber-300 font-extrabold text-xs px-3 py-0.5 rounded-full border border-amber-500/40 inline-flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>ย้อนหลัง {drawOffset} งวด ({pastDrawResult?.dateFormatted})</span>
              </span>
              {pastDrawResult && (
                <div className="bg-gradient-to-r from-emerald-950/90 via-gray-900 to-emerald-950/90 border-2 border-emerald-500/60 px-3.5 py-1.5 rounded-xl shadow-glow-emerald flex items-center justify-center gap-2 flex-wrap text-xs text-gray-200">
                  <span className="font-black text-emerald-300 flex items-center gap-1">🏆 ผลออกจริง ➔</span>
                  <span className="font-bold text-gray-300">
                    3 ตัวบน: <strong className="text-yellow-300 text-base sm:text-lg font-black bg-black/70 border border-yellow-500/40 px-2 py-0.5 rounded-md shadow-sm">{pastDrawResult.top3}</strong>
                  </span>
                  <span className="font-bold text-gray-300">
                    2 ตัวบน: <strong className="text-amber-400 text-base sm:text-lg font-black bg-black/70 border border-amber-500/40 px-1.5 py-0.5 rounded-md shadow-sm">{pastDrawResult.top2}</strong>
                  </span>
                  <span className="font-bold text-gray-300">
                    2 ตัวล่าง: <strong className="text-cyan-300 text-base sm:text-lg font-black bg-black/70 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-sm">{pastDrawResult.bottom2}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              const tableEl = document.getElementById('history-table-section');
              if (tableEl) {
                tableEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 900, behavior: 'smooth' });
              }
            }}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3 h-3 text-amber-400" /> 📊 เลื่อนดูตารางสถิติย้อนหลัง 3 เดือนเต็ม ({totalDraws} งวด)
          </button>
        </div>

        <button
          onClick={onNextDraw}
          disabled={drawOffset === 0}
          className="w-full sm:w-auto bg-nikkei-card hover:bg-nikkei-cardHover disabled:opacity-30 border border-amber-500/40 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
        >
          <span>ดูงวดถัดไป {nextDrawLabel ? `(${nextDrawLabel})` : ''} ➡️</span>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Cross-Session Flow Correlation Summary Box */}
      {prediction.correlationReport && (prediction.lotteryType === 'NIKKEI' || prediction.lotteryType === 'STOCKS_VIP') && (
        <div className="my-5 bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-emerald-500/15 border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <ArrowRightLeft className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  วิเคราะห์ความสัมพันธ์ เช้า ➔ บ่าย (Cross-Session Correlation)
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                  ไหลข้ามรอบ {prediction.correlationReport.repeatDigitHitRate}%
                </span>
              </div>
              <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                {prediction.correlationReport.correlationSummary}
              </p>
            </div>
          </div>

          <div className="bg-nikkei-dark/80 border border-nikkei-border rounded-lg p-2.5 text-center shrink-0 w-full md:w-auto">
            <span className="text-[10px] text-gray-400 block">คู่เลขไหลบ่อยที่สุด:</span>
            <div className="text-sm font-extrabold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {prediction.correlationReport.topFlowingDigits[0]?.morningDigit ?? 6} ➔ {prediction.correlationReport.topFlowingDigits[0]?.afternoonDigit ?? 7}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main 4-Column Grid: Recommended Digits, Gauges & Actual Draw Result Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        
        {/* Top Pick 1 (เลขเด่นหลัก) */}
        <div className="relative group bg-nikkei-dark/60 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              🔥 เด่นหลัก (รูดตัวเดียว)
            </span>
            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
              <Gauge className="w-3.5 h-3.5" />
              <span>โอกาส {prediction.topDigitProb}%</span>
            </div>
          </div>

          <div className="my-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-extrabold text-5xl shadow-glow-gold transform group-hover:scale-110 transition-transform duration-300">
              {prediction.topDigit}
            </div>
            <p className="text-xs text-amber-200/80 font-medium mt-2">
              ความน่าจะเป็น <strong className="text-amber-400 font-bold">{prediction.topDigitProb}%</strong> (สถิติจริงย้อนหลัง)
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-300 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${prediction.topDigitProb}%` }}
            />
          </div>
          {renderDigitHitBadge(prediction.topDigit)}
        </div>

        {/* Top Pick 2 (เลขรอง) */}
        <div className="relative group bg-nikkei-dark/60 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
              ⭐ เลขรอง
            </span>
            <div className="flex items-center gap-1 text-cyan-300 font-bold text-xs">
              <Gauge className="w-3.5 h-3.5" />
              <span>โอกาส {prediction.secondaryDigitProb}%</span>
            </div>
          </div>

          <div className="my-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-teal-200 text-black font-extrabold text-5xl shadow-glow-cyan transform group-hover:scale-110 transition-transform duration-300">
              {prediction.secondaryDigit}
            </div>
            <p className="text-xs text-cyan-200/80 font-medium mt-2">
              ความน่าจะเป็น <strong className="text-cyan-400 font-bold">{prediction.secondaryDigitProb}%</strong>
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-teal-300 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${prediction.secondaryDigitProb}%` }}
            />
          </div>
          {renderDigitHitBadge(prediction.secondaryDigit)}
        </div>

        {/* Supporting & Run/Slide Info */}
        <div className="bg-nikkei-dark/60 border border-nikkei-border rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              🎯 เลขกัน & รูดตัวเดียว
            </span>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-gray-400 block mb-1">เลขกัน / เด่นเสริม:</span>
                <div className="flex gap-2">
                  {prediction.supportingDigits.map((d) => (
                    <span key={d} className="bg-gray-800 border border-gray-700 text-emerald-300 font-bold text-lg px-3 py-1 rounded-lg">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-amber-400 font-bold block mb-1">⚡ รูด 19 ประตู (เน้นตัวเดียว):</span>
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-base px-3 py-1.5 rounded-xl inline-flex items-center gap-2 shadow-glow-gold">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>รูดเน้นๆ: {prediction.topDigit} ({prediction.topDigitProb}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-gray-400 border-t border-gray-800 pt-2.5 flex items-center justify-between">
              <span>งวดเป้าหมาย:</span>
              <span className="text-amber-300 font-semibold">{prediction.targetDate}</span>
            </div>
            {renderDigitHitBadge(prediction.topDigit)}
          </div>
        </div>

        {/* Card 4: Calculated Prediction vs Actual Draw Result Box (กล่องเปรียบเทียบผลคำนวณ vs ผลออกจริง) */}
        {(() => {
          const isSameSession =
            !prediction.session ||
            prediction.session === 'HANOI_ALL_3' ||
            prediction.session === 'BOTH' ||
            latestDrawResult?.session === prediction.session;

          const isDateMatching = Boolean(
            latestDrawResult &&
              prediction.targetDate &&
              (prediction.targetDate.includes(latestDrawResult.dateFormatted) ||
                prediction.targetDate.includes(latestDrawResult.date))
          );

          const isLatestMatchingTarget = Boolean(
            drawOffset === 0 &&
              latestDrawResult &&
              latestDrawResult.top3 &&
              isSameSession &&
              isDateMatching
          );

          const effectiveResult = pastDrawResult || (isLatestMatchingTarget ? latestDrawResult : undefined);
          if (!effectiveResult) {
            return (
              <div className="relative group bg-nikkei-dark/60 border border-nikkei-border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> เปรียบเทียบผล
                    </span>
                    <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                      ⏳ รอผลรางวัล
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                      <span className="text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider mb-1">🔮 ผลตามที่คำนวณไว้:</span>
                      <div className="text-xs text-gray-200 space-y-0.5 font-medium">
                        <div className="flex justify-between">
                          <span className="text-gray-400">เด่นหลัก (รูด):</span>
                          <strong className="text-amber-300 font-bold">{prediction.topDigit}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">2 ตัวเน้น:</span>
                          <strong className="text-amber-300 font-bold">{prediction.pairs2D.top.slice(0, 3).join(', ')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">3 ตัวเน้น:</span>
                          <strong className="text-cyan-300 font-bold">{prediction.triples3D.slice(0, 2).join(', ')}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">🏆 ผลออกจริง:</span>
                      <span className="text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                        ⏳ รอประกาศผลรางวัล
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 border-t border-gray-800 pt-2 flex items-center justify-between">
                  <span>สถานะ:</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">⏳ รอออกรางวัลเรียลไทม์</span>
                </div>
              </div>
            );
          }

          return (
            <div className="relative group bg-gradient-to-br from-nikkei-dark/90 via-nikkei-dark/80 to-amber-950/40 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-glow-gold">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> เปรียบเทียบผล
                  </span>
                  <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {effectiveResult.dateFormatted}
                  </span>
                </div>

                {/* Side-by-Side Comparison: Calculated vs Actual */}
                <div className="mt-2 space-y-2">
                  
                  {/* Row 1: Calculated Prediction (ผลตามที่คำนวณไว้) */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                    <span className="text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>🔮 ผลตามที่คำนวณไว้:</span>
                      <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">สูตรคำนวณ</span>
                    </span>
                    <div className="text-xs text-gray-200 space-y-0.5 font-medium">
                      <div className="flex justify-between">
                        <span className="text-gray-400">เด่นหลัก (รูด):</span>
                        <strong className="text-amber-300 font-bold">{prediction.topDigit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">เลขรอง:</span>
                        <strong className="text-cyan-300 font-bold">{prediction.secondaryDigit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">2 ตัวเน้น:</span>
                        <strong className="text-amber-300 font-bold">{prediction.pairs2D.top.slice(0, 3).join(', ')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">3 ตัวเน้น:</span>
                        <strong className="text-cyan-300 font-bold">{prediction.triples3D.slice(0, 2).join(', ')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Actual Result (ผลออกจริง) */}
                  {prediction.lotteryType === 'HANOI' && prediction.session === 'HANOI_ALL_3' && allHanoiData ? (() => {
                    const hanoiDraws = allHanoiData.filter((d) => (d.date === effectiveResult.date || (d.dateFormatted && effectiveResult.dateFormatted && d.dateFormatted === effectiveResult.dateFormatted)) && d.top3);
                    const specialDraw = hanoiDraws.find((d) => d.session === 'HANOI_SPECIAL');
                    const eveningDraw = hanoiDraws.find((d) => d.session === 'HANOI_EVENING');
                    const vipDraw = hanoiDraws.find((d) => d.session === 'HANOI_VIP');

                    const sessions = [
                      { label: '🟠 ฮานอยพิเศษ (17:30)', draw: specialDraw },
                      { label: '🔴 ฮานอยปกติ (18:30)', draw: eveningDraw },
                      { label: '🟣 ฮานอย VIP (19:30)', draw: vipDraw },
                    ];

                    return (
                      <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-3 shadow-glow-emerald space-y-2">
                        <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-emerald-400" /> 🏆 ผลออกจริง 3 ฮานอย:</span>
                          <span className="text-[10px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-2 py-0.5 rounded-md animate-pulse">ผลรางวัล 3 รอบ</span>
                        </span>
                        {sessions.map(({ label, draw }, idx) => {
                          const top2Str = draw ? (draw.top2 || (draw.top3 ? draw.top3.slice(1) : '')) : '';
                          const bottom2Str = draw ? (draw.bottom2 || '') : '';
                          const allDigits = `${top2Str}${bottom2Str}`;
                          const topDigitHit = draw && allDigits.includes(prediction.topDigit.toString());

                          return (
                            <div key={idx} className="bg-black/50 p-2 rounded-lg border border-emerald-500/30">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] font-bold text-amber-300">{label}</span>
                                {topDigitHit && (
                                  <span className="text-[9px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded">
                                    ✓ เด่น ({prediction.topDigit})
                                  </span>
                                )}
                              </div>
                              {draw ? (
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300">3 บน: <strong className="text-yellow-300 font-black">{draw.top3}</strong></span>
                                  <span className="text-gray-300">2 บน: <strong className="text-amber-300 font-black">{draw.top2}</strong></span>
                                  <span className="text-gray-300">2 ล่าง: <strong className="text-cyan-300 font-black">{draw.bottom2}</strong></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-300/80 font-semibold italic">⏳ รอประกาศผล</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : (
                    <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/60 rounded-xl p-3 shadow-glow-emerald">
                      <span className="text-xs text-emerald-300 font-black block uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-emerald-400" /> 🏆 ผลออกจริง:</span>
                        <span className="text-[10px] text-emerald-200 font-extrabold bg-emerald-500/30 border border-emerald-500/50 px-2 py-0.5 rounded-md animate-pulse">ผลรางวัลออกจริง</span>
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center bg-black/50 p-2 rounded-lg border border-emerald-500/30">
                          <span className="text-xs text-gray-300 font-extrabold">3 ตัวบน:</span>
                          <strong className="text-yellow-300 text-xl sm:text-2xl font-black tracking-wider bg-yellow-500/20 border border-yellow-500/50 px-2.5 py-0.5 rounded-md shadow-glow-gold">{effectiveResult.top3}</strong>
                        </div>
                        <div className="flex justify-between items-center bg-black/50 p-2 rounded-lg border border-emerald-500/30">
                          <span className="text-xs text-gray-300 font-extrabold">2 ตัวบน:</span>
                          <strong className="text-amber-300 text-xl sm:text-2xl font-black tracking-wider bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 rounded-md shadow-glow-gold">{effectiveResult.top2}</strong>
                        </div>
                        <div className="flex justify-between items-center bg-black/50 p-2 rounded-lg border border-emerald-500/30">
                          <span className="text-xs text-gray-300 font-extrabold">2 ตัวล่าง:</span>
                          <strong className="text-cyan-300 text-xl sm:text-2xl font-black tracking-wider bg-cyan-500/20 border border-cyan-500/50 px-2.5 py-0.5 rounded-md shadow-glow-cyan">{effectiveResult.bottom2}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Status hit verification summary badge - Display ALL matched items */}
              <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] text-center font-bold flex flex-wrap items-center justify-center gap-1.5">
                {(() => {
                  if (prediction.lotteryType === 'HANOI' && prediction.session === 'HANOI_ALL_3' && allHanoiData) {
                    const hanoiDraws = allHanoiData.filter((d) => (d.date === effectiveResult.date || (d.dateFormatted && effectiveResult.dateFormatted && d.dateFormatted === effectiveResult.dateFormatted)) && d.top3);
                    const specialDraw = hanoiDraws.find((d) => d.session === 'HANOI_SPECIAL');
                    const eveningDraw = hanoiDraws.find((d) => d.session === 'HANOI_EVENING');
                    const vipDraw = hanoiDraws.find((d) => d.session === 'HANOI_VIP');

                    const sessions = [
                      { label: '🟠 พิเศษ', draw: specialDraw },
                      { label: '🔴 ปกติ', draw: eveningDraw },
                      { label: '🟣 VIP', draw: vipDraw },
                    ];

                    const hits: React.ReactNode[] = [];

                    sessions.forEach(({ label, draw }) => {
                      if (!draw || !draw.top3) return;
                      const top2Str = draw.top2 || (draw.top3 ? draw.top3.slice(1) : '');
                      const bottom2Str = draw.bottom2 || '';
                      const allDigits = `${top2Str}${bottom2Str}`;

                      if (allDigits.includes(prediction.topDigit.toString())) {
                        const pos = [];
                        if (top2Str.includes(prediction.topDigit.toString())) pos.push(`บน ${top2Str}`);
                        if (bottom2Str.includes(prediction.topDigit.toString())) pos.push(`ล่าง ${bottom2Str}`);
                        hits.push(
                          <span key={`${label}-rood`} className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40 inline-flex items-center gap-1 shadow-glow-emerald">
                            <Check className="w-3 h-3 stroke-[3]" /> {label} [{pos.join(', ')}]
                          </span>
                        );
                      }
                    });

                    if (hits.length === 0) {
                      return (
                        <span className="bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/40 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-400" /> ❌ ไม่เข้าเป้า
                        </span>
                      );
                    }

                    return <>{hits}</>;
                  }

                  const top2Str = effectiveResult.top2 || (effectiveResult.top3 ? effectiveResult.top3.slice(1) : '');
                  const allDigits = `${top2Str}${effectiveResult.bottom2 || ''}`;
                  const isRoodHit = allDigits.includes(prediction.topDigit.toString());
                  
                  const matchedPairs = prediction.pairs2D.top.slice(0, 6).filter(
                    p => p === effectiveResult.top2 || p === effectiveResult.top2.split('').reverse().join('') || p === effectiveResult.bottom2 || p === effectiveResult.bottom2.split('').reverse().join('')
                  );

                  const matchedTriples = prediction.triples3D.slice(0, 4).filter(t => t === effectiveResult.top3);

                  const hasAnyHit = isRoodHit || matchedPairs.length > 0 || matchedTriples.length > 0;

                  if (!hasAnyHit) {
                    return (
                      <span className="bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/40 inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> ❌ ไม่เข้าเป้า
                      </span>
                    );
                  }

                  return (
                    <>
                      {isRoodHit && (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40 inline-flex items-center gap-1 shadow-glow-emerald">
                          <Check className="w-3 h-3 stroke-[3]" /> เข้าตัวรูด [{prediction.topDigit}]
                        </span>
                      )}
                      {matchedPairs.length > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 inline-flex items-center gap-1 shadow-glow-gold">
                          <Check className="w-3 h-3 stroke-[3]" /> เข้า 2 ตัว [{matchedPairs.join(', ')}]
                        </span>
                      )}
                      {matchedTriples.length > 0 && (
                        <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/40 inline-flex items-center gap-1 shadow-glow-cyan">
                          <Check className="w-3 h-3 stroke-[3]" /> เข้า 3 ตัว [{matchedTriples.join(', ')}]
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Win 4 Digits Focus Set (Super Focused 4 Digits for Top/Bottom & 3D) */}
      <div className="border-t border-nikkei-border/80 pt-5 mb-4">
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-amber-400/60 rounded-2xl p-4 shadow-glow-gold relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                🔥 ชุดคัดเน้นพิเศษ 4 เลข
              </span>
              <h4 className="text-sm font-extrabold text-amber-200">
                ชุดเลขวินเน้น 4 ตัว (ใช้ได้ทั้ง บน-ล่าง & 3 ตัวตรง-โต๊ด)
              </h4>
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-900/60 border border-amber-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              ⚡ 2 ตัว (บน-ล่าง): 12 ชุด | 3 ตัวตรง: 4 ชุด (24 โต๊ด)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {Array.from(new Set([prediction.topDigit, prediction.secondaryDigit, ...prediction.supportingDigits])).slice(0, 4).sort((a, b) => a - b).map((digit) => (
              <div key={digit} className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-black font-black text-2xl flex items-center justify-center shadow-lg border-2 border-amber-100 scale-100 hover:scale-105 transition-transform">
                {digit}
              </div>
            ))}
            <div className="hidden sm:block text-xs text-amber-300/80 font-semibold pl-2">
              เน้นตัดตรง 4 เลขเด่นสูงสุดจากเอนจินสถิติ
            </div>
          </div>
        </div>
      </div>

      {/* Win Digits Section (5 Digits Top & Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              👑 ชุดเลขวิน 5 ตัว (บน)
            </span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
              จับคู่ 20 ชุด / 3 ตัว 10 ชุด
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from(new Set(prediction.winTop5Digits || [2, 3, 7, 8, 9])).slice(0, 5).sort((a, b) => a - b).map((digit) => (
              <div key={digit} className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-extrabold text-xl flex items-center justify-center shadow-glow-gold">
                {digit}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              💎 ชุดเลขวิน 5 ตัว (ล่าง)
            </span>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded">
              จับคู่ 20 ชุด 2 ตัวล่าง
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from(new Set(prediction.winBottom5Digits || [2, 3, 4, 7, 8])).slice(0, 5).sort((a, b) => a - b).map((digit) => (
              <div key={digit} className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-200 text-black font-extrabold text-xl flex items-center justify-center shadow-glow-cyan">
                {digit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended 2D & 3D Sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-nikkei-border/80 pt-5">
        
        {/* 2D Sets */}
        <div className="bg-nikkei-dark/40 rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" /> ชุดเจาะ 2 ตัวบน-ล่าง
            </span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded">
              เน้นไม่เกิน 6 ชุด
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {prediction.pairs2D.top.slice(0, 6).map((pair, idx) => (
              <div
                key={idx}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center justify-center transition-colors shadow-sm min-h-[64px]"
              >
                <span className="text-amber-300 font-extrabold text-base sm:text-lg">
                  {pair}
                </span>
                {renderPairHitBadge(pair)}
              </div>
            ))}
          </div>
        </div>

        {/* 3D Sets */}
        <div className="bg-nikkei-dark/40 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> ชุดเจาะ 3 ตัวเด่น (ตรง-โต๊ด)
            </span>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded">
              เน้นไม่เกิน 4 ชุด
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {prediction.triples3D.slice(0, 4).map((triple, idx) => (
              <div
                key={idx}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col items-center justify-center transition-colors shadow-sm min-h-[64px]"
              >
                <span className="text-cyan-300 font-extrabold text-base sm:text-lg">
                  {triple}
                </span>
                {renderTripleHitBadge(triple)}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
