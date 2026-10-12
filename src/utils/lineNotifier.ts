import { DrawResult, LotteryType, SessionType } from '../types';
import { analyzeDayOfWeekStats } from './calculator';

export function getDayCodeFromDate(dateStr?: string): string {
  if (!dateStr) return 'Mon';
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayCodes[d.getDay()] || 'Mon';
  }
  return 'Mon';
}

export interface LineBotConfig {
  channelAccessToken: string;
  targetId: string;
  enabled: boolean;
}

export const DEFAULT_LINE_CONFIG: LineBotConfig = {
  channelAccessToken: '',
  targetId: 'U3a7529a26c7c9a1a06d4cd374349a33c',
  enabled: true
};

const LINE_CONFIG_STORAGE_KEY = 'lotto_line_bot_config';
const SENT_DRAWS_STORAGE_KEY = 'lotto_line_sent_draws';

export function getLocalLineConfig(): LineBotConfig {
  if (typeof localStorage === 'undefined') return DEFAULT_LINE_CONFIG;
  try {
    const raw = localStorage.getItem(LINE_CONFIG_STORAGE_KEY);
    if (raw) return { ...DEFAULT_LINE_CONFIG, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_LINE_CONFIG;
}

export function saveLocalLineConfig(config: LineBotConfig) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LINE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getSentDrawIds(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SENT_DRAWS_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

export function markDrawAsSent(drawId: string) {
  if (typeof localStorage === 'undefined') return;
  try {
    const set = getSentDrawIds();
    set.add(drawId);
    // keep max 500 recent ids
    const arr = Array.from(set).slice(-500);
    localStorage.setItem(SENT_DRAWS_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {}
}

/**
 * แปลงชื่อหวยและรอบให้ออกมาในรูปแบบของหัวข้อ
 * เช่น: นิเคอิ-ปก (เช้า), จีน-ปก (บ่าย), นิเคอิ-VIP (เช้า), ฮานอยพิเศษ
 */
export function getLineHeaderTitle(lotteryType: LotteryType, session?: SessionType): string {
  const s = session || '';
  if (lotteryType === 'NIKKEI') {
    if (s.includes('CHINA')) {
      return s.includes('AFTERNOON') ? 'จีน-ปก (บ่าย)' : 'จีน-ปก (เช้า)';
    }
    if (s.includes('HANGSENG')) {
      return s.includes('AFTERNOON') ? 'ฮั่งเส็ง-ปก (บ่าย)' : 'ฮั่งเส็ง-ปก (เช้า)';
    }
    if (s.includes('AFTERNOON')) return 'นิเคอิ-ปก (บ่าย)';
    return 'นิเคอิ-ปก (เช้า)';
  }
  if (lotteryType === 'STOCKS_VIP') {
    if (s.includes('NIKKEI')) {
      return s.includes('AFTERNOON') ? 'นิเคอิ-VIP (บ่าย)' : 'นิเคอิ-VIP (เช้า)';
    }
    if (s.includes('CHINA')) {
      return s.includes('AFTERNOON') ? 'จีน-VIP (บ่าย)' : 'จีน-VIP (เช้า)';
    }
    if (s.includes('HANGSENG')) {
      return s.includes('AFTERNOON') ? 'ฮั่งเส็ง-VIP (บ่าย)' : 'ฮั่งเส็ง-VIP (เช้า)';
    }
    return 'หุ้น-VIP';
  }
  if (lotteryType === 'HANOI') {
    if (s === 'HANOI_SPECIAL') return 'ฮานอยพิเศษ';
    if (s === 'HANOI_VIP') return 'ฮานอย VIP';
    return 'ฮานอยปกติ';
  }
  if (lotteryType === 'LAOS') return 'ลาวพัฒนา';
  if (lotteryType === 'DOWJONES') return 'ดาวโจนส์';
  if (lotteryType === 'GSB') return 'ออมสิน';
  if (lotteryType === 'GOVERNMENT') return 'รัฐบาลไทย';
  if (lotteryType === 'MALAY') return 'หวยมาเลย์';
  return 'ผลหวย';
}

/**
 * ชื่อย่อของตลาดสำหรับแสดงในบรรทัด เด่น / รอง
 * เช่น: "นิเคอิ ปก-เช้า", "จีน ปก-บ่าย", "นิเคอิ VIP-เช้า", "ฮานอยพิเศษ"
 */
export function getMarketShortName(lotteryType: LotteryType, session?: SessionType): string {
  const s = session || '';
  if (lotteryType === 'NIKKEI') {
    if (s.includes('CHINA')) {
      return s.includes('AFTERNOON') ? 'จีน ปก-บ่าย' : 'จีน ปก-เช้า';
    }
    if (s.includes('HANGSENG')) {
      return s.includes('AFTERNOON') ? 'ฮั่งเส็ง ปก-บ่าย' : 'ฮั่งเส็ง ปก-เช้า';
    }
    return s.includes('AFTERNOON') ? 'นิเคอิ ปก-บ่าย' : 'นิเคอิ ปก-เช้า';
  }
  if (lotteryType === 'STOCKS_VIP') {
    if (s.includes('NIKKEI')) return s.includes('AFTERNOON') ? 'นิเคอิ VIP-บ่าย' : 'นิเคอิ VIP-เช้า';
    if (s.includes('CHINA')) return s.includes('AFTERNOON') ? 'จีน VIP-บ่าย' : 'จีน VIP-เช้า';
    if (s.includes('HANGSENG')) return s.includes('AFTERNOON') ? 'ฮั่งเส็ง VIP-บ่าย' : 'ฮั่งเส็ง VIP-เช้า';
    return 'หุ้น VIP';
  }
  if (lotteryType === 'HANOI') {
    if (s === 'HANOI_SPECIAL') return 'ฮานอย พิเศษ';
    if (s === 'HANOI_VIP') return 'ฮานอย VIP';
    return 'ฮานอย ปกติ';
  }
  return lotteryType;
}

export interface FormatLineMessageParams {
  draw: DrawResult;
  allData?: DrawResult[];
  lotteryType?: LotteryType;
}

/**
 * สร้างข้อความแจ้งเตือนผลหวยออกตามรูปแบบในภาพ:
 * 
 * นิเคอิ-ปก (เช้า)
 * 177-22
 * 
 * 🌼 นิเคอิ ปก-เช้า เด่น 2 [ล่าง 2 2]
 * 🌼 นิเคอิ ปก-เช้า รอง 7 [บน 7 7]
 * 🏷️ รวมทุกหุ้นปกติ 6 รอบ [บน 7 7]
 * 
 * 🎉🎉🎉🎉
 */
export function buildLineResultMessage(params: FormatLineMessageParams): string {
  const { draw, allData = [], lotteryType = draw.lotteryType } = params;
  const top3 = (draw.top3 || '').trim();
  const bottom2 = (draw.bottom2 || '').trim();
  const top2 = draw.top2 || (top3.length >= 2 ? top3.slice(-2) : '');

  const headerTitle = getLineHeaderTitle(lotteryType, draw.session);
  const resultLine = `${top3}-${bottom2}`;
  const marketShort = getMarketShortName(lotteryType, draw.session);

  // คำนวณเลขเด่น-รองของรอบนี้ (จากสถิติของวัน activeDay ก่อนหน้าผลนี้)
  const dayCode = getDayCodeFromDate(draw.date);
  // กรองชุดข้อมูลก่อนวันออกผลนี้
  const pastData = allData.filter((d) => d.date !== draw.date && d.session === draw.session);
  const targetDataset = pastData.length >= 5 ? pastData : allData.filter((d) => d.session === draw.session);
  const report = analyzeDayOfWeekStats(targetDataset, dayCode);

  const primaryDigit = report.topSingleDigits[0]?.digit;
  const secondaryDigit = report.topSingleDigits[1]?.digit;

  const hitLines: string[] = [];

  // ฟังก์ชันช่วยตรวจสอบว่าเลขเดี่ยว เข้าบน หรือ เข้าล่าง
  const checkDigitHit = (digit: number): { onTop: boolean; onBottom: boolean } => {
    const dStr = String(digit);
    const onTop = top2.includes(dStr);
    const onBottom = bottom2.includes(dStr);
    return { onTop, onBottom };
  };

  // 1. ตรวจสอบเลขเด่น
  if (primaryDigit !== undefined && primaryDigit !== null) {
    const hit = checkDigitHit(primaryDigit);
    if (hit.onBottom) {
      // ตัวอย่าง: [ล่าง 2 2] หรือ [ล่าง 25] (ใส่ช่องว่างระหว่างหลักตามสไตล์)
      const formattedResult = bottom2.split('').join(' ');
      hitLines.push(`🌼 ${marketShort} เด่น ${primaryDigit} [ล่าง ${formattedResult}]`);
    }
    if (hit.onTop) {
      const formattedResult = top2.split('').join(' ');
      hitLines.push(`🌼 ${marketShort} เด่น ${primaryDigit} [บน ${formattedResult}]`);
    }
  }

  // 2. ตรวจสอบเลขรอง
  if (secondaryDigit !== undefined && secondaryDigit !== null) {
    const hit = checkDigitHit(secondaryDigit);
    if (hit.onBottom) {
      const formattedResult = bottom2.split('').join(' ');
      hitLines.push(`🌼 ${marketShort} รอง ${secondaryDigit} [ล่าง ${formattedResult}]`);
    }
    if (hit.onTop) {
      const formattedResult = top2.split('').join(' ');
      hitLines.push(`🌼 ${marketShort} รอง ${secondaryDigit} [บน ${formattedResult}]`);
    }
  }

  // 3. ตรวจสอบ รวมทุกหุ้นปกติ 6 รอบ / รวมทุกหุ้น VIP 6 รอบ / รวม 3 ฮานอย
  if (lotteryType === 'NIKKEI') {
    // หุ้นปกติ 6 รอบ
    const stocksAllData = allData.filter((d) => d.date !== draw.date);
    const stocksReport = analyzeDayOfWeekStats(stocksAllData, dayCode);
    const sPrimary = stocksReport.topSingleDigits[0]?.digit;
    const sSecondary = stocksReport.topSingleDigits[1]?.digit;

    const checkCombinedHit = (d: number | undefined) => {
      if (d === undefined || d === null) return;
      const hit = checkDigitHit(d);
      if (hit.onTop) {
        hitLines.push(`🏷️ รวมทุกหุ้นปกติ 6 รอบ [บน ${top2.split('').join(' ')}]`);
      } else if (hit.onBottom) {
        hitLines.push(`🏷️ รวมทุกหุ้นปกติ 6 รอบ [ล่าง ${bottom2.split('').join(' ')}]`);
      }
    };
    checkCombinedHit(sPrimary);
    if (!hitLines.some((l) => l.includes('รวมทุกหุ้นปกติ 6 รอบ'))) {
      checkCombinedHit(sSecondary);
    }
  } else if (lotteryType === 'STOCKS_VIP') {
    // หุ้น VIP 6 รอบ
    const vipAllData = allData.filter((d) => d.date !== draw.date);
    const vipReport = analyzeDayOfWeekStats(vipAllData, dayCode);
    const vPrimary = vipReport.topSingleDigits[0]?.digit;
    const vSecondary = vipReport.topSingleDigits[1]?.digit;

    const checkVipHit = (d: number | undefined) => {
      if (d === undefined || d === null) return;
      const hit = checkDigitHit(d);
      if (hit.onTop) {
        hitLines.push(`🏷️ รวมทุกหุ้น VIP 6 รอบ [บน ${top2.split('').join(' ')}]`);
      } else if (hit.onBottom) {
        hitLines.push(`🏷️ รวมทุกหุ้น VIP 6 รอบ [ล่าง ${bottom2.split('').join(' ')}]`);
      }
    };
    checkVipHit(vPrimary);
    if (!hitLines.some((l) => l.includes('รวมทุกหุ้น VIP 6 รอบ'))) {
      checkVipHit(vSecondary);
    }
  } else if (lotteryType === 'HANOI') {
    // รวม 3 ฮานอย
    const hanoiAllData = allData.filter((d) => d.date !== draw.date);
    const hanoiReport = analyzeDayOfWeekStats(hanoiAllData, dayCode);
    const hPrimary = hanoiReport.topSingleDigits[0]?.digit;
    const hSecondary = hanoiReport.topSingleDigits[1]?.digit;

    const checkHanoiHit = (d: number | undefined) => {
      if (d === undefined || d === null) return;
      const hit = checkDigitHit(d);
      if (hit.onTop) {
        hitLines.push(`🏷️ รวม 3 ฮานอย [บน ${top2.split('').join(' ')}]`);
      } else if (hit.onBottom) {
        hitLines.push(`🏷️ รวม 3 ฮานอย [ล่าง ${bottom2.split('').join(' ')}]`);
      }
    };
    checkHanoiHit(hPrimary);
    if (!hitLines.some((l) => l.includes('รวม 3 ฮานอย'))) {
      checkHanoiHit(hSecondary);
    }
  }

  // ประกอบข้อความ
  let message = `${headerTitle}\n${resultLine}\n\n`;

  if (hitLines.length > 0) {
    // ตัดบรรทัดที่ซ้ำกันออก
    const uniqueHitLines = Array.from(new Set(hitLines));
    message += uniqueHitLines.join('\n') + '\n\n🎉🎉🎉🎉';
  } else {
    message += `(รอบนี้สถิติเลขไม่เข้าเป้า)`;
  }

  return message;
}

/**
 * ส่งข้อความเข้า LINE ผ่าน Cloudflare Worker API
 */
export async function sendLineNotification(message: string, targetId?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const config = getLocalLineConfig();
    const finalTarget = targetId || config.targetId || 'U3a7529a26c7c9a1a06d4cd374349a33c';

    const res = await fetch('/api/line/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        to: finalTarget,
        token: config.channelAccessToken
      })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'เชื่อมต่อเซิร์ฟเวอร์แจ้งเตือนไม่สำเร็จ' };
  }
}
