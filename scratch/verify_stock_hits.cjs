const fs = require('fs');

const dNikkei = { session: 'NIKKEI_AFTERNOON', date: '2026-10-16', top3: '429', top2: '29', bottom2: '34' };
const dChina = { session: 'CHINA_AFTERNOON', date: '2026-10-16', top3: '246', top2: '46', bottom2: '33' };
const dHang = { session: 'HANGSENG_AFTERNOON', date: '2026-10-16', top3: '683', top2: '83', bottom2: '11' };

const O = [dNikkei, dChina, dHang];
const a = O;

const code = fs.readFileSync('dist/assets/index-CN-5_2d9.js', 'utf8');
const vm = require('vm');
const ctx = {
  window: {},
  console: console,
  O: O,
  a: a,
  g: false,
  localStorage: {
    getItem: (key) => {
      if (key === 'lotto_data_nikkei_afternoon') return JSON.stringify([dNikkei]);
      if (key === 'lotto_data_china_afternoon') return JSON.stringify([dChina]);
      if (key === 'lotto_data_hangseng_afternoon') return JSON.stringify([dHang]);
      return null;
    }
  }
};
vm.createContext(ctx);

const helperEnd = code.indexOf('window._getHitRoundText = _getHitRoundText;') + 44;
vm.runInContext(code.substring(0, helperEnd), ctx);

const pStart = code.indexOf('const getWinningSetsHelper = (dayCode, cat, time) => {');
const pEnd = code.indexOf('const renderStockSession = (dayCode, cat, time) => {');
vm.runInContext('var ' + code.substring(pStart + 6, pEnd), ctx);

const res = vm.runInContext('getWinningSetsHelper("Fri", "reg", "Afternoon")', ctx);
console.log('win2D has 34:', res.win2D.has('34'));
console.log('win2D has 46:', res.win2D.has('46'));
console.log('34 round text:', ctx.window._getHitRoundText('34', res.win2DRounds));
console.log('46 round text:', ctx.window._getHitRoundText('46', res.win2DRounds));
