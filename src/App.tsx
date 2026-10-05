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
  INITIAL_NIKKEI_MORNING_DATA,
  INITIAL_NIKKEI_AFTERNOON_DATA,
  INITIAL_CHINA_MORNING_DATA,
  INITIAL_CHINA_AFTERNOON_DATA,
  INITIAL_HANGSENG_MORNING_DATA,
  INITIAL_HANGSENG_AFTERNOON_DATA,
  ALL_STOCKS_DATA
} from './data/nikkeiData';
import {
  INITIAL_NIKKEI_VIP_MORNING_DATA,
  INITIAL_NIKKEI_VIP_AFTERNOON_DATA,
  INITIAL_CHINA_VIP_MORNING_DATA,
  INITIAL_CHINA_VIP_AFTERNOON_DATA,
  INITIAL_HANGSENG_VIP_MORNING_DATA,
  INITIAL_HANGSENG_VIP_AFTERNOON_DATA
} from './data/stockVipData';
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
import { DayOfWeekAnalyzer } from './components/DayOfWeekAnalyzer';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Sparkles, BarChart2, Table, Cpu, Layers, PlusCircle, ShieldCheck, Calendar } from 'lucide-react';
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

const loadPersistedData = (key: string, fallback: DrawResult[]): DrawResult[] => {
  try {
    const isHanoiKey = key.startsWith('lotto_data_hanoi');
    const isStockKey = key.startsWith('lotto_data_nikkei') || key.startsWith('lotto_data_china') || key.startsWith('lotto_data_hangseng');
    if (isHanoiKey || isStockKey) {
      const keyVersion = localStorage.getItem(`${key}_v5_authentic_stock_import`);
      if (keyVersion !== 'true') {
        localStorage.removeItem(key);
        localStorage.setItem(`${key}_v5_authentic_stock_import`, 'true');
        return fallback.map(fixDrawDate);
      }
    }

    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(fixDrawDate);
      }
    }
  } catch (err) {
    console.error(`Failed to load persisted lotto data for ${key}:`, err);
  }
  return fallback.map(fixDrawDate);
};

export default function App() {
  const [lotteryType, setLotteryType] = useState<LotteryType>(() => {
    const saved = localStorage.getItem('lotto_active_lottery_type');
    return (saved as LotteryType) || 'NIKKEI';
  });

  const [nikkeiMorningData, setNikkeiMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_morning', INITIAL_NIKKEI_MORNING_DATA)
  );
  const [nikkeiAfternoonData, setNikkeiAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_afternoon', INITIAL_NIKKEI_AFTERNOON_DATA)
  );
  const [chinaMorningData, setChinaMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_morning', INITIAL_CHINA_MORNING_DATA)
  );
  const [chinaAfternoonData, setChinaAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_afternoon', INITIAL_CHINA_AFTERNOON_DATA)
  );
  const [hangsengMorningData, setHangsengMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_morning', INITIAL_HANGSENG_MORNING_DATA)
  );
  const [hangsengAfternoonData, setHangsengAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_afternoon', INITIAL_HANGSENG_AFTERNOON_DATA)
  );

  const [nikkeiVipMorningData, setNikkeiVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_vip_morning', INITIAL_NIKKEI_VIP_MORNING_DATA)
  );
  const [nikkeiVipAfternoonData, setNikkeiVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_nikkei_vip_afternoon', INITIAL_NIKKEI_VIP_AFTERNOON_DATA)
  );
  const [chinaVipMorningData, setChinaVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_vip_morning', INITIAL_CHINA_VIP_MORNING_DATA)
  );
  const [chinaVipAfternoonData, setChinaVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_china_vip_afternoon', INITIAL_CHINA_VIP_AFTERNOON_DATA)
  );
  const [hangsengVipMorningData, setHangsengVipMorningData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_vip_morning', INITIAL_HANGSENG_VIP_MORNING_DATA)
  );
  const [hangsengVipAfternoonData, setHangsengVipAfternoonData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hangseng_vip_afternoon', INITIAL_HANGSENG_VIP_AFTERNOON_DATA)
  );

  const [laosData, setLaosData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_laos', INITIAL_LAOS_DATA)
  );
  const [dowjonesData, setDowjonesData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_dowjones', INITIAL_DOWJONES_DATA)
  );
  const [hanoiSpecialData, setHanoiSpecialData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi_special', INITIAL_HANOI_SPECIAL_DATA)
  );
  const [hanoiData, setHanoiData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi', INITIAL_HANOI_DATA)
  );
  const [hanoiVipData, setHanoiVipData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_hanoi_vip', INITIAL_HANOI_VIP_DATA)
  );
  const [gsbData, setGsbData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_gsb', INITIAL_GSB_DATA)
  );
  const [govData, setGovData] = useState<DrawResult[]>(() =>
    loadPersistedData('lotto_data_gov', INITIAL_GOVERNMENT_DATA)
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync engine version
  useEffect(() => {
    const currentVersion = '11.0.0_add_stock_vip';
    const savedVersion = localStorage.getItem('lotto_engine_version');
    if (savedVersion !== currentVersion) {
      localStorage.setItem('lotto_engine_version', currentVersion);
      localStorage.removeItem('lotto_data_nikkei_morning');
      localStorage.removeItem('lotto_data_nikkei_afternoon');
      localStorage.removeItem('lotto_data_china_morning');
      localStorage.removeItem('lotto_data_china_afternoon');
      localStorage.removeItem('lotto_data_hangseng_morning');
      localStorage.removeItem('lotto_data_hangseng_afternoon');
      localStorage.removeItem('lotto_data_nikkei_vip_morning');
      localStorage.removeItem('lotto_data_nikkei_vip_afternoon');
      localStorage.removeItem('lotto_data_china_vip_morning');
      localStorage.removeItem('lotto_data_china_vip_afternoon');
      localStorage.removeItem('lotto_data_hangseng_vip_morning');
      localStorage.removeItem('lotto_data_hangseng_vip_afternoon');
      localStorage.removeItem('lotto_data_laos');
      localStorage.removeItem('lotto_data_dowjones');
      localStorage.removeItem('lotto_data_hanoi_special');
      localStorage.removeItem('lotto_data_hanoi');
      localStorage.removeItem('lotto_data_hanoi_vip');
      localStorage.removeItem('lotto_data_gsb');
      localStorage.removeItem('lotto_data_gov');

      setNikkeiMorningData(INITIAL_NIKKEI_MORNING_DATA);
      setNikkeiAfternoonData(INITIAL_NIKKEI_AFTERNOON_DATA);
      setChinaMorningData(INITIAL_CHINA_MORNING_DATA);
      setChinaAfternoonData(INITIAL_CHINA_AFTERNOON_DATA);
      setHangsengMorningData(INITIAL_HANGSENG_MORNING_DATA);
      setHangsengAfternoonData(INITIAL_HANGSENG_AFTERNOON_DATA);
      setNikkeiVipMorningData(INITIAL_NIKKEI_VIP_MORNING_DATA);
      setNikkeiVipAfternoonData(INITIAL_NIKKEI_VIP_AFTERNOON_DATA);
      setChinaVipMorningData(INITIAL_CHINA_VIP_MORNING_DATA);
      setChinaVipAfternoonData(INITIAL_CHINA_VIP_AFTERNOON_DATA);
      setHangsengVipMorningData(INITIAL_HANGSENG_VIP_MORNING_DATA);
      setHangsengVipAfternoonData(INITIAL_HANGSENG_VIP_AFTERNOON_DATA);
      setLaosData(INITIAL_LAOS_DATA);
      setDowjonesData(INITIAL_DOWJONES_DATA);
      setHanoiSpecialData(INITIAL_HANOI_SPECIAL_DATA);
      setHanoiData(INITIAL_HANOI_DATA);
      setHanoiVipData(INITIAL_HANOI_VIP_DATA);
      setGsbData(INITIAL_GSB_DATA);
      setGovData(INITIAL_GOVERNMENT_DATA);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lotto_active_lottery_type', lotteryType);
    if (lotteryType === 'HANOI' && !['HANOI_SPECIAL', 'HANOI_EVENING', 'HANOI_VIP', 'HANOI_ALL_3'].includes(selectedSession)) {
      setSelectedSession('HANOI_ALL_3');
    }
    if (lotteryType === 'STOCK_VIP' && !['NIKKEI_VIP_BOTH', 'NIKKEI_VIP_MORNING', 'NIKKEI_VIP_AFTERNOON', 'CHINA_VIP_BOTH', 'CHINA_VIP_MORNING', 'CHINA_VIP_AFTERNOON', 'HANGSENG_VIP_BOTH', 'HANGSENG_VIP_MORNING', 'HANGSENG_VIP_AFTERNOON', 'STOCKS_VIP_ALL_3'].includes(selectedSession)) {
      setSelectedSession('NIKKEI_VIP_BOTH');
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

  // Persist stock dataset states to localStorage & Cloud
  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_morning', JSON.stringify(nikkeiMorningData));
    syncSaveToCloud('lotto_data_nikkei_morning', nikkeiMorningData);
  }, [nikkeiMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_afternoon', JSON.stringify(nikkeiAfternoonData));
    syncSaveToCloud('lotto_data_nikkei_afternoon', nikkeiAfternoonData);
  }, [nikkeiAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_morning', JSON.stringify(chinaMorningData));
    syncSaveToCloud('lotto_data_china_morning', chinaMorningData);
  }, [chinaMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_afternoon', JSON.stringify(chinaAfternoonData));
    syncSaveToCloud('lotto_data_china_afternoon', chinaAfternoonData);
  }, [chinaAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_morning', JSON.stringify(hangsengMorningData));
    syncSaveToCloud('lotto_data_hangseng_morning', hangsengMorningData);
  }, [hangsengMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_afternoon', JSON.stringify(hangsengAfternoonData));
    syncSaveToCloud('lotto_data_hangseng_afternoon', hangsengAfternoonData);
  }, [hangsengAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_vip_morning', JSON.stringify(nikkeiVipMorningData));
    syncSaveToCloud('lotto_data_nikkei_vip_morning', nikkeiVipMorningData);
  }, [nikkeiVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_nikkei_vip_afternoon', JSON.stringify(nikkeiVipAfternoonData));
    syncSaveToCloud('lotto_data_nikkei_vip_afternoon', nikkeiVipAfternoonData);
  }, [nikkeiVipAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_vip_morning', JSON.stringify(chinaVipMorningData));
    syncSaveToCloud('lotto_data_china_vip_morning', chinaVipMorningData);
  }, [chinaVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_china_vip_afternoon', JSON.stringify(chinaVipAfternoonData));
    syncSaveToCloud('lotto_data_china_vip_afternoon', chinaVipAfternoonData);
  }, [chinaVipAfternoonData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_vip_morning', JSON.stringify(hangsengVipMorningData));
    syncSaveToCloud('lotto_data_hangseng_vip_morning', hangsengVipMorningData);
  }, [hangsengVipMorningData]);

  useEffect(() => {
    localStorage.setItem('lotto_data_hangseng_vip_afternoon', JSON.stringify(hangsengVipAfternoonData));
    syncSaveToCloud('lotto_data_hangseng_vip_afternoon', hangsengVipAfternoonData);
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
    if (lotteryType === 'STOCK_VIP') {
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
    const sessionPrefix = newDraw.session ? newDraw.session.toLowerCase() : newDraw.lotteryType.toLowerCase();
    const created: DrawResult = {
      ...newDraw,
      id: `${sessionPrefix}_${Date.now()}`
    };

    const sortByDateDesc = (list: DrawResult[]) => [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (newDraw.lotteryType === 'LAOS') {
      setLaosData((prev) => sortByDateDesc([created, ...prev]));
    } else if (newDraw.lotteryType === 'DOWJONES') {
      setDowjonesData((prev) => sortByDateDesc([created, ...prev]));
    } else if (newDraw.lotteryType === 'HANOI') {
      if (newDraw.session === 'HANOI_SPECIAL') {
        setHanoiSpecialData((prev) => sortByDateDesc([created, ...prev]));
      } else if (newDraw.session === 'HANOI_VIP') {
        setHanoiVipData((prev) => sortByDateDesc([created, ...prev]));
      } else {
        setHanoiData((prev) => sortByDateDesc([created, ...prev]));
      }
    } else if (newDraw.lotteryType === 'GSB') {
      setGsbData((prev) => sortByDateDesc([created, ...prev]));
    } else if (newDraw.lotteryType === 'GOVERNMENT') {
      setGovData((prev) => sortByDateDesc([created, ...prev]));
    } else if (newDraw.lotteryType === 'STOCK_VIP') {
      if (newDraw.session === 'CHINA_VIP_MORNING') setChinaVipMorningData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'CHINA_VIP_AFTERNOON') setChinaVipAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'HANGSENG_VIP_MORNING') setHangsengVipMorningData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'HANGSENG_VIP_AFTERNOON') setHangsengVipAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'NIKKEI_VIP_AFTERNOON') setNikkeiVipAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else setNikkeiVipMorningData((prev) => sortByDateDesc([created, ...prev]));
    } else {
      if (newDraw.session === 'CHINA_MORNING') setChinaMorningData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'CHINA_AFTERNOON') setChinaAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'HANGSENG_MORNING') setHangsengMorningData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'HANGSENG_AFTERNOON') setHangsengAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else if (newDraw.session === 'NIKKEI_AFTERNOON' || newDraw.session === 'AFTERNOON') setNikkeiAfternoonData((prev) => sortByDateDesc([created, ...prev]));
      else setNikkeiMorningData((prev) => sortByDateDesc([created, ...prev]));
    }

    const sessionLabels: Record<string, string> = {
      NIKKEI_MORNING: 'นิเคอิ เช้า',
      NIKKEI_AFTERNOON: 'นิเคอิ บ่าย',
      MORNING: 'นิเคอิ เช้า',
      AFTERNOON: 'นิเคอิ บ่าย',
      CHINA_MORNING: 'หุ้นจีน เช้า',
      CHINA_AFTERNOON: 'หุ้นจีน บ่าย',
      HANGSENG_MORNING: 'หุ้นฮั่งเส็ง เช้า',
      HANGSENG_AFTERNOON: 'หุ้นฮั่งเส็ง บ่าย',
      NIKKEI_VIP_MORNING: 'นิเคอิ VIP เช้า',
      NIKKEI_VIP_AFTERNOON: 'นิเคอิ VIP บ่าย',
      CHINA_VIP_MORNING: 'จีน VIP เช้า',
      CHINA_VIP_AFTERNOON: 'จีน VIP บ่าย',
      HANGSENG_VIP_MORNING: 'ฮั่งเส็ง VIP เช้า',
      HANGSENG_VIP_AFTERNOON: 'ฮั่งเส็ง VIP บ่าย',
      LAOS_EVENING: 'ลาวพัฒนา',
      DOWJONES_NIGHT: 'ดาวโจนส์',
      HANOI_SPECIAL: 'ฮานอยพิเศษ',
      HANOI_EVENING: 'ฮานอยปกติ',
      HANOI_VIP: 'ฮานอย VIP',
      GSB_BIWEEKLY: 'ออมสิน',
      GOV_BIWEEKLY: 'รัฐบาลไทย'
    };
    const sName = sessionLabels[newDraw.session] || 'ผลรางวัล';
    addToast('success', 'บันทึกผลสำเร็จ!', `เพิ่มผลรางวัล [${sName}] วันที่ ${newDraw.dateFormatted} เรียบร้อยแล้ว`);
  };

  const handleEditDraw = (updatedDraw: DrawResult) => {
    const removeDraw = (list: DrawResult[]) => list.filter((item) => item.id !== updatedDraw.id);
    const updateOrAdd = (list: DrawResult[]) => {
      const exists = list.some((item) => item.id === updatedDraw.id);
      if (exists) {
        return list.map((item) => (item.id === updatedDraw.id ? updatedDraw : item));
      }
      return [updatedDraw, ...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    };

    if (updatedDraw.lotteryType === 'LAOS') setLaosData(updateOrAdd);
    else if (updatedDraw.lotteryType === 'DOWJONES') setDowjonesData(updateOrAdd);
    else if (updatedDraw.lotteryType === 'HANOI') {
      if (updatedDraw.session === 'HANOI_SPECIAL') {
        setHanoiSpecialData(updateOrAdd);
        setHanoiData(removeDraw);
        setHanoiVipData(removeDraw);
      } else if (updatedDraw.session === 'HANOI_VIP') {
        setHanoiVipData(updateOrAdd);
        setHanoiData(removeDraw);
        setHanoiSpecialData(removeDraw);
      } else {
        setHanoiData(updateOrAdd);
        setHanoiSpecialData(removeDraw);
        setHanoiVipData(removeDraw);
      }
    }
    else if (updatedDraw.lotteryType === 'GSB') setGsbData(updateOrAdd);
    else if (updatedDraw.lotteryType === 'GOVERNMENT') setGovData(updateOrAdd);
    else if (updatedDraw.lotteryType === 'STOCK_VIP') {
      if (updatedDraw.session === 'CHINA_VIP_MORNING') {
        setChinaVipMorningData(updateOrAdd);
        setChinaVipAfternoonData(removeDraw);
        setHangsengVipMorningData(removeDraw);
        setHangsengVipAfternoonData(removeDraw);
        setNikkeiVipMorningData(removeDraw);
        setNikkeiVipAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'CHINA_VIP_AFTERNOON') {
        setChinaVipAfternoonData(updateOrAdd);
        setChinaVipMorningData(removeDraw);
        setHangsengVipMorningData(removeDraw);
        setHangsengVipAfternoonData(removeDraw);
        setNikkeiVipMorningData(removeDraw);
        setNikkeiVipAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'HANGSENG_VIP_MORNING') {
        setHangsengVipMorningData(updateOrAdd);
        setHangsengVipAfternoonData(removeDraw);
        setChinaVipMorningData(removeDraw);
        setChinaVipAfternoonData(removeDraw);
        setNikkeiVipMorningData(removeDraw);
        setNikkeiVipAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'HANGSENG_VIP_AFTERNOON') {
        setHangsengVipAfternoonData(updateOrAdd);
        setHangsengVipMorningData(removeDraw);
        setChinaVipMorningData(removeDraw);
        setChinaVipAfternoonData(removeDraw);
        setNikkeiVipMorningData(removeDraw);
        setNikkeiVipAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'NIKKEI_VIP_AFTERNOON') {
        setNikkeiVipAfternoonData(updateOrAdd);
        setNikkeiVipMorningData(removeDraw);
        setChinaVipMorningData(removeDraw);
        setChinaVipAfternoonData(removeDraw);
        setHangsengVipMorningData(removeDraw);
        setHangsengVipAfternoonData(removeDraw);
      } else {
        setNikkeiVipMorningData(updateOrAdd);
        setNikkeiVipAfternoonData(removeDraw);
        setChinaVipMorningData(removeDraw);
        setChinaVipAfternoonData(removeDraw);
        setHangsengVipMorningData(removeDraw);
        setHangsengVipAfternoonData(removeDraw);
      }
    }
    else {
      if (updatedDraw.session === 'CHINA_MORNING') {
        setChinaMorningData(updateOrAdd);
        setChinaAfternoonData(removeDraw);
        setHangsengMorningData(removeDraw);
        setHangsengAfternoonData(removeDraw);
        setNikkeiMorningData(removeDraw);
        setNikkeiAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'CHINA_AFTERNOON') {
        setChinaAfternoonData(updateOrAdd);
        setChinaMorningData(removeDraw);
        setHangsengMorningData(removeDraw);
        setHangsengAfternoonData(removeDraw);
        setNikkeiMorningData(removeDraw);
        setNikkeiAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'HANGSENG_MORNING') {
        setHangsengMorningData(updateOrAdd);
        setHangsengAfternoonData(removeDraw);
        setChinaMorningData(removeDraw);
        setChinaAfternoonData(removeDraw);
        setNikkeiMorningData(removeDraw);
        setNikkeiAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'HANGSENG_AFTERNOON') {
        setHangsengAfternoonData(updateOrAdd);
        setHangsengMorningData(removeDraw);
        setChinaMorningData(removeDraw);
        setChinaAfternoonData(removeDraw);
        setNikkeiMorningData(removeDraw);
        setNikkeiAfternoonData(removeDraw);
      } else if (updatedDraw.session === 'NIKKEI_AFTERNOON' || updatedDraw.session === 'AFTERNOON') {
        setNikkeiAfternoonData(updateOrAdd);
        setNikkeiMorningData(removeDraw);
        setChinaMorningData(removeDraw);
        setChinaAfternoonData(removeDraw);
        setHangsengMorningData(removeDraw);
        setHangsengAfternoonData(removeDraw);
      } else {
        setNikkeiMorningData(updateOrAdd);
        setNikkeiAfternoonData(removeDraw);
        setChinaMorningData(removeDraw);
        setChinaAfternoonData(removeDraw);
        setHangsengMorningData(removeDraw);
        setHangsengAfternoonData(removeDraw);
      }
    }

    addToast('success', 'แก้ไขผลสำเร็จ!', `แก้ไขผลรางวัลวันที่ ${updatedDraw.dateFormatted} เรียบร้อยแล้ว`);
  };

  const handleDeleteDraw = (drawId: string, drawDate: string, lottery: LotteryType) => {
    if (confirm(`คุณต้องการลบผลรางวัลวันที่ ${drawDate} ใช่หรือไม่?`)) {
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
      else if (lottery === 'STOCK_VIP') {
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
    if (confirm('คุณต้องการรีเซ็ตชุดข้อมูลกลับไปเป็นค่าเริ่มต้นสถิติใช่หรือไม่?')) {
      if (lotteryType === 'LAOS') {
        localStorage.removeItem('lotto_data_laos');
        setLaosData(INITIAL_LAOS_DATA);
      } else if (lotteryType === 'DOWJONES') {
        localStorage.removeItem('lotto_data_dowjones');
        setDowjonesData(INITIAL_DOWJONES_DATA);
      } else if (lotteryType === 'HANOI') {
        localStorage.removeItem('lotto_data_hanoi_special');
        localStorage.removeItem('lotto_data_hanoi');
        localStorage.removeItem('lotto_data_hanoi_vip');
        setHanoiSpecialData(INITIAL_HANOI_SPECIAL_DATA);
        setHanoiData(INITIAL_HANOI_DATA);
        setHanoiVipData(INITIAL_HANOI_VIP_DATA);
      } else if (lotteryType === 'GSB') {
        localStorage.removeItem('lotto_data_gsb');
        setGsbData(INITIAL_GSB_DATA);
      } else if (lotteryType === 'GOVERNMENT') {
        localStorage.removeItem('lotto_data_gov');
        setGovData(INITIAL_GOVERNMENT_DATA);
      } else if (lotteryType === 'STOCK_VIP') {
        localStorage.removeItem('lotto_data_nikkei_vip_morning');
        localStorage.removeItem('lotto_data_nikkei_vip_afternoon');
        localStorage.removeItem('lotto_data_china_vip_morning');
        localStorage.removeItem('lotto_data_china_vip_afternoon');
        localStorage.removeItem('lotto_data_hangseng_vip_morning');
        localStorage.removeItem('lotto_data_hangseng_vip_afternoon');
        setNikkeiVipMorningData(INITIAL_NIKKEI_VIP_MORNING_DATA);
        setNikkeiVipAfternoonData(INITIAL_NIKKEI_VIP_AFTERNOON_DATA);
        setChinaVipMorningData(INITIAL_CHINA_VIP_MORNING_DATA);
        setChinaVipAfternoonData(INITIAL_CHINA_VIP_AFTERNOON_DATA);
        setHangsengVipMorningData(INITIAL_HANGSENG_VIP_MORNING_DATA);
        setHangsengVipAfternoonData(INITIAL_HANGSENG_VIP_AFTERNOON_DATA);
      } else {
        localStorage.removeItem('lotto_data_nikkei_morning');
        localStorage.removeItem('lotto_data_nikkei_afternoon');
        localStorage.removeItem('lotto_data_china_morning');
        localStorage.removeItem('lotto_data_china_afternoon');
        localStorage.removeItem('lotto_data_hangseng_morning');
        localStorage.removeItem('lotto_data_hangseng_afternoon');
        setNikkeiMorningData(INITIAL_NIKKEI_MORNING_DATA);
        setNikkeiAfternoonData(INITIAL_NIKKEI_AFTERNOON_DATA);
        setChinaMorningData(INITIAL_CHINA_MORNING_DATA);
        setChinaAfternoonData(INITIAL_CHINA_AFTERNOON_DATA);
        setHangsengMorningData(INITIAL_HANGSENG_MORNING_DATA);
        setHangsengAfternoonData(INITIAL_HANGSENG_AFTERNOON_DATA);
      }
      addToast('info', 'รีเซ็ตข้อมูลสำเร็จ', 'คืนค่าฐานข้อมูลสถิติต้นฉบับเรียบร้อย');
    }
  };

  const handleAutoFetch = async (isSilentArg?: any) => {
    const isSilent = typeof isSilentArg === 'boolean' ? isSilentArg : false;
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const nameMap: Record<LotteryType, string> = {
      NIKKEI: 'หุ้นปกติ',
      STOCK_VIP: 'หุ้น VIP',
      DOWJONES: 'ดาวโจนส์',
      LAOS: 'ลาวพัฒนา',
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

      const mergeDataset = (
        current: DrawResult[],
        sessionName: SessionType,
        lottoType: LotteryType
      ): { list: DrawResult[]; updatedCount: number } => {
        const items = liveResults.filter((r: DrawResult) => r.session === sessionName && r.lotteryType === lottoType);
        if (items.length === 0) return { list: current, updatedCount: 0 };

        let addedOrUpdated = 0;
        const updatedList = [...current];

        for (const item of items) {
          const existingIdx = updatedList.findIndex((d) => d.date === item.date);
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

        updatedList.sort((a, b) => b.date.localeCompare(a.date));
        return { list: updatedList, updatedCount: addedOrUpdated };
      };

      const nikkeiM = mergeDataset(nikkeiMorningData, 'NIKKEI_MORNING', 'NIKKEI');
      if (nikkeiM.updatedCount > 0) { setNikkeiMorningData(nikkeiM.list); updatedTotalCount += nikkeiM.updatedCount; }

      const nikkeiA = mergeDataset(nikkeiAfternoonData, 'NIKKEI_AFTERNOON', 'NIKKEI');
      if (nikkeiA.updatedCount > 0) { setNikkeiAfternoonData(nikkeiA.list); updatedTotalCount += nikkeiA.updatedCount; }

      const chinaM = mergeDataset(chinaMorningData, 'CHINA_MORNING', 'NIKKEI');
      if (chinaM.updatedCount > 0) { setChinaMorningData(chinaM.list); updatedTotalCount += chinaM.updatedCount; }

      const chinaA = mergeDataset(chinaAfternoonData, 'CHINA_AFTERNOON', 'NIKKEI');
      if (chinaA.updatedCount > 0) { setChinaAfternoonData(chinaA.list); updatedTotalCount += chinaA.updatedCount; }

      const hangsengM = mergeDataset(hangsengMorningData, 'HANGSENG_MORNING', 'NIKKEI');
      if (hangsengM.updatedCount > 0) { setHangsengMorningData(hangsengM.list); updatedTotalCount += hangsengM.updatedCount; }

      const hangsengA = mergeDataset(hangsengAfternoonData, 'HANGSENG_AFTERNOON', 'NIKKEI');
      if (hangsengA.updatedCount > 0) { setHangsengAfternoonData(hangsengA.list); updatedTotalCount += hangsengA.updatedCount; }

      const nikkeiVipM = mergeDataset(nikkeiVipMorningData, 'NIKKEI_VIP_MORNING', 'STOCK_VIP');
      if (nikkeiVipM.updatedCount > 0) { setNikkeiVipMorningData(nikkeiVipM.list); updatedTotalCount += nikkeiVipM.updatedCount; }

      const nikkeiVipA = mergeDataset(nikkeiVipAfternoonData, 'NIKKEI_VIP_AFTERNOON', 'STOCK_VIP');
      if (nikkeiVipA.updatedCount > 0) { setNikkeiVipAfternoonData(nikkeiVipA.list); updatedTotalCount += nikkeiVipA.updatedCount; }

      const chinaVipM = mergeDataset(chinaVipMorningData, 'CHINA_VIP_MORNING', 'STOCK_VIP');
      if (chinaVipM.updatedCount > 0) { setChinaVipMorningData(chinaVipM.list); updatedTotalCount += chinaVipM.updatedCount; }

      const chinaVipA = mergeDataset(chinaVipAfternoonData, 'CHINA_VIP_AFTERNOON', 'STOCK_VIP');
      if (chinaVipA.updatedCount > 0) { setChinaVipAfternoonData(chinaVipA.list); updatedTotalCount += chinaVipA.updatedCount; }

      const hangsengVipM = mergeDataset(hangsengVipMorningData, 'HANGSENG_VIP_MORNING', 'STOCK_VIP');
      if (hangsengVipM.updatedCount > 0) { setHangsengVipMorningData(hangsengVipM.list); updatedTotalCount += hangsengVipM.updatedCount; }

      const hangsengVipA = mergeDataset(hangsengVipAfternoonData, 'HANGSENG_VIP_AFTERNOON', 'STOCK_VIP');
      if (hangsengVipA.updatedCount > 0) { setHangsengVipAfternoonData(hangsengVipA.list); updatedTotalCount += hangsengVipA.updatedCount; }

      const laos = mergeDataset(laosData, 'LAOS_EVENING', 'LAOS');
      if (laos.updatedCount > 0) { setLaosData(laos.list); updatedTotalCount += laos.updatedCount; }

      const dowjones = mergeDataset(dowjonesData, 'DOWJONES_NIGHT', 'DOWJONES');
      if (dowjones.updatedCount > 0) { setDowjonesData(dowjones.list); updatedTotalCount += dowjones.updatedCount; }

      const hanoiSpec = mergeDataset(hanoiSpecialData, 'HANOI_SPECIAL', 'HANOI');
      if (hanoiSpec.updatedCount > 0) { setHanoiSpecialData(hanoiSpec.list); updatedTotalCount += hanoiSpec.updatedCount; }

      const hanoiNorm = mergeDataset(hanoiData, 'HANOI_EVENING', 'HANOI');
      if (hanoiNorm.updatedCount > 0) { setHanoiData(hanoiNorm.list); updatedTotalCount += hanoiNorm.updatedCount; }

      const hanoiVip = mergeDataset(hanoiVipData, 'HANOI_VIP', 'HANOI');
      if (hanoiVip.updatedCount > 0) { setHanoiVipData(hanoiVip.list); updatedTotalCount += hanoiVip.updatedCount; }

      const gsb = mergeDataset(gsbData, 'GSB_BIWEEKLY', 'GSB');
      if (gsb.updatedCount > 0) { setGsbData(gsb.list); updatedTotalCount += gsb.updatedCount; }

      const gov = mergeDataset(govData, 'GOV_BIWEEKLY', 'GOVERNMENT');
      if (gov.updatedCount > 0) { setGovData(gov.list); updatedTotalCount += gov.updatedCount; }

      if (updatedTotalCount > 0) {
        addToast('success', '🔄 ซิงค์ผลรางวัลสำเร็จ!', `อัปเดตผลรางวัลใหม่ ${updatedTotalCount} รายการจาก exphuay.com เรียบร้อยแล้ว (เวลา ${nowStr} น.)`);
      } else if (!isSilent) {
        addToast('success', '✅ ข้อมูลเป็นปัจจุบันแล้ว', `ซิงค์สถิติ [${lottoName}] ล่าสุดเรียบร้อยแล้ว (อัปเดตเมื่อ ${nowStr} น.)`);
      }
    } catch (err: any) {
      console.error('Auto fetch failed:', err);
      if (!isSilent) {
        addToast('error', 'ซิงค์ผลไม่สำเร็จ', err.message || 'ไม่สามารถเชื่อมต่อ exphuay.com ได้');
      }
    }
  };

  // Background auto-sync on app mount
  useEffect(() => {
    handleAutoFetch(true);
  }, []);

  // Theme mode styling generator
  const getThemeClass = () => {
    return themeMode === 'LIGHT'
      ? 'theme-light bg-slate-100 text-slate-900 selection:bg-amber-500 selection:text-black'
      : 'theme-dark bg-[#080b11] text-gray-100 selection:bg-amber-500 selection:text-black';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${getThemeClass()}`}>
      
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Session Indicator Subbanner */}
        <div className="bg-gradient-to-r from-nikkei-card via-[#182234] to-nikkei-card border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {lotteryType === 'LAOS'
                ? '🇱🇦'
                : lotteryType === 'DOWJONES'
                ? '🇺🇸'
                : lotteryType === 'HANOI'
                ? '🇻🇳'
                : lotteryType === 'GSB'
                ? '🏦'
                : lotteryType === 'GOVERNMENT'
                ? '🇹🇭'
                : lotteryType === 'STOCK_VIP'
                ? selectedSession?.startsWith('CHINA_VIP')
                  ? '💎🇨🇳'
                  : selectedSession?.startsWith('HANGSENG_VIP')
                  ? '💎🇭🇰'
                  : selectedSession === 'STOCKS_VIP_ALL_3'
                  ? '💎⭐'
                  : '💎🎌'
                : selectedSession === 'CHINA_BOTH' || selectedSession === 'CHINA_MORNING' || selectedSession === 'CHINA_AFTERNOON'
                ? '🇨🇳'
                : selectedSession === 'HANGSENG_BOTH' || selectedSession === 'HANGSENG_MORNING' || selectedSession === 'HANGSENG_AFTERNOON'
                ? '🇭🇰'
                : selectedSession === 'STOCKS_ALL_3'
                ? '⭐'
                : selectedSession === 'MORNING' || selectedSession === 'NIKKEI_MORNING'
                ? '☀️'
                : selectedSession === 'AFTERNOON' || selectedSession === 'NIKKEI_AFTERNOON'
                ? '🌤️'
                : '🎌'}
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                ขณะนี้กำลังวิเคราะห์: <span className="text-amber-400">
                  {lotteryType === 'LAOS'
                    ? 'หวยลาวพัฒนา (ออกทุกวัน รอบ 20:30 น.)'
                    : lotteryType === 'DOWJONES'
                    ? 'หวยหุ้นดาวโจนส์ (รอบ 04:00 น. เช้ามืด - อ้างอิง exphuay)'
                    : lotteryType === 'HANOI'
                    ? selectedSession === 'HANOI_SPECIAL'
                      ? 'หวยฮานอยพิเศษ (รอบ 17:30 น. - อ้างอิง exphuay xsthm)'
                      : selectedSession === 'HANOI_VIP'
                      ? 'หวยฮานอย VIP (รอบ 19:30 น. - อ้างอิง exphuay mlnhngo)'
                      : selectedSession === 'HANOI_EVENING'
                      ? 'หวยฮานอยปกติ (รอบ 18:30 น. - อ้างอิง exphuay Minh Ngoc)'
                      : 'วิเคราะห์รวม 3 หวยฮานอย (17:30 / 18:30 / 19:30) ดักเด่นรูด 3 รอบ'
                    : lotteryType === 'GSB'
                    ? 'หวยออมสิน (ออกวันที่ 1 และ 16 เวลา 13:00 น. - อ้างอิง exphuay GSB)'
                    : lotteryType === 'GOVERNMENT'
                    ? 'หวยรัฐบาลไทย (ออกวันที่ 1 และ 16 เวลา 15:30 น. - อ้างอิง exphuay)'
                    : lotteryType === 'STOCK_VIP'
                    ? selectedSession === 'CHINA_VIP_MORNING'
                      ? 'หวยหุ้นจีน VIP รอบเช้า (09:30 น.)'
                      : selectedSession === 'CHINA_VIP_AFTERNOON'
                      ? 'หวยหุ้นจีน VIP รอบบ่าย (13:00 น.)'
                      : selectedSession === 'CHINA_VIP_BOTH'
                      ? 'หวยหุ้นจีน VIP ควบ 2 รอบ (เช้า 09:30 / บ่าย 13:00 น.)'
                      : selectedSession === 'HANGSENG_VIP_MORNING'
                      ? 'หวยหุ้นฮั่งเส็ง VIP รอบเช้า (10:55 น.)'
                      : selectedSession === 'HANGSENG_VIP_AFTERNOON'
                      ? 'หวยหุ้นฮั่งเส็ง VIP รอบบ่าย (14:55 น.)'
                      : selectedSession === 'HANGSENG_VIP_BOTH'
                      ? 'หวยหุ้นฮั่งเส็ง VIP ควบ 2 รอบ (เช้า 10:55 / บ่าย 14:55 น.)'
                      : selectedSession === 'STOCKS_VIP_ALL_3'
                      ? 'รวมทุกหุ้น VIP 3 ตลาด (นิเคอิ VIP / จีน VIP / ฮั่งเส็ง VIP รวม 6 รอบ)'
                      : selectedSession === 'NIKKEI_VIP_MORNING'
                      ? 'หวยหุ้นนิคเคอิ VIP เช้า (รอบ 08:30 น.)'
                      : selectedSession === 'NIKKEI_VIP_AFTERNOON'
                      ? 'หวยหุ้นนิคเคอิ VIP บ่าย (รอบ 12:00 น.)'
                      : 'วิเคราะห์รวมนิคเคอิ VIP 2 รอบ (เช้า 08:30 / บ่าย 12:00 น.)'
                    : selectedSession === 'CHINA_MORNING'
                    ? 'หวยหุ้นจีน รอบเช้า (10:35 น.)'
                    : selectedSession === 'CHINA_AFTERNOON'
                    ? 'หวยหุ้นจีน รอบบ่าย (14:00 น.)'
                    : selectedSession === 'CHINA_BOTH'
                    ? 'หวยหุ้นจีน ควบ 2 รอบ (เช้า 10:35 / บ่าย 14:00 น.)'
                    : selectedSession === 'HANGSENG_MORNING'
                    ? 'หวยหุ้นฮั่งเส็ง รอบเช้า (11:00 น.)'
                    : selectedSession === 'HANGSENG_AFTERNOON'
                    ? 'หวยหุ้นฮั่งเส็ง รอบบ่าย (15:00 น.)'
                    : selectedSession === 'HANGSENG_BOTH'
                    ? 'หวยหุ้นฮั่งเส็ง ควบ 2 รอบ (เช้า 11:00 / บ่าย 15:00 น.)'
                    : selectedSession === 'STOCKS_ALL_3'
                    ? 'รวมทุกหุ้นปกติ 3 ตลาด (นิเคอิ / จีน / ฮั่งเส็ง รวม 6 รอบ)'
                    : selectedSession === 'MORNING' || selectedSession === 'NIKKEI_MORNING'
                    ? 'หวยหุ้นนิคเคอิเช้า (รอบ 09:30 น.)'
                    : selectedSession === 'AFTERNOON' || selectedSession === 'NIKKEI_AFTERNOON'
                    ? 'หวยหุ้นนิคเคอิบ่าย (รอบ 13:00 น.)'
                    : 'วิเคราะห์รวมนิคเคอิ 2 รอบ (เช้า 09:30 / บ่าย 13:00 น.)'}
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {lotteryType === 'LAOS'
                  ? 'คำนวณแนวทางสถิติหวยลาวพัฒนา 6 ตัว, 3 ตัวบน, 2 ตัวล่าง ย้อนหลัง 3 เดือน'
                  : lotteryType === 'DOWJONES'
                  ? 'คำนวณแนวทางสถิติหวยหุ้นดาวโจนส์ ดัชนีปิดตลาดสหรัฐฯ ย้อนหลัง 3 เดือน อ้างอิง exphuay'
                  : lotteryType === 'HANOI'
                  ? 'คำนวณแนวทางสถิติหวยฮานอยปกติ ย้อนหลัง 3 เดือน อ้างอิง exphuay (Minh Ngoc)'
                  : lotteryType === 'GSB'
                  ? 'คำนวณแนวทางสถิติหวยออมสิน ย้อนหลัง 6 เดือนเต็ม (มีนาคม - สิงหาคม) อ้างอิง exphuay (GSB)'
                  : lotteryType === 'GOVERNMENT'
                  ? 'คำนวณแนวทางสถิติหวยรัฐบาลไทย ย้อนหลัง 6 เดือนเต็ม (มีนาคม - สิงหาคม) อ้างอิง exphuay'
                  : lotteryType === 'STOCK_VIP'
                  ? selectedSession === 'CHINA_VIP_MORNING'
                    ? 'คำนวณแนวทางหุ้นจีน VIP รอบเช้า ปิดตลาด 09:30 น. ออกผลทุกวัน'
                    : selectedSession === 'CHINA_VIP_AFTERNOON'
                    ? 'คำนวณแนวทางหุ้นจีน VIP รอบบ่าย ปิดตลาด 13:00 น. ออกผลทุกวัน'
                    : selectedSession === 'CHINA_VIP_BOTH'
                    ? 'คำนวณแนวทางหุ้นจีน VIP ควบเช้า-บ่าย 2 รอบ (09:30 / 13:00 น.)'
                    : selectedSession === 'HANGSENG_VIP_MORNING'
                    ? 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP รอบเช้า ปิดตลาด 10:55 น. ออกผลทุกวัน'
                    : selectedSession === 'HANGSENG_VIP_AFTERNOON'
                    ? 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP รอบบ่าย ปิดตลาด 14:55 น. ออกผลทุกวัน'
                    : selectedSession === 'HANGSENG_VIP_BOTH'
                    ? 'คำนวณแนวทางหุ้นฮั่งเส็ง VIP ควบเช้า-บ่าย 2 รอบ (10:55 / 14:55 น.)'
                    : selectedSession === 'STOCKS_VIP_ALL_3'
                    ? 'วิเคราะห์ความน่าจะเป็นรวมทุกหุ้น VIP 3 ประเทศ (นิเคอิ VIP / จีน VIP / ฮั่งเส็ง VIP)'
                    : selectedSession === 'NIKKEI_VIP_AFTERNOON'
                    ? 'คำนวณแนวทางรอบบ่าย พร้อมวิเคราะห์เลขไหลต่อเนื่องจากรอบเช้า'
                    : 'คำนวณแนวทางรอบเช้าจากสถิติตลาดหุ้นนิเคอิ VIP เปิดรอบแรก'
                  : selectedSession === 'CHINA_MORNING'
                  ? 'คำนวณแนวทางหุ้นจีนรอบเช้า ปิดตลาด 10:35 น. อ้างอิง exphuay (SZSE)'
                  : selectedSession === 'CHINA_AFTERNOON'
                  ? 'คำนวณแนวทางหุ้นจีนรอบบ่าย ปิดตลาด 14:00 น. อ้างอิง exphuay (SZSE)'
                  : selectedSession === 'CHINA_BOTH'
                  ? 'คำนวณแนวทางหุ้นจีนควบเช้า-บ่าย 2 รอบ (10:35 / 14:00 น.)'
                  : selectedSession === 'HANGSENG_MORNING'
                  ? 'คำนวณแนวทางหุ้นฮั่งเส็งรอบเช้า ปิดตลาด 11:00 น. อ้างอิง exphuay (HSI)'
                  : selectedSession === 'HANGSENG_AFTERNOON'
                  ? 'คำนวณแนวทางหุ้นฮั่งเส็งรอบบ่าย ปิดตลาด 15:00 น. อ้างอิง exphuay (HSI)'
                  : selectedSession === 'HANGSENG_BOTH'
                  ? 'คำนวณแนวทางหุ้นฮั่งเส็งควบเช้า-บ่าย 2 รอบ (11:00 / 15:00 น.)'
                  : selectedSession === 'STOCKS_ALL_3'
                  ? 'วิเคราะห์ความน่าจะเป็นรวมทุกหุ้นปกติ 3 ประเทศ (นิเคอิ / จีน / ฮั่งเส็ง)'
                  : selectedSession === 'AFTERNOON' || selectedSession === 'NIKKEI_AFTERNOON'
                  ? 'คำนวณแนวทางรอบบ่าย พร้อมวิเคราะห์เลขไหลต่อเนื่องจากรอบเช้า'
                  : 'คำนวณแนวทางรอบเช้าจากสถิติตลาดหุ้นญี่ปุ่นเปิดรอบแรก'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {lotteryType === 'STOCK_VIP' && (
              <div className="flex items-center gap-1 bg-nikkei-dark/80 border border-nikkei-border p-1 rounded-xl text-xs">
                {selectedSession.startsWith('CHINA_VIP') ? (
                  <>
                    <button
                      onClick={() => setSelectedSession('CHINA_VIP_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_VIP_BOTH'
                          ? 'bg-red-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      💎🇨🇳 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('CHINA_VIP_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_VIP_MORNING'
                          ? 'bg-red-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 09:30
                    </button>
                    <button
                      onClick={() => setSelectedSession('CHINA_VIP_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_VIP_AFTERNOON'
                          ? 'bg-rose-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 13:00
                    </button>
                  </>
                ) : selectedSession.startsWith('HANGSENG_VIP') ? (
                  <>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_VIP_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_VIP_BOTH'
                          ? 'bg-blue-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      💎🇭🇰 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_VIP_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_VIP_MORNING'
                          ? 'bg-blue-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 10:55
                    </button>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_VIP_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_VIP_AFTERNOON'
                          ? 'bg-indigo-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 14:55
                    </button>
                  </>
                ) : selectedSession === 'STOCKS_VIP_ALL_3' ? (
                  <span className="text-[11px] text-amber-300 font-extrabold px-2 py-0.5">
                    💎 รวมทั้ง 3 หุ้น VIP (6 รอบ)
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_VIP_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_VIP_BOTH'
                          ? 'bg-purple-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      💎🎌 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_VIP_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_VIP_MORNING'
                          ? 'bg-purple-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 08:30
                    </button>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_VIP_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_VIP_AFTERNOON'
                          ? 'bg-purple-600 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 12:00
                    </button>
                  </>
                )}
              </div>
            )}

            {lotteryType === 'NIKKEI' && (
              <div className="flex items-center gap-1 bg-nikkei-dark/80 border border-nikkei-border p-1 rounded-xl text-xs">
                {selectedSession.startsWith('CHINA') ? (
                  <>
                    <button
                      onClick={() => setSelectedSession('CHINA_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_BOTH'
                          ? 'bg-red-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🇨🇳 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('CHINA_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_MORNING'
                          ? 'bg-red-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 10:35
                    </button>
                    <button
                      onClick={() => setSelectedSession('CHINA_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'CHINA_AFTERNOON'
                          ? 'bg-rose-500 text-white shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 14:00
                    </button>
                  </>
                ) : selectedSession.startsWith('HANGSENG') ? (
                  <>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_BOTH'
                          ? 'bg-blue-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🇭🇰 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_MORNING'
                          ? 'bg-blue-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 11:00
                    </button>
                    <button
                      onClick={() => setSelectedSession('HANGSENG_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'HANGSENG_AFTERNOON'
                          ? 'bg-indigo-500 text-white shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 15:00
                    </button>
                  </>
                ) : selectedSession === 'STOCKS_ALL_3' ? (
                  <span className="text-[11px] text-amber-300 font-extrabold px-2 py-0.5">
                    รวมทั้ง 3 หุ้นปกติ (6 รอบ)
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_BOTH')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_BOTH' || selectedSession === 'BOTH'
                          ? 'bg-amber-400 text-black shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🎌 ควบเช้า-บ่าย
                    </button>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_MORNING')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_MORNING' || selectedSession === 'MORNING'
                          ? 'bg-amber-400 text-black shadow-glow-gold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ☀️ เช้า 09:30
                    </button>
                    <button
                      onClick={() => setSelectedSession('NIKKEI_AFTERNOON')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedSession === 'NIKKEI_AFTERNOON' || selectedSession === 'AFTERNOON'
                          ? 'bg-cyan-400 text-black shadow-glow-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌤️ บ่าย 13:00
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-glow-gold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ใส่ผลรางวัลใหม่</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Responsive Grid for Desktop and Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-2.5 pb-2 border-b border-nikkei-border">
          
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">หน้าหลัก & คาดการณ์งวดถัดไป</span>
          </button>

          <button
            onClick={() => setActiveTab('PROBABILITY')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'PROBABILITY'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span className="truncate">% ความน่าจะเป็น (0-9 Matrix)</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'HISTORY'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Table className="w-4 h-4 shrink-0" />
            <span className="truncate">ตารางสถิติย้อนหลัง ({activeDataset.length} งวด)</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'CALENDAR'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">ปฏิทินวันเปิด-ปิดประจำเดือน</span>
          </button>

          <button
            onClick={() => setActiveTab('FORMULAS')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'FORMULAS'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span className="truncate">สูตรวิเคราะห์ 5 รูปแบบ</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKTEST')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'BACKTEST'
                ? 'bg-emerald-500 text-black shadow-glow-emerald scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">พิสูจน์ผลย้อนหลัง (Backtest)</span>
          </button>

          <button
            onClick={() => setActiveTab('WIN_GEN')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'WIN_GEN'
                ? 'bg-amber-500 text-black shadow-glow-gold scale-[1.02]'
                : 'bg-nikkei-card hover:bg-nikkei-cardHover text-gray-300 border border-nikkei-border'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">เครื่องมือจับเลขวิน</span>
          </button>

        </div>

        {/* Day of Week Frequency Analyzer (Positioned directly under the 6 Navigation Tabs) */}
        <DayOfWeekAnalyzer
          data={activeDataset}
          allData={lotteryType === 'HANOI' ? allHanoiData : (lotteryType === 'STOCK_VIP' ? allStockVipData : (lotteryType === 'NIKKEI' ? allStockData : activeDataset))}
          lotteryType={lotteryType}
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
                selectedSession={selectedSession}
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
              selectedSession={selectedSession}
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

      {/* Footer */}
      <footer className="bg-nikkei-dark border-t border-nikkei-border py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AI Predictor & Statistical Calculator (นิคเคอิ, หวยลาวพัฒนา, หวยหุ้นดาวโจนส์). อ้างอิงผลจาก exphuay & LottoTH</span>
          <span className="text-amber-400/80 font-medium">สถิติย้อนหลัง 2 เดือนเต็ม</span>
        </div>
      </footer>

    </div>
  );
}
