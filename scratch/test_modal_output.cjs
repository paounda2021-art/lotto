global.window = { __KV_DRAWS__: {} };
let capturedHtml = '';
let textareaContent = '';
global.document = {
  body: { appendChild: (el) => {} },
  createElement: (tag) => {
    const el = {
      tagName: tag,
      style: {},
      querySelector: (sel) => {
        if (sel === '#chase-slip-textarea') return { value: textareaContent };
        return { onclick: null };
      },
      querySelectorAll: (sel) => [],
      set innerHTML(val) {
        capturedHtml = val;
        const match = val.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/);
        if (match) textareaContent = match[1];
      }
    };
    return el;
  },
  getElementById: (id) => null,
  querySelectorAll: (sel) => []
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.MutationObserver = class { observe() {} };

const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/export_modal.js', 'utf8');
eval(code);

// Load KV draws for Friday & Saturday
const dir = 'downloaded_target_worker/kv_data';
window.__KV_DRAWS__['lotto_data_nikkei_morning'] = JSON.parse(fs.readFileSync(dir + '/lotto_data_nikkei_morning.json', 'utf8'));
window.__KV_DRAWS__['lotto_data_china_afternoon'] = JSON.parse(fs.readFileSync(dir + '/lotto_data_china_afternoon.json', 'utf8'));
window.__KV_DRAWS__['lotto_data_china_vip_morning'] = JSON.parse(fs.readFileSync(dir + '/lotto_data_china_vip_morning.json', 'utf8'));
window.__KV_DRAWS__['lotto_data_china_vip_afternoon'] = JSON.parse(fs.readFileSync(dir + '/lotto_data_china_vip_afternoon.json', 'utf8'));

window.openChaseSlipModal();

console.log('=== TEST 1: DEFAULT (ALL) TEXTAREA ===');
console.log(textareaContent);

console.log('\n=== TEST 2: CHECK BANNER IN HTML ===');
const bannerMatch = capturedHtml.match(/🎲 วินเด่น 4 ตัว:[\s\S]*?<\/span>/);
if (bannerMatch) console.log(bannerMatch[0].replace(/\s+/g, ' '));

process.exit(0);
