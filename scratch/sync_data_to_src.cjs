const fs = require('fs');
const path = require('path');

const kvDir = path.join(__dirname, '..', 'cloudflare_download_afdeb0f4', 'kv_data');

function loadKv(fileName, defaultType, defaultSession) {
  const filePath = path.join(kvDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.map(item => {
    let lottoType = item.lotteryType || defaultType;
    if (lottoType === 'STOCK_VIP') lottoType = 'STOCKS_VIP';
    let session = item.session || defaultSession;
    return {
      ...item,
      lotteryType: lottoType,
      session: session
    };
  });
}

// 1. Generate src/data/stocksVipData.ts
const nikkeiVipMorning = loadKv('lotto_data_nikkei_vip_morning.json', 'STOCKS_VIP', 'NIKKEI_VIP_MORNING');
const nikkeiVipAfternoon = loadKv('lotto_data_nikkei_vip_afternoon.json', 'STOCKS_VIP', 'NIKKEI_VIP_AFTERNOON');
const chinaVipMorning = loadKv('lotto_data_china_vip_morning.json', 'STOCKS_VIP', 'CHINA_VIP_MORNING');
const chinaVipAfternoon = loadKv('lotto_data_china_vip_afternoon.json', 'STOCKS_VIP', 'CHINA_VIP_AFTERNOON');
const hangsengVipMorning = loadKv('lotto_data_hangseng_vip_morning.json', 'STOCKS_VIP', 'HANGSENG_VIP_MORNING');
const hangsengVipAfternoon = loadKv('lotto_data_hangseng_vip_afternoon.json', 'STOCKS_VIP', 'HANGSENG_VIP_AFTERNOON');

const stocksVipTs = `import { DrawResult } from '../types';

export const INITIAL_NIKKEI_VIP_MORNING_DATA: DrawResult[] = ${JSON.stringify(nikkeiVipMorning, null, 2)};

export const INITIAL_NIKKEI_VIP_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(nikkeiVipAfternoon, null, 2)};

export const INITIAL_CHINA_VIP_MORNING_DATA: DrawResult[] = ${JSON.stringify(chinaVipMorning, null, 2)};

export const INITIAL_CHINA_VIP_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(chinaVipAfternoon, null, 2)};

export const INITIAL_HANGSENG_VIP_MORNING_DATA: DrawResult[] = ${JSON.stringify(hangsengVipMorning, null, 2)};

export const INITIAL_HANGSENG_VIP_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(hangsengVipAfternoon, null, 2)};

export const ALL_NIKKEI_VIP_DATA: DrawResult[] = [
  ...INITIAL_NIKKEI_VIP_MORNING_DATA,
  ...INITIAL_NIKKEI_VIP_AFTERNOON_DATA
];

export const ALL_CHINA_VIP_DATA: DrawResult[] = [
  ...INITIAL_CHINA_VIP_MORNING_DATA,
  ...INITIAL_CHINA_VIP_AFTERNOON_DATA
];

export const ALL_HANGSENG_VIP_DATA: DrawResult[] = [
  ...INITIAL_HANGSENG_VIP_MORNING_DATA,
  ...INITIAL_HANGSENG_VIP_AFTERNOON_DATA
];

export const ALL_STOCKS_VIP_DATA: DrawResult[] = [
  ...ALL_NIKKEI_VIP_DATA,
  ...ALL_CHINA_VIP_DATA,
  ...ALL_HANGSENG_VIP_DATA
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'stocksVipData.ts'), stocksVipTs, 'utf8');
console.log('src/data/stocksVipData.ts generated from afdeb0f4 KV data.');

// 2. Generate src/data/nikkeiData.ts
const nikkeiMorning = loadKv('lotto_data_nikkei_morning.json', 'NIKKEI', 'NIKKEI_MORNING');
const nikkeiAfternoon = loadKv('lotto_data_nikkei_afternoon.json', 'NIKKEI', 'NIKKEI_AFTERNOON');
const chinaMorning = loadKv('lotto_data_china_morning.json', 'NIKKEI', 'CHINA_MORNING');
const chinaAfternoon = loadKv('lotto_data_china_afternoon.json', 'NIKKEI', 'CHINA_AFTERNOON');
const hangsengMorning = loadKv('lotto_data_hangseng_morning.json', 'NIKKEI', 'HANGSENG_MORNING');
const hangsengAfternoon = loadKv('lotto_data_hangseng_afternoon.json', 'NIKKEI', 'HANGSENG_AFTERNOON');
const laos = loadKv('lotto_data_laos.json', 'LAOS', 'LAOS_EVENING');
const dowjones = loadKv('lotto_data_dowjones.json', 'DOWJONES', 'DOWJONES_NIGHT');
const hanoiSpecial = loadKv('lotto_data_hanoi_special.json', 'HANOI', 'HANOI_SPECIAL');
const hanoi = loadKv('lotto_data_hanoi.json', 'HANOI', 'HANOI_EVENING');
const hanoiVip = loadKv('lotto_data_hanoi_vip.json', 'HANOI', 'HANOI_VIP');
const gsb = loadKv('lotto_data_gsb.json', 'GSB', 'GSB_BIWEEKLY');
const gov = loadKv('lotto_data_gov.json', 'GOVERNMENT', 'GOV_BIWEEKLY');

const nikkeiTs = `import { DrawResult } from '../types';

export const INITIAL_NIKKEI_MORNING_DATA: DrawResult[] = ${JSON.stringify(nikkeiMorning, null, 2)};

export const INITIAL_NIKKEI_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(nikkeiAfternoon, null, 2)};

export const INITIAL_CHINA_MORNING_DATA: DrawResult[] = ${JSON.stringify(chinaMorning, null, 2)};

export const INITIAL_CHINA_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(chinaAfternoon, null, 2)};

export const INITIAL_HANGSENG_MORNING_DATA: DrawResult[] = ${JSON.stringify(hangsengMorning, null, 2)};

export const INITIAL_HANGSENG_AFTERNOON_DATA: DrawResult[] = ${JSON.stringify(hangsengAfternoon, null, 2)};

export const ALL_NIKKEI_DATA: DrawResult[] = [
  ...INITIAL_NIKKEI_MORNING_DATA,
  ...INITIAL_NIKKEI_AFTERNOON_DATA
];

export const ALL_STOCKS_DATA: DrawResult[] = [
  ...ALL_NIKKEI_DATA,
  ...INITIAL_CHINA_MORNING_DATA,
  ...INITIAL_CHINA_AFTERNOON_DATA,
  ...INITIAL_HANGSENG_MORNING_DATA,
  ...INITIAL_HANGSENG_AFTERNOON_DATA
];

export const INITIAL_LAOS_DATA: DrawResult[] = ${JSON.stringify(laos, null, 2)};

export const INITIAL_DOWJONES_DATA: DrawResult[] = ${JSON.stringify(dowjones, null, 2)};

export const INITIAL_HANOI_SPECIAL_DATA: DrawResult[] = ${JSON.stringify(hanoiSpecial, null, 2)};

export const INITIAL_HANOI_DATA: DrawResult[] = ${JSON.stringify(hanoi, null, 2)};

export const INITIAL_HANOI_VIP_DATA: DrawResult[] = ${JSON.stringify(hanoiVip, null, 2)};

export const ALL_HANOI_DATA: DrawResult[] = [
  ...INITIAL_HANOI_SPECIAL_DATA,
  ...INITIAL_HANOI_DATA,
  ...INITIAL_HANOI_VIP_DATA
];

export const INITIAL_GSB_DATA: DrawResult[] = ${JSON.stringify(gsb, null, 2)};

export const INITIAL_GOVERNMENT_DATA: DrawResult[] = ${JSON.stringify(gov, null, 2)};

export * from './stocksVipData';
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'nikkeiData.ts'), nikkeiTs, 'utf8');
console.log('src/data/nikkeiData.ts generated strictly from afdeb0f4 KV data.');
