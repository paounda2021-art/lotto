import { DrawResult, LotteryType, SessionType, DayOfWeekType } from '../types';

const MASTER_KEY_SEED = "eM0zHI5kzg96Qad7yRjEm3WciYwys2qejHKM8JSuO6jpoeAXjfaCga7eGg8ATmx0";
const DERIVED_KEY_STR = MASTER_KEY_SEED.replace("WciY", "TiSm").trim();

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const DAY_NAMES: { en: DayOfWeekType; th: string }[] = [
  { en: 'Sun', th: 'อาทิตย์' },
  { en: 'Mon', th: 'จันทร์' },
  { en: 'Tue', th: 'อังคาร' },
  { en: 'Wed', th: 'พุธ' },
  { en: 'Thu', th: 'พฤหัสบดี' },
  { en: 'Fri', th: 'ศุกร์' },
  { en: 'Sat', th: 'เสาร์' }
];

export interface ExphuayRawItem {
  id: number;
  lottosType?: string;
  lottosFlag?: string;
  lottosName: string;
  lottosTH: string;
  lottosDate: string;
  lottosTime?: string;
  lottosNumber: string;
  lottosUnder: string;
}

// Map exphuay lottosName -> { lotteryType, session }
const LOTTO_NAME_MAP: Record<string, { lotteryType: LotteryType; session: SessionType }> = {
  'nikkei-morning': { lotteryType: 'NIKKEI', session: 'NIKKEI_MORNING' },
  'nikkeimorning': { lotteryType: 'NIKKEI', session: 'NIKKEI_MORNING' },
  'nikkei-afternoon': { lotteryType: 'NIKKEI', session: 'NIKKEI_AFTERNOON' },
  'nikkeiafternoon': { lotteryType: 'NIKKEI', session: 'NIKKEI_AFTERNOON' },

  'szse-morning': { lotteryType: 'NIKKEI', session: 'CHINA_MORNING' },
  'szsemorning': { lotteryType: 'NIKKEI', session: 'CHINA_MORNING' },
  'szse-afternoon': { lotteryType: 'NIKKEI', session: 'CHINA_AFTERNOON' },
  'szseafternoon': { lotteryType: 'NIKKEI', session: 'CHINA_AFTERNOON' },

  'hsi-morning': { lotteryType: 'NIKKEI', session: 'HANGSENG_MORNING' },
  'hsimorning': { lotteryType: 'NIKKEI', session: 'HANGSENG_MORNING' },
  'hsi-afternoon': { lotteryType: 'NIKKEI', session: 'HANGSENG_AFTERNOON' },
  'hsiafternoon': { lotteryType: 'NIKKEI', session: 'HANGSENG_AFTERNOON' },

  'dji': { lotteryType: 'DOWJONES', session: 'DOWJONES_NIGHT' },
  'laosdevelops': { lotteryType: 'LAOS', session: 'LAOS_EVENING' },

  'xsthm': { lotteryType: 'HANOI', session: 'HANOI_SPECIAL' },
  'minhngoc': { lotteryType: 'HANOI', session: 'HANOI_EVENING' },
  'mlnhngo': { lotteryType: 'HANOI', session: 'HANOI_VIP' },

  'gsb': { lotteryType: 'GSB', session: 'GSB_BIWEEKLY' },
  'goverment': { lotteryType: 'GOVERNMENT', session: 'GOV_BIWEEKLY' },

  'nikkei-vip-morning': { lotteryType: 'STOCK_VIP', session: 'NIKKEI_VIP_MORNING' },
  'nikkei-vip-afternoon': { lotteryType: 'STOCK_VIP', session: 'NIKKEI_VIP_AFTERNOON' },
  'szse-vip-morning': { lotteryType: 'STOCK_VIP', session: 'CHINA_VIP_MORNING' },
  'szse-vip-afternoon': { lotteryType: 'STOCK_VIP', session: 'CHINA_VIP_AFTERNOON' },
  'hsi-vip-morning': { lotteryType: 'STOCK_VIP', session: 'HANGSENG_VIP_MORNING' },
  'hsi-vip-afternoon': { lotteryType: 'STOCK_VIP', session: 'HANGSENG_VIP_AFTERNOON' }
};

const BACKWARD_SLUGS_MAP: Record<LotteryType, string[]> = {
  LAOS: ['laosdevelops'],
  DOWJONES: ['dji'],
  HANOI: ['xsthm', 'minhngoc', 'mlnhngo'],
  NIKKEI: ['nikkei-morning', 'nikkei-afternoon', 'szse-morning', 'szse-afternoon', 'hsi-morning', 'hsi-afternoon'],
  STOCK_VIP: ['nikkei-vip-morning', 'nikkei-vip-afternoon', 'szse-vip-morning', 'szse-vip-afternoon', 'hsi-vip-morning', 'hsi-vip-afternoon'],
  GSB: ['gsb'],
  GOVERNMENT: ['goverment']
};

/**
 * Web Crypto AES-256-GCM Decrypter for ExpHuay dataset
 */
async function decryptExpHuayPayload(payload: string, iv: string): Promise<any> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(DERIVED_KEY_STR);
  const hash = await crypto.subtle.digest('SHA-256', keyData);
  const cryptoKey = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);

  const fixBase64 = (e: string) => {
    let r = e.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
    while (r.length % 4 !== 0) r += '=';
    return r;
  };

  const base64ToUint8 = (str: string) => {
    const binary = atob(fixBase64(str));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const payloadBytes = base64ToUint8(payload.substring(268));
  const ivBytes = base64ToUint8(iv);

  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, cryptoKey, payloadBytes);
  const text = new TextDecoder().decode(decryptedBuffer);

  let parsed = JSON.parse(text);
  if (typeof parsed === 'string') parsed = JSON.parse(parsed);
  return parsed;
}

/**
 * Safely fetch JSON with CORS proxy fallbacks
 */
async function fetchWithFallback(targetUrl: string): Promise<any> {
  const tryProxyRoute = async () => {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text);
    if (json && json.nodes) return json;
    throw new Error('Invalid structure');
  };

  const tryDirect = async () => {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`Direct HTTP ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text);
    if (json && json.nodes) return json;
    throw new Error('Invalid structure');
  };

  const tryAllOriginsRaw = async () => {
    const u = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(u);
    if (!res.ok) throw new Error(`AllOrigins HTTP ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text);
    if (json && json.nodes) return json;
    throw new Error('Invalid structure');
  };

  const tryAllOriginsGet = async () => {
    const u = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(u);
    if (!res.ok) throw new Error(`AllOriginsGet HTTP ${res.status}`);
    const wrapper = await res.json();
    if (wrapper && wrapper.contents) {
      const json = JSON.parse(wrapper.contents);
      if (json && json.nodes) return json;
    }
    throw new Error('Invalid structure');
  };

  const tryCorsProxyIo = async () => {
    const u = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const res = await fetch(u);
    if (!res.ok) throw new Error(`Corsproxy.io HTTP ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text);
    if (json && json.nodes) return json;
    throw new Error('Invalid structure');
  };

  const strategies = [
    tryProxyRoute,
    tryDirect,
    tryAllOriginsRaw,
    tryAllOriginsGet,
    tryCorsProxyIo
  ];

  for (const strat of strategies) {
    try {
      const result = await strat();
      if (result) return result;
    } catch (e) {
      // try next strategy silently
    }
  }

  throw new Error('ไม่สามารถเชื่อมต่อ exphuay.com ได้ (โปรดตรวจสอบอินเทอร์เน็ต)');
}

/**
 * Format raw Exphuay item to App's DrawResult
 */
export function formatExphuayItem(raw: ExphuayRawItem): DrawResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const lottoName = raw.lottosName;
  if (!lottoName) return null;

  const mapped = LOTTO_NAME_MAP[lottoName];
  if (!mapped) return null;

  if (!raw.lottosNumber || !raw.lottosUnder) return null;

  // Convert lottosDate to Thai ICT local date
  const rawDate = new Date(raw.lottosDate);
  if (isNaN(rawDate.getTime())) return null;

  // Shift UTC by +7 hours for ICT timezone if date is stored as UTC midnight (17:00:00Z)
  const ictTime = new Date(rawDate.getTime() + 7 * 3600 * 1000);
  const yyyy = ictTime.getUTCFullYear();
  const mm = String(ictTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(ictTime.getUTCDate()).padStart(2, '0');
  const dateIso = `${yyyy}-${mm}-${dd}`;

  // Thai BE Year format (e.g., 2026 -> 2569)
  const beYear = yyyy + 543;
  const monthName = THAI_MONTHS_SHORT[ictTime.getUTCMonth()];
  const dateFormatted = `${dd} ${monthName} ${beYear}`;

  const dayObj = DAY_NAMES[ictTime.getUTCDay()];

  // Extract winning numbers
  const fullNumStr = String(raw.lottosNumber).trim();
  const top3 = fullNumStr.length >= 3 ? fullNumStr.slice(-3) : fullNumStr.padStart(3, '0');
  const top2 = top3.slice(-2);
  const bottom2 = String(raw.lottosUnder).trim().padStart(2, '0');

  return {
    id: `${mapped.lotteryType}_${mapped.session}_${dateIso}`,
    lotteryType: mapped.lotteryType,
    session: mapped.session,
    date: dateIso,
    dateFormatted,
    dayOfWeek: dayObj.en,
    dayNameThai: dayObj.th,
    full6D: fullNumStr.length >= 6 ? fullNumStr : undefined,
    top3,
    top2,
    bottom2
  };
}

/**
 * Internal helper to parse nodes of SvelteKit data payload
 */
async function parseSvelteKitDataNodes(json: any): Promise<DrawResult[]> {
  const results: DrawResult[] = [];
  if (!json || !json.nodes) return results;

  for (const node of json.nodes || []) {
    if (!node || !node.data) continue;
    for (const item of node.data) {
      if (typeof item === 'object' && item !== null && item.payload !== undefined && item.iv !== undefined) {
        const payloadStr = typeof item.payload === 'number' ? node.data[item.payload] : item.payload;
        const ivStr = typeof item.iv === 'number' ? node.data[item.iv] : item.iv;
        
        try {
          const decryptedItems = await decryptExpHuayPayload(payloadStr, ivStr);
          if (Array.isArray(decryptedItems)) {
            for (const rawItem of decryptedItems) {
              const formatted = formatExphuayItem(rawItem);
              if (formatted) {
                results.push(formatted);
              }
            }
          }
        } catch (err) {
          // ignore decrypt errors for non-matching nodes
        }
      }
    }
  }
  return results;
}

/**
 * Fetch backward historical draws for a specific slug
 */
export async function fetchExphuayBackwardResults(slug: string): Promise<DrawResult[]> {
  try {
    const json = await fetchWithFallback(`https://exphuay.com/backward/${slug}/__data.json`);
    return await parseSvelteKitDataNodes(json);
  } catch (err) {
    return [];
  }
}

/**
 * Main Sync Function: Fetch all latest results from exphuay.com/result AND target backward endpoints
 */
export async function fetchExphuayLiveResults(targetLotteryType?: LotteryType): Promise<DrawResult[]> {
  const allResults: DrawResult[] = [];

  // 1. Fetch main live result page
  try {
    const liveJson = await fetchWithFallback('https://exphuay.com/result/__data.json');
    const liveResults = await parseSvelteKitDataNodes(liveJson);
    allResults.push(...liveResults);
  } catch (err) {
    console.warn('Failed to fetch exphuay /result, falling back to backward endpoints');
  }

  // 2. Fetch target or all backward endpoints to ensure historical and recent draws are updated
  const slugsToFetch: string[] = [];
  if (targetLotteryType && BACKWARD_SLUGS_MAP[targetLotteryType]) {
    slugsToFetch.push(...BACKWARD_SLUGS_MAP[targetLotteryType]);
  } else {
    // Fetch all backward slugs
    Object.values(BACKWARD_SLUGS_MAP).forEach(slugs => slugsToFetch.push(...slugs));
  }

  const backwardPromises = slugsToFetch.map(slug => fetchExphuayBackwardResults(slug));
  const backwardResultsArray = await Promise.all(backwardPromises);

  for (const bResults of backwardResultsArray) {
    allResults.push(...bResults);
  }

  // Deduplicate by ID
  const map = new Map<string, DrawResult>();
  for (const r of allResults) {
    map.set(r.id, r);
  }

  return Array.from(map.values());
}
