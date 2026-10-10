import React, { useState, useMemo, useEffect } from 'react';
import { 
  ALL_NIKKEI_DATA, 
  INITIAL_LAOS_DATA, 
  INITIAL_DOWJONES_DATA, 
  INITIAL_HANOI_DATA, 
  INITIAL_HANOI_SPECIAL_DATA, 
  INITIAL_HANOI_VIP_DATA, 
  ALL_HANOI_DATA, 
  INITIAL_GSB_DATA, 
  INITIAL_GOVERNMENT_DATA,
  INITIAL_LAOS_STAR_DATA,
  INITIAL_MALAY_DATA,
  INITIAL_NIKKEI_MORNING_DATA,
  INITIAL_NIKKEI_AFTERNOON_DATA,
  INITIAL_CHINA_MORNING_DATA,
  INITIAL_CHINA_AFTERNOON_DATA,
  INITIAL_HANGSENG_MORNING_DATA,
  INITIAL_HANGSENG_AFTERNOON_DATA,
  ALL_STOCKS_DATA,
  INITIAL_NIKKEI_VIP_MORNING_DATA,
  INITIAL_NIKKEI_VIP_AFTERNOON_DATA,
  INITIAL_CHINA_VIP_MORNING_DATA,
  INITIAL_CHINA_VIP_AFTERNOON_DATA,
  INITIAL_HANGSENG_VIP_MORNING_DATA,
  INITIAL_HANGSENG_VIP_AFTERNOON_DATA,
  ALL_NIKKEI_VIP_DATA,
  ALL_CHINA_VIP_DATA,
  ALL_HANGSENG_VIP_DATA,
  ALL_STOCKS_VIP_DATA
} from './data/nikkeiData';
import { DrawResult, SessionType, LotteryType, ThemeMode } from './types';
import { getDigitStatistics, predictNextDraw, calculateFormulas } from './utils/calculator';

import { Navbar } from './components/Navbar';
import { PredictionCard } from './components/PredictionCard';
import { ProbabilityChart } from './components/ProbabilityChart';
import { HistoryTable } from './components/HistoryTable';
import { FormulaCalculator } from './components/FormulaCalculator';
import { WinGenerator } from './components/WinGenerator';
import { BacktestView } from './components/BacktestView';
import { AddDrawModal } from './components/AddDrawModal';
import { ManualRecordsModal } from './components/ManualRecordsModal';
import { DayOfWeekAnalyzer } from './components/DayOfWeekAnalyzer';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Sparkles, BarChart2, Table, Cpu, Layers, PlusCircle, ShieldCheck, Calendar, Gem } from 'lucide-react';
import { syncFetchFromCloud, syncSaveToCloud } from './services/cloudSync';
import { fetchExphuayLiveResults } from './services/exphuaySync';

const fixDrawDate = (draw: DrawResult): DrawResult => {
  if (draw.dateFormatted) {
    const monthMap: Record<string, string> = {
      'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06',
      'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
    };
    const parts = draw.dateFormatted.trim().split(/\s+/);
    if (parts.length >= 3) {
      const dayNum = parseInt(parts[0], 10);
      const mStr = monthMap[parts[1]] || '01';
      const yearBE = parseInt(parts[2], 10);
      const yearAD = yearBE > 2500 ? yearBE - 543 : yearBE;
      if (!isNaN(dayNum) && !isNaN(yearAD)) {
        const ddStr = String(dayNum).padStart(2, '0');
        const correctIsoDate = `${yearAD}-${mStr}-${ddStr}`;
        if (draw.date !== correctIsoDate) {
          return { ...draw, date: correctIsoDate };
        }
      }
    }
  }
  return draw;
};

// Dedicated persistent storage for user manual draws that is never wiped by resets or syncs
const MANUAL_RECORDS_KEY = 'lotto_manual_records';

export const loadManualRecords = (): DrawResult[] => {
  try {
    const raw = localStorage.getItem(MANUAL_RECORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(fixDrawDate);
      }
    }
  } catch (err) {
    console.error('Failed to load manual records:', err);
  }
  return [];
};

export const saveManualRecord = (draw: DrawResult): void => {
  try {
    const list = loadManualRecords();
    const filtered = list.filter(
      (item) => item.id !== draw.id && !(item.date === draw.date && item.session === draw.session && item.lotteryType === draw.lotteryType)
    );
    const updated = [{ ...draw, isManual: true }, ...filtered];
    localStorage.setItem(MANUAL_RECORDS_KEY, JSON.stringify(updated));
    syncSaveToCloud(MANUAL_RECORDS_KEY, updated);
  } catch (err) {
    console.error('Failed to save manual record:', err);
  }
};

export const removeManualRecord = (
  id: string,
  date?: string,
  lotteryType?: LotteryType,
  session?: SessionType
): void => {
  try {
    const list = loadManualRecords();
    const updated = list.filter((item) => {
      if (item.id === id) return false;
      if (date && lotteryType && item.date === date && item.lotteryType === lotteryType) {
        if (!session || item.session === session) return false;
      }
      return true;
    });
    localStorage.setItem(MANUAL_RECORDS_KEY, JSON.stringify(updated));
    syncSaveToCloud(MANUAL_RECORDS_KEY, updated);
  } catch (err) {
    console.error('Failed to remove manual record:', err);
  }
};

export const injectManualRecords = (
  list: DrawResult[],
  lottoType: LotteryType,
  sessionName?: SessionType
): DrawResult[] => {
  const manualRecords = loadManualRecords();
  const relevantManuals = manualRecords.filter((m) => {
    if (m.lotteryType !== lottoType) return false;
    if (sessionName && m.session !== sessionName) return false;
    return true;
  });

  if (relevantManuals.length === 0) return list;

  const result = [...list];
  for (const man of relevantManuals) {
    const idx = result.findIndex((item) => item.date === man.date && item.session === man.session);
    if (idx >= 0) {
      result[idx] = { ...man, isManual: true };
    } else {
      result.unshift({ ...man, isManual: true });
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
};

const loadPersistedData = (
  key: string,
  fallback: DrawResult[],
  lottoType?: LotteryType,
  sessionName?: SessionType
): DrawResult[] => {
  try {
    const isHanoiKey = key.startsWith('lotto_data_hanoi');
    const isStockKey = key.startsWith('lotto_data_nikkei') || key.startsWith('lotto_data_china') || key.startsWith('lotto_data_hangseng');
    if (isHanoiKey || isStockKey) {
      const keyVersion = localStorage.getItem(`${key}_v8_manual_protect`);
      if (keyVersion !== 'true') {
        try {
          const oldDataStr = localStorage.getItem(key);
          if (oldDataStr) {
            const oldData = JSON.parse(oldDataStr);
            if (Array.isArray(oldData)) {
              for (const it of oldData) {
                if (it && it.isManual) saveManualRecord(it);
              }
            }
          }
        } catch (e) {}
        localStorage.removeItem(key);
        localStorage.setItem(`${key}_v8_manual_protect`, 'true');
        const base = fallback.map(fixDrawDate);
        return lottoType ? injectManualRecords(base, lottoType, sessionName) : base;
      }
    }

    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const base = parsed.map(fixDrawDate);
        return lottoType ? injectManualRecords(base, lottoType, sessionName) : base;
      }
    }
  } catch (err) {
    console.error(`Failed to load persisted lotto data for ${key}:`, err);
  }
  const base = fallback.map(fixDrawDate);
  return lottoType ? injectManualRecords(base, lottoType, sessionName) : base;
};

export default function App() {
  const [lotteryType, setLotteryType] = useState<LotteryType>(() => {
    const saved = localStorage.getItem('lotto_active_lottery_type');
    return (saved as LotteryType) || 'NIKKEI';
  });

  const [nikkeiMorningData, setNikkeiMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_morning', INITIAL_NIKKEI_MORNING_DATA, 'NIKKEI', 'NIKKEI_MORNING')
  );
  const [nikkeiAfternoonData, setNikkeiAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_afternoon', INITIAL_NIKKEI_AFTERNOON_DATA, 'NIKKEI', 'NIKKEI_AFTERNOON')
  );
  const [chinaMorningData, setChinaMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_morning', INITIAL_CHINA_MORNING_DATA, 'NIKKEI', 'CHINA_MORNING')
  );
  const [chinaAfternoonData, setChinaAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_afternoon', INITIAL_CHINA_AFTERNOON_DATA, 'NIKKEI', 'CHINA_AFTERNOON')
  );
  const [hangsengMorningData, setHangsengMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_morning', INITIAL_HANGSENG_MORNING_DATA, 'NIKKEI', 'HANGSENG_MORNING')
  );
  const [hangsengAfternoonData, setHangsengAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_afternoon', INITIAL_HANGSENG_AFTERNOON_DATA, 'NIKKEI', 'HANGSENG_AFTERNOON')
  );

  // VIP Stock Lotteries State
  const [nikkeiVipMorningData, setNikkeiVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_vip_morning', INITIAL_NIKKEI_VIP_MORNING_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_MORNING')
  );
  const [nikkeiVipAfternoonData, setNikkeiVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_vip_afternoon', INITIAL_NIKKEI_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_AFTERNOON')
  );
  const [chinaVipMorningData, setChinaVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_vip_morning', INITIAL_CHINA_VIP_MORNING_DATA, 'STOCKS_VIP', 'CHINA_VIP_MORNING')
  );
  const [chinaVipAfternoonData, setChinaVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_vip_afternoon', INITIAL_CHINA_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'CHINA_VIP_AFTERNOON')
  );
  const [hangsengVipMorningData, setHangsengVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_vip_morning', INITIAL_HANGSENG_VIP_MORNING_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_MORNING')
  );
  const [hangsengVipAfternoonData, setHangsengVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_vip_afternoon', INITIAL_HANGSENG_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_AFTERNOON')
  );

  const [laosData, setLaosData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_laos', INITIAL_LAOS_DATA, 'LAOS', 'LAOS_EVENING')
  );
  const [malayData, setMalayData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_malay', INITIAL_MALAY_DATA, 'MALAY', 'MALAY_EVENING')
  );
  const [dowjonesData, setDowjonesData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_dowjones', INITIAL_DOWJONES_DATA, 'DOWJONES', 'DOWJONES_NIGHT')
  );
  const [hanoiSpecialData, setHanoiSpecialData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi_special', INITIAL_HANOI_SPECIAL_DATA, 'HANOI', 'HANOI_SPECIAL')
  );
  const [hanoiData, setHanoiData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi', INITIAL_HANOI_DATA, 'HANOI', 'HANOI_EVENING')
  );
  const [hanoiVipData, setHanoiVipData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi_vip', INITIAL_HANOI_VIP_DATA, 'HANOI', 'HANOI_VIP')
  );
  const [gsbData, setGsbData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_gsb', INITIAL_GSB_DATA, 'GSB', 'GSB_BIWEEKLY')
  );
  const [govData, setGovData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_gov', INITIAL_GOVERNMENT_DATA, 'GOVERNMENT', 'GOV_BIWEEKLY')
  );
  
  const [selectedSession, setSelectedSession] = useState<SessionType>(() => {
    const saved = localStorage.getItem('lotto_selected_session');
    return (saved as SessionType) || 'NIKKEI_BOTH';
  });

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROBABILITY' | 'HISTORY' | 'FORMULAS' | 'BACKTEST' | 'WIN_GEN' | 'CALENDAR'>(() => {
    const saved = localStorage.getItem('lotto_active_tab');
    return (saved as any) || 'OVERVIEW';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('lotto_theme_mode');
    return (saved as ThemeMode) || 'DARK';
  });

  const [manualRecords, setManualRecords] = useState<DrawResult[]>(() => loadManualRecords());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync engine version with manual protection
  useEffect(() => {
    const currentVersion = '15.0.0_laos_star_malay_support';
    const savedVersion = localStorage.getItem('lotto_engine_version');
    if (savedVersion !== currentVersion) {
      // First, migrate any existing isManual records into MANUAL_RECORDS_KEY so they are never lost!
      const allKeys = [
        'lotto_data_nikkei_morning', 'lotto_data_nikkei_afternoon',
        'lotto_data_china_morning', 'lotto_data_china_afternoon',
        'lotto_data_hangseng_morning', 'lotto_data_hangseng_afternoon',
        'lotto_data_nikkei_vip_morning', 'lotto_data_nikkei_vip_afternoon',
        'lotto_data_china_vip_morning', 'lotto_data_china_vip_afternoon',
        'lotto_data_hangseng_vip_morning', 'lotto_data_hangseng_vip_afternoon',
        'lotto_data_laos', 'lotto_data_laos_star', 'lotto_data_malay', 'lotto_data_dowjones', 'lotto_data_hanoi_special',
        'lotto_data_hanoi', 'lotto_data_hanoi_vip', 'lotto_data_gsb', 'lotto_data_gov'
      ];
      allKeys.forEach((k) => {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.filter((x: any) => x && x.isManual).forEach(saveManualRecord);
            }
          }
        } catch (e) {}
      });

      localStorage.setItem('lotto_engine_version', currentVersion);
      allKeys.forEach((k) => localStorage.removeItem(k));

      setNikkeiMorningData(injectManualRecords(INITIAL_NIKKEI_MORNING_DATA, 'NIKKEI', 'NIKKEI_MORNING'));
      setNikkeiAfternoonData(injectManualRecords(INITIAL_NIKKEI_AFTERNOON_DATA, 'NIKKEI', 'NIKKEI_AFTERNOON'));
      setChinaMorningData(injectManualRecords(INITIAL_CHINA_MORNING_DATA, 'NIKKEI', 'CHINA_MORNING'));
      setChinaAfternoonData(injectManualRecords(INITIAL_CHINA_AFTERNOON_DATA, 'NIKKEI', 'CHINA_AFTERNOON'));
      setHangsengMorningData(injectManualRecords(INITIAL_HANGSENG_MORNING_DATA, 'NIKKEI', 'HANGSENG_MORNING'));
      setHangsengAfternoonData(injectManualRecords(INITIAL_HANGSENG_AFTERNOON_DATA, 'NIKKEI', 'HANGSENG_AFTERNOON'));
      setNikkeiVipMorningData(injectManualRecords(INITIAL_NIKKEI_VIP_MORNING_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_MORNING'));
      setNikkeiVipAfternoonData(injectManualRecords(INITIAL_NIKKEI_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_AFTERNOON'));
      setChinaVipMorningData(injectManualRecords(INITIAL_CHINA_VIP_MORNING_DATA, 'STOCKS_VIP', 'CHINA_VIP_MORNING'));
      setChinaVipAfternoonData(injectManualRecords(INITIAL_CHINA_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'CHINA_VIP_AFTERNOON'));
      setHangsengVipMorningData(injectManualRecords(INITIAL_HANGSENG_VIP_MORNING_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_MORNING'));
      setHangsengVipAfternoonData(injectManualRecords(INITIAL_HANGSENG_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_AFTERNOON'));
      setLaosData(injectManualRecords(INITIAL_LAOS_DATA, 'LAOS', 'LAOS_EVENING'));
      setLaosStarData(injectManualRecords(INITIAL_LAOS_STAR_DATA, 'LAOS_STAR', 'LAOS_STAR_DAY'));
      setMalayData(injectManualRecords(INITIAL_MALAY_DATA, 'MALAY', 'MALAY_EVENING'));
      setDowjonesData(injectManualRecords(INITIAL_DOWJONES_DATA, 'DOWJONES', 'DOWJONES_NIGHT'));
      setHanoiSpecialData(injectManualRecords(INITIAL_HANOI_SPECIAL_DATA, 'HANOI', 'HANOI_SPECIAL'));
      setHanoiData(injectManualRecords(INITIAL_HANOI_DATA, 'HANOI', 'HANOI_EVENING'));
      setHanoiVipData(injectManualRecords(INITIAL_HANOI_VIP_DATA, 'HANOI', 'HANOI_VIP'));
      setGsbData(injectManualRecords(INITIAL_GSB_DATA, 'GSB', 'GSB_BIWEEKLY'));
      setGovData(injectManualRecords(INITIAL_GOVERNMENT_DATA, 'GOVERNMENT', 'GOV_BIWEEKLY'));

      setManualRecords(loadManualRecords());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lotto_active_lottery_type', lotteryType);
    if (lotteryType === 'STOCKS_VIP' && !['NIKKEI_VIP_BOTH', 'NIKKEI_VIP_MORNING', 'NIKKEI_VIP_AFTERNOON', 'CHINA_VIP_BOTH', 'CHINA_VIP_MORNING', 'CHINA_VIP_AFTERNOON', 'HANGSENG_VIP_BOTH', 'HANGSENG_VIP_MORNING', 'HANGSENG_VIP_AFTERNOON', 'STOCKS_VIP_ALL_3'].includes(selectedSession)) {
      setSelectedSession('NIKKEI_VIP_BOTH');
    }
    if (lotteryType === 'HANOI' && !['HANOI_SPECIAL', 'HANOI_EVENING', 'HANOI_VIP', 'HANOI_ALL_3'].includes(selectedSession)) {
      setSelectedSession('HANOI_ALL_3');
    }
    if (lotteryType === 'NIKKEI' && !['NIKKEI_BOTH', 'NIKKEI_MORNING', 'NIKKEI_AFTERNOON', 'CHINA_BOTH', 'CHINA_MORNING', 'CHINA_AFTERNOON', 'HANGSENG_BOTH', 'HANGSENG_MORNING', 'HANGSENG_AFTERNOON', 'STOCKS_ALL_3', 'MORNING', 'AFTERNOON', 'BOTH'].includes(selectedSession)) {
      setSelectedSession('NIKKEI_BOTH');
    }
  }, [lotteryType, selectedSession]);

  useEffect(() => {
    localStorage.setItem('lotto_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('lotto_selected_session', selectedSession);
  }, [selectedSession]);

  useEffect(() => {
    localStorage.setItem('lotto_theme_mode', themeMode);
  }, [themeMode]);

  // Persist stock dataset states to localStorage
  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_morning', JSON.stringify(nikkeiMorningData));
  }, [nikkeiMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_afternoon', JSON.stringify(nikkeiAfternoonData));
  }, [nikkeiAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_morning', JSON.stringify(chinaMorningData));
  }, [chinaMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_afternoon', JSON.stringify(chinaAfternoonData));
  }, [chinaAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_morning', JSON.stringify(hangsengMorningData));
  }, [hangsengMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_afternoon', JSON.stringify(hangsengAfternoonData));
  }, [hangsengAfternoonData]);

  // Persist VIP stock dataset states to localStorage
  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_vip_morning', JSON.stringify(nikkeiVipMorningData));
  }, [nikkeiVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_vip_afternoon', JSON.stringify(nikkeiVipAfternoonData));
  }, [nikkeiVipAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_vip_morning', JSON.stringify(chinaVipMorningData));
  }, [chinaVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_vip_afternoon', JSON.stringify(chinaVipAfternoonData));
  }, [chinaVipAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_vip_morning', JSON.stringify(hangsengVipMorningData));
  }, [hangsengVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_vip_afternoon', JSON.stringify(hangsengVipAfternoonData));
  }, [hangsengVipAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_laos', JSON.stringify(laosData));
    syncSaveToCloud('lotto_data_laos', laosData);
  }, [laosData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_dowjones', JSON.stringify(dowjonesData));
    syncSaveToCloud('lotto_data_dowjones', dowjonesData);
  }, [dowjonesData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hanoi_special', JSON.stringify(hanoiSpecialData));
    syncSaveToCloud('lotto_data_hanoi_special', hanoiSpecialData);
  }, [hanoiSpecialData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hanoi', JSON.stringify(hanoiData));
    syncSaveToCloud('lotto_data_hanoi', hanoiData);
  }, [hanoiData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hanoi_vip', JSON.stringify(hanoiVipData));
    syncSaveToCloud('lotto_data_hanoi_vip', hanoiVipData);
  }, [hanoiVipData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_gsb', JSON.stringify(gsbData));
    syncSaveToCloud('lotto_data_gsb', gsbData);
  }, [gsbData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_gov', JSON.stringify(govData));
    syncSaveToCloud('lotto_data_gov', govData);
  }, [govData]);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const allHanoiData = useMemo(() => {
    const combined = [...hanoiSpecialData, ...hanoiData, ...hanoiVipData];
    const sessionWeight = (s?: SessionType) => {
      if (s === 'HANOI_VIP') return 3;
      if (s === 'HANOI_EVENING') return 2;
      if (s === 'HANOI_SPECIAL') return 1;
      return 0;
    };
    return combined.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return sessionWeight(b.session) - sessionWeight(a.session);
    });
  }, [hanoiSpecialData, hanoiData, hanoiVipData]);

  const nikkeiBothData = useMemo(() => {
    return [...nikkeiMorningData, ...nikkeiAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return (b.session === 'NIKKEI_AFTERNOON' || b.session === 'AFTERNOON') ? 1 : -1;
    });
  }, [nikkeiMorningData, nikkeiAfternoonData]);

  const chinaBothData = useMemo(() => {
    return [...chinaMorningData, ...chinaAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return b.session === 'CHINA_AFTERNOON' ? 1 : -1;
    });
  }, [chinaMorningData, chinaAfternoonData]);

  const hangsengBothData = useMemo(() => {
    return [...hangsengMorningData, ...hangsengAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return b.session === 'HANGSENG_AFTERNOON' ? 1 : -1;
    });
  }, [hangsengMorningData, hangsengAfternoonData]);

  const allStockData = useMemo(() => {
    const combined = [
      ...nikkeiMorningData, ...nikkeiAfternoonData,
      ...chinaMorningData, ...chinaAfternoonData,
      ...hangsengMorningData, ...hangsengAfternoonData
    ];
    const sessionWeight = (s?: SessionType) => {
      if (s === 'HANGSENG_AFTERNOON') return 6;
      if (s === 'CHINA_AFTERNOON') return 5;
      if (s === 'NIKKEI_AFTERNOON' || s === 'AFTERNOON') return 4;
      if (s === 'HANGSENG_MORNING') return 3;
      if (s === 'CHINA_MORNING') return 2;
      if (s === 'NIKKEI_MORNING' || s === 'MORNING') return 1;
      return 0;
    };
    return combined.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return sessionWeight(b.session) - sessionWeight(a.session);
    });
  }, [nikkeiMorningData, nikkeiAfternoonData, chinaMorningData, chinaAfternoonData, hangsengMorningData, hangsengAfternoonData]);

  // Combined VIP Stock Datasets
  const nikkeiVipBothData = useMemo(() => {
    return [...nikkeiVipMorningData, ...nikkeiVipAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return b.session === 'NIKKEI_VIP_AFTERNOON' ? 1 : -1;
    });
  }, [nikkeiVipMorningData, nikkeiVipAfternoonData]);

  const chinaVipBothData = useMemo(() => {
    return [...chinaVipMorningData, ...chinaVipAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return b.session === 'CHINA_VIP_AFTERNOON' ? 1 : -1;
    });
  }, [chinaVipMorningData, chinaVipAfternoonData]);

  const hangsengVipBothData = useMemo(() => {
    return [...hangsengVipMorningData, ...hangsengVipAfternoonData].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return b.session === 'HANGSENG_VIP_AFTERNOON' ? 1 : -1;
    });
  }, [hangsengVipMorningData, hangsengVipAfternoonData]);

  const allStockVipData = useMemo(() => {
    const combined = [
      ...nikkeiVipMorningData, ...nikkeiVipAfternoonData,
      ...chinaVipMorningData, ...chinaVipAfternoonData,
      ...hangsengVipMorningData, ...hangsengVipAfternoonData
    ];
    const sessionWeight = (s?: SessionType) => {
      if (s === 'HANGSENG_VIP_AFTERNOON') return 6;
      if (s === 'CHINA_VIP_AFTERNOON') return 5;
      if (s === 'NIKKEI_VIP_AFTERNOON') return 4;
      if (s === 'HANGSENG_VIP_MORNING') return 3;
      if (s === 'CHINA_VIP_MORNING') return 2;
      if (s === 'NIKKEI_VIP_MORNING') return 1;
      return 0;
    };
    return combined.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      const timeDiff = timeB - timeA;
      if (timeDiff !== 0) return timeDiff;
      return sessionWeight(b.session) - sessionWeight(a.session);
    });
  }, [nikkeiVipMorningData, nikkeiVipAfternoonData, chinaVipMorningData, chinaVipAfternoonData, hangsengVipMorningData, hangsengVipAfternoonData]);

  // Active dataset according to selected lottery type and session
  const activeDataset = useMemo(() => {
    if (lotteryType === 'LAOS') {
      return laosData;
    }
    if (lotteryType === 'MALAY') {
      return malayData;
    }
    if (lotteryType === 'DOWJONES') {
      return dowjonesData;
    }
    if (lotteryType === 'HANOI') {
      if (selectedSession === 'HANOI_SPECIAL') return hanoiSpecialData;
      if (selectedSession === 'HANOI_VIP') return hanoiVipData;
      if (selectedSession === 'HANOI_EVENING') return hanoiData;
      return allHanoiData;
    }
    if (lotteryType === 'GSB') {
      return gsbData;
    }
    if (lotteryType === 'GOVERNMENT') {
      return govData;
    }
    if (lotteryType === 'STOCKS_VIP') {
      if (selectedSession === 'NIKKEI_VIP_MORNING') return nikkeiVipMorningData;
      if (selectedSession === 'NIKKEI_VIP_AFTERNOON') return nikkeiVipAfternoonData;
      if (selectedSession === 'NIKKEI_VIP_BOTH') return nikkeiVipBothData;
      if (selectedSession === 'CHINA_VIP_MORNING') return chinaVipMorningData;
      if (selectedSession === 'CHINA_VIP_AFTERNOON') return chinaVipAfternoonData;
      if (selectedSession === 'CHINA_VIP_BOTH') return chinaVipBothData;
      if (selectedSession === 'HANGSENG_VIP_MORNING') return hangsengVipMorningData;
      if (selectedSession === 'HANGSENG_VIP_AFTERNOON') return hangsengVipAfternoonData;
      if (selectedSession === 'HANGSENG_VIP_BOTH') return hangsengVipBothData;
      if (selectedSession === 'STOCKS_VIP_ALL_3') return allStockVipData;
      return nikkeiVipBothData;
    }
    if (lotteryType === 'NIKKEI') {
      if (selectedSession === 'NIKKEI_MORNING' || selectedSession === 'MORNING') return nikkeiMorningData;
      if (selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON') return nikkeiAfternoonData;
      if (selectedSession === 'NIKKEI_BOTH' || selectedSession === 'BOTH') return nikkeiBothData;
      if (selectedSession === 'CHINA_MORNING') return chinaMorningData;
      if (selectedSession === 'CHINA_AFTERNOON') return chinaAfternoonData;
      if (selectedSession === 'CHINA_BOTH') return chinaBothData;
      if (selectedSession === 'HANGSENG_MORNING') return hangsengMorningData;
      if (selectedSession === 'HANGSENG_AFTERNOON') return hangsengAfternoonData;
      if (selectedSession === 'HANGSENG_BOTH') return hangsengBothData;
      if (selectedSession === 'STOCKS_ALL_3') return allStockData;
      return nikkeiBothData;
    }
    return nikkeiBothData;
  }, [
    lotteryType, selectedSession,
    nikkeiMorningData, nikkeiAfternoonData, chinaMorningData, chinaAfternoonData, hangsengMorningData, hangsengAfternoonData,
    nikkeiBothData, chinaBothData, hangsengBothData, allStockData,
    nikkeiVipMorningData, nikkeiVipAfternoonData, chinaVipMorningData, chinaVipAfternoonData, hangsengVipMorningData, hangsengVipAfternoonData,
    nikkeiVipBothData, chinaVipBothData, hangsengVipBothData, allStockVipData,
    laosData, dowjonesData, hanoiSpecialData, hanoiData, hanoiVipData, gsbData, govData
  ]);

  const [drawOffset, setDrawOffset] = useState<number>(0);

  // Unique dates for Hanoi when in HANOI_ALL_3 combined mode
  const hanoiUniqueDates = useMemo(() => {
    const dates: string[] = [];
    const seen = new Set<string>();
    for (const item of allHanoiData) {
      const key = item.dateFormatted || item.date;
      if (key && !seen.has(key)) {
        seen.add(key);
        dates.push(key);
      }
    }
    return dates;
  }, [allHanoiData]);

  const maxDrawOffset = useMemo(() => {
    if (lotteryType === 'HANOI' && selectedSession === 'HANOI_ALL_3') {
      return hanoiUniqueDates.length;
    }
    return activeDataset.length;
  }, [lotteryType, selectedSession, hanoiUniqueDates, activeDataset]);

  // Reset drawOffset when lotteryType or selectedSession changes
  useEffect(() => {
    setDrawOffset(0);
  }, [lotteryType, selectedSession]);

  // Compute predictions, statistics, and formulas dynamically
  const digitStats = useMemo(() => getDigitStatistics(activeDataset), [activeDataset]);
  
  const { currentPrediction, pastDrawResult, prevDrawLabel, nextDrawLabel } = useMemo(() => {
    if (lotteryType === 'HANOI' && selectedSession === 'HANOI_ALL_3') {
      if (drawOffset === 0) {
        const pred = predictNextDraw(allHanoiData, 'HANOI_ALL_3', 'HANOI');
        const pLabel = hanoiUniqueDates[0] || '';
        return {
          currentPrediction: pred,
          pastDrawResult: undefined,
          prevDrawLabel: pLabel,
          nextDrawLabel: ''
        };
      }

      const targetDateKey = hanoiUniqueDates[drawOffset - 1];
      const pastRes = allHanoiData.find((d) => (d.dateFormatted || d.date) === targetDateKey) || allHanoiData[0];

      const olderDates = new Set(hanoiUniqueDates.slice(drawOffset));
      const datasetForCalc = allHanoiData.filter((d) => olderDates.has(d.dateFormatted || d.date));
      const dataToUse = datasetForCalc.length > 0 ? datasetForCalc : allHanoiData;

      const pred = predictNextDraw(dataToUse, 'HANOI_ALL_3', 'HANOI');
      if (pastRes) {
        const formattedDateOnly = pastRes.dateFormatted || pastRes.date;
        pred.targetDate = `${formattedDateOnly} (วิเคราะห์รวม 3 ฮานอย 17:30/18:30/19:30)`;
      }

      const pLabel = hanoiUniqueDates[drawOffset] || '';
      const nLabel = drawOffset === 1 ? 'งวดอนาคต' : (hanoiUniqueDates[drawOffset - 2] || '');

      return {
        currentPrediction: pred,
        pastDrawResult: pastRes,
        prevDrawLabel: pLabel,
        nextDrawLabel: nLabel
      };
    }

    if (drawOffset === 0) {
      const pred = predictNextDraw(activeDataset, selectedSession, lotteryType);
      const pLabel = activeDataset[0]?.dateFormatted || '';
      return {
        currentPrediction: pred,
        pastDrawResult: undefined,
        prevDrawLabel: pLabel,
        nextDrawLabel: ''
      };
    }

    const targetIdx = drawOffset - 1;
    const pastRes = activeDataset[targetIdx];
    const pastHistory = activeDataset.slice(drawOffset);
    const datasetForCalc = pastHistory.length > 0 ? pastHistory : activeDataset;

    const sessionToUse = pastRes?.session || selectedSession;
    const pred = predictNextDraw(datasetForCalc, sessionToUse, lotteryType);
    if (pastRes) {
      pred.targetDate = `${pastRes.dateFormatted} (${pastRes.dayNameThai || pastRes.dayOfWeek})`;
    }

    const pLabel = activeDataset[drawOffset]?.dateFormatted || '';
    const nLabel = drawOffset === 1 ? 'งวดอนาคต' : (activeDataset[drawOffset - 2]?.dateFormatted || '');

    return {
      currentPrediction: pred,
      pastDrawResult: pastRes,
      prevDrawLabel: pLabel,
      nextDrawLabel: nLabel
    };
  }, [activeDataset, drawOffset, selectedSession, lotteryType, hanoiUniqueDates, allHanoiData]);

  const formulas = useMemo(
    () => calculateFormulas(activeDataset, lotteryType),
    [activeDataset, lotteryType]
  );

  const [editingDraw, setEditingDraw] = useState<DrawResult | null>(null);

  const handleAddDraw = (newDraw: Omit<DrawResult, 'id'>) => {
    const created: DrawResult = {
      ...newDraw,
      id: `${newDraw.lotteryType}_${newDraw.session}_${newDraw.date}_${Date.now()}`,
      isManual: true
    };

    saveManualRecord(created);
    setManualRecords(loadManualRecords());

    if (newDraw.lotteryType === 'LAOS') {
      setLaosData([created, ...laosData]);
    } else if (newDraw.lotteryType === 'DOWJONES') {
      setDowjonesData([created, ...dowjonesData]);
    } else if (newDraw.lotteryType === 'HANOI') {
      if (newDraw.session === 'HANOI_SPECIAL') {
        setHanoiSpecialData([created, ...hanoiSpecialData]);
      } else if (newDraw.session === 'HANOI_VIP') {
        setHanoiVipData([created, ...hanoiVipData]);
      } else {
        setHanoiData([created, ...hanoiData]);
      }
    } else if (newDraw.lotteryType === 'GSB') {
      setGsbData([created, ...gsbData]);
    } else if (newDraw.lotteryType === 'GOVERNMENT') {
      setGovData([created, ...govData]);
    } else if (newDraw.lotteryType === 'STOCKS_VIP') {
      if (newDraw.session === 'CHINA_VIP_MORNING') setChinaVipMorningData([created, ...chinaVipMorningData]);
      else if (newDraw.session === 'CHINA_VIP_AFTERNOON') setChinaVipAfternoonData([created, ...chinaVipAfternoonData]);
      else if (newDraw.session === 'HANGSENG_VIP_MORNING') setHangsengVipMorningData([created, ...hangsengVipMorningData]);
      else if (newDraw.session === 'HANGSENG_VIP_AFTERNOON') setHangsengVipAfternoonData([created, ...hangsengVipAfternoonData]);
      else if (newDraw.session === 'NIKKEI_VIP_AFTERNOON') setNikkeiVipAfternoonData([created, ...nikkeiVipAfternoonData]);
      else setNikkeiVipMorningData([created, ...nikkeiVipMorningData]);
    } else {
      if (newDraw.session === 'CHINA_MORNING') setChinaMorningData([created, ...chinaMorningData]);
      else if (newDraw.session === 'CHINA_AFTERNOON') setChinaAfternoonData([created, ...chinaAfternoonData]);
      else if (newDraw.session === 'HANGSENG_MORNING') setHangsengMorningData([created, ...hangsengMorningData]);
      else if (newDraw.session === 'HANGSENG_AFTERNOON') setHangsengAfternoonData([created, ...hangsengAfternoonData]);
      else if (newDraw.session === 'NIKKEI_AFTERNOON' || newDraw.session === 'AFTERNOON') setNikkeiAfternoonData([created, ...nikkeiAfternoonData]);
      else setNikkeiMorningData([created, ...nikkeiMorningData]);
    }

    addToast('success', 'บันทึกผลสำเร็จ! ✏️', `เพิ่มผลรางวัลวันที่ ${newDraw.dateFormatted} (ได้รับการคุ้มครอง ปลอดภัยไม่ถูกเขียนทับ)`);
  };

  const handleEditDraw = (updatedDraw: DrawResult) => {
    const manualUpdated = { ...updatedDraw, isManual: true };
    saveManualRecord(manualUpdated);
    setManualRecords(loadManualRecords());

    const updateList = (list: DrawResult[]) => list.map((item) => (item.id === updatedDraw.id ? manualUpdated : item));
    if (updatedDraw.lotteryType === 'LAOS') setLaosData(updateList(laosData));
    else if (updatedDraw.lotteryType === 'DOWJONES') setDowjonesData(updateList(dowjonesData));
    else if (updatedDraw.lotteryType === 'HANOI') {
      if (updatedDraw.session === 'HANOI_SPECIAL') setHanoiSpecialData(updateList(hanoiSpecialData));
      else if (updatedDraw.session === 'HANOI_VIP') setHanoiVipData(updateList(hanoiVipData));
      else setHanoiData(updateList(hanoiData));
    }
    else if (updatedDraw.lotteryType === 'GSB') setGsbData(updateList(gsbData));
    else if (updatedDraw.lotteryType === 'GOVERNMENT') setGovData(updateList(govData));
    else if (updatedDraw.lotteryType === 'STOCKS_VIP') {
      if (updatedDraw.session === 'CHINA_VIP_MORNING') setChinaVipMorningData(updateList(chinaVipMorningData));
      else if (updatedDraw.session === 'CHINA_VIP_AFTERNOON') setChinaVipAfternoonData(updateList(chinaVipAfternoonData));
      else if (updatedDraw.session === 'HANGSENG_VIP_MORNING') setHangsengVipMorningData(updateList(hangsengVipMorningData));
      else if (updatedDraw.session === 'HANGSENG_VIP_AFTERNOON') setHangsengVipAfternoonData(updateList(hangsengVipAfternoonData));
      else if (updatedDraw.session === 'NIKKEI_VIP_AFTERNOON') setNikkeiVipAfternoonData(updateList(nikkeiVipAfternoonData));
      else setNikkeiVipMorningData(updateList(nikkeiVipMorningData));
    }
    else {
      if (updatedDraw.session === 'CHINA_MORNING') setChinaMorningData(updateList(chinaMorningData));
      else if (updatedDraw.session === 'CHINA_AFTERNOON') setChinaAfternoonData(updateList(chinaAfternoonData));
      else if (updatedDraw.session === 'HANGSENG_MORNING') setHangsengMorningData(updateList(hangsengMorningData));
      else if (updatedDraw.session === 'HANGSENG_AFTERNOON') setHangsengAfternoonData(updateList(hangsengAfternoonData));
      else if (updatedDraw.session === 'NIKKEI_AFTERNOON' || updatedDraw.session === 'AFTERNOON') setNikkeiAfternoonData(updateList(nikkeiAfternoonData));
      else setNikkeiMorningData(updateList(nikkeiMorningData));
    }

    addToast('success', 'แก้ไขผลสำเร็จ! ✏️', `แก้ไขผลรางวัลวันที่ ${updatedDraw.dateFormatted} เรียบร้อยแล้ว`);
  };

  const handleDeleteDraw = (drawId: string, drawDate: string, lottery: LotteryType, session?: SessionType) => {
    if (confirm(`คุณต้องการลบผลรางวัลวันที่ ${drawDate} ใช่หรือไม่?`)) {
      removeManualRecord(drawId, drawDate, lottery, session);
      setManualRecords(loadManualRecords());

      const filterList = (list: DrawResult[]) => list.filter((item) => item.id !== drawId);
      if (lottery === 'LAOS') setLaosData(filterList(laosData));
      else if (lottery === 'DOWJONES') setDowjonesData(filterList(dowjonesData));
      else if (lottery === 'HANOI') {
        setHanoiSpecialData(filterList(hanoiSpecialData));
        setHanoiData(filterList(hanoiData));
        setHanoiVipData(filterList(hanoiVipData));
      }
      else if (lottery === 'GSB') setGsbData(filterList(gsbData));
      else if (lottery === 'GOVERNMENT') setGovData(filterList(govData));
      else if (lottery === 'STOCKS_VIP') {
        setNikkeiVipMorningData(filterList(nikkeiVipMorningData));
        setNikkeiVipAfternoonData(filterList(nikkeiVipAfternoonData));
        setChinaVipMorningData(filterList(chinaVipMorningData));
        setChinaVipAfternoonData(filterList(chinaVipAfternoonData));
        setHangsengVipMorningData(filterList(hangsengVipMorningData));
        setHangsengVipAfternoonData(filterList(hangsengVipAfternoonData));
      }
      else {
        setNikkeiMorningData(filterList(nikkeiMorningData));
        setNikkeiAfternoonData(filterList(nikkeiAfternoonData));
        setChinaMorningData(filterList(chinaMorningData));
        setChinaAfternoonData(filterList(chinaAfternoonData));
        setHangsengMorningData(filterList(hangsengMorningData));
        setHangsengAfternoonData(filterList(hangsengAfternoonData));
      }

      addToast('info', 'ลบผลสำเร็จ!', `ลบผลรางวัลวันที่ ${drawDate} เรียบร้อยแล้ว`);
    }
  };

  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตชุดข้อมูลกลับไปเป็นค่าเริ่มต้นสถิติใช่หรือไม่? (ผลที่บันทึกเองจะยังคงได้รับการคุ้มครอง)')) {
      if (lotteryType === 'LAOS') {
        localStorage.removeItem('lotto_data_laos');
        setLaosData(injectManualRecords(INITIAL_LAOS_DATA, 'LAOS', 'LAOS_EVENING'));

      } else if (lotteryType === 'MALAY') {
        localStorage.removeItem('lotto_data_malay');
        setMalayData(injectManualRecords(INITIAL_MALAY_DATA, 'MALAY', 'MALAY_EVENING'));
      } else if (lotteryType === 'DOWJONES') {
        localStorage.removeItem('lotto_data_dowjones');
        setDowjonesData(injectManualRecords(INITIAL_DOWJONES_DATA, 'DOWJONES', 'DOWJONES_NIGHT'));
      } else if (lotteryType === 'HANOI') {
        localStorage.removeItem('lotto_data_hanoi_special');
        localStorage.removeItem('lotto_data_hanoi');
        localStorage.removeItem('lotto_data_hanoi_vip');
        setHanoiSpecialData(injectManualRecords(INITIAL_HANOI_SPECIAL_DATA, 'HANOI', 'HANOI_SPECIAL'));
        setHanoiData(injectManualRecords(INITIAL_HANOI_DATA, 'HANOI', 'HANOI_EVENING'));
        setHanoiVipData(injectManualRecords(INITIAL_HANOI_VIP_DATA, 'HANOI', 'HANOI_VIP'));
      } else if (lotteryType === 'GSB') {
        localStorage.removeItem('lotto_data_gsb');
        setGsbData(injectManualRecords(INITIAL_GSB_DATA, 'GSB', 'GSB_BIWEEKLY'));
      } else if (lotteryType === 'GOVERNMENT') {
        localStorage.removeItem('lotto_data_gov');
        setGovData(injectManualRecords(INITIAL_GOVERNMENT_DATA, 'GOVERNMENT', 'GOV_BIWEEKLY'));
      } else if (lotteryType === 'STOCKS_VIP') {
        localStorage.removeItem('lotto_data_nikkei_vip_morning');
        localStorage.removeItem('lotto_data_nikkei_vip_afternoon');
        localStorage.removeItem('lotto_data_china_vip_morning');
        localStorage.removeItem('lotto_data_china_vip_afternoon');
        localStorage.removeItem('lotto_data_hangseng_vip_morning');
        localStorage.removeItem('lotto_data_hangseng_vip_afternoon');
        setNikkeiVipMorningData(injectManualRecords(INITIAL_NIKKEI_VIP_MORNING_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_MORNING'));
        setNikkeiVipAfternoonData(injectManualRecords(INITIAL_NIKKEI_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'NIKKEI_VIP_AFTERNOON'));
        setChinaVipMorningData(injectManualRecords(INITIAL_CHINA_VIP_MORNING_DATA, 'STOCKS_VIP', 'CHINA_VIP_MORNING'));
        setChinaVipAfternoonData(injectManualRecords(INITIAL_CHINA_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'CHINA_VIP_AFTERNOON'));
        setHangsengVipMorningData(injectManualRecords(INITIAL_HANGSENG_VIP_MORNING_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_MORNING'));
        setHangsengVipAfternoonData(injectManualRecords(INITIAL_HANGSENG_VIP_AFTERNOON_DATA, 'STOCKS_VIP', 'HANGSENG_VIP_AFTERNOON'));
      } else {
        localStorage.removeItem('lotto_data_nikkei_morning');
        localStorage.removeItem('lotto_data_nikkei_afternoon');
        localStorage.removeItem('lotto_data_china_morning');
        localStorage.removeItem('lotto_data_china_afternoon');
        localStorage.removeItem('lotto_data_hangseng_morning');
        localStorage.removeItem('lotto_data_hangseng_afternoon');
        setNikkeiMorningData(injectManualRecords(INITIAL_NIKKEI_MORNING_DATA, 'NIKKEI', 'NIKKEI_MORNING'));
        setNikkeiAfternoonData(injectManualRecords(INITIAL_NIKKEI_AFTERNOON_DATA, 'NIKKEI', 'NIKKEI_AFTERNOON'));
        setChinaMorningData(injectManualRecords(INITIAL_CHINA_MORNING_DATA, 'NIKKEI', 'CHINA_MORNING'));
        setChinaAfternoonData(injectManualRecords(INITIAL_CHINA_AFTERNOON_DATA, 'NIKKEI', 'CHINA_AFTERNOON'));
        setHangsengMorningData(injectManualRecords(INITIAL_HANGSENG_MORNING_DATA, 'NIKKEI', 'HANGSENG_MORNING'));
        setHangsengAfternoonData(injectManualRecords(INITIAL_HANGSENG_AFTERNOON_DATA, 'NIKKEI', 'HANGSENG_AFTERNOON'));
      }
      addToast('info', 'รีเซ็ตข้อมูลสำเร็จ', 'คืนค่าฐานข้อมูลสถิติต้นฉบับเรียบร้อย (คุ้มครองผลที่บันทึกเองไว้แล้ว)');
    }
  };

  const handleAutoFetch = async (isSilentArg?: any) => {
    const isSilent = typeof isSilentArg === 'boolean' ? isSilentArg : false;
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const nameMap: Record<LotteryType, string> = {
      NIKKEI: 'หุ้นปกติ',
      STOCKS_VIP: 'หวยหุ้น VIP',
      DOWJONES: 'ดาวโจนส์',
      LAOS: 'ลาวพัฒนา',
      MALAY: 'หวยมาเลย์',
      HANOI: 'ฮานอย',
      GSB: 'ออมสิน',
      GOVERNMENT: 'รัฐบาลไทย'
    };
    const lottoName = nameMap[lotteryType] || 'หวย';

    if (!isSilent) {
      addToast('info', 'กำลังซิงค์ข้อมูล...', `กำลังดึงผลรางวัลล่าสุดสำหรับ [${lottoName}] จาก exphuay.com`);
    }

    try {
      const liveResults = await fetchExphuayLiveResults(lotteryType);
      if (!liveResults || liveResults.length === 0) {
        if (!isSilent) {
          addToast('success', '✅ ซิงค์สำเร็จ (เป็นปัจจุบันแล้ว)', `สถิติ [${lottoName}] เป็นปัจจุบันล่าสุดแล้ว (อัปเดตเมื่อ ${nowStr} น.)`);
        }
        return;
      }

      let updatedTotalCount = 0;
      let protectedTotalCount = 0;

      const mergeDataset = (
        current: DrawResult[],
        sessionName: SessionType,
        lottoType: LotteryType
      ): { list: DrawResult[]; updatedCount: number; protectedCount: number } => {
        const items = liveResults.filter((r: DrawResult) => r.session === sessionName && r.lotteryType === lottoType);

        // All manual records from dedicated storage and current list
        const storedManuals = loadManualRecords().filter(
          (m) => m.lotteryType === lottoType && m.session === sessionName
        );
        const currentManuals = current.filter((d) => d.isManual);

        const manualMap = new Map<string, DrawResult>();
        storedManuals.forEach((m) => manualMap.set(m.date, m));
        currentManuals.forEach((m) => manualMap.set(m.date, m));

        let addedOrUpdated = 0;
        let protectedManuals = 0;
        const updatedList = [...current];

        for (const item of items) {
          const existingIdx = updatedList.findIndex((d) => d.date === item.date);
          const isUserManual = manualMap.has(item.date) || (existingIdx >= 0 && updatedList[existingIdx].isManual);

          if (isUserManual) {
            // Guard manual entry!
            const manualDraw = manualMap.get(item.date) || updatedList[existingIdx];
            
            // Check if web has valid non-placeholder data
            const isWebValid = 
              item.top3 && item.top3.length === 3 && item.top3 !== '000' && item.top3 !== '---' &&
              item.bottom2 && item.bottom2.length === 2 && item.bottom2 !== '--';

            if (!isWebValid) {
              // Web is not yet updated or returned dummy/incomplete data
              // Strict protection: preserve user's manual entry
              protectedManuals++;
              if (existingIdx >= 0) {
                updatedList[existingIdx] = { ...manualDraw, isManual: true };
              } else {
                updatedList.unshift({ ...manualDraw, isManual: true });
              }
              continue;
            }

            // Web has valid numbers: check if they match manual entry
            if (manualDraw.top3 === item.top3 && manualDraw.bottom2 === item.bottom2) {
              // Match! Retain record and keep isManual: true
              if (existingIdx >= 0) {
                updatedList[existingIdx] = { ...item, ...manualDraw, isManual: true };
              }
              protectedManuals++;
            } else {
              // If web differs, protect user's manual entry as priority
              protectedManuals++;
              if (existingIdx >= 0) {
                updatedList[existingIdx] = { ...manualDraw, isManual: true };
              }
            }
          } else {
            // Normal online item (not manual)
            if (existingIdx >= 0) {
              if (
                updatedList[existingIdx].top3 !== item.top3 ||
                updatedList[existingIdx].bottom2 !== item.bottom2
              ) {
                updatedList[existingIdx] = { ...updatedList[existingIdx], ...item };
                addedOrUpdated++;
              }
            } else {
              updatedList.unshift(item);
              addedOrUpdated++;
            }
          }
        }

        // Guarantee all manual records for this session remain in updatedList even if web omitted them
        manualMap.forEach((manualDraw, date) => {
          const idx = updatedList.findIndex((d) => d.date === date);
          if (idx < 0) {
            updatedList.unshift({ ...manualDraw, isManual: true });
            protectedManuals++;
          } else {
            updatedList[idx] = { ...updatedList[idx], ...manualDraw, isManual: true };
          }
        });

        updatedList.sort((a, b) => b.date.localeCompare(a.date));
        return { list: updatedList, updatedCount: addedOrUpdated, protectedCount: protectedManuals };
      };

      const nikkeiM = mergeDataset(nikkeiMorningData, 'NIKKEI_MORNING', 'NIKKEI');
      if (nikkeiM.updatedCount > 0) {
        setNikkeiMorningData(nikkeiM.list);
        syncSaveToCloud('lotto_data_nikkei_morning', nikkeiM.list);
      }
      updatedTotalCount += nikkeiM.updatedCount;
      protectedTotalCount += nikkeiM.protectedCount;

      const nikkeiA = mergeDataset(nikkeiAfternoonData, 'NIKKEI_AFTERNOON', 'NIKKEI');
      if (nikkeiA.updatedCount > 0) {
        setNikkeiAfternoonData(nikkeiA.list);
        syncSaveToCloud('lotto_data_nikkei_afternoon', nikkeiA.list);
      }
      updatedTotalCount += nikkeiA.updatedCount;
      protectedTotalCount += nikkeiA.protectedCount;

      const chinaM = mergeDataset(chinaMorningData, 'CHINA_MORNING', 'NIKKEI');
      if (chinaM.updatedCount > 0) {
        setChinaMorningData(chinaM.list);
        syncSaveToCloud('lotto_data_china_morning', chinaM.list);
      }
      updatedTotalCount += chinaM.updatedCount;
      protectedTotalCount += chinaM.protectedCount;

      const chinaA = mergeDataset(chinaAfternoonData, 'CHINA_AFTERNOON', 'NIKKEI');
      if (chinaA.updatedCount > 0) {
        setChinaAfternoonData(chinaA.list);
        syncSaveToCloud('lotto_data_china_afternoon', chinaA.list);
      }
      updatedTotalCount += chinaA.updatedCount;
      protectedTotalCount += chinaA.protectedCount;

      const hangsengM = mergeDataset(hangsengMorningData, 'HANGSENG_MORNING', 'NIKKEI');
      if (hangsengM.updatedCount > 0) {
        setHangsengMorningData(hangsengM.list);
        syncSaveToCloud('lotto_data_hangseng_morning', hangsengM.list);
      }
      updatedTotalCount += hangsengM.updatedCount;
      protectedTotalCount += hangsengM.protectedCount;

      const hangsengA = mergeDataset(hangsengAfternoonData, 'HANGSENG_AFTERNOON', 'NIKKEI');
      if (hangsengA.updatedCount > 0) {
        setHangsengAfternoonData(hangsengA.list);
        syncSaveToCloud('lotto_data_hangseng_afternoon', hangsengA.list);
      }
      updatedTotalCount += hangsengA.updatedCount;
      protectedTotalCount += hangsengA.protectedCount;

      const laos = mergeDataset(laosData, 'LAOS_EVENING', 'LAOS');
      if (laos.updatedCount > 0) {
        setLaosData(laos.list);
        syncSaveToCloud('lotto_data_laos', laos.list);
      }
      updatedTotalCount += laos.updatedCount;
      protectedTotalCount += laos.protectedCount;

      const laosStar = mergeDataset(laosStarData, 'LAOS_STAR_DAY', 'LAOS_STAR');
      if (laosStar.updatedCount > 0) {
        setLaosStarData(laosStar.list);
        syncSaveToCloud('lotto_data_laos_star', laosStar.list);
      }
      updatedTotalCount += laosStar.updatedCount;
      protectedTotalCount += laosStar.protectedCount;

      const malay = mergeDataset(malayData, 'MALAY_EVENING', 'MALAY');
      if (malay.updatedCount > 0) {
        setMalayData(malay.list);
        syncSaveToCloud('lotto_data_malay', malay.list);
      }
      updatedTotalCount += malay.updatedCount;
      protectedTotalCount += malay.protectedCount;

      const dowjones = mergeDataset(dowjonesData, 'DOWJONES_NIGHT', 'DOWJONES');
      if (dowjones.updatedCount > 0) {
        setDowjonesData(dowjones.list);
        syncSaveToCloud('lotto_data_dowjones', dowjones.list);
      }
      updatedTotalCount += dowjones.updatedCount;
      protectedTotalCount += dowjones.protectedCount;

      const hanoiSpec = mergeDataset(hanoiSpecialData, 'HANOI_SPECIAL', 'HANOI');
      if (hanoiSpec.updatedCount > 0) {
        setHanoiSpecialData(hanoiSpec.list);
        syncSaveToCloud('lotto_data_hanoi_special', hanoiSpec.list);
      }
      updatedTotalCount += hanoiSpec.updatedCount;
      protectedTotalCount += hanoiSpec.protectedCount;

      const hanoiNorm = mergeDataset(hanoiData, 'HANOI_EVENING', 'HANOI');
      if (hanoiNorm.updatedCount > 0) {
        setHanoiData(hanoiNorm.list);
        syncSaveToCloud('lotto_data_hanoi', hanoiNorm.list);
      }
      updatedTotalCount += hanoiNorm.updatedCount;
      protectedTotalCount += hanoiNorm.protectedCount;

      const hanoiVip = mergeDataset(hanoiVipData, 'HANOI_VIP', 'HANOI');
      if (hanoiVip.updatedCount > 0) {
        setHanoiVipData(hanoiVip.list);
        syncSaveToCloud('lotto_data_hanoi_vip', hanoiVip.list);
      }
      updatedTotalCount += hanoiVip.updatedCount;
      protectedTotalCount += hanoiVip.protectedCount;

      const gsb = mergeDataset(gsbData, 'GSB_BIWEEKLY', 'GSB');
      if (gsb.updatedCount > 0) {
        setGsbData(gsb.list);
        syncSaveToCloud('lotto_data_gsb', gsb.list);
      }
      updatedTotalCount += gsb.updatedCount;
      protectedTotalCount += gsb.protectedCount;

      const gov = mergeDataset(govData, 'GOV_BIWEEKLY', 'GOVERNMENT');
      if (gov.updatedCount > 0) {
        setGovData(gov.list);
        syncSaveToCloud('lotto_data_gov', gov.list);
      }
      updatedTotalCount += gov.updatedCount;
      protectedTotalCount += gov.protectedCount;

      const nikkeiVipM = mergeDataset(nikkeiVipMorningData, 'NIKKEI_VIP_MORNING', 'STOCKS_VIP');
      if (nikkeiVipM.updatedCount > 0) {
        setNikkeiVipMorningData(nikkeiVipM.list);
        syncSaveToCloud('lotto_data_nikkei_vip_morning', nikkeiVipM.list);
      }
      updatedTotalCount += nikkeiVipM.updatedCount;
      protectedTotalCount += nikkeiVipM.protectedCount;

      const nikkeiVipA = mergeDataset(nikkeiVipAfternoonData, 'NIKKEI_VIP_AFTERNOON', 'STOCKS_VIP');
      if (nikkeiVipA.updatedCount > 0) {
        setNikkeiVipAfternoonData(nikkeiVipA.list);
        syncSaveToCloud('lotto_data_nikkei_vip_afternoon', nikkeiVipA.list);
      }
      updatedTotalCount += nikkeiVipA.updatedCount;
      protectedTotalCount += nikkeiVipA.protectedCount;

      const chinaVipM = mergeDataset(chinaVipMorningData, 'CHINA_VIP_MORNING', 'STOCKS_VIP');
      if (chinaVipM.updatedCount > 0) {
        setChinaVipMorningData(chinaVipM.list);
        syncSaveToCloud('lotto_data_china_vip_morning', chinaVipM.list);
      }
      updatedTotalCount += chinaVipM.updatedCount;
      protectedTotalCount += chinaVipM.protectedCount;

      const chinaVipA = mergeDataset(chinaVipAfternoonData, 'CHINA_VIP_AFTERNOON', 'STOCKS_VIP');
      if (chinaVipA.updatedCount > 0) {
        setChinaVipAfternoonData(chinaVipA.list);
        syncSaveToCloud('lotto_data_china_vip_afternoon', chinaVipA.list);
      }
      updatedTotalCount += chinaVipA.updatedCount;
      protectedTotalCount += chinaVipA.protectedCount;

      const hangsengVipM = mergeDataset(hangsengVipMorningData, 'HANGSENG_VIP_MORNING', 'STOCKS_VIP');
      if (hangsengVipM.updatedCount > 0) setHangsengVipMorningData(hangsengVipM.list);
      updatedTotalCount += hangsengVipM.updatedCount;
      protectedTotalCount += hangsengVipM.protectedCount;

      const hangsengVipA = mergeDataset(hangsengVipAfternoonData, 'HANGSENG_VIP_AFTERNOON', 'STOCKS_VIP');
      if (hangsengVipA.updatedCount > 0) setHangsengVipAfternoonData(hangsengVipA.list);
      updatedTotalCount += hangsengVipA.updatedCount;
      protectedTotalCount += hangsengVipA.protectedCount;

      setManualRecords(loadManualRecords());

      const protectMsg = protectedTotalCount > 0 ? ` (🛡️ คุ้มครองผลบันทึกเอง ${protectedTotalCount} งวด ปลอดภัยไม่ถูกลบ)` : '';
      if (updatedTotalCount > 0) {
        addToast('success', '🔄 ซิงค์ผลรางวัลสำเร็จ!', `อัปเดตผลรางวัลใหม่ ${updatedTotalCount} รายการจาก exphuay.com เรียบร้อยแล้ว${protectMsg} (เวลา ${nowStr} น.)`);
      } else if (!isSilent) {
        addToast('success', '✅ ข้อมูลเป็นปัจจุบันแล้ว', `ซิงค์สถิติ [${lottoName}] ล่าสุดเรียบร้อยแล้ว${protectMsg} (อัปเดตเมื่อ ${nowStr} น.)`);
      }
    } catch (err: any) {
      console.error('Auto fetch failed:', err);
      if (!isSilent) {
        addToast('error', 'ซิงค์ผลไม่สำเร็จ', err.message || 'ไม่สามารถเชื่อมต่อ exphuay.com ได้');
      }
    }
  };

  const handleVerifyManualRecords = async () => {
    setIsVerifyingManual(true);
    await handleAutoFetch(false);
    setIsVerifyingManual(false);
  };

  // Background auto-sync on app mount
  useEffect(() => {
    handleAutoFetch(true);
  }, []);

  // Helper for subbanner card matching 0a787ed2
  const getMarketCodeBadge = () => {
    const isVip = lotteryType === 'STOCKS_VIP';
    const vipPrefix = isVip ? '💎 ' : '';
    if (lotteryType === 'HANOI') return 'VN';
    if (lotteryType === 'LAOS') return 'LA';
    if (lotteryType === 'MALAY') return 'MY';
    if (lotteryType === 'DOWJONES') return 'US';
    if (lotteryType === 'GSB') return 'GSB';
    if (lotteryType === 'GOVERNMENT') return 'TH';
    if (selectedSession.startsWith('CHINA')) return `${vipPrefix}CN`;
    if (selectedSession.startsWith('HANGSENG')) return `${vipPrefix}HK`;
    if (selectedSession.startsWith('NIKKEI')) return `${vipPrefix}NK`;
    return `${vipPrefix}VIP`;
  };

  const getSubbannerTitleAndSubtitle = () => {
    let title = '';
    let subtitle = '';

    if (lotteryType === 'NIKKEI') {
      if (selectedSession === 'CHINA_MORNING') {
        title = 'หวยหุ้นจีน รอบเช้า (10:35 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีนรอบเช้า ปิดตลาด 10:35 น. อ้างอิง exphuay (SZSE)';
      } else if (selectedSession === 'CHINA_AFTERNOON') {
        title = 'หวยหุ้นจีน รอบบ่าย (14:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีนรอบบ่าย ปิดตลาด 14:00 น. อ้างอิง exphuay (SZSE)';
      } else if (selectedSession === 'CHINA_BOTH') {
        title = 'หวยหุ้นจีน ควบ 2 รอบ (เช้า 10:35 / บ่าย 14:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีนควบเช้า-บ่าย 2 รอบ (10:35 / 14:00 น.)';
      } else if (selectedSession === 'HANGSENG_MORNING') {
        title = 'หวยหุ้นฮั่งเส็ง รอบเช้า (11:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็งรอบเช้า ปิดตลาด 11:00 น. อ้างอิง exphuay (HSI)';
      } else if (selectedSession === 'HANGSENG_AFTERNOON') {
        title = 'หวยหุ้นฮั่งเส็ง รอบบ่าย (15:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็งรอบบ่าย ปิดตลาด 15:00 น. อ้างอิง exphuay (HSI)';
      } else if (selectedSession === 'HANGSENG_BOTH') {
        title = 'หวยหุ้นฮั่งเส็ง ควบ 2 รอบ (เช้า 11:00 / บ่าย 15:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็งควบเช้า-บ่าย 2 รอบ (11:00 / 15:00 น.)';
      } else if (selectedSession === 'NIKKEI_MORNING' || selectedSession === 'MORNING') {
        title = 'หวยหุ้นนิคเคอิเช้า (รอบ 09:30 น.)';
        subtitle = 'คำนวณแนวทางรอบเช้าจากสถิติตลาดหุ้นญี่ปุ่นเปิดรอบแรก';
      } else if (selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON') {
        title = 'หวยหุ้นนิคเคอิบ่าย (รอบ 13:00 น.)';
        subtitle = 'คำนวณแนวทางรอบบ่าย พร้อมวิเคราะห์เลขไหลต่อเนื่องจากรอบเช้า';
      } else if (selectedSession === 'NIKKEI_BOTH' || selectedSession === 'BOTH') {
        title = 'วิเคราะห์รวมนิคเคอิ 2 รอบ (เช้า 09:30 / บ่าย 13:00 น.)';
        subtitle = 'คำนวณแนวทางรอบเช้าและบ่ายจากสถิติตลาดหุ้นญี่ปุ่น';
      } else {
        title = 'รวมทุกหุ้นปกติ 3 ตลาด (นิเคอิ / จีน / ฮั่งเส็ง รวม 6 รอบ)';
        subtitle = 'วิเคราะห์ความน่าจะเป็นรวมทุกหุ้นปกติ 3 ประเทศ (นิเคอิ / จีน / ฮั่งเส็ง)';
      }
    } else if (lotteryType === 'STOCKS_VIP') {
      if (selectedSession === 'CHINA_VIP_MORNING') {
        title = 'หวยหุ้นจีน VIP รอบเช้า (09:30 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีน VIP รอบเช้า ปิดตลาด 09:30 น. ออกผลทุกวัน';
      } else if (selectedSession === 'CHINA_VIP_AFTERNOON') {
        title = 'หวยหุ้นจีน VIP รอบบ่าย (13:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีน VIP รอบบ่าย ปิดตลาด 13:00 น. ออกผลทุกวัน';
      } else if (selectedSession === 'CHINA_VIP_BOTH') {
        title = 'หวยหุ้นจีน VIP ควบ 2 รอบ (เช้า 09:30 / บ่าย 13:00 น.)';
        subtitle = 'คำนวณแนวทางหุ้นจีน VIP ควบเช้า-บ่าย 2 รอบ (09:30 / 13:00 น.)';
      } else if (selectedSession === 'HANGSENG_VIP_MORNING') {
        title = 'หวยหุ้นฮั่งเส็ง VIP รอบเช้า (10:55 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP รอบเช้า ปิดตลาด 10:55 น. ออกผลทุกวัน';
      } else if (selectedSession === 'HANGSENG_VIP_AFTERNOON') {
        title = 'หวยหุ้นฮั่งเส็ง VIP รอบบ่าย (14:55 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP รอบบ่าย ปิดตลาด 14:55 น. ออกผลทุกวัน';
      } else if (selectedSession === 'HANGSENG_VIP_BOTH') {
        title = 'หวยหุ้นฮั่งเส็ง VIP ควบ 2 รอบ (เช้า 10:55 / บ่าย 14:55 น.)';
        subtitle = 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP ควบเช้า-บ่าย 2 รอบ (10:55 / 14:55 น.)';
      } else if (selectedSession === 'NIKKEI_VIP_MORNING') {
        title = 'หวยหุ้นนิคเคอิ VIP เช้า (รอบ 08:30 น.)';
        subtitle = 'คำนวณแนวทางรอบเช้าจากสถิติตลาดหุ้นนิเคอิ VIP เปิดรอบแรก';
      } else if (selectedSession === 'NIKKEI_VIP_AFTERNOON') {
        title = 'หวยหุ้นนิคเคอิ VIP บ่าย (รอบ 12:00 น.)';
        subtitle = 'คำนวณแนวทางรอบบ่าย พร้อมวิเคราะห์เลขไหลต่อเนื่องจากรอบเช้า';
      } else if (selectedSession === 'NIKKEI_VIP_BOTH') {
        title = 'วิเคราะห์รวมนิคเคอิ VIP 2 รอบ (เช้า 08:30 / บ่าย 12:00 น.)';
        subtitle = 'คำนวณแนวทางรอบเช้าและบ่ายจากสถิติตลาดหุ้นนิเคอิ VIP';
      } else {
        title = 'รวมทุกหุ้น VIP 3 ตลาด (นิเคอิ VIP / จีน VIP / ฮั่งเส็ง VIP รวม 6 รอบ)';
        subtitle = 'วิเคราะห์ความน่าจะเป็นรวมทุกหุ้น VIP 3 ประเทศ (นิเคอิ VIP / จีน VIP / ฮั่งเส็ง VIP)';
      }
    } else if (lotteryType === 'HANOI') {
      if (selectedSession === 'HANOI_SPECIAL') {
        title = 'หวยฮานอยพิเศษ (รอบ 17:30 น. - อ้างอิง exphuay xsthm)';
        subtitle = 'คำนวณแนวทางสถิติหวยฮานอยพิเศษ ย้อนหลัง 3 เดือน อ้างอิง exphuay';
      } else if (selectedSession === 'HANOI_EVENING') {
        title = 'หวยฮานอยปกติ (รอบ 18:30 น. - อ้างอิง exphuay Minh Ngoc)';
        subtitle = 'คำนวณแนวทางสถิติหวยฮานอยปกติ ย้อนหลัง 3 เดือน อ้างอิง exphuay (Minh Ngoc)';
      } else if (selectedSession === 'HANOI_VIP') {
        title = 'หวยฮานอย VIP (รอบ 19:30 น. - อ้างอิง exphuay mlnhngo)';
        subtitle = 'คำนวณแนวทางสถิติหวยฮานอย VIP ย้อนหลัง 3 เดือน อ้างอิง exphuay';
      } else {
        title = 'วิเคราะห์รวม 3 หวยฮานอย (17:30 / 18:30 / 19:30) ดักเด่นรูด 3 รอบ';
        subtitle = 'คำนวณแนวทางสถิติรวม 3 รอบฮานอย ดักทางเลขเด่นวิ่ง-รูด 3 รอบ';
      }
    } else if (lotteryType === 'LAOS') {
      title = 'หวยลาวพัฒนา (ออกทุกวัน รอบ 20:30 น.)';
      subtitle = 'คำนวณแนวทางสถิติหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวล่าง ย้อนหลัง 3 เดือน';
    } else if (lotteryType === 'MALAY') {
      title = 'หวยมาเลย์ Magnum 4D (รอบ 18:30 น.)';
      subtitle = 'คำนวณแนวทางสถิติหวยมาเลย์ Magnum 4D ย้อนหลัง 3 เดือน';
    } else if (lotteryType === 'DOWJONES') {
      title = 'หวยหุ้นดาวโจนส์ (รอบ 04:00 น. เช้ามืด - อ้างอิง exphuay)';
      subtitle = 'คำนวณแนวทางสถิติหวยหุ้นดาวโจนส์ ดัชนีปิดตลาดสหรัฐฯ ย้อนหลัง 3 เดือน อ้างอิง exphuay';
    } else if (lotteryType === 'GSB') {
      title = 'หวยออมสิน (ออกวันที่ 1 และ 16 เวลา 13:00 น. - อ้างอิง exphuay GSB)';
      subtitle = 'คำนวณแนวทางสถิติหวยออมสิน ย้อนหลัง 6 เดือนเต็ม (มีนาคม - สิงหาคม) อ้างอิง exphuay (GSB)';
    } else if (lotteryType === 'GOVERNMENT') {
      title = 'หวยรัฐบาลไทย (ออกวันที่ 1 และ 16 เวลา 15:30 น. - อ้างอิง exphuay)';
      subtitle = 'คำนวณแนวทางสถิติหวยรัฐบาลไทย ย้อนหลัง 6 เดือนเต็ม (มีนาคม - สิงหาคม) อ้างอิง exphuay';
    }

    return { title, subtitle };
  };

  const renderSubbannerSessionButtons = () => {
    if (lotteryType === 'NIKKEI') {
      if (selectedSession.startsWith('CHINA')) {
        return (
          <>
            <button
              onClick={() => setSelectedSession('CHINA_BOTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_BOTH'
                  ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️-🌙 รวมเช้า-บ่าย
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_MORNING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_MORNING'
                  ? 'bg-rose-500 text-white font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️ เช้า 10:35
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_AFTERNOON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_AFTERNOON'
                  ? 'bg-red-600 text-white font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🌙 บ่าย 14:00
            </button>
          </>
        );
      }
      if (selectedSession.startsWith('HANGSENG')) {
        return (
          <>
            <button
              onClick={() => setSelectedSession('HANGSENG_BOTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_BOTH'
                  ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️-🌙 รวมเช้า-บ่าย
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_MORNING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_MORNING'
                  ? 'bg-emerald-400 text-black font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️ เช้า 11:00
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_AFTERNOON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_AFTERNOON'
                  ? 'bg-teal-400 text-black font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🌙 บ่าย 15:00
            </button>
          </>
        );
      }
      if (selectedSession === 'STOCKS_ALL_3') {
        return (
          <>
            <button
              onClick={() => setSelectedSession('NIKKEI_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              ☀️ นิคเคอิ
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              🇨🇳 จีน
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              🇭🇰 ฮั่งเส็ง
            </button>
          </>
        );
      }
      // NIKKEI
      return (
        <>
          <button
            onClick={() => setSelectedSession('NIKKEI_BOTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_BOTH' || selectedSession === 'BOTH'
                ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ☀️-🌙 รวมเช้า-บ่าย
          </button>
          <button
            onClick={() => setSelectedSession('NIKKEI_MORNING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_MORNING' || selectedSession === 'MORNING'
                ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ☀️ เช้า 09:30
          </button>
          <button
            onClick={() => setSelectedSession('NIKKEI_AFTERNOON')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON'
                ? 'bg-cyan-400 text-black font-extrabold shadow-glow-cyan'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🌙 บ่าย 13:00
          </button>
        </>
      );
    }

    if (lotteryType === 'STOCKS_VIP') {
      if (selectedSession.startsWith('CHINA')) {
        return (
          <>
            <button
              onClick={() => setSelectedSession('CHINA_VIP_BOTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_VIP_BOTH'
                  ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️-🌙 รวมเช้า-บ่าย
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_VIP_MORNING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_VIP_MORNING'
                  ? 'bg-rose-500 text-white font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️ เช้า 09:30
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_VIP_AFTERNOON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'CHINA_VIP_AFTERNOON'
                  ? 'bg-red-600 text-white font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🌙 บ่าย 14:00
            </button>
          </>
        );
      }
      if (selectedSession.startsWith('HANGSENG')) {
        return (
          <>
            <button
              onClick={() => setSelectedSession('HANGSENG_VIP_BOTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_VIP_BOTH'
                  ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️-🌙 รวมเช้า-บ่าย
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_VIP_MORNING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_VIP_MORNING'
                  ? 'bg-cyan-400 text-black font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              ☀️ เช้า 11:00
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_VIP_AFTERNOON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSession === 'HANGSENG_VIP_AFTERNOON'
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              🌙 บ่าย 15:30
            </button>
          </>
        );
      }
      if (selectedSession === 'STOCKS_VIP_ALL_3') {
        return (
          <>
            <button
              onClick={() => setSelectedSession('NIKKEI_VIP_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              ☀️ นิคเคอิ VIP
            </button>
            <button
              onClick={() => setSelectedSession('CHINA_VIP_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              🇨🇳 จีน VIP
            </button>
            <button
              onClick={() => setSelectedSession('HANGSENG_VIP_BOTH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-gray-300 hover:bg-white/20 cursor-pointer"
            >
              🇭🇰 ฮั่งเส็ง VIP
            </button>
          </>
        );
      }
      // NIKKEI VIP
      return (
        <>
          <button
            onClick={() => setSelectedSession('NIKKEI_VIP_BOTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_VIP_BOTH'
                ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ☀️-🌙 รวมเช้า-บ่าย
          </button>
          <button
            onClick={() => setSelectedSession('NIKKEI_VIP_MORNING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_VIP_MORNING'
                ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ☀️ เช้า 09:30
          </button>
          <button
            onClick={() => setSelectedSession('NIKKEI_VIP_AFTERNOON')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'NIKKEI_VIP_AFTERNOON'
                ? 'bg-cyan-400 text-black font-extrabold shadow-glow-cyan'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🌙 บ่าย 13:00
          </button>
        </>
      );
    }

    if (lotteryType === 'HANOI') {
      return (
        <>
          <button
            onClick={() => setSelectedSession('HANOI_ALL_3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'HANOI_ALL_3'
                ? 'bg-emerald-500 text-black font-extrabold shadow-glow-emerald'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ✨ รวม 3 ฮานอย
          </button>
          <button
            onClick={() => setSelectedSession('HANOI_SPECIAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'HANOI_SPECIAL'
                ? 'bg-amber-400 text-black font-extrabold shadow-glow-gold'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🟠 พิเศษ (17:30)
          </button>
          <button
            onClick={() => setSelectedSession('HANOI_EVENING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'HANOI_EVENING'
                ? 'bg-red-500 text-white font-extrabold shadow-md'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🔴 ปกติ (18:30)
          </button>
          <button
            onClick={() => setSelectedSession('HANOI_VIP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSession === 'HANOI_VIP'
                ? 'bg-purple-500 text-white font-extrabold shadow-md'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🟣 VIP (19:30)
          </button>
        </>
      );
    }

    return null;
  };

  // Theme mode styling generator
  const getThemeClass = () => {
    return themeMode === 'LIGHT'
      ? 'theme-light bg-[#fff7ed] text-[#78350f] selection:bg-amber-500 selection:text-black'
      : 'theme-dark bg-[#140b04] text-[#fffbeb] selection:bg-amber-500 selection:text-black';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col relative overflow-hidden ${getThemeClass()}`}>
      
      {/* Ambient background glows for Modern Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-500/[0.05] rounded-full blur-[140px]" />
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Navbar */}
      <Navbar
        lotteryType={lotteryType}
        onSelectLotteryType={setLotteryType}
        drawCount={activeDataset.length}
        latestDate={activeDataset[0]?.dateFormatted || '-'}
        selectedSession={selectedSession}
        onSelectSession={setSelectedSession}
        onResetData={handleResetData}
        onAutoFetch={handleAutoFetch}
        themeMode={themeMode}
        onSelectThemeMode={setThemeMode}
        manualCount={manualRecords.length}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Subbanner Card: ขณะนี้กำลังวิเคราะห์ */}
        <div className="bg-[#2a170b] border-2 border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 uppercase tracking-wider shadow-md">
              {getMarketCodeBadge()}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1.5 flex-wrap">
                <span>ขณะนี้กำลังวิเคราะห์:</span>
                <span className="text-yellow-300 font-extrabold">{getSubbannerTitleAndSubtitle().title}</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-amber-200/70 mt-0.5">
                {getSubbannerTitleAndSubtitle().subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {renderSubbannerSessionButtons()}
            <button
              onClick={() => { setEditingDraw(null); setIsAddModalOpen(true); }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-black hover:brightness-110 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-glow-gold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ ใส่ผลรางวัลใหม่</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Responsive Swipeable on Mobile, Grid on Desktop) */}
        <div className="flex lg:grid lg:grid-cols-7 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 touch-pan-x border-b border-nikkei-border/60">
          
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">หน้าหลัก & คาดการณ์งวดถัดไป</span>
          </button>

          <button
            onClick={() => setActiveTab('PROBABILITY')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'PROBABILITY'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span className="truncate">% ความน่าจะเป็น (0-9 Matrix)</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'HISTORY'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4 shrink-0" />
            <span className="truncate">ตารางสถิติย้อนหลัง ({activeDataset.length} งวด)</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'CALENDAR'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">ปฏิทินวันเปิด-ปิดประจำเดือน</span>
          </button>

          <button
            onClick={() => setActiveTab('FORMULAS')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'FORMULAS'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span className="truncate">สูตรวิเคราะห์ 5 รูปแบบ</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKTEST')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'BACKTEST'
                ? 'bg-emerald-500 text-black shadow-glow-emerald scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">พิสูจน์ผลย้อนหลัง (Backtest)</span>
          </button>

          <button
            onClick={() => setActiveTab('WIN_GEN')}
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 transition-all duration-200 ${
              activeTab === 'WIN_GEN'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'glass-panel hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">เครื่องมือจับเลขวิน</span>
          </button>

        </div>

        {/* Day of Week Frequency Analyzer (Positioned directly under the 7 Navigation Tabs) */}
        <DayOfWeekAnalyzer
          data={activeDataset}
          allData={
            lotteryType === 'HANOI'
              ? allHanoiData
              : lotteryType === 'NIKKEI'
              ? allStockData
              : lotteryType === 'STOCKS_VIP'
              ? allStockVipData
              : activeDataset
          }
          lotteryType={lotteryType}
          selectedSession={selectedSession}
        />

        {/* Tab Content Display */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <PredictionCard
              prediction={currentPrediction}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              drawOffset={drawOffset}
              totalDraws={maxDrawOffset}
              pastDrawResult={pastDrawResult}
              latestDrawResult={activeDataset[0]}
              allHanoiData={allHanoiData}
              prevDrawLabel={prevDrawLabel}
              nextDrawLabel={nextDrawLabel}
              onPrevDraw={() => setDrawOffset((prev) => Math.min(prev + 1, maxDrawOffset))}
              onNextDraw={() => setDrawOffset((prev) => Math.max(prev - 1, 0))}
            />
            <div id="history-table-section">
              <HistoryTable
                data={activeDataset}
                lotteryType={lotteryType}
                onAddDraw={handleAddDraw}
                onOpenAddModal={() => { setEditingDraw(null); setIsAddModalOpen(true); }}
                onOpenEditModal={(draw) => { setEditingDraw(draw); setIsAddModalOpen(true); }}
                onDeleteDraw={handleDeleteDraw}
              />
            </div>
          </div>
        )}

        {activeTab === 'PROBABILITY' && (
          <div className="space-y-6">
            <ProbabilityChart stats={digitStats} totalDraws={activeDataset.length} />
            <PredictionCard
              prediction={currentPrediction}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              drawOffset={drawOffset}
              totalDraws={maxDrawOffset}
              pastDrawResult={pastDrawResult}
              latestDrawResult={activeDataset[0]}
              allHanoiData={allHanoiData}
              prevDrawLabel={prevDrawLabel}
              nextDrawLabel={nextDrawLabel}
              onPrevDraw={() => setDrawOffset((prev) => Math.min(prev + 1, maxDrawOffset))}
              onNextDraw={() => setDrawOffset((prev) => Math.max(prev - 1, 0))}
            />
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-6">
            <HistoryTable
              data={activeDataset}
              lotteryType={lotteryType}
              onAddDraw={handleAddDraw}
              onOpenAddModal={() => { setEditingDraw(null); setIsAddModalOpen(true); }}
              onOpenEditModal={(draw) => { setEditingDraw(draw); setIsAddModalOpen(true); }}
              onDeleteDraw={handleDeleteDraw}
            />
          </div>
        )}

        {activeTab === 'FORMULAS' && (
          <div className="space-y-6">
            <FormulaCalculator formulas={formulas} />
            <PredictionCard
              prediction={currentPrediction}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              drawOffset={drawOffset}
              totalDraws={activeDataset.length}
              pastDrawResult={pastDrawResult}
              latestDrawResult={activeDataset[0]}
              allHanoiData={allHanoiData}
              prevDrawLabel={prevDrawLabel}
              nextDrawLabel={nextDrawLabel}
              onPrevDraw={() => setDrawOffset((prev) => Math.min(prev + 1, activeDataset.length))}
              onNextDraw={() => setDrawOffset((prev) => Math.max(prev - 1, 0))}
            />
          </div>
        )}

        {activeTab === 'BACKTEST' && (
          <div className="space-y-6">
            <BacktestView data={activeDataset} formulas={formulas} lotteryType={lotteryType} />
          </div>
        )}

        {activeTab === 'WIN_GEN' && (
          <div className="space-y-6">
            <WinGenerator initialDigits={currentPrediction.win19Digits} />
          </div>
        )}

        {activeTab === 'CALENDAR' && (
          <div className="space-y-6">
            <MonthlyCalendarView data={activeDataset} lotteryType={lotteryType} selectedSession={selectedSession} />
          </div>
        )}

      </main>

      {/* Global Modal for Adding or Editing Draw */}
      <AddDrawModal
        isOpen={isAddModalOpen}
        lotteryType={lotteryType}
        selectedSession={selectedSession}
        initialData={editingDraw}
        onClose={() => { setIsAddModalOpen(false); setEditingDraw(null); }}
        onAddDraw={handleAddDraw}
        onEditDraw={handleEditDraw}
      />

      {/* Manual Records Protection & Verification Modal */}
      <ManualRecordsModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        manualRecords={manualRecords}
        onOpenEditModal={(draw) => {
          setEditingDraw(draw);
          setIsAddModalOpen(true);
        }}
        onDeleteDraw={(id, date, lType, sType) => {
          handleDeleteDraw(id, date, lType, sType);
        }}
        onOpenAddModal={() => {
          setEditingDraw(null);
          setIsAddModalOpen(true);
        }}
        onVerifyWithWeb={handleVerifyManualRecords}
        isVerifying={isVerifyingManual}
        lotteryType={lotteryType}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-nikkei-border/70 py-6 text-center text-xs text-gray-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AI Predictor & Statistical Calculator (นิคเคอิ, หวยหุ้น VIP, ฮานอย, ลาวพัฒนา, หวยหุ้นดาวโจนส์). อ้างอิงผลจาก exphuay & LottoTH</span>
          <span className="text-amber-400/90 font-medium">สถิติย้อนหลังครอบคลุมทุกตลาด VIP 759 งวด</span>
        </div>
      </footer>

    </div>
  );
}
