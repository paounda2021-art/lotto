export type LotteryType = 'NIKKEI' | 'STOCK_VIP' | 'LAOS' | 'DOWJONES' | 'HANOI' | 'GSB' | 'GOVERNMENT';
export type SessionType = 
  | 'MORNING' | 'AFTERNOON' | 'BOTH'
  | 'NIKKEI_MORNING' | 'NIKKEI_AFTERNOON' | 'NIKKEI_BOTH'
  | 'CHINA_MORNING' | 'CHINA_AFTERNOON' | 'CHINA_BOTH'
  | 'HANGSENG_MORNING' | 'HANGSENG_AFTERNOON' | 'HANGSENG_BOTH'
  | 'STOCKS_ALL_3'
  | 'NIKKEI_VIP_MORNING' | 'NIKKEI_VIP_AFTERNOON' | 'NIKKEI_VIP_BOTH'
  | 'CHINA_VIP_MORNING' | 'CHINA_VIP_AFTERNOON' | 'CHINA_VIP_BOTH'
  | 'HANGSENG_VIP_MORNING' | 'HANGSENG_VIP_AFTERNOON' | 'HANGSENG_VIP_BOTH'
  | 'STOCKS_VIP_ALL_3'
  | 'LAOS_EVENING' | 'DOWJONES_NIGHT' 
  | 'HANOI_EVENING' | 'HANOI_SPECIAL' | 'HANOI_VIP' | 'HANOI_ALL_3' 
  | 'GSB_BIWEEKLY' | 'GOV_BIWEEKLY';
export type DayOfWeekType = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type ThemeMode = 'DARK' | 'LIGHT';

export interface DrawResult {
  id: string;
  lotteryType: LotteryType;
  session: SessionType;
  date: string; // e.g. "2026-08-07"
  dateFormatted: string; // e.g. "07 ส.ค. 2569"
  dayOfWeek: DayOfWeekType;
  dayNameThai: string; // e.g. "ศุกร์"
  full6D?: string; // e.g. "197677" for Laos or 6D for Govt
  top3: string; // e.g. "677"
  top2: string; // e.g. "77"
  bottom2: string; // e.g. "76"
}

export interface DigitStat {
  digit: number;
  countTop3: number;
  countTop2: number;
  countBottom2: number;
  totalOccurrences: number;
  probability: number; // 0 - 100 %
  lastSeenDaysAgo: number; // gap analysis
  status: 'HOT' | 'WARM' | 'COLD';
}

export interface FormulaResult {
  formulaId: string;
  formulaName: string;
  description: string;
  recommendedTopDigits: number[];
  secondaryDigits: number[];
  pairs2D: string[];
  triples3D: string[];
  hitRatePercent: number; // past accuracy backtest %
}

export interface CrossSessionCorrelationReport {
  totalPairedDays: number;
  repeatDigitHitRate: number;
  topFlowingDigits: { morningDigit: number; afternoonDigit: number; frequency: number }[];
  sameDigitFlowPercent: number;
  correlationSummary: string;
}

export interface NextDrawPrediction {
  lotteryType: LotteryType;
  session: SessionType;
  targetDate: string;
  dayOfWeek: string;
  topDigit: number;
  topDigitProb: number;
  secondaryDigit: number;
  secondaryDigitProb: number;
  supportingDigits: number[];
  recommendedRun: number[];
  singleRoodDigit: number;
  pairs2D: {
    top: string[];
    bottom: string[];
  };
  triples3D: string[];
  win19Digits: number[];
  winTop5Digits: number[];
  winBottom5Digits: number[];
  confidenceScore: number;
  digitProbabilities: DigitStat[];
  crossSessionFlowNote?: string;
  correlationReport?: CrossSessionCorrelationReport;
}
