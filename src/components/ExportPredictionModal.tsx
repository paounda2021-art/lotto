import React, { useState, useMemo } from 'react';
import { X, Download, FileSpreadsheet, FileText, Calendar, Filter, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DrawResult, LotteryType, SessionType } from '../types';
import { analyzeDayOfWeekStats } from '../utils/calculator';

interface ExportPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLotteryType: LotteryType;
  currentSession?: SessionType | string;
  allDatasets: {
    allStockData?: DrawResult[];
    allStockVipData?: DrawResult[];
    allHanoiData?: DrawResult[];
    laosData?: DrawResult[];
    malayData?: DrawResult[];
    dowjonesData?: DrawResult[];
    gsbData?: DrawResult[];
    governmentData?: DrawResult[];
    activeDataset?: DrawResult[];
  };
}

type RangeType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const LOTTERY_OPTIONS: { id: string; label: string; group: string }[] = [
  { id: 'CURRENT', label: '⭐ หวยที่กำลังวิเคราะห์อยู่', group: 'ปัจจุบัน' },
  { id: 'NIKKEI_ALL', label: '🎌 หุ้นปกติ (นิเคอิ / จีน / ฮั่งเส็ง 6 รอบ)', group: 'หุ้นปกติ' },
  { id: 'NIKKEI', label: '☀️ นิเคอิ (เช้า-บ่าย)', group: 'หุ้นปกติ' },
  { id: 'CHINA', label: '🇨🇳 จีน (เช้า-บ่าย)', group: 'หุ้นปกติ' },
  { id: 'HANGSENG', label: '🇭🇰 ฮั่งเส็ง (เช้า-บ่าย)', group: 'หุ้นปกติ' },
  { id: 'STOCKS_VIP_ALL', label: '💎 หุ้น VIP (นิเคอิ / จีน / ฮั่งเส็ง VIP 6 รอบ)', group: 'หุ้น VIP' },
  { id: 'NIKKEI_VIP', label: '💎 นิเคอิ VIP (เช้า-บ่าย)', group: 'หุ้น VIP' },
  { id: 'CHINA_VIP', label: '🏮 จีน VIP (เช้า-บ่าย)', group: 'หุ้น VIP' },
  { id: 'HANGSENG_VIP', label: '🏛️ ฮั่งเส็ง VIP (เช้า-บ่าย)', group: 'หุ้น VIP' },
  { id: 'HANOI_ALL', label: '🇻🇳 ฮานอย (รวม 3 รอบ: พิเศษ / ปกติ / VIP)', group: 'ฮานอย' },
  { id: 'HANOI_SPECIAL', label: '🟠 ฮานอยพิเศษ (17:30)', group: 'ฮานอย' },
  { id: 'HANOI_EVENING', label: '🔴 ฮานอยปกติ (18:30)', group: 'ฮานอย' },
  { id: 'HANOI_VIP', label: '🟣 ฮานอย VIP (19:30)', group: 'ฮานอย' },
  { id: 'LAOS', label: '🇱🇦 ลาวพัฒนา (20:30)', group: 'หวยเพื่อนบ้าน' },
  { id: 'MALAY', label: '🇲🇾 หวยมาเลย์ (Magnum 4D 18:30)', group: 'หวยเพื่อนบ้าน' },
  { id: 'DOWJONES', label: '🇺🇸 หวยหุ้นดาวโจนส์ (04:00)', group: 'หุ้นต่างประเทศ' },
  { id: 'GSB', label: '🏦 หวยออมสิน (13:00)', group: 'หวยไทย' },
  { id: 'GOVERNMENT', label: '🇹🇭 หวยรัฐบาลไทย (15:30)', group: 'หวยไทย' },
  { id: 'ALL_COMBINED', label: '🌐 รวมสถิติทุกหวยในระบบ', group: 'ทั้งหมด' },
];

const DAY_OPTIONS = [
  { code: 'ALL', label: 'ทุกวัน (จันทร์-อาทิตย์)' },
  { code: 'Mon', label: 'เฉพาะวันจันทร์' },
  { code: 'Tue', label: 'เฉพาะวันอังคาร' },
  { code: 'Wed', label: 'เฉพาะวันพุธ' },
  { code: 'Thu', label: 'เฉพาะวันพฤหัสบดี' },
  { code: 'Fri', label: 'เฉพาะวันศุกร์' },
  { code: 'Sat', label: 'เฉพาะวันเสาร์' },
  { code: 'Sun', label: 'เฉพาะวันอาทิตย์' },
];

export const ExportPredictionModal: React.FC<ExportPredictionModalProps> = ({
  isOpen,
  onClose,
  currentLotteryType,
  currentSession,
  allDatasets
}) => {
  const [selectedLottery, setSelectedLottery] = useState<string>('CURRENT');
  const [rangeType, setRangeType] = useState<RangeType>('DAILY');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [weeklyCount, setWeeklyCount] = useState<number>(4); // 1, 2, 4 weeks
  const [monthlyCount, setMonthlyCount] = useState<number>(3); // 1, 2, 3, 6 months
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Helper to resolve dataset according to selectedLottery
  const getTargetDataset = (lotteryId: string): { data: DrawResult[]; name: string } => {
    switch (lotteryId) {
      case 'CURRENT': {
        const d = allDatasets.activeDataset || [];
        return { data: d, name: `หวยปัจจุบัน_${currentLotteryType}` };
      }
      case 'NIKKEI_ALL':
        return { data: allDatasets.allStockData || [], name: 'หุ้นปกติ_รวม6รอบ' };
      case 'NIKKEI':
        return { data: (allDatasets.allStockData || []).filter(d => d.session.includes('NIKKEI') || d.session === 'MORNING' || d.session === 'AFTERNOON'), name: 'หุ้นนิเคอิ' };
      case 'CHINA':
        return { data: (allDatasets.allStockData || []).filter(d => d.session.includes('CHINA')), name: 'หุ้นจีน' };
      case 'HANGSENG':
        return { data: (allDatasets.allStockData || []).filter(d => d.session.includes('HANGSENG')), name: 'หุ้นฮั่งเส็ง' };
      case 'STOCKS_VIP_ALL':
        return { data: allDatasets.allStockVipData || [], name: 'หุ้นVIP_รวม6รอบ' };
      case 'NIKKEI_VIP':
        return { data: (allDatasets.allStockVipData || []).filter(d => d.session.includes('NIKKEI')), name: 'หุ้นนิเคอิ_VIP' };
      case 'CHINA_VIP':
        return { data: (allDatasets.allStockVipData || []).filter(d => d.session.includes('CHINA')), name: 'หุ้นจีน_VIP' };
      case 'HANGSENG_VIP':
        return { data: (allDatasets.allStockVipData || []).filter(d => d.session.includes('HANGSENG')), name: 'หุ้นฮั่งเส็ง_VIP' };
      case 'HANOI_ALL':
        return { data: allDatasets.allHanoiData || [], name: 'ฮานอย_รวม3รอบ' };
      case 'HANOI_SPECIAL':
        return { data: (allDatasets.allHanoiData || []).filter(d => d.session === 'HANOI_SPECIAL'), name: 'ฮานอยพิเศษ' };
      case 'HANOI_EVENING':
        return { data: (allDatasets.allHanoiData || []).filter(d => d.session === 'HANOI_EVENING'), name: 'ฮานอยปกติ' };
      case 'HANOI_VIP':
        return { data: (allDatasets.allHanoiData || []).filter(d => d.session === 'HANOI_VIP'), name: 'ฮานอย_VIP' };
      case 'LAOS':
        return { data: allDatasets.laosData || [], name: 'ลาวพัฒนา' };
      case 'MALAY':
        return { data: allDatasets.malayData || [], name: 'หวยมาเลย์' };
      case 'DOWJONES':
        return { data: allDatasets.dowjonesData || [], name: 'หุ้นดาวโจนส์' };
      case 'GSB':
        return { data: allDatasets.gsbData || [], name: 'หวยออมสิน' };
      case 'GOVERNMENT':
        return { data: allDatasets.governmentData || [], name: 'หวยรัฐบาลไทย' };
      case 'ALL_COMBINED': {
        const combined = [
          ...(allDatasets.allStockData || []),
          ...(allDatasets.allStockVipData || []),
          ...(allDatasets.allHanoiData || []),
          ...(allDatasets.laosData || []),
          ...(allDatasets.malayData || []),
          ...(allDatasets.dowjonesData || []),
          ...(allDatasets.gsbData || []),
          ...(allDatasets.governmentData || [])
        ];
        return { data: combined, name: 'รวมทุกหวย' };
      }
      default:
        return { data: allDatasets.activeDataset || [], name: 'หวย' };
    }
  };

  // Filter draws by selected time range
  const filteredDraws = useMemo(() => {
    const { data } = getTargetDataset(selectedLottery);
    if (!data || data.length === 0) return [];

    // Distinct dates sorted descending
    const dateList = Array.from(new Set(data.map(d => d.date))).filter(Boolean).sort().reverse();

    if (rangeType === 'DAILY') {
      if (selectedDay === 'ALL') {
        return data;
      }
      return data.filter(d => d.dayOfWeek === selectedDay);
    }

    if (rangeType === 'WEEKLY') {
      // 1 week = approx 7 calendar days or 5-7 distinct draw dates
      const targetDateCount = Math.min(dateList.length, weeklyCount * 7);
      const allowedDates = new Set(dateList.slice(0, targetDateCount));
      return data.filter(d => allowedDates.has(d.date));
    }

    if (rangeType === 'MONTHLY') {
      // 1 month = approx 30 calendar days or 22-30 distinct draw dates
      const targetDateCount = Math.min(dateList.length, monthlyCount * 30);
      const allowedDates = new Set(dateList.slice(0, targetDateCount));
      return data.filter(d => allowedDates.has(d.date));
    }

    return data;
  }, [selectedLottery, rangeType, selectedDay, weeklyCount, monthlyCount, allDatasets]);

  // Generate Excel / CSV Row Records
  const generateExportRows = () => {
    const { data: fullData } = getTargetDataset(selectedLottery);
    if (!filteredDraws || filteredDraws.length === 0) return [];

    // Group draws by date
    const drawsByDate = new Map<string, DrawResult[]>();
    filteredDraws.forEach(d => {
      if (!drawsByDate.has(d.date)) drawsByDate.set(d.date, []);
      drawsByDate.get(d.date)!.push(d);
    });

    const rows: any[] = [];
    let rowIndex = 1;

    // Process each date in descending order
    const dates = Array.from(drawsByDate.keys()).sort().reverse();

    for (const date of dates) {
      const dayDraws = drawsByDate.get(date) || [];
      const sampleDraw = dayDraws[0];
      const dayOfWeek = sampleDraw?.dayOfWeek || '';
      const dayNameThai = sampleDraw?.dayNameThai || '';
      const dateFormatted = sampleDraw?.dateFormatted || date;

      // Predict for this date using draws strictly prior to this date
      const historicalBeforeDate = fullData.filter(d => d.date < date);
      const report = analyzeDayOfWeekStats(historicalBeforeDate.length > 10 ? historicalBeforeDate : fullData, dayOfWeek);

      const mainDigit = report.topSingleDigits[0]?.digit !== undefined ? report.topSingleDigits[0].digit : '';
      const subDigit = report.topSingleDigits[1]?.digit !== undefined ? report.topSingleDigits[1].digit : '';
      const top6Pairs = report.top2DPairs.slice(0, 6).map(p => p.pair);
      const top6PairsStr = top6Pairs.join(', ');

      // Actual results across draws on this day
      for (const draw of dayDraws) {
        const top3 = draw.top3 || '';
        const top2 = draw.top2 || (draw.top3 ? draw.top3.slice(1) : '');
        const bottom2 = draw.bottom2 || '';
        const sessionThai = draw.session || '';

        // Hit detections
        const isMainHitTop = top2.includes(String(mainDigit));
        const isMainHitBottom = bottom2.includes(String(mainDigit));
        const isMainHit = isMainHitTop || isMainHitBottom;

        const isSubHitTop = top2.includes(String(subDigit));
        const isSubHitBottom = bottom2.includes(String(subDigit));
        const isSubHit = isSubHitTop || isSubHitBottom;

        const isPairHitTop = top6Pairs.includes(top2) || top6Pairs.includes(top2.split('').reverse().join(''));
        const isPairHitBottom = top6Pairs.includes(bottom2) || top6Pairs.includes(bottom2.split('').reverse().join(''));
        const isPairHit = isPairHitTop || isPairHitBottom;

        const mainHitDetail = isMainHit
          ? `เข้า [${isMainHitTop ? `บน ${top2}` : ''}${isMainHitTop && isMainHitBottom ? ', ' : ''}${isMainHitBottom ? `ล่าง ${bottom2}` : ''}]`
          : (top3 ? 'ไม่เข้า' : 'รอผล');

        const subHitDetail = isSubHit
          ? `เข้า [${isSubHitTop ? `บน ${top2}` : ''}${isSubHitTop && isSubHitBottom ? ', ' : ''}${isSubHitBottom ? `ล่าง ${bottom2}` : ''}]`
          : (top3 ? 'ไม่เข้า' : 'รอผล');

        const pairHitDetail = isPairHit
          ? `เข้า [${isPairHitTop ? `บน ${top2}` : ''}${isPairHitTop && isPairHitBottom ? ', ' : ''}${isPairHitBottom ? `ล่าง ${bottom2}` : ''}]`
          : (top3 ? 'ไม่เข้า' : 'รอผล');

        const isOverallHit = isMainHit || isSubHit || isPairHit;
        const overallStatus = !top3 ? '⏳ รอผล' : isOverallHit ? '✓ เข้าเป้า' : '❌ ไม่เข้า';

        rows.push({
          'ลำดับ': rowIndex++,
          'วันที่': dateFormatted,
          'วันประจำสัปดาห์': dayNameThai ? `วัน${dayNameThai}` : dayOfWeek,
          'ประเภทหวย': draw.lotteryType || selectedLottery,
          'รอบออกรางวัล': sessionThai,
          'เด่นหลัก (ฟันตัวเดียว)': mainDigit,
          'เด่นรอง': subDigit,
          'TOP 6 เลข 2 ตัวเน้น': top6PairsStr,
          'ผล 3 ตัวบน': top3 || '-',
          'ผล 2 ตัวบน': top2 || '-',
          'ผล 2 ตัวล่าง': bottom2 || '-',
          'วิ่ง-รูด เด่นหลัก': mainHitDetail,
          'วิ่ง-รูด เด่นรอง': subHitDetail,
          'เข้า 2 ตัวเน้น': pairHitDetail,
          'สรุปผล': overallStatus
        });
      }
    }

    return rows;
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const rows = generateExportRows();
      if (rows.length === 0) {
        alert('ไม่พบข้อมูลในช่วงที่เลือกสำหรับดาวน์โหลด');
        setIsExporting(false);
        return;
      }

      const { name } = getTargetDataset(selectedLottery);
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 6 },  // ลำดับ
        { wch: 14 }, // วันที่
        { wch: 12 }, // วันประจำสัปดาห์
        { wch: 14 }, // ประเภทหวย
        { wch: 20 }, // รอบออกรางวัล
        { wch: 18 }, // เด่นหลัก
        { wch: 10 }, // เด่นรอง
        { wch: 22 }, // TOP 6 เลข 2 ตัว
        { wch: 10 }, // 3 ตัวบน
        { wch: 10 }, // 2 ตัวบน
        { wch: 10 }, // 2 ตัวล่าง
        { wch: 18 }, // เด่นหลัก ผล
        { wch: 18 }, // เด่นรอง ผล
        { wch: 18 }, // 2 ตัวเน้น ผล
        { wch: 12 }, // สรุปผล
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'สรุปฟันธงเด่นรูด');

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `สรุปฟันธงเด่นรูด_${name}_${rangeType}_${dateStr}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      setExportSuccess(`ส่งออก Excel (.xlsx) สำเร็จ: ${rows.length} รายการ`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV (.csv with UTF-8 BOM for Thai Excel support)
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows = generateExportRows();
      if (rows.length === 0) {
        alert('ไม่พบข้อมูลในช่วงที่เลือกสำหรับดาวน์โหลด');
        setIsExporting(false);
        return;
      }

      const { name } = getTargetDataset(selectedLottery);
      const headers = Object.keys(rows[0]);
      
      const csvLines = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(h => {
            const val = String(row[h] ?? '').replace(/"/g, '""');
            return `"${val}"`;
          }).join(',')
        )
      ];

      // Add UTF-8 BOM (\uFEFF) so Excel opens Thai properly without mojibake
      const csvContent = '\uFEFF' + csvLines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `สรุปฟันธงเด่นรูด_${name}_${rangeType}_${dateStr}.csv`;

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(`ส่งออก CSV สำเร็จ: ${rows.length} รายการ`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด CSV: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#140b04] border-2 border-amber-500/50 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 text-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
                📥 ดาวน์โหลดสรุปฟันธงเลขเด่นรูด
              </h3>
              <p className="text-[11px] text-gray-400">
                ส่งออกเป็นไฟล์ Excel (.xlsx) หรือ CSV รองรับภาษาไทย 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: เลือกหวย */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1. เลือกประเภทหวยที่ต้องการดาวน์โหลด:
          </label>
          <select
            value={selectedLottery}
            onChange={(e) => setSelectedLottery(e.target.value)}
            className="w-full bg-[#1e1006] border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-bold text-amber-100 focus:outline-none focus:border-amber-400"
          >
            {LOTTERY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: เลือกประเภทช่วงเวลา (รายวัน / รายสัปดาห์ / รายเดือน) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            2. เลือกช่วงเวลาสรุปสถิติ:
          </label>

          {/* Range Type Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#1e1006] rounded-xl border border-amber-500/30">
            <button
              onClick={() => setRangeType('DAILY')}
              className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                rangeType === 'DAILY'
                  ? 'bg-amber-400 text-black shadow-glow-gold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              📅 รายวัน
            </button>
            <button
              onClick={() => setRangeType('WEEKLY')}
              className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                rangeType === 'WEEKLY'
                  ? 'bg-cyan-400 text-black shadow-glow-cyan'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🗓️ รายสัปดาห์
            </button>
            <button
              onClick={() => setRangeType('MONTHLY')}
              className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                rangeType === 'MONTHLY'
                  ? 'bg-emerald-400 text-black shadow-glow-emerald'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              📊 รายเดือน
            </button>
          </div>

          {/* Sub-options for each Range Type */}
          {rangeType === 'DAILY' && (
            <div className="p-3 bg-[#1e1006]/70 rounded-xl border border-amber-500/20 space-y-1.5">
              <span className="text-[11px] text-gray-300 font-semibold block">เลือกวันประจำสัปดาห์:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => setSelectedDay(d.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      selectedDay === d.code
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-black'
                        : 'bg-black/30 border-amber-500/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rangeType === 'WEEKLY' && (
            <div className="p-3 bg-[#1e1006]/70 rounded-xl border border-cyan-500/20 space-y-1.5">
              <span className="text-[11px] text-gray-300 font-semibold block">เลือกจำนวนสัปดาห์ย้อนหลัง:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { weeks: 1, label: '1 สัปดาห์ล่าสุด (7 วัน)' },
                  { weeks: 2, label: '2 สัปดาห์ล่าสุด (14 วัน)' },
                  { weeks: 4, label: '4 สัปดาห์ล่าสุด (1 เดือน)' },
                ].map((w) => (
                  <button
                    key={w.weeks}
                    onClick={() => setWeeklyCount(w.weeks)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      weeklyCount === w.weeks
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-black'
                        : 'bg-black/30 border-cyan-500/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rangeType === 'MONTHLY' && (
            <div className="p-3 bg-[#1e1006]/70 rounded-xl border border-emerald-500/20 space-y-1.5">
              <span className="text-[11px] text-gray-300 font-semibold block">เลือกจำนวนเดือนย้อนหลัง:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { months: 1, label: '1 เดือน (30 วัน)' },
                  { months: 2, label: '2 เดือน (60 วัน)' },
                  { months: 3, label: '3 เดือน (90 วัน)' },
                  { months: 6, label: '6 เดือนเต็ม' },
                ].map((m) => (
                  <button
                    key={m.months}
                    onClick={() => setMonthlyCount(m.months)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      monthlyCount === m.months
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-black'
                        : 'bg-black/30 border-emerald-500/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data summary preview pill */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300 font-bold">
          <span>📊 จำนวนผลรางวัลที่จะถูกประมวลผล:</span>
          <span className="text-white font-black text-sm bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
            {filteredDraws.length} งวด
          </span>
        </div>

        {/* Success Alert */}
        {exportSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-200 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Action Buttons: Excel & CSV */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            disabled={isExporting || filteredDraws.length === 0}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>ดาวน์โหลด Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || filteredDraws.length === 0}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-yellow-300 text-black hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
            <span>ดาวน์โหลด CSV (.csv)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
        </div>

      </div>
    </div>
  );
};
